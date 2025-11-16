# **函数有默认值的时候，如果传的参数是 undefined ，会被默认值赋值吗？**

## 前言

从 ES6 开始，JavaScript 支持为函数参数设置默认值。当调用函数时，如果对应参数没有传递或传递了 `undefined`，函数参数会被赋予默认值。了解默认参数的工作机制，对于编写健壮和灵活的函数非常重要。本文将详细解释默认参数与 `undefined` 的关系及相关行为。

## 函数默认参数简介

默认参数语法允许在函数定义时为参数指定默认值：

```plain
function greet(name = 'Guest') {
  console.log('Hello, ' + name);
}
```

如果调用时没有传递参数，或传递的参数是 `undefined`，`name` 会被赋值为 `'Guest'`。

## 传递 undefined 时的行为

传递 `undefined` 会触发默认值赋值行为：

```plain
greet(undefined); // Hello, Guest
```

这是因为默认参数的赋值条件是“参数值严格等于 `undefined`”。

与此不同的是，传递其他“假值”如 `null`、空字符串或 `0`，不会触发默认值：

```plain
greet(null);  // Hello, null
greet('');    // Hello, 
greet(0);     // Hello, 0
```

这说明只有当参数为 `undefined`，才会被默认值覆盖。

## 为什么默认值只对 undefined 生效？

这是设计使然，默认值意图为“缺省参数”提供默认值。传递 `null` 或其他值被认为是“明确传递”，不应被默认值覆盖。

## 与函数内部赋值的区别

传统写法中，通过函数体内判断赋默认值：

```plain
function greet(name) {
  name = name || 'Guest'; // 这种写法对 falsy 值都赋默认值
  console.log('Hello, ' + name);
}
```

此写法会把 `null`、`0`、`''` 等值误认为未传值，导致意外赋默认值，不够精准。

默认参数语法更符合预期，只对 `undefined` 赋值，更加严谨。

## 面试回答

**问题：JavaScript 函数有默认参数时，如果传递的是** `**undefined**`**，会被默认值赋值吗？**

回答示范：

是的，函数默认参数只会在参数值严格等于 `undefined` 时生效，也就是说，如果调用时传递 `undefined`，该参数会被赋予默认值。传递其他假值，如 `null`、`0` 或空字符串，则不会触发默认值赋值。相比传统在函数体内使用逻辑或操作赋默认值，ES6 默认参数更准确地处理了默认值赋值的条件。

## 总结

JavaScript 默认参数机制通过严格判断参数是否为 `undefined` 来决定是否使用默认值。理解这一规则可以避免对其他假值误用默认值带来的潜在问题。合理运用默认参数，可以写出语义明确且健壮的函数，提升代码质量。