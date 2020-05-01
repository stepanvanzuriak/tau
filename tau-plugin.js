module.exports = function noisyReadToken(Parser) {
  return class extends Parser {
    readToken(code) {
      super.readToken(code);
    }

    finishNode(node, type) {
      if (type === 'VariableDeclarator') {
        if (typeof node.init.value === 'number') {
          node.$Type = 'number';
        } else if (typeof node.init.value === 'string') {
          node.$Type = 'string';
        }
      }

      return super.finishNode(node, type);
    }

    parseExprAtom(refShortHandDefaultPos) {
      return super.parseExprAtom(refShortHandDefaultPos);
    }

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
