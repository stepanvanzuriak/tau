const { Parser } = require('acorn');
const TauPlugin = require('./tau-plugin');
const TauValidator = require('./tau-validator');

const TauParserObject = Parser.extend(TauPlugin);

function TauParser(data) {
 
  return TauParserObject.parse(data, {
    locations: true,
    ecmaVersion: 2020,
  });
}

module.exports = {
  TauParser,
  TauValidator,
};
