# **在 forEach 中和 for 循环中调用异步函数的区别**

## 前言

在 JavaScript 中，遍历数组时执行异步操作是常见场景。开发者常用 `forEach`、`for`、`for...of` 等方式迭代数组，但在异步函数调用时，这些方法的行为差异显著。理解这些区别对于正确控制异步流程、保证业务逻辑正确执行至关重要。

本文将详细对比在 `forEach` 和普通 `for` 循环中调用异步函数的差异，并给出正确的使用建议。

## forEach 中调用异步函数的行为

`forEach` 是数组方法，接收同步回调函数。即使你在回调中使用了 `async` 函数，`forEach` 本身不会等待异步函数完成，所有回调同步触发。

示例：

```plain
const arr = [1, 2, 3];

arr.forEach(async (num) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(num);
});

console.log('forEach 结束');
```

输出顺序：

```plain
forEach 结束
1
2
3
```

原因在于 `forEach` 不支持异步回调等待。所有异步回调几乎同时启动，且 `forEach` 不返回 Promise，也无法使用 `await` 等待其完成。

这导致在使用 `forEach` 时，无法保证异步操作按顺序执行或等待全部完成。

## for 循环中调用异步函数的行为

传统 `for` 循环可以结合 `await` 使用，实现顺序异步执行。

示例：

```plain
async function test() {
  const arr = [1, 2, 3];
  for (let i = 0; i < arr.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(arr[i]);
  }
  console.log('for 循环结束');
}

test();
```

输出顺序：

```plain
1
2
3
for 循环结束
```

因为 `for` 循环可以配合 `await` 使用，能顺序等待每个异步操作完成后再执行下一次迭代。

## for...of 循环中调用异步函数的行为

`for...of` 与 `for` 循环类似，也能结合 `await` 实现顺序异步执行。

示例：

```plain
async function test() {
  const arr = [1, 2, 3];
  for (const num of arr) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(num);
  }
  console.log('for...of 循环结束');
}

test();
```

输出和 `for` 循环相同。

## 如何等待所有异步操作完成？

如果希望并行执行异步操作，但等待全部完成，可以用 `Promise.all`：

```plain
const arr = [1, 2, 3];

await Promise.all(
  arr.map(async (num) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(num);
  })
);

console.log('所有异步操作完成');
```

所有异步操作同时开始，完成顺序不保证，但能等待所有完成后执行后续代码。

## 面试回答

`forEach` 不支持异步等待，即使回调函数是 async，`forEach` 本身不会等待异步函数完成，所有异步回调会被同步触发，导致无法顺序执行或等待全部完成。

相比之下，传统 `for` 循环和 `for...of` 循环支持配合 `await` 使用，可以顺序执行异步函数，确保每个异步操作完成后才进行下一次迭代。

如果想要并行执行异步操作并等待全部完成，可以用 `Promise.all` 搭配数组的 `map` 方法。

总结来说，避免在需要异步顺序执行的场景用 `forEach`，推荐使用 `for` 或 `for...of`，它们支持 await，代码更清晰且能保证异步流程的正确性。

## 总结

`forEach` 适合同步操作，调用异步函数时无法保证等待效果。`for` 和 `for...of` 循环能配合 `await` 实现异步操作顺序执行。选择合适的循环结构，结合 Promise 和 async/await，能写出逻辑正确、易维护的异步代码。