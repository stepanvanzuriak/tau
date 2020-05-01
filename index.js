const fs = require('fs');
const walk = require('acorn-walk');
const { Parser } = require('acorn');

const TauParser = Parser.extend(require('./tau-plugin'));

function getVariableType(node, scope) {
  let $Type = 'unknown';

  walk.simple(scope, {
    VariableDeclarator(n) {
      if (n.id.name === node.name) {
        $Type = n.$Type;
      }
    },
  });

  return $Type;
}

const errors = [];

try {
  const data = fs.readFileSync('./test.tau.js', 'utf8');
  const ast = TauParser.parse(data);

  walk.ancestor(ast, {
    ExpressionStatement(node, scope) {
      const { left, right } = node.expression;
      const leftType = getVariableType(left, scope[0]);
      const rightType = getVariableType(right, scope[0]);

      if (left !== right) {
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

console.log(errors);
