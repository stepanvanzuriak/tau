const { UNKNOWN_TYPE } = require('./constants');

function getAtomType(value) {
  let $Type = UNKNOWN_TYPE;

  if (typeof value !== 'undefined' || value === null) {
    $Type = typeof value;
  }

  return $Type;
}

function isAtomType(name) {
  return ['number', 'string', 'symbol', 'boolean'].includes(name);
}

module.exports = {
  getAtomType,
  isAtomType,
};
