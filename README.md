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

## Installation & Usage

Install from npm:

    % npm install babel-plugin-ast-literal

Add to you Babel config (probably `.babelrc`):

    {
      "plugins": ["ast-literal"]
    }

Enjoy!
