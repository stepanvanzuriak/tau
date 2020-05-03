const { getAtomType } = require('./utils');

module.exports = function readToken(Parser) {
  return class extends Parser {
    finishNode(node, type) {
      if (type === 'VariableDeclarator') {
        node.$Type = getAtomType(node.init.value);
      }

      return super.finishNode(node, type);
    }

    // readToken(code) {
    //   super.readToken(code);
    // }

    // parseExprAtom(refShortHandDefaultPos) {
    //   return super.parseExprAtom(refShortHandDefaultPos);
    // }

    // updateContext(prevType) {
    //   //console.log('updateContext', prevType, this.type);

    //   return super.updateContext(prevType);
    // }

    // parseStatement(context, topLevel, exports) {
    //   console.log("parseStatement", context, topLevel, exports)
    //   super.parseStatement(context, topLevel, exports)
    // }

    // finishToken(type, val) {
    //   console.log(type, val)
    //   super.finishToken(type, val);
    // }
  };
};
