import {transform} from 'babel-core';
import generate from 'babel-generator';
import assert from 'power-assert';
import ASTLiteral from '../index';

describe('babel-plugin-ast-literal', function() {

  it('generates expressions', function() {
    let src = 'expr`1 + ${2}`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
(function (_param) {
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
    "right": _param
  };
})(2);
`.trim());
  });

  it('generates statements', function() {
    let src = 'stmt`1 + ${2}`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
(function (_param) {
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

  it('generates statements with return', function() {
    let src = 'stmt`return ${1}`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert.equal(output, `
(function (_param) {
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
(function (_param) {
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
(function (_param, _param2) {
  return {
    "type": "ImportDeclaration",
    "specifiers": [{
      "type": "ImportDefaultSpecifier",
      "local": _param
    }],
    "source": _param2
  };
})(something, module);
`.trim());
  });

});