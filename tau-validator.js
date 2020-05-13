const walk = require('acorn-walk');

const { getAtomType, TypeMap, isAtomType } = require('./utils');
const { UNKNOWN_TYPE } = require('./constants');

const {
  TypeDoubleDeclarationError,
  TypesNotMatch,
  TypeRefNotFound,
  TypeOfReturnWrong,
} = require('./errors-formatter.js');

function ExpressionStatementTypeSwitch(node, state) {
  switch (node.type) {
    case 'Identifier':
      return state.TypeMap.get(node.name);

    case 'Literal':
      return getAtomType(node.value).name;

    default:
      return UNKNOWN_TYPE;
  }
}

function typeToScope(name, type, node, state, errors) {
  if (isAtomType(type)) {
    state.TypeMap.set(name, type);
  } else if (state.TypeMap.has(type)) {
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
      if (definedReturnedType !== realReturnType) {
        errors.push(
          TypeOfReturnWrong(definedReturnedType, realReturnType, node.loc),
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
          const argType = arg.name;
          const { name } = untypedArgs[index];

          typeToScope(name, argType, node, state, errors);
        });

        if (type.result) {
          typeToScope(node.id.name, type.result.name, node, state, errors);
        }
      }
      state.currentFunction = node.id.name;
      c(node.body, state);
    },

    // Visit function for TypeDefinition
    // Example: type a = boolean;
    TypeDefinition(node, state) {
      const typeAlias = node.alias.name;
      const { annotation } = node;

      // TODO: Extend this
      if (annotation.$Type.type !== 'FunctionType') {
        const typeAnnotation = annotation.$Type.name;

        if (state.TypeMap.hasScope(typeAlias)) {
          errors.push(
            TypeDoubleDeclarationError(
              state.TypeMap.get(typeAlias),
              typeAnnotation,
              node.loc,
            ),
          );
        } else if (!annotation.isReferenceType) {
          state.TypeMap.set(typeAlias, typeAnnotation);
        } else if (state.TypeMap.has(typeAnnotation)) {
          state.TypeMap.set(typeAlias, state.TypeMap.get(typeAnnotation));
        } else {
          errors.push(TypeRefNotFound(typeAnnotation, node.loc));
        }
      } else if (annotation.$Type.type === 'FunctionType') {
        state.TypeMap.set(typeAlias, annotation.$Type);
      }
    },

    // Visit function for ExpressionStatement
    // Example: num1 = num2;
    ExpressionStatement(node, state) {
      // Left and right nodes: Node -> expression -> left / right
      const { left, right } = node.expression;
      const leftType = ExpressionStatementTypeSwitch(left, state);
      const rightType = ExpressionStatementTypeSwitch(right, state);

      if (leftType !== rightType) {
        errors.push(TypesNotMatch(leftType, rightType, node.loc));
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
            if (type !== dec.$Type.name) {
              // type a = string;
              // let a = 12; // <- Error here
              errors.push(TypesNotMatch(type, dec.$Type.name, dec.loc));
              break;
            }
          } else {
            // When let a = c;
            const initType = state.TypeMap.get(dec.init.name);

            if (type !== initType) {
              errors.push(TypesNotMatch(type, initType, dec.loc));
              break;
            }
          }
        }

        if (dec.$Type) {
          state.TypeMap.set(dec.id.name, dec.$Type.name);
        } else {
          // Example: let b = c;
          const initType = state.TypeMap.get(dec.init.name);

          state.TypeMap.set(dec.id.name, initType);
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
