const fs = require('fs');
const path = require('path');
const { TauParser, TauValidator } = require('../index');

const base = path.resolve(__dirname, './raw');
const snapshots = path.resolve(__dirname, './snapshots');
const files = fs.readdirSync(base);

files.forEach((file) => {
  const content = fs.readFileSync(path.join(base, file), 'utf8');
  const snapshot = TauValidator(TauParser(content), undefined).typeMap;

  fs.writeFileSync(path.resolve(snapshots, `${file}.snapshot.js`), '');
  fs.writeFileSync(
    path.resolve(snapshots, `${file}.snapshot.js`),
    `module.exports = {types: ${JSON.stringify(
      { typeMap: snapshot },
      null,
      1,
    )}}`,
  );
});
