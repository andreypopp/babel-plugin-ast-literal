/**
 * @copyright 2015-present, Babel Plugin AST Literal team.
 */

import invariant from 'invariant';
import * as babylon from 'babylon';

const MARKER = '_babel-plugin-ast-literal';

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

  function taggedTemplateToNode(node, parent, scope) {
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
    let nodeNode = babylon.parse(src, {
      sourceType: 'module',
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
    });
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
    node = locateExpression(babylon.parse('(' + src + ')'));
    ctx.traverse.removeProperties(node);
    return node;
  }

  function locateExpression(node) {
    return node.program.body[0].expression;
  }

  function locateStatement(node) {
    return node.program.body[0];
  }

  return {
    visitor: {
      TaggedTemplateExpression(path) {
        let {node, parent, scope} = path;
        // TODO: We need better scope-aware checks
        if (node.tag.name === 'expr') {
          let {nodeNode, params} = taggedTemplateToNode(node, parent, scope);
          nodeNode = replaceParamsWithIdentifiers(nodeNode, params, locateExpression);
          path.replaceWith(
            buildASTFactoryExpression(t, params, node.quasi.expressions, nodeNode)
          );
        } else if (node.tag.name === 'stmt') {
          let {nodeNode, params} = taggedTemplateToNode(node, parent, scope);
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
  return t.callExpression(
    t.functionExpression(
      null,
      paramNames.map(param => t.identifier(param)),
      t.blockStatement([t.returnStatement(template)])),
    paramNames.map((_, idx) => paramValues[idx]))
}
