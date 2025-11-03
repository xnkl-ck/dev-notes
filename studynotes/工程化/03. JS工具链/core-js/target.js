require('core-js/modules/es.array.flat-map');

const result = [1, 2].flatMap((x) => [x, x * 2]);
console.log(result);
