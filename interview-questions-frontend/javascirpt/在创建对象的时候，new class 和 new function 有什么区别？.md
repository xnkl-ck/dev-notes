# **在创建对象的时候，new class 和 new function 有什么区别？**

## 前言

JavaScript 从 ES6 开始引入了 `class` 语法，这给开发者带来了更接近传统面向对象语言的写法。尽管 `class` 看起来是新的语法结构，但它本质上是基于函数和原型的封装。很多人会疑惑：使用 `new class` 和 `new function` 创建对象之间到底有什么区别？本文将从底层机制和语法角度，系统讲解二者的异同。

## `new function` 创建对象的原理

在 ES6 之前，JavaScript 通过函数充当构造函数，再用 `new` 关键字创建对象。

```plain
function Person(name) {
  this.name = name;
}
Person.prototype.say = function() {
  console.log(this.name);
};

const p = new Person('Alice');
```

这时，`Person` 是普通函数，但配合 `new`，其行为就像类的构造器。`new` 会完成以下几步：

- 创建一个新对象，设置其 `[[Prototype]]` 指向 `Person.prototype`
- 调用 `Person` 函数，绑定 `this` 到新对象
- 如果函数没有返回对象，则返回新对象

函数式构造器模式灵活，但写法和语义不够清晰。

## `new class` 创建对象的原理

ES6 引入的 `class` 语法是基于函数和原型的语法糖。

```plain
class Person {
  constructor(name) {
    this.name = name;
  }
  say() {
    console.log(this.name);
  }
}

const p = new Person('Bob');
```

`class` 实际上是一个特殊函数，声明时不允许直接调用，必须用 `new` 实例化。

与函数构造器的区别：

- `class` 语法更明确：使用 `constructor` 方法定义构造函数
- `class` 内部默认使用严格模式（`'use strict'`）
- `class` 方法定义在 `prototype` 上，且不可枚举
- `class` 不允许在未调用 `new` 时调用构造器，会报错
- `class` 支持 `extends` 和 `super`，实现继承更方便

## 本质与语法的差异

| 方面         | new function              | new class                  |
| ------------ | ------------------------- | -------------------------- |
| 语法         | 普通函数                  | class 语法                 |
| 是否严格模式 | 否（默认）                | 是（默认严格模式）         |
| 调用限制     | 可直接调用函数            | 只能通过 `new` 调用        |
| 继承         | 手动设置原型继承          | 支持 `extends` 和 `super`  |
| 方法定义     | 通过 `prototype` 显式定义 | 在类体内定义，自动绑定原型 |
| 可读性       | 较低                      | 较高，更贴近传统 OOP 语法  |

## 什么时候选用哪种方式？

建议尽量使用 `class`，理由包括：

- 语法更清晰易懂，维护性强
- 内置继承支持，避免手动原型链设置错误
- 严格模式避免很多潜在错误
- 趋势和规范推荐，现代项目主流

但在某些需要动态构造函数或兼容旧环境时，函数构造器仍有存在价值。

------

## 面试回答示范

**问题：用** `**new class**` **和用** `**new function**` **创建对象有什么区别？**

回答示例：

“`class` 是 ES6 引入的语法糖，本质上是基于函数和原型的。使用 `new function` 是传统的构造函数方式，它可以被直接调用，默认非严格模式，方法定义在 `prototype` 上且可枚举。

而 `class` 内部默认严格模式，禁止不带 `new` 调用，支持更完善的继承和方法定义语法，更加规范和安全。

因此，虽然底层机制类似，但 `class` 提供了更好的语法和结构建议，推荐在现代项目中使用 `class`。”

------

## 总结

`new function` 和 `new class` 在 JavaScript 中都可以创建实例对象，底层都基于函数和原型链。`class` 作为语法糖，优化了开发体验，增强了代码规范性和可维护性。掌握两者的差异，有助于理解语言演变和面向对象设计思路，提升代码质量。