const UNKNOWN_TYPE = 'unknown';

const TYPE_KIND = {
  ATOM_TYPE: 'AtomType',
  REFERENCE_TYPE: 'ReferenceType',
  FUNCTION_TYPE: 'FunctionType',
  OBJECT_TYPE: 'ObjectType',
  ARROW_FUNCTION_TYPE: 'ArrowFunctionType',
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
};

module.exports = {
  UNKNOWN_TYPE,
  TYPE_KIND,
  NODE_TYPE,
};
