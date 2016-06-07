import {transform} from 'babel-core';
import generate from 'babel-generator';
import assert from 'power-assert';
import ASTLiteral from '../index';

describe('babel-plugin-ast-literal', function() {

  it('generates expressions', function() {
    let src = 'expr`1 + ${2}`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
var __liftToAST = require("babel-plugin-ast-literal/lib/liftToAST").default;

(function (_param) {
  _param = __liftToAST(_param);
  return {
    "type": "BinaryExpression",
    "left": {
      "type": "NumericLiteral",
      "extra": {
        "rawValue": 1,
        "raw": "1"
      },
      "value": 1
    },
    "operator": "+",
    "right": _param,
    "extra": {
      "parenthesized": true,
      "parenStart": 0
    }
  };
})(2);
`.trim());
  });

  it('generates expressions (function expression)', function() {
    let src = 'expr`function(${a}) { return ${a}; }`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
var __liftToAST = require("babel-plugin-ast-literal/lib/liftToAST").default;

(function (_param, _param2) {
  _param = __liftToAST(_param);
  _param2 = __liftToAST(_param2);
  return {
    "type": "FunctionExpression",
    "id": null,
    "generator": false,
    "expression": false,
    "async": false,
    "params": [_param],
    "body": {
      "type": "BlockStatement",
      "body": [{
        "type": "ReturnStatement",
        "argument": _param2
      }],
      "directives": []
    },
    "extra": {
      "parenthesized": true,
      "parenStart": 0
    }
  };
})(a, a);
`.trim());
  });

  it('generates expressions (string literal)', function() {
    let src = 'expr`"ok"`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
var __liftToAST = require("babel-plugin-ast-literal/lib/liftToAST").default;

(function () {
  return {
    "type": "StringLiteral",
    "extra": {
      "rawValue": "ok",
      "raw": "\\\"ok\\\"",
      "parenthesized": true,
      "parenStart": 0
    },
    "value": "ok"
  };
})();
`.trim());
  });

  it('generates statements', function() {
    let src = 'stmt`1 + ${2}`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
var __liftToAST = require("babel-plugin-ast-literal/lib/liftToAST").default;

(function (_param) {
  _param = __liftToAST(_param);
  return {
    "type": "ExpressionStatement",
    "expression": {
      "type": "BinaryExpression",
      "left": {
        "type": "NumericLiteral",
        "extra": {
          "rawValue": 1,
          "raw": "1"
        },
        "value": 1
      },
      "operator": "+",
      "right": _param
    }
  };
})(2);
`.trim());
  });

  it('generates lists of statements', function() {
    let src = 'stmt`let result = 1 + ${2}; console.log(result);`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
var __liftToAST = require("babel-plugin-ast-literal/lib/liftToAST").default;

(function (_param) {
  _param = __liftToAST(_param);
  return [{
    "type": "VariableDeclaration",
    "declarations": [{
      "type": "VariableDeclarator",
      "id": {
        "type": "Identifier",
        "name": "result"
      },
      "init": {
        "type": "BinaryExpression",
        "left": {
          "type": "NumericLiteral",
          "extra": {
            "rawValue": 1,
            "raw": "1"
          },
          "value": 1
        },
        "operator": "+",
        "right": _param
      }
    }],
    "kind": "let"
  }, {
    "type": "ExpressionStatement",
    "expression": {
      "type": "CallExpression",
      "callee": {
        "type": "MemberExpression",
        "object": {
          "type": "Identifier",
          "name": "console"
        },
        "property": {
          "type": "Identifier",
          "name": "log"
        },
        "computed": false
      },
      "arguments": [{
        "type": "Identifier",
        "name": "result"
      }]
    }
  }];
})(2);
`.trim());
  });

  it('generates statements with return', function() {
    let src = 'stmt`return ${1}`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
var __liftToAST = require("babel-plugin-ast-literal/lib/liftToAST").default;

(function (_param) {
  _param = __liftToAST(_param);
  return {
    "type": "ReturnStatement",
    "argument": _param
  };
})(1);
`.trim());
  });

  it('generates statements with super', function() {
    let src = 'stmt`super(${1});`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
var __liftToAST = require("babel-plugin-ast-literal/lib/liftToAST").default;

(function (_param) {
  _param = __liftToAST(_param);
  return {
    "type": "ExpressionStatement",
    "expression": {
      "type": "CallExpression",
      "callee": {
        "type": "Super"
      },
      "arguments": [_param]
    }
  };
})(1);
`.trim());
  });

  it('generates import statements', function() {
    let src = 'stmt`import ${something} from "${module}";`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
var __liftToAST = require("babel-plugin-ast-literal/lib/liftToAST").default;

(function (_param, _param2) {
  _param = __liftToAST(_param);
  _param2 = __liftToAST(_param2);
  return {
    "type": "ImportDeclaration",
    "specifiers": [{
      "type": "ImportDefaultSpecifier",
      "local": _param
    }],
    "importKind": "value",
    "source": _param2
  };
})(something, module);
`.trim());
  });

  it('generates AST with object spread', function() {
    let src = 'stmt`let x = {...x};`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
var __liftToAST = require("babel-plugin-ast-literal/lib/liftToAST").default;

(function () {
  return {
    "type": "VariableDeclaration",
    "declarations": [{
      "type": "VariableDeclarator",
      "id": {
        "type": "Identifier",
        "name": "x"
      },
      "init": {
        "type": "ObjectExpression",
        "properties": [{
          "type": "SpreadProperty",
          "argument": {
            "type": "Identifier",
            "name": "x"
          }
        }]
      }
    }],
    "kind": "let"
  };
})();
`.trim());
  });

  it('generates AST with async functions', function() {
    let src = 'stmt`async function name(x) { await x; }`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
var __liftToAST = require("babel-plugin-ast-literal/lib/liftToAST").default;

(function () {
  return {
    "type": "FunctionDeclaration",
    "id": {
      "type": "Identifier",
      "name": "name"
    },
    "generator": false,
    "expression": false,
    "async": true,
    "params": [{
      "type": "Identifier",
      "name": "x"
    }],
    "body": {
      "type": "BlockStatement",
      "body": [{
        "type": "ExpressionStatement",
        "expression": {
          "type": "AwaitExpression",
          "argument": {
            "type": "Identifier",
            "name": "x"
          }
        }
      }],
      "directives": []
    }
  };
})();
`.trim());
  });

  it('does nothing if found no AST literals', function() {
    let src = 'just(some(code))';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
just(some(code));
`.trim());

  });

});
