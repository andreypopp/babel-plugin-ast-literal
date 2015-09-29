

let expression = expr`call(1, 2, ${1 + 1}, ${x})`

let statement = stmt`
if (${cond}) {
  console.log('ok');
}

console.log('oops');
`;
