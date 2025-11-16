# **Promise then 第二个参数和 Promise.catch 的区别是什么？**

## 前言

在 JavaScript 的 Promise 中，处理错误的方式主要有两种：通过 `then` 方法的第二个参数或者使用单独的 `catch` 方法。很多初学者对此容易产生混淆，不清楚两者的差别以及最佳实践。本文将详细剖析这两者的区别和联系，帮助你更好地理解和使用 Promise 的错误处理机制。

## then 第二个参数和 catch 的基本用法

`then` 方法接受两个参数：

```javascript
promise.then(onFulfilled, onRejected);
```

- `onFulfilled`：Promise 成功时执行的回调
- `onRejected`：Promise 失败时执行的回调

而 `catch` 是 `then` 的语法糖，专门用来捕获错误：

```javascript
promise.then(onFulfilled).catch(onRejected);
```

`catch(onRejected)` 相当于调用 `then(null, onRejected)`。

## 区别一：链式调用中的错误捕获范围

使用 `then` 的第二个参数，只能捕获当前 Promise 的错误，而后续链中的错误不会被捕获。

```javascript
Promise.resolve()
  .then(() => {
    throw new Error('错误A');
  }, err => {
    console.log('捕获错误A:', err.message);
  })
  .then(() => {
    throw new Error('错误B');
  })
  .catch(err => {
    console.log('捕获错误B:', err.message);
  });
```

输出结果：

```plain
捕获错误B: 错误A
```

而如果用 `catch` 捕获错误，能捕获整个链条中未被捕获的错误。

## 区别二：异常传播机制

当 `then` 的第二个参数执行后，错误被“吃掉”了，后续的 `catch` 不会收到这个错误。

```javascript
Promise.reject('error')
  .then(null, err => {
    console.log('处理错误:', err);
    // 不抛出错误，错误不会继续传递
  })
  .catch(err => {
    console.log('这里不会执行');
  });
```

如果想让错误继续传递，需要在 `then` 的错误回调里显式抛出异常或返回一个 rejected Promise。

```javascript
Promise.reject('error')
  .then(null, err => {
    console.log('处理错误:', err);
    throw err; // 或 return Promise.reject(err);
  })
  .catch(err => {
    console.log('这里会执行:', err);
  });
```

## 区别三：代码可读性与错误处理分离

使用 `catch` 可以将错误处理统一放在链的末尾，使得业务逻辑和错误处理分开，代码更清晰。

```javascript
doSomething()
  .then(res => {
    // 业务逻辑
  })
  .then(res => {
    // 业务逻辑
  })
  .catch(err => {
    // 统一捕获所有错误
  });
```

而 `then` 第二个参数适合对某一步的错误做特定处理。

## 其它细节

- `catch` 实际上是 `then(null, onRejected)` 的语法糖，但在链条上使用时能捕获更多位置的异常。
- 如果在 `then` 的成功回调中抛错，只有 `catch` 能捕获，`then` 第二个参数不会捕获成功回调抛出的错误。

```javascript
Promise.resolve()
  .then(() => {
    throw new Error('异常');
  }, err => {
    console.log('不会捕获这里的异常');
  })
  .catch(err => {
    console.log('catch 捕获:', err.message);
  });
```

## 面试回答

`then` 方法的第二个参数和 `catch` 都是用来处理 Promise 异常的。它们的主要区别是：

第一，`then` 第二个参数只能捕获当前 Promise 的 reject，而 `catch` 可以捕获整个链条中未处理的异常。

第二，如果在 `then` 的成功回调中抛出异常，`then` 第二个参数无法捕获，只有后面的 `catch` 能捕获。

第三，使用 `catch` 可以将错误处理放到链的末尾，使代码逻辑更清晰，更符合现实开发中“集中处理异常”的需求。

因此，实际工作中推荐使用 `.then(onFulfilled).catch(onRejected)` 的写法，而避免在 `then` 里写第二个参数作为错误处理，除非是需要对某一步错误做特殊处理。

## 总结

Promise 的错误处理机制有多种方式，`then` 第二个参数和 `catch` 都能捕获错误，但它们的捕获范围和行为不同。合理选择错误处理方式，可以让代码更简洁、逻辑更清晰，也能避免隐藏错误。理解它们的差异，有助于写出健壮且易于维护的异步代码。