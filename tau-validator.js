const walk = require('acorn-walk');
const { getAtomType } = require('./utils');
const { UNKNOWN_TYPE } = require('./constants');

function ignore() {}

const visitor = {
  ...walk.base,
  TypeDefinition: ignore,
  TypeAnnotation: ignore,
};

function getVariableType(node, scope) {
  let $Type;

  if (node.type === 'Literal') {
    return getAtomType(node.value);
  }

  walk.simple(
    scope,
    {
      TypeDefinition(n) {
        if (n.alias.name === node.id.name && !$Type) {
          $Type = n.annotation.$Type.name;
        }
      },
      VariableDeclarator(n) {
        if (n.id.name === node.name && !$Type) {
          $Type = n.$Type;
        }
      },
    },
    visitor,
  );

  return $Type || UNKNOWN_TYPE;
}

function searchForTypeDefinition(node, scope) {
  let result;

  walk.simple(
    scope,
    {
      TypeDefinition(n) {
        if (n.alias.name === node.name) {
          if (!result) {
            result = n;
          } else {
            throw {
              name: `Double declaration ${result.annotation.$Type.name} before and ${n.annotation.$Type.name} here`,
              loc: n.loc,
            };
          }
        }
      },
    },
    visitor,
  );

  return result;
}

function TauValidator(ast) {
  const errors = [];

  walk.ancestor(
    ast,
    {
      VariableDeclarator(node, scope) {
        const parentScope = scope[0];
        let definition;
        let rightType;
        let leftType;

        try {
          definition = searchForTypeDefinition(node.id, parentScope);
          leftType = definition && definition.annotation.$Type.name;
        } catch (error) {
          errors.push(error);
        }

        // when right value is literal
        if (node.init.type === 'Literal') {
          rightType = getAtomType(node.init.value);
        }

        // when right value not literal
        if (node.init.type === 'Identifier') {
          try {
            const rightTypeDefinition = searchForTypeDefinition(
              node.init,
              parentScope,
            );
            rightType =
              rightTypeDefinition && rightTypeDefinition.annotation.$Type.name;
          } catch (error) {
            errors.push(error);
          }
        }

        // TODO: Only naming, fix for values
        if (leftType !== rightType && rightType && leftType) {
          errors.push({
            name: `Type ${leftType} is not ${rightType}`,
            loc: node.loc,
          });
        }
      },
      ExpressionStatement(node, scope) {
        const { left, right } = node.expression;
        const parentScope = scope[0];

        const leftType = getVariableType(left, parentScope);
        const rightType = getVariableType(right, parentScope);

        if (leftType !== rightType && leftType !== UNKNOWN_TYPE) {
          errors.push({
            name: `Type ${leftType} is not ${rightType}`,
            loc: node.loc,
          });
        }
      },
    },
    visitor,
  );

  return errors;
}

module.exports = TauValidator;
