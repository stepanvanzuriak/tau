const get = require('lodash.get');

const { getAtomType, getArrayType, buildAtomType } = require('./utils');
const {
  UNKNOWN_TYPE,
  TYPE_KIND,
  NODE_TYPE,
  DEFINED_HIGH_ORDER_TYPES,
  ATOM_TYPE,
} = require('./constants');
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

function annotationPrepare(node) {
  switch (node.annotation) {
    case DEFINED_HIGH_ORDER_TYPES.ARRAY:
    case DEFINED_HIGH_ORDER_TYPES.MIXED_ARRAY:
      return `${node.annotation}(${node.arguments
        .map((arg) => arg.annotation)
        .join(',')})`;

    default:
      return node.annotation;
  }
}

function annotationMatcher(left, right) {
  switch (right.type) {
    case TYPE_KIND.ARROW_FUNCTION_TYPE: {
      const leftAnnotation = annotationPrepare(left);
      const rightAnnotation = annotationPrepare(right.annotation.result);
      return {
        match: leftAnnotation === rightAnnotation,
        left: leftAnnotation,
        right: rightAnnotation,
      };
    }

    default: {
      const leftAnnotation = annotationPrepare(left);
      const rightAnnotation = annotationPrepare(right);

      return {
        match: leftAnnotation === rightAnnotation,
        left: leftAnnotation,
        right: rightAnnotation,
      };
    }
  }
}

function ExpressionStatementTypeSwitch(node, state) {
  switch (node.type) {
    case NODE_TYPE.IDENTIFIER:
      return state.TypeMap.get(node.name);

    case NODE_TYPE.LITERAL:
      return getAtomType(node.value);

    case NODE_TYPE.MEMBER_EXPRESSION: {
      const [id, ...path] = getRecursiveObjectPath(node);

      const type = state.TypeMap.get(id);

      if (type) {
        if (type.annotation === DEFINED_HIGH_ORDER_TYPES.ARRAY) {
          return type.arguments[0];
        }

        const result = get(
          type,
          path.reduce((acc, el) => [...acc, 'annotation', el], []),
        );

        if (result.isRef) {
          return state.TypeMap.get(result.annotation);
        }

        return result;
      }

      return UNKNOWN_TYPE;
    }

    case NODE_TYPE.CALL_EXPRESSION:
      return ExpressionStatementTypeSwitch(node.callee, state);

    case NODE_TYPE.ARRAY_EXPRESSION: {
      const type = state.TypeMap.get(node.name);

      if (type) {
        return type;
      }

      return getArrayType(node);
    }

    case NODE_TYPE.UNARY_EXPRESSION: {
      return buildAtomType(ATOM_TYPE.BOOLEAN);
    }

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
