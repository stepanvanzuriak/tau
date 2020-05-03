const fs = require('fs');
const path = require('path');
const { TauParser, TauValidator } = require('../index.js');

const data = fs.readFileSync(
  path.resolve(__dirname, './input/number.js'),
  'utf8',
);

test('Number test', () => {
  expect(TauValidator(TauParser(data))).toMatchObject([
    {
      loc: { end: { column: 14, line: 7 }, start: { column: 0, line: 7 } },
      name: 'Type number is not string',
    },
  ]);
});
