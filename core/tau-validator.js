const walk = require('acorn-walk');

const { getAtomType, TypeMap } = require('./utils');
const { UNKNOWN_TYPE, TYPE_KIND, NODE_TYPE } = require('./constants');
const {
  TypeDoubleDeclarationError,
  TypesNotMatch,
  TypeRefNotFound,
  TypeOfReturnWrong,
  ArgumentsNotMatch,
} = require('./errors-formatter.js');
const {
  typeToScope,
  ExpressionStatementTypeSwitch,
  OtherTypeMatcher,
  annotationMatcher,
  AutoTypeSetter,
} = require('./tau-validator-utils.js');

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

    CallExpression(node, state) {
      const originFunctionType = state.TypeMap.get(node.callee.name);
      const originFunctionArguments = originFunctionType.arguments;
      const realArguments = node.arguments;

      for (let i = 0; i < originFunctionArguments.length; i++) {
        const originType = originFunctionArguments[i];
        const realType = realArguments[i];

        // TODO: ADD SWITCH
        if (originType.type === TYPE_KIND.ATOM_TYPE) {
          const valueType = typeof realType.value;

          if (originType.annotation !== valueType) {
            errors.push(
              ArgumentsNotMatch(valueType, originType.annotation, node.loc),
            );
          }
        }
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
      } else if (
        node.$Type.type === TYPE_KIND.FUNCTION_TYPE ||
        node.$Type.type === TYPE_KIND.OBJECT_TYPE
      ) {
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

      const {
        left: leftAnnotation,
        right: rightAnnotation,
        match,
      } = annotationMatcher(leftType, rightType);

      if (!match) {
        errors.push(TypesNotMatch(leftAnnotation, rightAnnotation, node.loc));
      }
    },

    // Visit function for Variable declaration
    // Example: let num1 = 12;
    VariableDeclaration(node, state, c) {
      // Type path: Node -> declarations -> $Type
      // Type to variable name: Node -> declarations -> id -> name

      for (let i = 0; i < node.declarations.length; i += 1) {
        const dec = node.declarations[i];
        // Check if type was already defined

        if (state.TypeMap.hasScope(dec.id.name)) {
          const stateType = state.TypeMap.get(dec.id.name);

          // WARNING: LOOKS LIKE BUG BECAUSE NOT SET HERE (FULL IF)
          if (dec.$Type) {
            if (dec.$Type.isAtom) {
              if (stateType.annotation !== dec.$Type.annotation) {
                // type a = string;
                // let a = 12; // <- Error here

                errors.push(
                  TypesNotMatch(
                    stateType.annotation,
                    dec.$Type.annotation,
                    dec.loc,
                  ),
                );
              }
            } else if (dec.$Type.isRef) {
              // When let a = c;
              const initType = state.TypeMap.get(dec.init.name);

              if (stateType !== initType) {
                errors.push(
                  TypesNotMatch(
                    stateType.annotation,
                    initType.annotation,
                    dec.loc,
                  ),
                );
              }
            } else {
              OtherTypeMatcher(dec, stateType, errors);
            }
          }
        } else if (dec.$Type) {
          if (dec.$Type.isAtom) {
            state.TypeMap.set(dec.id.name, dec.$Type);
          } else if (dec.$Type.isRef) {
            // Example: let b = c;
            const initType = state.TypeMap.get(dec.init.name);

            state.TypeMap.set(dec.id.name, initType);
          } else {
            state.TypeMap.set(dec.id.name, dec.$Type);
          }
        } else {
          c(dec.init, state);

          AutoTypeSetter(dec, state);
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
