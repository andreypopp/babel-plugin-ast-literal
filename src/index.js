/**
 * @copyright 2015-present, Babel Plugin AST Literal team.
 */

import invariant from 'invariant';
import * as babylon from 'babylon';

const MARKER = '_babel-plugin-ast-literal';
const LIFT = 'babel-plugin-ast-literal/lib/liftToAST';
const LIFT_ID = '__liftToAST';

export function expr() {
  invariant(
    false,
    'Calls to genast.expr() should be transformed away by genast/babel-plugin'
  );
}

export function stmt() {
  invariant(
    false,
    'Calls to genast.stmt() should be transformed away by genast/babel-plugin'
  );
}

function parse(source) {
  return babylon.parse(source, {
    sourceType: 'module',
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    plugins: ['flow', 'objectRestSpread', 'asyncFunctions'],
  });
}

export default function GenASTBabelPlugin(ctx) {
  let {traverse, types: t} = ctx;

  function sanitizeParamsIdentifiers(node, params) {
    traverse(node, {
      enter(path) {
        if (
          t.isIdentifier(path.node) &&
          params.indexOf(path.node.name) > -1 &&
          !path.node[MARKER]
        ) {
          path.replaceWith({
            type: path.node.type,
            name: path.node.name,
            [MARKER]: true
          });
        } else if (
          t.isStringLiteral(path.node) &&
          params.indexOf(path.node.value) > -1 &&
          !path.node[MARKER]
        ) {
          path.replaceWith({
            type: path.node.type,
            value: path.node.value,
            [MARKER]: true
          });
        }
      }
    });
  }

  function taggedTemplateToNode(node, parent, scope, options = {}) {
    let nodes = node.quasi.quasis.concat(node.quasi.expressions);
    nodes.sort((a, b) => a.start - b.start);

    let params = [];
    let src = nodes.map(node => {
      if (t.isTemplateElement(node)) {
        return node.value.raw;
      } else {
        let param = scope.generateUidIdentifier('param');
        params.push(param.name);
        return param.name;
      }
    }).join('');
    if (options.expression) {
      src = '(' + src + ')';
    }
    let nodeNode = parse(src);
    sanitizeParamsIdentifiers(nodeNode, params);
    ctx.traverse.removeProperties(nodeNode);
    return {nodeNode, params};
  }

  function replaceParamsWithIdentifiers(node, params, locateNode = locateExpression) {
    let src = JSON.stringify(locateNode(node));
    for (let i = 0; i < params.length; i++) {
      let re = new RegExp(`({"type":"Identifier","name":"${params[i]}"})|({"type":"StringLiteral","value":"${params[i]}"})`);
      src = src.replace(re, params[i]);
    }
    node = locateExpression(parse('(' + src + ')'));
    ctx.traverse.removeProperties(node);
    return node;
  }

  function locateExpression(node) {
    return node.program.body[0].expression;
  }

  function locateStatement(node) {
    return node.program.body.length === 1 ? node.program.body[0] : node.program.body;
  }

  return {
    visitor: {
      Program: {
        enter(path, {file}) {
          file.seenASTLiteral = false;
        },
        exit(path, {file}) {
          if (file.seenASTLiteral) {
            path.node.body.unshift(t.variableDeclaration('var', [
              t.variableDeclarator(
                t.identifier(LIFT_ID),
                t.memberExpression(
                  t.callExpression(t.identifier('require'), [t.stringLiteral(LIFT)]),
                  t.identifier('default')
                )
              )
            ]));
          }
        },
      },
      TaggedTemplateExpression(path, {file}) {
        let {node, parent, scope} = path;
        // TODO: We need better scope-aware checks
        if (node.tag.name === 'expr') {
          file.seenASTLiteral = true;

          let {nodeNode, params} = taggedTemplateToNode(
            node, parent, scope, {expression: true});
          nodeNode = replaceParamsWithIdentifiers(nodeNode, params, locateExpression);
          path.replaceWith(
            buildASTFactoryExpression(t, params, node.quasi.expressions, nodeNode)
          );
        } else if (node.tag.name === 'stmt') {
          file.seenASTLiteral = true;

          let {nodeNode, params} = taggedTemplateToNode(
            node, parent, scope, {expression: false});
          nodeNode = replaceParamsWithIdentifiers(nodeNode, params, locateStatement);
          path.replaceWith(
            buildASTFactoryExpression(t, params, node.quasi.expressions, nodeNode)
          );
        }
      }
    }
  };
}

function buildASTFactoryExpression(t, paramNames, paramValues, template) {
  let statements = [];
  paramNames.forEach(paramName => {
    let param = t.identifier(paramName);
    statements.push(
      t.expressionStatement(t.assignmentExpression(
        '=',
        param,
        t.callExpression(t.identifier(LIFT_ID), [param])
      ))
    );
  });
  statements.push(t.returnStatement(template));
  return t.callExpression(
    t.functionExpression(
      null,
      paramNames.map(param => t.identifier(param)),
      t.blockStatement(statements)
    ),
    paramNames.map((_, idx) => paramValues[idx]));
}
