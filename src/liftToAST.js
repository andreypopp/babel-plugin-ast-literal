/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 */

import * as types from 'babel-types';

export default function liftToAST(value) {
  if (value && typeof value.toJSAST === 'function') {
    return value.toJSAST(types);
  } else if (types.isNode(value)) {
    return value;
  } else if (value === undefined) {
    return types.identifier('undefined');
  } else if (value === null) {
    return types.nullLiteral();
  } else if (typeof value === 'string') {
    return types.stringLiteral(value);
  } else if (typeof value === 'number') {
    return types.numericLiteral(value);
  } else if (typeof value === 'boolean') {
    return types.booleanLiteral(value);
  } else if (value instanceof RegExp) {
    return types.regExpLiteral(
      value.source,
      regExpFlags(value)
    );
  } else if (value instanceof Date) {
    return types.newExpression(
      types.identifier('Date'),
      [types.stringLiteral(value.toISOString())]
    );
  } else if (Array.isArray(value)) {
    return types.arrayExpression(value.map(item =>
      liftToAST(item)));
  } else if (typeof value === 'object') {
    let properties = [];
    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        properties.push(
          types.objectProperty(
            types.stringLiteral(key),
            liftToAST(value[key])
          )
        );
      }
    }
    return types.objectExpression(properties);
  } else {
    throw new Error('cannot parse value to AST: ' + value);
  }
}

function regExpFlags(re) {
  return re.flags !== undefined ? re.flags : [
    re.global ? 'g' : '',
    re.ignoreCase ? 'i' : '',
    re.multiline ? 'm' : '',
    re.sticky ? 'y' : '',
    re.unicode ? 'u' : '',
  ].join('');
}
