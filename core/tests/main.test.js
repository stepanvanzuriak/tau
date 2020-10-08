const fs = require('fs');
const path = require('path');
const { TauParser, TauValidator } = require('../index.js');

const base = path.resolve(__dirname, './inputs');
const tests = fs.readdirSync(base);

tests
  .filter((testName) => testName === 'anon-func.js')
  .forEach((testName) => {
    test(testName, () => {
      const content = fs.readFileSync(path.join(base, testName), 'utf8');

      const [value, match] = content.split('// EXPECT');

      expect(TauValidator(TauParser(value))).toMatchObject(
        eval(match.replace(/\s+/g, ' ').trim()),
      );
    });
  });
