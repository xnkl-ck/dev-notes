"use strict";

require("core-js/modules/es.array.flat-map.js");
require("core-js/modules/es.array.unscopables.flat-map.js");
var _obj$foo;
const obj = {};
obj === null || obj === void 0 || (_obj$foo = obj.foo) === null || _obj$foo === void 0 || (_obj$foo = _obj$foo.bar) === null || _obj$foo === void 0 || _obj$foo.baz; // undefined

const result = [1, 2].flatMap(x => [x, x * 2]);
console.log(result);
