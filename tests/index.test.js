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

test('Number test', () => {
  expect(TauValidator(TauParser(numberTestInput))).toMatchObject([
    {
      loc: { end: { column: 14, line: 7 }, start: { column: 0, line: 7 } },
      name: 'Type number is not string',
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
      name: 'Type string is not number',
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
      name: 'Type number is not string',
    },
  ]);
});
