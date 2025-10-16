# React Bug 记录（错题本）

记录在使用 React 过程中遇到的问题和解决方案。

---

## 🐞 问题 1：useEffect 无限循环

### 💬 发现场景
在组件中使用 `useEffect` 获取数据时，发现页面一直在重新渲染，控制台疯狂打印日志。

### ❌ 错误示例
```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // 🚨 错误：依赖数组中传入了对象
  useEffect(() => {
    fetchUser(userId).then(data => setUser(data));
  }, [user]); // 每次 user 更新都会触发，造成无限循环！

  return <div>{user?.name}</div>;
}
```

### ✅ 正确写法
```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // ✅ 正确：只依赖 userId
  useEffect(() => {
    fetchUser(userId).then(data => setUser(data));
  }, [userId]); // 只有 userId 变化时才重新获取

  return <div>{user?.name}</div>;
}
```

### 🔍 原因分析
1. React 的依赖数组会进行**浅比较**（shallow comparison）
2. 对象和数组每次渲染都是新的引用，即使内容相同
3. 如果把 `user` 放在依赖数组中：
   - useEffect 执行 → 更新 user
   - user 变化 → 触发 useEffect
   - 形成无限循环

### 💡 总结与延伸
- 依赖数组只放**原始类型**或**稳定的引用**
- 对于对象/数组依赖，只依赖具体的属性值（如 `user.id`）
- 使用 ESLint 插件：`eslint-plugin-react-hooks` 会提示依赖问题
- 如果确实需要依赖对象，考虑使用 `useMemo` 或 `useCallback`

### 🔖 标签
`#react` `#useEffect` `#bugfix` `#infinite-loop`

---

## 🐞 问题 2：组件状态更新不及时

### 💬 发现场景
点击按钮后立即使用 state 的值，发现拿到的还是旧值。

### ❌ 错误示例
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    console.log(count); // 🚨 输出的是旧值！
    // 假设 count 原来是 0，这里会打印 0 而不是 1
  };

  return <button onClick={handleClick}>点击：{count}</button>;
}
```

### ✅ 正确写法

**方法 1：使用函数式更新**
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(prevCount => {
      const newCount = prevCount + 1;
      console.log('新值:', newCount); // ✅ 这里能拿到新值
      return newCount;
    });
  };

  return <button onClick={handleClick}>点击：{count}</button>;
}
```

**方法 2：使用 useEffect 监听变化**
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('count 更新了:', count); // ✅ 在这里能拿到最新值
  }, [count]);

  const handleClick = () => {
    setCount(count + 1);
  };

  return <button onClick={handleClick}>点击：{count}</button>;
}
```

### 🔍 原因分析
1. `setState` 是**异步**的，不会立即更新
2. React 会批量处理状态更新，提高性能
3. 在 `setState` 之后立即访问 state，拿到的还是闭包中的旧值

### 💡 总结与延伸
- React 18+ 中，所有更新都是批量的（包括异步函数中的更新）
- 如果需要基于旧状态计算新状态，使用函数式更新：`setState(prev => prev + 1)`
- 如果需要在状态更新后执行操作，使用 `useEffect`
- 注意闭包陷阱，尤其是在定时器和事件监听器中

### 🔖 标签
`#react` `#useState` `#async` `#closure`

---

## 🐞 问题 3：key 警告和列表渲染问题

### 💬 发现场景
渲染列表时，控制台出现警告："Warning: Each child in a list should have a unique 'key' prop."

### ❌ 错误示例
```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {/* 🚨 错误 1：没有 key */}
      {todos.map(todo => (
        <li>{todo.text}</li>
      ))}
      
      {/* 🚨 错误 2：使用 index 作为 key（当列表会变化时）*/}
      {todos.map((todo, index) => (
        <li key={index}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### ✅ 正确写法
```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {/* ✅ 使用唯一且稳定的 ID 作为 key */}
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### 🔍 原因分析
1. React 使用 `key` 来追踪列表中的元素
2. 没有 key 或使用 index 作为 key 会导致：
   - 性能问题（无法正确复用元素）
   - 状态错乱（删除/插入元素时）
   - 动画/过渡效果异常

**示例：为什么不能用 index**
```jsx
// 初始列表：[A, B, C]
// index:    [0, 1, 2]

// 删除 B 后：[A, C]
// index:     [0, 1]

// React 认为：
// - 元素 0 (A) 没变
// - 元素 1 从 B 变成了 C（会重新渲染或状态错乱）
// - 元素 2 (C) 被删除了
```

### 💡 总结与延伸
- 永远使用**唯一且稳定**的 ID 作为 key
- 如果数据没有 ID，可以在获取数据时生成（如用 `uuid` 库）
- 只有在列表是**静态**且**不会重新排序**时才能用 index
- key 应该在**兄弟元素**之间唯一，不需要全局唯一

### 🔖 标签
`#react` `#key` `#list-rendering` `#warning`

---

## 🐞 问题 4：Props 解构导致的默认值陷阱

### 💬 发现场景
给组件传递了 `undefined` 作为 prop，但默认值没有生效。

### ❌ 错误示例
```jsx
// 父组件
<Button size={undefined} /> // 🚨 传递了 undefined

// 子组件
function Button({ size = 'medium' }) {
  console.log(size); // 输出: undefined（而不是 'medium'）
  return <button className={`btn-${size}`}>按钮</button>;
}
```

### ✅ 正确写法

**方法 1：在父组件不传递 undefined**
```jsx
// 父组件
<Button /> // ✅ 不传递这个 prop
// 或
<Button size={someValue || undefined} /> // 使用条件渲染
```

**方法 2：在子组件中处理**
```jsx
function Button({ size }) {
  const actualSize = size ?? 'medium'; // ✅ 使用空值合并运算符
  return <button className={`btn-${actualSize}`}>按钮</button>;
}
```

**方法 3：使用对象解构的默认值**
```jsx
function Button(props) {
  const { size = 'medium' } = props.size === undefined ? {} : props;
  // 或者更简洁：
  const size = props.size ?? 'medium';
  return <button className={`btn-${size}`}>按钮</button>;
}
```

### 🔍 原因分析
1. JavaScript 的参数默认值只在参数为 `undefined` 时生效
2. 如果显式传递了 `undefined`，它会覆盖默认值
3. 这是 JavaScript 的特性，不是 React 的问题

### 💡 总结与延伸
- 避免显式传递 `undefined` 作为 prop
- 使用 `??`（空值合并）或 `||`（逻辑或）处理默认值
- TypeScript 可以帮助检测这类问题
- 可以使用 PropTypes 的 `defaultProps` 来定义默认值

### 🔖 标签
`#react` `#props` `#javascript` `#default-values`

---

## 📌 常见错误速查

| 错误类型 | 症状 | 快速解决 |
|---------|------|---------|
| useEffect 无限循环 | 页面卡死，控制台疯狂打印 | 检查依赖数组，不要依赖会变化的对象 |
| 状态更新不及时 | setState 后立即读取是旧值 | 使用函数式更新或 useEffect |
| key 警告 | 控制台警告 | 使用唯一 ID 而非 index |
| 内存泄漏 | 组件卸载后仍在更新状态 | useEffect 中返回清理函数 |
| 闭包陷阱 | 定时器中拿到的是旧状态 | 使用 useRef 或函数式更新 |

---

## 🔗 深度分析文章

对于特别复杂的问题，我会创建独立的深度分析文档：

- [⭐ 弹窗滚动事件问题：passive 监听器 + 微前端 iframe 边界](./passive-events-and-iframe-boundary.md)
  - 涉及：事件监听、passive、composedPath、微前前端
  - 难度：⭐⭐⭐⭐⭐
  - 经验价值：非常高

---

**最后更新：** 2025-10-16

