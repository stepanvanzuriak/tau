const acorn = require('acorn');

const {
  getAtomType,
  getObjectType,
  isAtomType,
  getRefType,
  getFunctionType,
  getArrayType,
} = require('./utils');
const { TYPE_KIND, NODE_TYPE } = require('./constants');

const tt = acorn.tokTypes;

// Token that defines `type` keyword
tt._type = new acorn.TokenType('type', { keyword: 'type' });

module.exports = function plugin(Parser) {
  class TauPlugin extends Parser {
    finishNode(node, type) {
      if (
        type === NODE_TYPE.VARIABLE_DECLARATOR &&
        node.init &&
        node.init.type
      ) {
        switch (node.init.type) {
          case NODE_TYPE.LITERAL: {
            node.$Type = getAtomType(node.init.value);
            break;
          }
          case NODE_TYPE.OBJECT_EXPRESSION: {
            node.$Type = getObjectType(node.init);
            break;
          }
          case NODE_TYPE.FUNCTION_EXPRESSION:
          case NODE_TYPE.ARROW_FUNCTION_EXPRESSION: {
            node.$Type = getFunctionType(node.init);
            break;
          }
          case NODE_TYPE.ARRAY_EXPRESSION: {
            node.$Type = getArrayType(node.init);
            break;
          }
        }
      }

      return super.finishNode(node, type);
    }

    _fromIdentToType() {
      let result = {};
      const ident = this.parseIdent();

      const isAtom = isAtomType(ident.name);

      if (isAtom) {
        result = {
          annotation: ident.name,
          isAtom: true,
          isRef: false,
          type: TYPE_KIND.ATOM_TYPE,
        };
      } else {
        result = getRefType(ident.name);
      }

      return result;
    }

    _parseFunctionType() {
      // 1: Define node
      const result = {
        type: TYPE_KIND.FUNCTION_TYPE,
        isRef: false,
        isAtom: false,
      };
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

    _parseObjectType() {
      // 1: Define node
      const result = {
        type: TYPE_KIND.OBJECT_TYPE,
        isRef: false,
        isAtom: false,
        annotation: {},
      };

      let isOpenParam = false;

      const keys = [];
      const types = [];

      while (!this.eat(tt.braceR)) {
        if (!isOpenParam) {
          if (this.type === tt.name) {
            const ident = this.parseIdent();

            keys.push(ident.name);
            isOpenParam = true;
          } else {
            this.nextToken();
          }
        } else {
          this.expect(tt.colon);

          if (this.type === tt.name) {
            const type = this._fromIdentToType();
            types.push(type);
            isOpenParam = false;
          } else {
            this.nextToken();
          }
        }
      }

      if (keys.length === types.length) {
        keys.forEach((key, index) => {
          result.annotation[key] = types[index];
        });
      } else {
        throw new Error('Wrong type formation');
      }

      return result;
    }

    _parseHighOrderType(typeBase) {
      const result = {
        type: TYPE_KIND.HIGH_ORDER_TYPE,
        isRef: false,
        isAtom: false,
        annotation: typeBase.annotation,
      };

      const params = [];

      while (!this.eat(tt.parenR)) {
        if (this.type === tt.name) {
          params.push(this._fromIdentToType());
        } else {
          this.nextToken();
        }
      }

      result.arguments = params;

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
      } else if (this.type === tt.braceL) {
        // 2b: If type annotation is object
        // Example: type a = {a: number};
        this.nextToken();
        result = this._parseObjectType();
      } else {
        // 2с: If type annotation is just type name
        // Example: type a = number;

        result = this._fromIdentToType();

        // 2d: If type is High order type
        // Example: type a = Array(number);
        if (this.type === tt.parenL) {
          result = this._parseHighOrderType(result);
        }
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
      return this.finishNode(node, NODE_TYPE.TYPE_DEFINITION);
    }

    _parseType(node, expr) {
      // Check if current expression is `type`
      if (expr.name === tt._type.keyword && this.type === tt.name) {
        return this._parseTypeAliasDeclaration();
      }

      return super.parseExpressionStatement(node, expr);
    }

    parseExpressionStatement(node, expr) {
      return expr.type === NODE_TYPE.IDENTIFIER
        ? this._parseType(node, expr)
        : super.parseExpressionStatement(node, expr);
    }
  }

  return TauPlugin;
};
