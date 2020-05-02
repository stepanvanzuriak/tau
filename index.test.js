const { TauParser, TauValidator } = require('./index.js');

test('No errors test', () => {
  expect(TauValidator(TauParser.parse('2+2;'))).toHaveLength(0);
});
