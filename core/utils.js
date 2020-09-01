const { UNKNOWN_TYPE, NODE_TYPE, TYPE_KIND } = require('./constants');

function getRefType(name) {
  return {
    annotation: name,
    type: TYPE_KIND.REFERENCE_TYPE,
    isAtom: false,
    isRef: true,
  };
}

function getAtomType(value) {
  if (typeof value !== 'undefined' || value === null) {
    return {
      annotation: typeof value,
      isAtom: true,
      isRef: false,
      type: TYPE_KIND.ATOM_TYPE,
    };
  }

  return UNKNOWN_TYPE;
}

function isAtomType(name) {
  return ['number', 'string', 'symbol', 'boolean'].includes(name);
}

function getObjectType(node) {
  return {
    annotation: node.properties.reduce((acc, prop) => {
      switch (prop.value.type) {
        case NODE_TYPE.IDENTIFIER: {
          acc[prop.key.name] = getRefType(prop.value.name);
          break;
        }
        case NODE_TYPE.LITERAL: {
          acc[prop.key.name] = getAtomType(prop.value.value);
          break;
        }
        case NODE_TYPE.OBJECT_EXPRESSION: {
          acc[prop.key.name] = getObjectType(prop.value);
          break;
        }
        case NODE_TYPE.ARROW_FUNCTION_EXPRESSION: {
          acc[prop.key.name] = getArrowFunctionType(prop.value);
          break;
        }
      }

      return acc;
    }, {}),
    isAtom: false,
    isRef: false,
    type: TYPE_KIND.OBJECT_TYPE,
  };
}

function getArrowFunctionType(node) {
  const annotation = {};

  annotation.arguments = node.params.map(({ name }) => name);

  switch (node.body.type) {
    case NODE_TYPE.LITERAL: {
      annotation.result = getAtomType(node.body.value);
      break;
    }
    case NODE_TYPE.IDENTIFIER: {
      annotation.result = getRefType(node.body.name);
      break;
    }
  }

  return {
    annotation,
    isRef: false,
    isAtom: false,
    type: TYPE_KIND.ARROW_FUNCTION_TYPE,
  };
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
  getObjectType,
  getRefType,
  getArrowFunctionType,
  isAtomType,
  TypeMap,
};
