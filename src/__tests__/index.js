import {transform} from 'babel-core';
import assert from 'power-assert';
import ASTLiteral from '../index';

describe('babel-plugin-ast-literal', function() {

  it('generates expressions', function() {
    let src = 'expr`1 + ${2}`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert(output === `
"use strict";

(function (_param) return {
  "type": "BinaryExpression",
  "left": {
    "type": "Literal",
    "value": 1
  },
  "operator": "+",
  "right": _param
};)(2);
`.trim());
  });

  it('generates statements', function() {
    let src = 'stmt`1 + ${2}`';
    let output = transform(src, {plugins: [ASTLiteral]}).code;
    assert(output === `
"use strict";

(function (_param) return {
  "type": "ExpressionStatement",
  "expression": {
    "type": "BinaryExpression",
    "left": {
      "type": "Literal",
      "value": 1
    },
    "operator": "+",
    "right": _param
  }
};)(2);
`.trim());
  });

});
