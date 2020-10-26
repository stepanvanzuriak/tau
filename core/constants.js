const UNKNOWN_TYPE = 'unknown';

const ATOM_TYPE = {
  BOOLEAN: "boolean"
}


const DEFINED_HIGH_ORDER_TYPES = {
  ARRAY: "Array",
  MIXED_ARRAY: "MixedArray"
}

const TYPE_KIND = {
  ATOM_TYPE: 'AtomType',
  REFERENCE_TYPE: 'ReferenceType',
  FUNCTION_TYPE: 'FunctionType',
  OBJECT_TYPE: 'ObjectType',
  ARROW_FUNCTION_TYPE: 'ArrowFunctionType',
  HIGH_ORDER_TYPE: 'HighOrderType',
};

const NODE_TYPE = {
  IDENTIFIER: 'Identifier',
  LITERAL: 'Literal',
  VARIABLE_DECLARATOR: 'VariableDeclarator',
  TYPE_DEFINITION: 'TypeDefinition',
  OBJECT_EXPRESSION: 'ObjectExpression',
  MEMBER_EXPRESSION: 'MemberExpression',
  ARROW_FUNCTION_EXPRESSION: 'ArrowFunctionExpression',
  CALL_EXPRESSION: 'CallExpression',
  FUNCTION_EXPRESSION: 'FunctionExpression',
  BLOCK_STATEMENT: 'BlockStatement',
  ARRAY_EXPRESSION: 'ArrayExpression',
  UNARY_EXPRESSION: "UnaryExpression",
};

module.exports = {
  UNKNOWN_TYPE,
  TYPE_KIND,
  NODE_TYPE,
  ATOM_TYPE,
  DEFINED_HIGH_ORDER_TYPES,
};
