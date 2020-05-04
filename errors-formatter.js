function TypeDoubleDeclarationError(left, right, loc) {
  return {
    name: `Double declaration ${left} before and ${right} here`,
    loc,
  };
}

module.exports = {
  TypeDoubleDeclarationError,
};
