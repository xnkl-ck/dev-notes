# **Object.keys 与 Object.getOwnPropertyNames() 有何区别**

## 前言

在 JavaScript 中，操作对象属性时，经常需要获取对象的所有属性名。`Object.keys` 和 `Object.getOwnPropertyNames` 是两个常用的方法，但它们在返回结果和适用场景上存在差异。了解它们的区别，有助于我们准确、高效地处理对象属性。本文将深入分析这两个方法的工作机制和区别，并结合应用场景说明如何选择。

## Object.keys 与 Object.getOwnPropertyNames 的工作原理

### Object.keys

- 返回对象自身**所有可枚举属性**的键名数组（不包含继承属性）。
- 可枚举属性指的是那些属性的 `enumerable` 特性为 `true`。
- 只返回字符串键名，不包括符号（`Symbol`）属性。

示例：

```plain
const obj = Object.create({}, {
  a: { value: 1, enumerable: true },
  b: { value: 2, enumerable: false }
});
console.log(Object.keys(obj)); // ['a']
```

### Object.getOwnPropertyNames

- 返回对象自身所有的**属性名（字符串键）**，包括不可枚举属性。
- 不包含继承属性，但包括不可枚举的和可枚举的字符串键。
- 也不包含符号（`Symbol`）属性。

示例：

```plain
console.log(Object.getOwnPropertyNames(obj)); // ['a', 'b']
```

### 对比总结

- `Object.keys` 只返回可枚举的属性名。
- `Object.getOwnPropertyNames` 返回所有自有属性名（包括不可枚举）。
- 两者都不包含继承属性和符号属性。

## 应用场景与选择建议

- 需要获取对象对外暴露的、可枚举的属性时，使用 `Object.keys`，如遍历普通对象的属性。
- 需要获取对象全部自有属性（包括不可枚举），用于深度分析或工具类开发时，使用 `Object.getOwnPropertyNames`。
- 如果还需要获取符号属性，需结合 `Object.getOwnPropertySymbols`。

## 面试回答示范

问：“Object.keys 和 Object.getOwnPropertyNames 有什么区别？什么时候用哪个？”

“`Object.keys` 和 `Object.getOwnPropertyNames` 都是获取对象自身属性名的方法，但返回的属性集合不同。`Object.keys` 只返回对象自身的可枚举属性名，而 `Object.getOwnPropertyNames` 返回对象自身所有属性名，包括不可枚举的。两者都不返回继承属性和符号属性。

因此，如果想遍历对象的公开属性，通常用 `Object.keys`，这是常见且高频的需求。若想获取对象所有属性名，做深度分析或调试，`Object.getOwnPropertyNames` 更合适。需要注意的是，这两个方法都不包含符号属性，若要包括符号，则要用 `Object.getOwnPropertySymbols`。”

## 总结

`Object.keys` 和 `Object.getOwnPropertyNames` 在属性选择范围上有所不同，前者关注可枚举属性，后者包含所有自有属性（包括不可枚举）。正确理解它们的差异和返回结果，能够帮助我们准确地处理对象属性，提升代码的可靠性和调试效率。