/**
 * @copyright 2016-present, Babel Plugin AST Literal team.
 */

import assert from 'power-assert';
import generate from 'babel-generator';
import * as types from 'babel-types';

import liftToAST from '../liftToAST';

let liftAndGen = obj => generate(liftToAST(obj)).code;

describe('liftToAST', function() {

  it('lifts JSON to equiv AST', function() {
    assert(liftAndGen(1) === '1');
    assert(liftAndGen(-1) === '-1');
    assert(liftAndGen(NaN) === 'NaN');
    assert(liftAndGen(Infinity) === 'Infinity');
    assert(liftAndGen(-Infinity) === '-Infinity');
    assert(liftAndGen("a") === '"a"');
    assert(liftAndGen(true) === 'true');
    assert(liftAndGen(false) === 'false');
    assert(liftAndGen(null) === 'null');
    assert(liftAndGen(undefined) === 'undefined');
    assert(liftAndGen({}) === '{}');
    assert(liftAndGen({a: 1}) === '{\n  "a": 1\n}');
    assert(liftAndGen([]) === '[]');
  });

  it('handles Date', function() {
    assert(liftAndGen(new Date(1000)) === 'new Date("1970-01-01T00:00:01.000Z")');
  });

  it('handles RegExp', function() {
    assert(liftAndGen(/id_[a-z]+/) === '/id_[a-z]+/');
    assert(liftAndGen(/id_[a-z]+/gi) === '/id_[a-z]+/gi');
  });

  it('lefts JS AST values as-is', function() {
    assert(liftAndGen(types.identifier('x')) === 'x');
    assert(liftAndGen(types.stringLiteral('x')) === '"x"');
  });

});
