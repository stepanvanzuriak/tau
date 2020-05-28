const { UNKNOWN_TYPE } = require('./constants');

function getAtomType(value) {
  if (typeof value !== 'undefined' || value === null) {
    return {
      annotation: typeof value,
      isAtom: true,
      isRef: false,
      type: 'AtomType',
    };
  }

  return UNKNOWN_TYPE;
}

function isAtomType(name) {
  return ['number', 'string', 'symbol', 'boolean'].includes(name);
}

class TypeMap {
  constructor() {
    this.scopes = [new Map()];
  }

  lastScope() {
    return this.scopes[this.scopes.length - 1];
  }

  set(name, type) {
    this.lastScope().set(name, type);
  }

  addScope() {
    this.scopes.push(new Map());
  }

  get(name) {
    for (let i = this.scopes.length - 1; i >= 0; i -= 1) {
      if (this.scopes[i].has(name)) {
        return this.scopes[i].get(name);
      }
    }

    return undefined;
  }

  hasScope(name) {
    return this.lastScope().has(name);
  }

  has(name) {
    for (let i = this.scopes.length - 1; i >= 0; i -= 1) {
      if (this.scopes[i].has(name)) {
        return true;
      }
    }

    return false;
  }
}

module.exports = {
  getAtomType,
  isAtomType,
  TypeMap,
};
