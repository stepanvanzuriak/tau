const UNKNOWN_TYPE = 'unknown';

const TYPE_KIND = {
  ATOM_TYPE: 'AtomType',
  REFERENCE_TYPE: 'ReferenceType',
  FUNCTION_TYPE: 'FunctionType',
};

const NODE_TYPE = {
  IDENTIFIER: 'Identifier',
  LITERAL: 'Literal',
  VARIABLE_DECLARATOR: 'VariableDeclarator',
  TYPE_DEFINITION: 'TypeDefinition',
  OBJECT_EXPRESSION: 'ObjectExpression',
  MEMBER_EXPRESSION: 'MemberExpression',
};

module.exports = {
  UNKNOWN_TYPE,
  TYPE_KIND,
  NODE_TYPE,
};
