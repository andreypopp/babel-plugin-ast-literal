# Babel Plugin AST Literal

Babel plugin which processes `expr` and `stmt` tagged template strings into JS
AST nodes:

    let exportReactComponentNode = stmt`
      export function ${name}(props) {
        return React.createElement(
          ${component},
          {...props, className: styles.${className}}
        );
      }
    `;

    let jsxNode = expr`<div a="${some}" />`

This is mostly useful for code generation.
