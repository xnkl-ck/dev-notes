# React 学习笔记

## 📝 知识点记录

---

### 🎯 useState 与 useEffect 的基本使用

#### 💬 学习场景
在开发列表组件时，需要从 API 获取数据并展示

#### ✅ 正确写法
```jsx
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('获取用户失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // 空依赖数组，仅在组件挂载时执行一次

  if (loading) return <div>加载中...</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

#### 💡 总结
- `useState` 用于声明组件的状态
- `useEffect` 用于处理副作用（如数据获取、订阅等）
- 依赖数组为空时，effect 只在挂载时运行一次
- 别忘了处理 loading 和 error 状态

#### 🔖 标签
`#react` `#hooks` `#useState` `#useEffect`

---

### 🎯 React 性能优化 - useMemo 和 useCallback

#### 💬 学习场景
组件频繁重新渲染，导致不必要的计算

#### ❌ 性能问题示例
```jsx
function ProductList({ products, category }) {
  // 每次渲染都会重新过滤
  const filteredProducts = products.filter(p => p.category === category);
  
  // 每次渲染都会创建新的函数
  const handleClick = (id) => {
    console.log('点击了产品:', id);
  };

  return (
    <div>
      {filteredProducts.map(p => (
        <ProductItem key={p.id} product={p} onClick={handleClick} />
      ))}
    </div>
  );
}
```

#### ✅ 优化后的写法
```jsx
import { useMemo, useCallback } from 'react';

function ProductList({ products, category }) {
  // 使用 useMemo 缓存计算结果
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === category);
  }, [products, category]);
  
  // 使用 useCallback 缓存函数引用
  const handleClick = useCallback((id) => {
    console.log('点击了产品:', id);
  }, []);

  return (
    <div>
      {filteredProducts.map(p => (
        <ProductItem key={p.id} product={p} onClick={handleClick} />
      ))}
    </div>
  );
}
```

#### 💡 总结
- `useMemo` 用于缓存计算结果，避免重复计算
- `useCallback` 用于缓存函数引用，避免子组件不必要的重渲染
- 配合 `React.memo` 使用效果更佳
- 不要过度优化，只在确实有性能问题时使用

#### 🔖 标签
`#react` `#performance` `#useMemo` `#useCallback`

---

### 🎯 自定义 Hook 的创建

#### 💬 学习场景
多个组件都需要使用表单输入逻辑，提取公共逻辑

#### ✅ 实现示例
```jsx
// hooks/useInput.js
import { useState } from 'react';

function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const reset = () => {
    setValue(initialValue);
  };

  return {
    value,
    onChange: handleChange,
    reset
  };
}

export default useInput;
```

#### 使用示例
```jsx
import useInput from './hooks/useInput';

function LoginForm() {
  const username = useInput('');
  const password = useInput('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('用户名:', username.value);
    console.log('密码:', password.value);
    
    // 提交后重置表单
    username.reset();
    password.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" {...username} placeholder="用户名" />
      <input type="password" {...password} placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  );
}
```

#### 💡 总结
- 自定义 Hook 以 `use` 开头命名
- 可以复用状态逻辑，避免代码重复
- 自定义 Hook 内部可以调用其他 Hook
- 保持 Hook 简单且专注于单一功能

#### 🔖 标签
`#react` `#custom-hooks` `#reusability`

---

## 📚 延伸阅读

- [React 官方文档 - Hooks](https://react.dev/reference/react)
- [React 性能优化指南](https://react.dev/learn/render-and-commit)

---

**最后更新：** 2025-10-16

