const walk = require('acorn-walk');

const { getAtomType, TypeMap } = require('./utils');
const { UNKNOWN_TYPE, TYPE_KIND, NODE_TYPE } = require('./constants');

const {
  TypeDoubleDeclarationError,
  TypesNotMatch,
  TypeRefNotFound,
  TypeOfReturnWrong,
} = require('./errors-formatter.js');

function ExpressionStatementTypeSwitch(node, state) {
  switch (node.type) {
    case NODE_TYPE.IDENTIFIER:
      return state.TypeMap.get(node.name);

    case NODE_TYPE.LITERAL:
      return getAtomType(node.value);

    case NODE_TYPE.MEMBER_EXPRESSION:
      if (node.object.type === NODE_TYPE.IDENTIFIER) {
        return state.TypeMap.get(node.object.name);
      }

      if (node.object.type === NODE_TYPE.MEMBER_EXPRESSION) {
        return ExpressionStatementTypeSwitch(node.object, state);
      }

      return UNKNOWN_TYPE;

    default:
      return UNKNOWN_TYPE;
  }
}

function typeToScope(name, type, node, state, errors) {
  if (type.isAtom) {
    state.TypeMap.set(name, type);
  } else if (type.isRef) {
    state.TypeMap.set(name, state.TypeMap.get(type));
  } else {
    errors.push(TypeRefNotFound(type, node.loc));
  }
}

function TauValidator(ast) {
  const errors = [];

  walk.recursive(ast, [], {
    BlockStatement(node, state, c) {
      node.body.forEach((child) => {
        c(child, state);
      });
    },

    ReturnStatement(node, state) {
      const definedReturnedType = state.TypeMap.get(state.currentFunction);
      const realReturnType = ExpressionStatementTypeSwitch(
        node.argument,
        state,
      );
      if (definedReturnedType.annotation !== realReturnType) {
        errors.push(
          TypeOfReturnWrong(
            definedReturnedType.annotation,
            realReturnType.annotation,
            node.loc,
          ),
        );
      }
    },

    FunctionDeclaration(node, state, c) {
      state.TypeMap.addScope();
      if (state.TypeMap.has(node.id.name)) {
        const type = state.TypeMap.get(node.id.name);
        const typeArgs = type.arguments;
        const untypedArgs = node.params;

        // TODO: add error here
        // if (typeArgs.length < untypedArgs) {}

        typeArgs.forEach((arg, index) => {
          const { name } = untypedArgs[index];

          typeToScope(name, arg, node, state, errors);
        });

        if (type.result) {
          typeToScope(node.id.name, type.result, node, state, errors);
        }
      }
      state.currentFunction = node.id.name;
      c(node.body, state);
    },

    // Visit function for TypeDefinition
    // Example: type a = boolean;
    TypeDefinition(node, state) {
      const typeAlias = node.alias.name;
      const typeAnnotation = node.$Type.annotation;

      if (
        node.$Type.type === TYPE_KIND.ATOM_TYPE ||
        node.$Type.type === TYPE_KIND.REFERENCE_TYPE
      ) {
        if (state.TypeMap.hasScope(typeAlias)) {
          errors.push(
            TypeDoubleDeclarationError(
              state.TypeMap.get(typeAlias).annotation,
              typeAnnotation,
              node.loc,
            ),
          );
        } else if (node.$Type.isAtom) {
          state.TypeMap.set(typeAlias, node.$Type);
        } else if (node.$Type.isRef && state.TypeMap.has(typeAnnotation)) {
          state.TypeMap.set(typeAlias, state.TypeMap.get(typeAnnotation));
        } else {
          errors.push(TypeRefNotFound(typeAnnotation, node.loc));
        }
      } else if (node.$Type.type === TYPE_KIND.FUNCTION_TYPE) {
        state.TypeMap.set(typeAlias, node.$Type);
      }
    },

    // Visit function for ExpressionStatement
    // Example: num1 = num2;
    ExpressionStatement(node, state) {
      // Left and right nodes: Node -> expression -> left / right
      const { left, right } = node.expression;
      const leftType = ExpressionStatementTypeSwitch(left, state);
      const rightType = ExpressionStatementTypeSwitch(right, state);

      if (left.type === NODE_TYPE.MEMBER_EXPRESSION) {
        // TODO: Object can include property a.l.g, only g in top level
        // Object inside object

        if (left.object.type === NODE_TYPE.IDENTIFIER) {
          if (
            leftType.annotation[left.property.name].annotation !==
            rightType.annotation
          ) {
            // TODO: Define new object error
            errors.push(
              TypesNotMatch(
                leftType.annotation[left.property.name].annotation,
                rightType.annotation,
                node.loc,
              ),
            );
          }
        } else if (left.object.type === NODE_TYPE.MEMBER_EXPRESSION) {
          const pathChain = [left.property.name];
          let cursor = left.object;

          while (cursor.type === NODE_TYPE.MEMBER_EXPRESSION) {
            pathChain.push(cursor.property.name);

            cursor = cursor.object;
          }

          pathChain.reverse();

          let target = leftType.annotation;

          pathChain.forEach((path) => {
            target = target[path].annotation;
          });

          if (target !== rightType.annotation) {
            errors.push(TypesNotMatch(target, rightType.annotation, node.loc));
          }
        }
      } else if (leftType.annotation !== rightType.annotation) {
        errors.push(
          TypesNotMatch(leftType.annotation, rightType.annotation, node.loc),
        );
      }
    },

    // Visit function for Variable declaration
    // Example: let num1 = 12;
    VariableDeclaration(node, state) {
      // Type path: Node -> declarations -> $Type
      // Type to variable name: Node -> declarations -> id -> name
      for (let i = 0; i < node.declarations.length; i += 1) {
        const dec = node.declarations[i];
        // Check if type was already defined
        if (state.TypeMap.hasScope(dec.id.name)) {
          const type = state.TypeMap.get(dec.id.name);

          if (dec.$Type) {
            if (dec.$Type.isAtom) {
              if (type.annotation !== dec.$Type.annotation) {
                // type a = string;
                // let a = 12; // <- Error here

                errors.push(
                  TypesNotMatch(type.annotation, dec.$Type.annotation, dec.loc),
                );
                break;
              }
            } else if (dec.$Type.isRef) {
              // When let a = c;
              const initType = state.TypeMap.get(dec.init.name);

              if (type !== initType) {
                errors.push(
                  TypesNotMatch(type.annotation, initType.annotation, dec.loc),
                );
                break;
              }
            }
          }
        }

        if (dec.$Type) {
          if (dec.$Type.isAtom) {
            state.TypeMap.set(dec.id.name, dec.$Type);
          } else if (dec.$Type.isRef) {
            // Example: let b = c;
            const initType = state.TypeMap.get(dec.init.name);

            state.TypeMap.set(dec.id.name, initType);
          } else {
            state.TypeMap.set(dec.id.name, dec.$Type);
          }
        }
      }
    },

    Program(node, state, c) {
      state.TypeMap = new TypeMap();
      node.body.forEach((child) => {
        c(child, state);
      });
    },
  });

  return errors;
}

module.exports = TauValidator;
