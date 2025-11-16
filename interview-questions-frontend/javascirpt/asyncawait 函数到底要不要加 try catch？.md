# **async/await 函数到底要不要加 try catch？**

## 前言

在使用 async/await 编写异步代码时，异常处理是一个必须关注的问题。很多开发者会纠结是否在 async 函数内部使用 try/catch，或者依赖外层的错误处理机制。正确理解什么时候应该使用 try/catch，有助于写出健壮、可维护的代码。本文将围绕 async/await 的异常捕获机制及实践建议展开分析。

## async/await 异常捕获的原理

async 函数本质上返回一个 Promise，函数内部抛出的异常会导致返回的 Promise 被拒绝（rejected）。因此，异常处理有两种常见方式：

1. 在 async 函数内部使用 try/catch 捕获异常，进行局部处理。
2. 在调用 async 函数的地方，通过 Promise 的 `.catch()` 方法捕获异常。

这两种方式的选择取决于异常的处理需求和上下文。

## 何时在 async 函数内部加 try/catch？

- 当你需要对异常进行局部处理时，比如记录日志、做清理、重试逻辑等。
- 希望对某些特定错误进行自定义处理，不影响外层调用。
- 防止异常穿透导致应用崩溃或用户体验差。

示例：

```plain
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('网络错误');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('fetchData 异常:', err);
    return null; // 兜底返回
  }
}
```

## 何时依赖外层捕获（不在函数内加 try/catch）？

- 函数本身不关心异常处理，交由调用方统一处理。
- 方便链式调用和集中异常管理。
- 代码更简洁，逻辑分离。

示例：

```plain
async function fetchData() {
  const res = await fetch('/api/data');
  const data = await res.json();
  return data;
}

fetchData()
  .then(data => console.log(data))
  .catch(err => console.error('统一异常处理:', err));
```

## 使用 try/catch 的注意事项

- 在 async 函数内用 try/catch 捕获异常后，如果不抛出或不返回错误，外层不会感知到错误，可能会掩盖问题。
- 建议处理完异常后，视情况选择是否抛出错误或返回特殊值。
- 对于多处异步操作，try/catch 可嵌套使用，精细化控制异常处理。

## 结合 finally 使用

finally 用于无论异常与否都执行的清理操作，例如关闭 loading 状态、释放资源。

```plain
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err; // 继续抛出，交给调用方
  } finally {
    console.log('请求结束，关闭 loading');
  }
}
```

## 面试回答

async 函数内部加不加 try/catch，取决于异常处理需求。如果函数需要对异常做局部处理，比如记录日志、做兜底处理，就应该加 try/catch。

如果函数本身不处理异常，而是让调用者统一捕获，则可以不加 try/catch，利用 Promise 的 `.catch()` 进行集中处理。

需要注意的是，try/catch 捕获异常后，如果没有再抛出或返回错误，外层调用可能无法感知异常，导致问题被掩盖。

所以写 async 函数时，建议合理使用 try/catch，明确异常处理边界，保证异常不会被吞掉，并结合 finally 做必要的清理操作。

总的来说，加 try/catch 是一种常见且推荐的异常处理方式，但是否加要根据具体业务场景和异常处理策略灵活决定。

## 总结

async/await 本质上是 Promise 的语法糖，异常处理依赖 Promise 的 reject 机制。是否在 async 函数内加 try/catch 取决于是否需要局部异常处理。合理使用 try/catch 结合外层的统一捕获，可以写出健壮且清晰的异步代码。异常处理不应被忽视，否则可能导致错误隐藏，影响程序稳定性。