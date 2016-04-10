# Babel Plugin AST Literal

Babel plugin which processes `expr` and `stmt` tagged template strings into
Babylon (Babel JS parser) AST nodes:

    let exportReactComponentNode = stmt`
      export function ${name}(props) {
        return React.createElement(
          ${component},
          {...props, className: styles.${className}}
        );
      }
    `; // {type: 'ExportNamedDeclaration', ...}

    let jsxNode = expr`<div a="${some}" />` // {type: 'JSXElement', ...}

This is mostly useful for code generation.

## Why not babel-template

* **+** It handles more cases, like:

        stmt`import Lib from "${lib}"`

  which can't be handled by `babel-template` (it can only fill identifiers).

* **+** It inlines AST Node generation in code instead of doing a pass over AST
  Node template as babel-template does. This should be faster.

* **-** It is somewhat hacky but it works!

* I wrote it when `babel-template` wasn't a thing (previous versions were
  targeting Babel 5).

## Installation & Usage

Install from npm:

    % npm install babel-plugin-ast-literal

Add to you Babel config (probably `.babelrc`):

    {
      "plugins": ["ast-literal"]
    }

Enjoy!
