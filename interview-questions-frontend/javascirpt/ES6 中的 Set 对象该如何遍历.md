# **ES6 中的 Set 对象该如何遍历**

## 前言

Set 是 ES6 引入的一种新的数据结构，用来存储唯一的值。与数组不同，Set 不允许重复元素，这使得它在去重、集合运算等场景中非常实用。熟练掌握 Set 的遍历方式，有助于你高效地处理和操作集合数据。本文将系统介绍 Set 对象的各种遍历方法及其适用情况。

## Set 遍历的常用方式及特点

Set 维护了元素的插入顺序，所有遍历方法都会按照添加顺序输出元素。常见的遍历方式有：

1. **for...of 循环**
   Set 对象本身是可迭代的，直接用 for...of 循环即可遍历所有元素。

```plain
for (const value of mySet) {
  console.log(value);
}
```

1. **Set.prototype.forEach() 方法**
   Set 也提供了 forEach 方法，回调函数接收三个参数：当前值、当前值（同一值两次，为了和 Map 保持一致）、Set 本身。

```plain
mySet.forEach((value, valueAgain, set) => {
  console.log(value);
});
```

需要注意的是，forEach 的前两个参数相同，这是设计上的一致性（和 Map 的 forEach 保持相同参数结构），虽然对 Set 来说没必要。

1. **values() 和 keys() 方法**
   Set 的 `values()` 和 `keys()` 方法返回同一个迭代器，遍历元素。由于 Set 没有键，keys 和 values 方法行为一致。

```plain
for (const value of mySet.values()) {
  console.log(value);
}
```

1. **entries() 方法**
   Set 的 `entries()` 方法返回一个包含 `[value, value]` 的迭代器，也是为与 Map 接口保持一致设计。

```plain
for (const [value1, value2] of mySet.entries()) {
  console.log(value1, value2); // 两个值相同
}
```

这种设计虽然有些冗余，但保证了遍历接口的统一。

### 选择合适的遍历方式

- 绝大多数情况下，直接用 `for...of` 遍历 Set 即可，简单清晰。
- 需要更函数式的写法时，`forEach` 也非常方便，尤其适合链式或回调逻辑。
- `values()`、`keys()` 和 `entries()` 更多是为了统一接口，一般使用不多。

## 面试回答示范

问：“ES6 的 Set 对象如何遍历？它的遍历方式和特点是什么？”你可以回答：

“Set 对象作为一种存储唯一值的集合，它的遍历方式比较简单。最常见的是使用 `for...of` 循环，因为 Set 本身是可迭代的，遍历时会按照插入顺序输出所有元素。除此之外，Set 还提供了 `forEach` 方法，和数组类似，不过它的回调函数第一个和第二个参数都是当前元素，这主要是为了和 Map 的接口保持一致。

此外，Set 也有 `values()` 和 `keys()` 方法，这两个方法返回同一个迭代器，因为 Set 没有键，只有值。`entries()` 方法返回 `[value, value]` 形式的迭代器，也是为了接口统一。这些方法一般不常用。

总体来说，遍历 Set 最直接和常用的方法就是用 `for...of`，既简洁又直观。如果想写回调函数式代码，`forEach` 也是很好的选择。”

## 总结

Set 的遍历接口设计上与 Map 保持一致，保证了使用上的统一性。它通过 `for...of` 和 `forEach` 提供了简单直观的遍历方式，维护了元素的插入顺序，方便开发者顺序处理集合中的唯一元素。掌握这些遍历方法，不仅能够提升代码简洁度，还能帮助你更灵活地应对不同的集合操作需求。