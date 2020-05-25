const acorn = require('acorn');

const { getAtomType, isAtomType } = require('./utils');

const tt = acorn.tokTypes;

// Token that defines `type` keyword
tt._type = new acorn.TokenType('type', { keyword: 'type' });

module.exports = function plugin(Parser) {
  class TauPlugin extends Parser {
    finishNode(node, type) {
      // Auto define type for variables
      // Example: let a = 12 // <- node.$Type = {name: number, isAtom: true}
      if (type === 'VariableDeclarator' && node.init.type === 'Literal') {
        node.$Type = getAtomType(node.init.value);
      }

      return super.finishNode(node, type);
    }

    _fromIdentToType() {
      let result = {};
      const ident = this.parseIdent();

      const isAtom = isAtomType(ident.name);

      if (isAtom) {
        result = { annotation: ident.name, type: 'AtomType' };
      } else {
        result = { annotation: ident.name, type: 'ReferenceType' };
      }

      result.isAtom = isAtom;
      result.isRef = !isAtom;

      return result;
    }

    _parseFunctionType() {
      // 1: Define node
      const result = { type: 'FunctionType' };
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
          params.push(this._fromIdentToType());
        } else {
          this.nextToken();
        }
      }

      // 3: Define arguments as node property
      result.arguments = params;

      // 4: Define result type as node property
      if (withResult) {
        result.result = this._fromIdentToType();
      }

      // 5: Define end of type
      this.semicolon();

      return result;
    }

    _parseTypeAnnotation() {
      // 1: Define new node
      let result = {};

      if (this.type === tt.parenL) {
        // 2a: If type annotation is function
        // Example: type f = (number) => number;
        this.nextToken();
        result = this._parseFunctionType();

        result.isRef = false;
        result.isAtom = false;
      } else {
        // 2b: If type annotation is just type name
        // Example: type a = number;

        result = this._fromIdentToType();
      }

      return result;
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
      node.$Type = this._parseTypeAnnotation();

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
