function TypeDoubleDeclarationError(left, right, loc) {
  return {
    name: `Double declaration ${left} before and ${right} here`,
    loc,
  };
}

function TypesNotMatch(left, right, loc) {
  return { name: `Type ${left} is not match ${right}`, loc };
}

function ArgumentsNotMatch(left, right, loc) {
  // TODO: ADD argument name to error
  return { name: `Argument ${left} is not match ${right}`, loc };
}

function TypeRefNotFound(name, loc) {
  return { name: `Type ${name} not found`, loc };
}

function TypeOfReturnWrong(defined, real, loc) {
  return { name: `Type ${defined} is expected, but ${real} is returned`, loc };
}

module.exports = {
  TypeDoubleDeclarationError,
  TypesNotMatch,
  TypeRefNotFound,
  TypeOfReturnWrong,
  ArgumentsNotMatch,
};
