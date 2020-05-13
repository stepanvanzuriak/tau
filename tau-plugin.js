const acorn = require('acorn');

const { getAtomType, isAtomType } = require('./utils');

const tt = acorn.tokTypes;

// Token that defines `type` keyword
tt._type = new acorn.TokenType('type', { keyword: 'type' });

module.exports = function plugin(Parser) {
  class TauPlugin extends Parser {
    finishNode(node, type) {
      // Auto define type for variables
      // Example: let a = 12 // <- node.$Type = number
      if (type === 'VariableDeclarator' && node.init.type === 'Literal') {
        node.$Type = getAtomType(node.init.value);
      }

      return super.finishNode(node, type);
    }

    _parseFunctionType() {
      // 1: Define node
      const node = this.startNode();
      const params = [];
      let withResult = true;

      // 2: Push function arguments to list
      // Example (number, boolean) => string // [number, boolean]
      while (!this.eat(tt.arrow)) {
        // Break the look if function defined without result type
        // Example: type f = (number, number);

        if (this.type === tt.semi) {
          withResult = false;
          break;
        }

        if (this.type === tt.name) {
          params.push(this.parseIdent());
        } else {
          this.nextToken();
        }
      }

      // 3: Define arguments as node property
      node.arguments = params;

      // 4: Define result type as node property
      if (withResult) {
        node.result = this.parseIdent();
      }

      // 5: Define end of type
      this.semicolon();

      return this.finishNode(node, 'FunctionType');
    }

    _parseTypeAnnotation() {
      // 1: Define new node
      const node = this.startNode(this.lastTokStart, this.lastTokStartLoc);

      if (this.type === tt.parenL) {
        // 2a: If type annotation is function
        // Example: type f = (number) => number;
        this.nextToken();
        node.$Type = this._parseFunctionType();

        node.isReferenceType = false;
      } else {
        // 2b: If type annotation is just type name
        // Example: type a = number;
        node.$Type = this.parseIdent();

        node.isReferenceType = !isAtomType(node.$Type.name);
      }

      return this.finishNode(node, 'TypeAnnotation');
    }

    _parseTypeAliasDeclaration() {
      // 1: Define new type Node
      const node = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);

      // 2: Set name of type
      // Example: type a = number; // <- `a` is alias here
      node.alias = this.parseIdent();

      // 3: Expect `=` token
      this.expect(tt.eq);

      // 4: Parse type annotation
      // Example: type a = number; // <- `number` is annotation
      node.annotation = this._parseTypeAnnotation();

      // 5: Define end of type
      this.semicolon();
      return this.finishNode(node, 'TypeDefinition');
    }

    _parseType(node, expr) {
      // Check if current expression is `type`
      if (expr.name === tt._type.keyword && this.type === tt.name) {
        return this._parseTypeAliasDeclaration();
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
