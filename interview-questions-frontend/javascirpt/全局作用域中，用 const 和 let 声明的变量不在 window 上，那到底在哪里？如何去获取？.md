# **全局作用域中，用 const 和 let 声明的变量不在 window 上，那到底在哪里？如何去获取？**

## 前言

在浏览器环境下，传统使用 `var` 声明的全局变量会自动成为 `window` 对象的属性，但 `let` 和 `const` 在全局作用域声明的变量则不会附加到 `window` 对象上。这让许多开发者感到困惑：这些变量到底存储在哪里？如何访问？本文将详细解释其中的原理和访问方式。

## 全局对象与全局作用域

浏览器中，全局对象是 `window`。使用 `var` 声明的全局变量会自动成为 `window` 的属性：

```plain
var a = 10;
console.log(window.a); // 10
```

而使用 `let` 或 `const` 声明的全局变量不会绑定到 `window` 上：

```plain
let b = 20;
const c = 30;
console.log(window.b); // undefined
console.log(window.c); // undefined
```

这说明 `let` 和 `const` 的全局变量存储机制不同。

## 全局作用域变量存储位置

`let` 和 `const` 声明的变量被存储在全局词法环境的“声明环境记录”（Declarative Environment Record）中，而非全局对象环境记录（Object Environment Record）中。

简单来说，JavaScript 引擎在全局环境会维护两类环境记录：

- **全局对象环境记录**
  绑定 `var` 声明的全局变量和全局函数。
- **声明环境记录**
  存储用 `let`、`const` 和 `class` 声明的变量。

这两者独立管理，互不干扰。

## 如何访问全局 let 和 const 变量？

- 直接使用变量名即可访问，正常作用域规则适用。
- 不可通过 `window` 或 `globalThis`（虽然 `globalThis` 是全局对象别名，但它和声明环境记录是不同的概念）访问。
- 在严格模式下访问和使用安全且符合规范。

示例：

```plain
let x = 100;
console.log(x);          // 100
console.log(window.x);   // undefined
console.log(globalThis.x); // undefined
```

## globalThis 与全局变量

`globalThis` 是统一访问全局对象的标准方式，但它依然是指向全局对象（浏览器是 `window`），不会包含 `let` 和 `const` 声明的全局变量。

## 总结理解

`var` 绑定的是全局对象属性，`let` 和 `const` 绑定的是全局词法环境中的声明环境记录。这保证了 `let` 和 `const` 变量不会无意间污染全局对象，增强代码安全性和模块化。

------

## 面试回答示范

**问题：全局作用域中，用 const 和 let 声明的变量不在 window 上，那它们到底在哪里？如何访问？**

回答示例：

“在浏览器环境中，使用 `var` 声明的全局变量会自动成为 `window` 对象的属性，而用 `let` 和 `const` 声明的全局变量不会绑定到 `window`。这是因为 `let` 和 `const` 声明的变量存储在全局词法环境的声明环境记录中，而不是全局对象环境记录。它们只能通过变量名直接访问，不能通过 `window` 或 `globalThis` 访问。这样设计可以避免污染全局对象，提高代码安全性和可维护性。”

------

## 总结

理解全局变量的不同存储机制，有助于掌握作用域和执行环境的本质，避免变量冲突和意外覆盖，是 JavaScript 作用域管理的关键知识点。