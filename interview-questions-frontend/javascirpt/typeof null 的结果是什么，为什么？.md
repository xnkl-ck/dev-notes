# **typeof null 的结果是什么，为什么？**

## 前言

`typeof` 是 JavaScript 中判断变量类型的基础操作符，但它在某些情况下的表现容易引起误解，尤其是 `typeof null` 返回 `"object"`，这看似矛盾的结果常常让开发者困惑。本文将详细解释 `typeof null` 返回 `"object"` 的原因及背后的历史背景。

## typeof null 返回 "object" 的原因

按照直觉，`null` 表示“无值”或“空值”，本应被识别为一种独立类型。但在 JavaScript 中，`typeof null` 返回的是 `"object"`。

这是因为 JavaScript 最初设计时，底层值的类型是用一个二进制位标识的。`null` 的内部表示为一个空指针，属于对象类型的指针（tagged pointer）。早期实现中，所有指向对象的值都被标记为 `"object"`，而 `null` 作为指向空的对象指针，也被归类为 `"object"`。

这种设计成为了历史遗留问题，语言后续版本未修正这一行为，为了兼容性继续保留。

## typeof 操作符的类型分类

`typeof` 可以返回以下几种字符串：

- `"undefined"`
- `"boolean"`
- `"number"`
- `"string"`
- `"symbol"`
- `"bigint"`
- `"function"`
- `"object"`

`null` 因为历史原因，归类到了 `"object"`。

## 如何正确判断 null？

由于 `typeof null` 返回 `"object"`，判断变量是否为 null，不能单纯依赖 `typeof`，而应使用严格相等判断：

```plain
value === null
```

或者结合类型判断：

```plain
typeof value === 'object' && value === null
```

## 小结

`typeof null` 返回 `"object"` 是 JavaScript 设计的历史遗留问题，已成为语言规范的一部分。了解这一点，有助于避免类型判断上的误解和错误。

------

## 面试回答示范

**问题：typeof null 的结果是什么，为什么？**

回答示例：

“`typeof null` 返回的是 `"object"`，这是 JavaScript 语言设计早期的一个历史遗留问题。由于当时内部使用类型标签标识数据类型，`null` 被表示为指向空对象的指针，因此被归类为对象类型。虽然这不是直观预期，但为了兼容性，这个行为一直被保留。所以判断是否为 `null` 时，不应单纯用 `typeof`，而要用严格等于判断。”

------

## 总结

理解 `typeof null` 返回 `"object"` 的原因，有助于开发者正确使用类型判断，避免逻辑错误，是掌握 JavaScript 类型系统的重要一环。