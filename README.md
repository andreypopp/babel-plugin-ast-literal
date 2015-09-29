# Babel Plugin AST Literal

Babel plugin which processes `expr` and `stmt` tagged template strings into JS
AST nodes:

    let node = expr`add(1, ${2})`
    node // {type: 'CallExpression', ...}

    let node = stmt`
    if (${false)) {
      console.log('ok')
    }`
    node // {type: 'IfStatement', ...}

This is mostly useful for code generation.
