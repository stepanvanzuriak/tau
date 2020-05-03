const acorn = require('acorn');

const { getAtomType } = require('./utils');

const tt = acorn.tokTypes;

tt._type = new acorn.TokenType('type', { keyword: 'type' });

module.exports = function plugin(Parser) {
  class TauPlugin extends Parser {
    finishNode(node, type) {
      if (type === 'VariableDeclarator') {
        node.$Type = getAtomType(node.init.value);
      }

      return super.finishNode(node, type);
    }

    parseTypeAnnotation() {
      const node = this.startNode(this.lastTokStart, this.lastTokStartLoc);

      node.$Type = this.parseIdent();

      return this.finishNode(node, 'TypeAnnotation');
    }

    parseTypeAliasDeclaration() {
      const node = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
      node.alias = this.parseIdent();

      this.expect(tt.eq);
      node.annotation = this.parseTypeAnnotation();

      this.semicolon();
      return this.finishNode(node, 'TypeDefinition');
    }

    _parseType(node, expr) {
      if (expr.name === tt._type.keyword) {
        if (this.type === tt.name) {
          return this.parseTypeAliasDeclaration();
        }
      }

      return super.parseExpressionStatement(node, expr);
    }

    parseExpressionStatement(node, expr) {
      return expr.type === 'Identifier'
        ? this._parseType(node, expr)
        : super.parseExpressionStatement(node, expr);
    }
  }

  return TauPlugin;
};
