import invariant  from 'invariant';

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
  let {Plugin, parse, types: t} = ctx;

  function sanitizeParamsIdentifiers(node, params) {
    ctx.traverse(node, {
      Identifier(node) {
        if (params.indexOf(node.name) > -1) {
          return {type: 'Identifier', name: node.name};
        }
      }
    });
  }

  function taggedTemplateToNode(node, parent, scope) {
    let params = [];
    let nodes = node.quasi.quasis.concat(node.quasi.expressions);
    nodes.sort((a, b) => a.start - b.start);
    let src = nodes.map(node => {
      if (t.isTemplateElement(node)) {
        return node.value.raw;
      } else {
        let param = scope.generateUidIdentifier('param');
        params.push(param.name);
        return `(${param.name})`;
      }
    }).join('');
    let nodeNode = parse(src);
    sanitizeParamsIdentifiers(nodeNode, params);
    ctx.traverse.removeProperties(nodeNode);
    return {nodeNode, params};
  }

  function replaceParamsWithIdentifiers(node, params, locateNode = locateExpression) {
    let src = JSON.stringify(locateNode(node));
    for (let i = 0; i < params.length; i++) {
      let re = new RegExp(`{"type":"Identifier","name":"${params[i]}"}`);
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
    return node.program.body[0];
  }

  return new Plugin('ast-literal', {
    visitor: {
      TaggedTemplateExpression(node, parent, scope) {
        // TODO: We need better scope-aware checks
        if (node.tag.name === 'expr') {
          let {nodeNode, params} = taggedTemplateToNode(node, parent, scope);
          nodeNode = replaceParamsWithIdentifiers(nodeNode, params, locateExpression);
          return t.callExpression(
            t.functionExpression(
              null,
              params.map(param => t.identifier(param)),
              t.returnStatement(nodeNode)),
            params.map((_, idx) => node.quasi.expressions[idx]));
        } else if (node.tag.name === 'stmt') {
          let {nodeNode, params} = taggedTemplateToNode(node, parent, scope);
          nodeNode = replaceParamsWithIdentifiers(nodeNode, params, locateStatement);
          return t.callExpression(
            t.functionExpression(
              null,
              params.map(param => t.identifier(param)),
              t.returnStatement(nodeNode)),
            params.map((_, idx) => node.quasi.expressions[idx]));
        }
      }
    }
  });
}
