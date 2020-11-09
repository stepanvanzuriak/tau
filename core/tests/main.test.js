const fs = require('fs');
const path = require('path');
const { TauParser, TauValidator } = require('../index.js');

const base = path.resolve(__dirname, './inputs');
const rosettaCodeTestBase = path.resolve(__dirname, './inputs/rosettacode');
const baseTests = fs.readdirSync(base).filter((el) => el.endsWith('.js'));
const rosettaCodeTest = fs.readdirSync(rosettaCodeTestBase);

baseTests.forEach((testName) => {
  test(testName, () => {
    const content = fs.readFileSync(path.join(base, testName), 'utf8');

    const [value, match] = content.split('// EXPECT');

    expect(TauValidator(TauParser(value)).errors).toMatchObject(
      eval(match.replace(/\s+/g, ' ').trim()),
    );
  });
});

rosettaCodeTest.forEach((testName) => {
  test(testName, () => {
    const content = fs.readFileSync(
      path.join(rosettaCodeTestBase, testName),
      'utf8',
    );

    const [value, match] = content.split('// EXPECT');

    expect(TauValidator(TauParser(value)).errors).toMatchObject(
      eval(match.replace(/\s+/g, ' ').trim()),
    );
  });
});
