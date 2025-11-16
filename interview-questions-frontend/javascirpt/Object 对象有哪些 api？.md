# **Object 对象有哪些 api？**

## 前言

JavaScript 中，Object 是最基础的数据类型之一，提供了丰富的 API 用于对象的创建、属性操作、继承和拷贝等功能。掌握 Object 的常用方法和场景，能够帮助开发者更灵活、高效地操作对象，提升代码质量。

本文将系统介绍常见的 Object API 及其典型应用场景。

## 创建和拷贝对象相关 API

- `Object.create(proto)`
  创建一个新对象，原型指向 `proto`，常用于实现继承。
- `Object.assign(target, ...sources)`
  将源对象的可枚举属性拷贝到目标对象，实现浅拷贝和对象合并。
- `Object.freeze(obj)`
  冻结对象，禁止添加、删除或修改属性。
- `Object.seal(obj)`
  密封对象，禁止添加或删除属性，但允许修改现有属性。

## 属性描述与操作

- `Object.defineProperty(obj, prop, descriptor)`
  定义或修改对象属性的描述符，如 `writable`、`enumerable`、`configurable` 和 `get/set`。
- `Object.getOwnPropertyDescriptor(obj, prop)`
  获取指定属性的描述符。
- `Object.keys(obj)`
  获取对象自身可枚举属性名数组。
- `Object.getOwnPropertyNames(obj)`
  获取对象自身所有属性名（包括不可枚举）。
- `Object.getPrototypeOf(obj)`
  获取对象的原型。
- `Object.setPrototypeOf(obj, proto)`
  设置对象的原型。

## 属性判断与检测

- `Object.hasOwn(obj, prop)`（ES2022）
  判断对象是否自身拥有指定属性。
- `obj.hasOwnProperty(prop)`
  检测对象是否有自身属性。
- `prop in obj`
  检查属性是否存在于对象自身或原型链。

## 其他实用 API

- `Object.entries(obj)`
  返回对象自身可枚举属性的键值对数组。
- `Object.values(obj)`
  返回对象自身可枚举属性的值数组。
- `Object.is(value1, value2)`
  判断两个值是否严格相等，区别于 `===`，能正确处理 `NaN` 和 `-0`。

## 典型应用场景

- 通过 `Object.create` 实现原型继承。
- 使用 `Object.assign` 进行对象合并和浅拷贝。
- 通过 `Object.defineProperty` 实现属性的访问控制（如只读、计算属性）。
- 用 `Object.freeze` 和 `Object.seal` 保护对象不被意外修改。
- 结合 `Object.keys`、`Object.entries` 处理对象数据遍历。
- 利用 `Object.getPrototypeOf` 和 `Object.setPrototypeOf` 操作原型链。

## 面试回答

Object 对象提供了丰富的 API 用于创建、修改和检测对象属性。

常用的包括 `Object.create` 创建原型链，`Object.assign` 实现对象合并，`Object.freeze` 和 `Object.seal` 用于冻结和密封对象。`Object.defineProperty` 可以精细控制属性的可写、可枚举和访问器。

判断属性时，可以用 `hasOwnProperty` 或 `in` 操作符，ES2022 新增了 `Object.hasOwn`，更简洁。

此外，`Object.keys`、`Object.entries` 和 `Object.values` 用于遍历对象属性和数据。

## 总结

JavaScript 的 Object API 涉及对象创建、属性定义、继承、检测和冻结等多个方面。合理使用这些接口，可以帮助开发者高效管理对象数据结构，保障代码质量和运行性能。理解这些 API 的使用场景是前端开发的重要基础。