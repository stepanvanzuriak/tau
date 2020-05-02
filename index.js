const walk = require('acorn-walk');
const { Parser } = require('acorn');

const TauParser = Parser.extend(require('./tau-plugin'));

function getVariableType(node, scope) {
  let $Type = 'unknown';

  if (node.type === 'Literal') {
    return typeof node.value;
  }

  walk.simple(scope, {
    VariableDeclarator(n) {
      if (n.id.name === node.name && $Type === 'unknown') {
        $Type = n.$Type;
      }
    },
  });

  return $Type;
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

        if (leftType !== rightType) {
          errors.push({
            name: `Type ${leftType} is not ${rightType}`,
            start: node.start,
            end: node.end,
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
