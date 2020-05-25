const fs = require('fs');
const path = require('path');
const { TauParser, TauValidator } = require('../index.js');

const numberTestInput = fs.readFileSync(
  path.resolve(__dirname, './input/number.js'),
  'utf8',
);

const typeDefInput = fs.readFileSync(
  path.resolve(__dirname, './input/type-def.js'),
  'utf8',
);

const doubleTypeDefInput = fs.readFileSync(
  path.resolve(__dirname, './input/double-type-def.js'),
  'utf8',
);

const globalTypeInput = fs.readFileSync(
  path.resolve(__dirname, './input/global-type.js'),
  'utf8',
);

const functionScopeInput = fs.readFileSync(
  path.resolve(__dirname, './input/function-scope.js'),
  'utf8',
);

const functionScopeTypeDef = fs.readFileSync(
  path.resolve(__dirname, './input/function-scope-type-def.js'),
  'utf8',
);

const functionArguments = fs.readFileSync(
  path.resolve(__dirname, './input/function-arguments.js'),
  'utf8',
);

const functionResult = fs.readFileSync(
  path.resolve(__dirname, './input/function-result.js'),
  'utf8',
);

test('Number test', () => {
  expect(TauValidator(TauParser(numberTestInput))).toMatchObject([
    {
      loc: { end: { column: 14, line: 8 }, start: { column: 0, line: 8 } },
      name: 'Type number is not match string',
    },
  ]);
});

test('Type definition', () => {
  expect(TauValidator(TauParser(typeDefInput))).toMatchObject([
    {
      loc: {
        end: {
          column: 10,
          line: 2,
        },
        start: {
          column: 4,
          line: 2,
        },
      },
      name: 'Type string is not match number',
    },
  ]);
});

test('Double type definition error', () => {
  expect(TauValidator(TauParser(doubleTypeDefInput))).toMatchObject([
    {
      loc: {
        end: {
          column: 16,
          line: 2,
        },
        start: {
          column: 0,
          line: 2,
        },
      },
      name: 'Double declaration number before and string here',
    },
  ]);
});

test('Type Reference', () => {
  expect(TauValidator(TauParser(globalTypeInput))).toMatchObject([]);
});

test('Function scope', () => {
  expect(TauValidator(TauParser(functionScopeInput))).toMatchObject([]);
});

test('Function scope type def', () => {
  expect(TauValidator(TauParser(functionScopeTypeDef))).toMatchObject([
    {
      loc: {
        end: {
          column: 20,
          line: 12,
        },
        start: {
          column: 8,
          line: 12,
        },
      },
      name: 'Type number is not match string',
    },
  ]);
});

test('Function arguments', () => {
  expect(TauValidator(TauParser(functionArguments))).toMatchObject([
    {
      loc: {
        end: {
          column: 9,
          line: 3,
        },
        start: {
          column: 2,
          line: 3,
        },
      },
      name: 'Type string is not match number',
    },
  ]);
});

test('Function result', () => {
  expect(TauValidator(TauParser(functionResult))).toMatchObject([
    {
      loc: {
        end: {
          column: 11,
          line: 3,
        },
        start: {
          column: 2,
          line: 3,
        },
      },
      name: 'Type number is expected, but string is returned',
    },
  ]);
});
