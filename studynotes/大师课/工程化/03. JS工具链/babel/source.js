const obj = {};

obj?.foo?.bar?.baz; // undefined

const result = [1, 2].flatMap((x) => [x, x * 2]);
console.log(result);
