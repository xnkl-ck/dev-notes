# **Promise 的三种状态分别是什么，是怎么转换的，转换时机呢？**

## 前言

在学习和使用 Promise 的过程中，理解它的状态流转机制是非常关键的一个环节。很多与 Promise 相关的 bug，都是因为状态转换和时机理解不到位而引起的。本文将详细解析 Promise 的三种状态、状态之间的转换逻辑，以及各个状态的触发时机。

## Promise 的三种状态

Promise 本质上是一个状态机，具有以下三种状态：

1. **Pending（进行中）**：初始状态，表示任务尚未完成
2. **Fulfilled（已成功）**：操作成功完成，并返回结果
3. **Rejected（已失败）**：操作失败，返回错误原因

注意：Promise 的状态一旦改变，就不可逆，即从 pending 到 fulfilled 或 rejected 只能发生一次。

## 状态是如何转换的？

### 从 Pending → Fulfilled

当调用 `resolve(value)` 时，状态从 pending 变为 fulfilled，并携带结果值 `value`。

```plain
new Promise((resolve, reject) => {
  resolve('成功');
});
```

### 从 Pending → Rejected

当调用 `reject(error)` 时，状态从 pending 变为 rejected，并携带错误信息。

```plain
new Promise((resolve, reject) => {
  reject('失败');
});
```

### 状态一旦确定就不可再改变

即使你在 `resolve()` 之后再调用 `reject()`，也不会生效。下面这个例子只会输出 "成功"：

```plain
new Promise((resolve, reject) => {
  resolve('成功');
  reject('失败'); // 无效
});
```

## 状态转换的时机

Promise 的状态转换不是立刻生效的，而是**异步执行的**。即使你在构造函数里立即调用了 `resolve()`，对应的 `.then()` 回调也是在下一轮事件循环中执行。

```plain
const p = new Promise(resolve => {
  resolve('done');
});

console.log('1');

p.then(res => {
  console.log(res); // 异步输出：done
});

console.log('2');

// 输出顺序：1 → 2 → done
```

这点是面试中的常见陷阱，体现了 Promise 的微任务机制。

## then、catch 触发的条件

- `.then(onFulfilled)`：在 Promise 被 fulfilled 后触发
- `.catch(onRejected)`：在 Promise 被 rejected 后触发
- `.finally(callback)`：无论是 fulfilled 还是 rejected，都会触发

需要注意，then 和 catch 的返回值也是一个新的 Promise，可以继续链式调用。

## 状态转换规则补充：错误也会触发 rejected

```plain
new Promise((resolve, reject) => {
  throw new Error('异常'); // 等同于 reject(new Error())
}).catch(err => console.error(err.message)); // 异常
```

如果在执行器中抛出异常，会自动转为 rejected 状态。

## 面试回答

Promise 有三种状态，分别是 pending、fulfilled 和 rejected。初始状态是 pending，在调用 resolve 后会变为 fulfilled，调用 reject 后会变为 rejected。状态一旦从 pending 改变就不能再变回，也不能从 fulfilled 变为 rejected，反之亦然。

状态变化的时机并不是同步的，即使我立即调用了 resolve，then 方法里的回调也会被放到微任务队列中，在本轮同步代码执行完之后才执行。这一点经常在一些定时器、事件处理函数的组合中引起问题。

另外，还有一个容易被忽略的细节是，Promise 构造函数中的代码是同步执行的，但 then 和 catch 中的回调是异步的。

理解这三种状态的流转逻辑，可以帮助我在处理复杂异步逻辑，比如链式调用、错误捕获、并发处理时避免很多坑。同时，也可以解释一些面试题，比如输出顺序题、为什么 finally 会被执行等。

## 总结

Promise 的状态流转规则是它设计的核心之一。了解 pending、fulfilled、rejected 三个状态的定义、转换方式以及执行时机，是使用 Promise 进行稳定、高效异步编程的前提。只有掌握这些底层机制，才能写出健壮的异步代码，并在面试中游刃有余地回答各种关于 Promise 的问题。