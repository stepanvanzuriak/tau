const walk = require('acorn-walk');
const { Parser } = require('acorn');
const { getAtomType } = require('./utils');
const { UNKNOWN_TYPE } = require('./constants');

const TauParserObject = Parser.extend(require('./tau-plugin'));

function getVariableType(node, scope) {
  let $Type;

  if (node.type === 'Literal') {
    return getAtomType(node.value);
  }

  walk.simple(scope, {
    VariableDeclarator(n) {
      if (n.id.name === node.name && !$Type) {
        $Type = n.$Type;
      }
    },
  });

  return $Type || UNKNOWN_TYPE;
}

function TauParser(data) {
  return TauParserObject.parse(data, { locations: true });
}

function TauValidator(ast) {
  const errors = [];
  try {
    walk.ancestor(ast, {
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
    });
  } catch (err) {
    console.error(err);
  }

  return errors;
}

module.exports = {
  TauParser,
  TauValidator,
};
