const walk = require('acorn-walk');
const { getAtomType } = require('./utils');
const { UNKNOWN_TYPE } = require('./constants');
const { TypeDoubleDeclarationError } = require('./errors-formatter.js');

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
        if (n.alias.name === node.name && !$Type) {
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

function findDefinition(defs, node, typeAlias = false) {
  let found;

  if (!typeAlias) {
    found = defs.filter((n) => n.alias.name === node.name);
  } else {
    found = defs.filter((n) => n.alias.name === typeAlias);
  }

  if (!found.length) {
    return UNKNOWN_TYPE;
  }

  if (found.length > 1) {
    throw TypeDoubleDeclarationError(
      found[0].annotation.$Type.name,
      found[1].annotation.$Type.name,
      found[1].loc,
    );
  }

  if (!found[0].annotation.isReferenceType) {
    return found[0];
  }

  return findDefinition(defs, node, found[0].annotation.$Type.name);
}

function searchForTypeDefinition(node, scope) {
  const typeDefs = [];

  walk.simple(
    scope,
    {
      TypeDefinition(n) {
        typeDefs.push(n);
      },
    },
    visitor,
  );

  return findDefinition(typeDefs, node);
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
          leftType =
            definition &&
            definition.annotation &&
            definition.annotation.$Type.name;
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

        const parentScope = scope[scope.length - 2];

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
