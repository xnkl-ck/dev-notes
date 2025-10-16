# 🐞 弹窗内滚动触发画布缩放 & 微前端环境下弹窗关闭问题

## 📊 问题概览

| 项目 | 信息 |
|------|------|
| **严重程度** | 🔴 高（影响核心功能） |
| **环境** | 开发环境正常，生产环境异常 → 微前端环境异常 |
| **技术栈** | React + React Flow + 无界微前端 |
| **发现日期** | 2025-10-16 |
| **解决时间** | 2天 |
| **难度** | ⭐⭐⭐⭐⭐ |

---

## 💬 问题描述

### 阶段 1️⃣：本地开发环境正常，编译后的开发/生产环境异常
**现象**：弹窗内滚动触发画布缩放

### 阶段 2️⃣：嵌入无界微前端后，所有滚动都关闭弹窗
**现象**：弹窗内滚动功能完全失效

---

## 🔍 根本原因分析

### 阶段 1：passive: true 限制了事件控制能力

#### ❌ 问题代码
```javascript
document.addEventListener('wheel', (e) => {
    if (popupElement.contains(e.target)) {
        e.stopPropagation()  // ⚠️ 在 passive: true 时效果被削弱
    } else {
        onClose()
    }
}, { passive: true, capture: true })  // 🚨 问题在这里
```

#### 🔬 深层原因

**什么是 passive 事件监听器？**

```javascript
// passive: true 的含义
// "我承诺不调用 preventDefault()，浏览器可以立即开始滚动"
element.addEventListener('wheel', handler, { passive: true })

// 副作用：
// 1. preventDefault() 会被忽略并警告
// 2. stopPropagation() 的效果在某些情况下会被削弱
```

**为什么本地环境正常？**

```
本地开发环境（Vite dev）
- 代码直接运行，未压缩
- 事件监听器按源代码顺序注册
- 浏览器的事件处理更"宽容"

编译后的生产环境（Vite build）
- 代码被压缩、优化、重组
- 事件监听器可能以不同顺序注册
- 浏览器的优化策略更激进
- passive: true 的限制更明显
```

---

### 阶段 2：iframe 边界与 DOM 隔离

#### ❌ 问题代码
```javascript
// 在微前端环境中
const popupElement = document.querySelector('[data-popup-id="xxx"]')
const target = event.target  // wujie-app 容器元素

popupElement.contains(target)  // ❌ 返回 false！
```

#### 🔬 深层原因

**微前端 DOM 结构**：
```
父应用 (主文档)
└─ document
   └─ body
      └─ <wujie-app> (特殊容器)
         └─ #shadow-root 或 iframe
            └─ 子应用文档
               └─ React 应用
                  └─ Portal 弹窗
```

**contains() 的限制**：

```javascript
// contains() 通过 parentNode 向上遍历
function contains(parent, child) {
    let node = child
    while (node) {
        if (node === parent) return true
        node = node.parentNode  // ⚠️ 遇到 iframe 边界会停止
    }
    return false
}

// 在微前端中：
// - event.target = wujie-app（容器元素）
// - popupElement 在另一个 DOM 分支
// - 它们在 DOM 树上不是父子关系
// - contains() 返回 false
```

**日志验证**：
```javascript
{
    result: false,              // contains() 检测失败
    targetElement: 'WUJIE-APP', // 事件目标是无界容器
    popupExists: true,          // ✅ 弹窗元素存在
    method: 'contains'          // 使用的是 contains 方法
}
```

---

## ✅ 完整解决方案

### 最终代码

```javascript
const popupRef = useRef(null)

useEffect(() => {
    const handleWheel = (e) => {
        const popup = popupRef.current
        if (!popup) return
        
        // 关键点 1: 使用 Ref 替代 querySelector
        let inside = popup.contains(e.target)
        
        // 关键点 2: composedPath() 解决微前端问题
        if (!inside && e.composedPath) {
            const path = e.composedPath()
            inside = path.some(el => el === popup)
        }
        
        if (inside) {
            e.stopPropagation()
        } else {
            onClose()
        }
    }
    
    // 关键点 3: passive: false 确保 stopPropagation 生效
    // 关键点 4: capture: true 在捕获阶段最早拦截
    document.addEventListener('wheel', handleWheel, {
        passive: false,  // 🔑 解决阶段 1
        capture: true
    })
    
    return () => {
        document.removeEventListener('wheel', handleWheel, { capture: true })
    }
}, [onClose])
```

### 4 个关键要素

| 要素 | 作用 | 解决的问题 |
|------|------|-----------|
| `useRef` | 更可靠的元素引用 | 避免 querySelector 时序问题 |
| `passive: false` | 完全控制事件传播 | 解决阶段 1（编译优化环境） |
| `composedPath()` | 获取完整事件路径 | 解决阶段 2（微前端环境） |
| `capture: true` | 捕获阶段监听 | 最早拦截事件 |

---

## 🎓 核心知识点

### 1. Passive 事件监听器的本质

**设计目的**：提升滚动性能

```javascript
// Chrome 51+ 引入
// 解决：JavaScript 阻塞滚动导致的卡顿

// 代价：限制了事件控制能力
// - preventDefault() 无效
// - stopPropagation() 效果被削弱（某些场景）
```

**使用原则**：
- ✅ **只读操作**：只监听，不干预 → `passive: true`
- ❌ **需要控制**：要阻止默认行为或传播 → `passive: false`

### 2. composedPath() vs contains()

| 方法 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|---------|
| `contains()` | 向上遍历 parentNode | 简单直观 | 无法跨越 iframe/Shadow DOM | 普通应用 |
| `composedPath()` | 返回完整事件路径 | 穿透所有边界 | 需要遍历数组 | 微前端/Web Components |

**示例对比**：
```javascript
// contains() - 普通环境
popupElement.contains(event.target)  // ✅ 简单

// composedPath() - 微前端环境
event.composedPath().some(el => el === popupElement)  // ✅ 可靠
```

### 3. 事件监听的时机

```javascript
// 事件传播三阶段
捕获阶段 (capture)  →  目标阶段 (target)  →  冒泡阶段 (bubble)
   ↓                      ↓                     ↓
最早拦截                原始目标              最晚处理
```

**为什么用 capture: true？**
- 在捕获阶段（最早）拦截事件
- 在其他监听器之前处理
- 避免被其他代码干扰

---

## 💡 举一反三

### 类似问题的识别模式

当你遇到这些现象时，可能是类似问题：

1. **本地正常，生产异常** → 检查 `passive` 配置
2. **普通环境正常，微前端异常** → 检查 `contains()` 使用
3. **事件监听不生效** → 检查 `capture` 阶段
4. **跨 iframe/Shadow DOM 的交互** → 使用 `composedPath()`

### 可以复用的解决模式

```javascript
// 通用模式：可靠的弹窗外点击/滚动检测
useEffect(() => {
    const handleEvent = (e) => {
        const element = elementRef.current
        if (!element) return
        
        // 双重检测（兼容所有环境）
        let inside = element.contains(e.target)
        if (!inside && e.composedPath) {
            inside = e.composedPath().some(el => el === element)
        }
        
        if (!inside) {
            // 在元素外部的处理
            onClickOutside?.()
        }
    }
    
    document.addEventListener(eventType, handleEvent, {
        passive: needControl ? false : true,  // 根据需要选择
        capture: true
    })
    
    return () => {
        document.removeEventListener(eventType, handleEvent, { capture: true })
    }
}, [needControl, onClickOutside])
```

---

## 📚 相关资源

### 官方文档
- [Chrome: Passive Event Listeners](https://developer.chrome.com/blog/passive-event-listeners/)
- [MDN: Event.composedPath()](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath)
- [无界微前端文档](https://wujie-micro.github.io/doc/)

### 延伸阅读
- [为什么 passive 会影响 stopPropagation](https://stackoverflow.com/questions/49571588)
- [Shadow DOM 事件重定向](https://developers.google.com/web/fundamentals/web-components/shadowdom)
- [微前端中的事件处理最佳实践](https://qiankun.umijs.org/zh/guide/)

---

## 🔖 标签

`#react` `#event-handling` `#passive-listener` `#micro-frontend` `#iframe` `#composedPath` `#performance` `#debugging` `#production-bug`

---

## 📝 个人反思

### 这个 Bug 让我学到了什么？

1. **不要忽视编译优化**：本地正常 ≠ 生产正常
2. **理解浏览器机制**：passive 不只是性能优化，还影响行为
3. **微前端的复杂性**：DOM 隔离带来的副作用
4. **调试策略**：通过日志逐步定位（targetElement 日志是关键）
5. **完整性思维**：一个问题可能有多个根因，需要多个解决方案

### 如果重来一次，我会怎么做？

1. ✅ 第一时间检查 `passive` 配置
2. ✅ 使用 `composedPath()` 而不是 `contains()`（前瞻性）
3. ✅ 在不同环境中早期测试（开发/生产/微前端）
4. ✅ 添加详细的日志（event.target, event.composedPath()）

### 留给未来的自己

> **核心原则**：当需要控制事件传播时，永远使用 `passive: false` + `composedPath()` + `capture: true`
> 
> 不是过度设计，而是**一次性做对**。

---

**记录时间**：2025-10-16  
**解决状态**：✅ 已完全解决  
**影响范围**：生产环境关键功能  
**经验价值**：⭐⭐⭐⭐⭐

