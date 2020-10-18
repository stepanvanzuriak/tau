const get = require('lodash.get');

const { getAtomType, TypeMap } = require('./utils');
const { UNKNOWN_TYPE, TYPE_KIND, NODE_TYPE } = require('./constants');
const { TypeOfReturnWrong } = require('./errors-formatter');

function typeToScope(name, type, node, state, errors) {
  if (type.isAtom) {
    state.TypeMap.set(name, type);
  } else if (type.isRef) {
    state.TypeMap.set(name, state.TypeMap.get(type));
  } else {
    errors.push(TypeRefNotFound(type, node.loc));
  }
}

function getRecursiveObjectPath(node, path = []) {
  if (node.object) {
    path = [...path, ...getRecursiveObjectPath(node.object, path)];
  }

  if (node.property) {
    path = [...path, node.property.name];
  }

  if (node.name) {
    path = [...path, node.name];
  }

  return path;
}

function annotationMatcher(left, right) {
  if (right.type === TYPE_KIND.ARROW_FUNCTION_TYPE) {
    // WARNING: Possible bug here when a = b.c ("a" and "b.c" are functions )
    return {
      match: left.annotation === right.annotation.result.annotation,
      left: left.annotation,
      right: right.annotation.result.annotation,
    };
  } else {
    return {
      match: left.annotation === right.annotation,
      left: left.annotation,
      right: right.annotation,
    };
  }
}

function ExpressionStatementTypeSwitch(node, state) {
  switch (node.type) {
    case NODE_TYPE.IDENTIFIER:
      return state.TypeMap.get(node.name);

    case NODE_TYPE.LITERAL:
      return getAtomType(node.value);

    case NODE_TYPE.MEMBER_EXPRESSION:
      const [id, ...path] = getRecursiveObjectPath(node);

      if (state.TypeMap.get(id)) {
        const result = get(
          state.TypeMap.get(id),
          path.reduce((acc, el) => [...acc, 'annotation', el], []),
        );

        if (result.isRef) {
          return state.TypeMap.get(result.annotation);
        }

        return result;
      }

      return UNKNOWN_TYPE;

    case NODE_TYPE.CALL_EXPRESSION:
      return ExpressionStatementTypeSwitch(node.callee, state);

    default:
      return UNKNOWN_TYPE;
  }
}

function OtherTypeMatcher(dec, stateType, errors) {
  // TODO: Convert to switch
  if (dec.$Type.type === TYPE_KIND.ARROW_FUNCTION_TYPE) {
    const result = dec.$Type.annotation.result;
    if (result.isAtom) {
      if (stateType.result.annotation !== result.annotation) {
        errors.push(
          TypeOfReturnWrong(
            result.annotation,
            stateType.result.annotation,
            dec.loc,
          ),
        );
      }
    }
  }
}

function AutoTypeSetter(dec, state) {
  // TODO: Convert to switch
  let autoType;

  if (dec.init.type === NODE_TYPE.CALL_EXPRESSION) {
    autoType = state.TypeMap.get(dec.init.callee.name).result;
    state.TypeMap.set(dec.id.name, autoType);
  }
}

module.exports = {
  typeToScope,
  ExpressionStatementTypeSwitch,
  OtherTypeMatcher,
  annotationMatcher,
  getRecursiveObjectPath,
  AutoTypeSetter,
};
