/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 */

export default function liftToAST(build, value) {
  if (value && typeof value.toJSAST === 'function') {
    return value.toJSAST(build);
  } else if (build.isNode(value)) {
    return value;
  } else if (value === undefined) {
    return build.identifier('undefined');
  } else if (value === null) {
    return build.nullLiteral();
  } else if (typeof value === 'string') {
    return build.stringLiteral(value);
  } else if (typeof value === 'number') {
    return build.numericLiteral(value);
  } else if (typeof value === 'boolean') {
    return build.booleanLiteral(value);
  } else if (value instanceof RegExp) {
    return build.regExpLiteral(
      value.source,
      regExpFlags(value)
    );
  } else if (value instanceof Date) {
    return build.newExpression(
      build.identifier('Date'),
      [build.stringLiteral(value.toISOString())]
    );
  } else if (Array.isArray(value)) {
    return build.arrayExpression(value.map(item =>
      liftToAST(build, item)));
  } else if (typeof value === 'object') {
    let properties = [];
    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        properties.push(
          build.objectProperty(
            build.stringLiteral(key),
            liftToAST(build, value[key])
          )
        );
      }
    }
    return build.objectExpression(properties);
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
