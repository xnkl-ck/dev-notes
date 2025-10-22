# AgentFactory 项目面试准备文档

> **项目定位**：企业级 AI 智能代理管理平台（微前端子应用）  
> **技术栈**：React 18 + Vite + TypeScript + Redux Toolkit + Material-UI + ReactFlow + TailwindCSS + i18next + Wujie

---

## 目录
- [一、微前端架构集成 (Wujie)](#一微前端架构集成-wujie)
- [二、外部认证系统集成 (SSO)](#二外部认证系统集成-sso)
- [三、性能优化 (构建)](#三性能优化-构建)
- [四、性能优化 (加载)](#四性能优化-加载)
- [五、性能优化 (缓存)](#五性能优化-缓存)
- [六、可视化工作流编辑器 (ReactFlow)](#六可视化工作流编辑器-reactflow)
- [七、工程化 (Turbo monorepo)](#七工程化-turbo-monorepo)
- [八、综合问题](#八综合问题)

---

## 一、微前端架构集成 (Wujie)

### 📌 技术实现细节

#### 1.1 为什么选择 Wujie？
- **WebComponent 容器 + iframe 沙箱**：天然隔离 CSS 和 JS
- **去中心化通信**：不依赖全局状态，通过事件总线实现松耦合
- **生命周期完整**：支持预加载、保活模式、降级策略
- **与 qiankun 对比**：Wujie 在样式隔离和 vite 兼容性上更优

#### 1.2 事件总线设计（100ms 内同步）

**实现架构**：
```javascript
// 主应用：发布事件
window.$wujie.bus.$emit('theme-change', { theme: 'dark' })
window.$wujie.bus.$emit('language-change', { lang: 'en' })
window.$wujie.bus.$emit('token-update', { token: 'xxx' })

// 子应用：监听事件
window.$wujie?.bus.$on('theme-change', ({ theme }) => {
  dispatch(setTheme(theme))
  applyThemeToDOM(theme)
})
```

**性能优化关键**：
- **防抖处理**：使用 `debounce(100ms)` 避免频繁触发
- **批量更新**：Redux Toolkit 的 `batch()` 合并多次 dispatch
- **缓存同步**：将状态同步写入 `localStorage`，刷新后恢复

**测试数据**：
- 事件传递延迟：< 50ms
- DOM 更新完成：< 100ms
- 用户无感知切换

#### 1.3 独立/嵌入式部署兼容

**核心代码**：
```javascript
// src/main.jsx
const isEmbedded = window.__POWERED_BY_WUJIE__

if (isEmbedded) {
  // 嵌入模式：接收主应用配置
  const config = window.$wujie.props
  initAppWithConfig(config)
} else {
  // 独立模式：使用默认配置
  initAppStandalone()
}

// 动态路由前缀
const basename = isEmbedded ? '/agent-factory' : '/'
```

**灵活性提升 100%**：指既能独立运行（http://localhost:3000），也能嵌入主应用（统一入口）

---

### 🎯 高频面试问题（STAR 法则）

#### Q1: 微前端架构中如何保证主子应用通信的可靠性？

**S (Situation)**：  
在微前端架构中，主应用和 AgentFactory 子应用需要实时同步主题、语言、Token 等状态，但直接通信存在耦合风险。

**T (Task)**：  
设计一套可靠的通信机制，保证数据同步的实时性（< 100ms）和容错性。

**A (Action)**：  
1. **事件总线 + 发布订阅模式**：使用 Wujie 的 `bus.$emit / $on` 解耦
2. **心跳检测**：子应用每 30s 向主应用发送心跳，确认连接状态
3. **降级策略**：通信失败时从 `localStorage` 读取缓存配置
4. **TypeScript 类型约束**：定义事件接口，编译时检查参数类型

**R (Result)**：  
- 状态同步延迟 < 100ms
- 异常场景下自动降级，可用性 99.8%
- 减少 70% 的通信调试时间

---

#### Q2: 独立部署和嵌入式部署的差异如何处理？

**S**：子应用需要支持两种运行模式，但路由、认证、环境变量配置不同。

**T**：实现一套代码，兼容两种部署方式。

**A**：
1. **环境检测**：通过 `window.__POWERED_BY_WUJIE__` 判断运行模式
2. **配置抽象**：创建 `ConfigProvider`，根据模式动态注入配置
3. **路由适配**：嵌入式使用 basename，独立式使用根路径
4. **认证切换**：嵌入式使用 SSO Token，独立式使用本地登录

**R**：
- 灵活性提升 100%（可以任意切换模式）
- 减少 50% 的环境配置工作量

---

### 🔧 技术深度问题

#### Q3: Wujie 的 iframe 沙箱和 qiankun 的 JS 沙箱有什么区别？

**Wujie**：
- 使用 **WebComponent + iframe** 实现双重隔离
- JS 运行在 iframe 中，DOM 渲染在 WebComponent 中
- **优势**：样式隔离彻底，无需 CSS Scope 方案
- **劣势**：iframe 通信有性能开销（通过代理优化）

**qiankun**：
- 使用 **Proxy 沙箱**拦截 `window` 对象
- CSS 通过 Shadow DOM 或 scoped 样式隔离
- **优势**：轻量级，无额外容器
- **劣势**：样式隔离不彻底（第三方库可能冲突）

**选择 Wujie 的原因**：项目使用 Vite + Material-UI，全局样式多，Wujie 的隔离更安全。

---

#### Q4: 如何解决微前端中的依赖冲突（如 React 版本不一致）？

**问题场景**：主应用 React 17，子应用 React 18。

**解决方案**：
1. **依赖外部化（推荐）**：子应用使用主应用的 React
   ```javascript
   // vite.config.js
   build: {
     rollupOptions: {
       external: ['react', 'react-dom']
     }
   }
   ```
2. **独立打包（当前方案）**：子应用打包自己的 React，通过 iframe 隔离
3. **Module Federation**：Webpack 5 的共享依赖方案

**实际选择**：独立打包，因为 Wujie 天然隔离，无冲突风险。

---

## 二、外部认证系统集成 (SSO)

### 📌 技术实现细节

#### 2.1 SSO 认证流程

```
1. 用户访问主应用 → 主应用登录 → 获取 JWT Token
2. 主应用加载子应用时，通过 props 传递 Token
3. 子应用接收 Token，调用后端 `/api/verify` 验证
4. 验证成功：保存 Token，跳转首页
5. 验证失败：跳转主应用登录页
```

**核心代码**：
```javascript
// 子应用启动时
const token = window.$wujie?.props?.token || getTokenFromStorage()

if (token) {
  const isValid = await api.verifyToken(token)
  if (isValid) {
    store.dispatch(setAuth({ token, user: decodedUser }))
    axios.defaults.headers['Authorization'] = `Bearer ${token}`
  } else {
    redirectToMainLogin()
  }
}
```

#### 2.2 Token 刷新机制

**问题**：JWT 过期后如何无感刷新？

**方案**：
1. **拦截器检测 401**：Axios 响应拦截器捕获过期错误
2. **自动刷新**：调用主应用的 `refreshToken` 接口
3. **重试请求**：刷新成功后重放失败的请求
4. **防并发**：使用 Promise 队列，避免多个请求同时刷新

```javascript
axios.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true
    const newToken = await refreshTokenFromMain()
    error.config.headers['Authorization'] = `Bearer ${newToken}`
    return axios(error.config)
  }
  return Promise.reject(error)
})
```

#### 2.3 认证成功率 99.8% 的保障

**监控指标**：
- Token 验证成功率：99.8%
- 平均响应时间：< 200ms
- 刷新失败率：< 0.2%

**容错措施**：
- **降级登录**：SSO 失败时，回退到本地登录
- **错误重试**：网络失败自动重试 3 次（指数退避）
- **日志上报**：记录所有认证失败事件，定位问题

---

### 🎯 高频面试问题（STAR 法则）

#### Q5: SSO 单点登录的核心原理是什么？如何实现？

**S**：多个系统需要共享登录状态，避免重复登录。

**T**：实现子应用自动继承主应用的登录态。

**A**：
1. **统一认证中心**：主应用作为认证方，颁发 JWT Token
2. **Token 传递**：通过 Wujie 的 `props` 或 URL 参数传递
3. **后端验证**：子应用调用主应用接口验证 Token 有效性
4. **状态同步**：验证成功后，子应用保存 Token 和用户信息

**R**：
- 用户无需二次登录，体验流畅
- 认证成功率达 99.8%

---

#### Q6: JWT Token 存储在哪里？有什么安全风险？

**存储方案对比**：

| 方案 | 优势 | 劣势 | 是否采用 |
|------|------|------|----------|
| **localStorage** | 持久化，刷新不丢失 | 易受 XSS 攻击 | ✅ 采用 |
| **sessionStorage** | 标签页隔离 | 刷新后需重新登录 | ❌ |
| **Cookie (httpOnly)** | 防 XSS | 不能被 JS 读取，不适合前后端分离 | ❌ |
| **内存** | 最安全 | 刷新后丢失 | 辅助使用 |

**实际方案**：
- **主存储**：`localStorage`（方便刷新恢复）
- **内存缓存**：Redux Store（运行时快速访问）
- **安全措施**：
  - 设置 Token 过期时间（2 小时）
  - 启用 CSP (Content Security Policy) 防 XSS
  - 敏感操作二次验证

---

### 🔧 技术深度问题

#### Q7: Token 过期后如何无感刷新？遇到并发请求怎么办？

**问题场景**：用户同时发起 10 个请求，Token 刚好过期。

**错误方案**：每个请求都触发刷新 → 后端收到 10 次刷新请求 → 浪费资源

**正确方案（Promise 队列）**：
```javascript
let refreshPromise = null

async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = api.refreshToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

// 拦截器中使用
const newToken = await refreshToken() // 多个请求复用同一个 Promise
```

**效果**：10 个并发请求，只刷新 1 次 Token。

---

## 三、性能优化 (构建)

### 📌 技术实现细节

#### 3.1 问题背景："数千个 HTTP 请求"

**初始状态**：
- 首屏加载：**3000+ HTTP 请求**
- 加载时间：8-10 秒
- 瀑布图：大量小文件请求阻塞

**原因分析**：
1. **Vite 开发模式特性**：按需加载模块，每个文件一个请求
2. **依赖未预构建**：第三方库（如 lodash）每个子模块都发请求
3. **动态导入滥用**：过多的 `import()` 拆分代码

#### 3.2 解决方案：智能代码分割

**策略 1：依赖预构建**
```javascript
// vite.config.js
optimizeDeps: {
  include: [
    'react', 'react-dom', 'react-router-dom',
    'lodash', 'axios', '@mui/material',
    'reactflow' // 大型库强制预构建
  ]
}
```

**策略 2：手动分包（splitChunks）**
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-ui': ['@mui/material', '@mui/icons-material'],
        'vendor-flow': ['reactflow'],
        'vendor-utils': ['lodash', 'axios', 'dayjs']
      }
    }
  }
}
```

**策略 3：路由懒加载**
```javascript
const FlowEditor = lazy(() => import('./pages/FlowEditor'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
```

**策略 4：异步组件合并**
- 原方案：10 个弹窗组件，10 个 chunk
- 优化后：合并为 `dialogs.js` 一个 chunk

#### 3.3 优化结果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| HTTP 请求数 | 3000+ | 20-30 | **90%+** |
| 首屏加载时间 | 8-10s | 3-4s | **60%** |
| Bundle 大小 | 5MB | 3MB | **40%** |

---

### 🎯 高频面试问题（STAR 法则）

#### Q8: 如何定位"数千个 HTTP 请求"的问题？

**S**：用户反馈首屏加载慢，打开 DevTools 发现 3000+ 请求。

**T**：定位请求来源，优化到合理范围（< 50 个）。

**A**：
1. **Network 面板分析**：按类型分组，发现大量 `.js` 文件
2. **Vite 日志检查**：开启 `debug` 模式，查看模块加载路径
3. **Bundle 分析**：使用 `rollup-plugin-visualizer` 生成依赖图
4. **定位根因**：发现 `lodash` 未预构建，每个函数一个请求

**R**：
- 将 lodash 加入 `optimizeDeps.include`
- 请求数从 3000+ 降至 30 左右
- 加载时间缩短 60%

---

#### Q9: Vite 的代码分割和 Webpack 有什么区别？

**Webpack**：
- 基于 `splitChunks` 配置，静态分析依赖关系
- 打包时生成固定的 chunk
- 需要手动配置 cacheGroups

**Vite**：
- **开发模式**：ESM 原生加载，按需请求（导致请求多）
- **生产模式**：基于 Rollup，自动分割动态导入
- 更智能的 Tree Shaking

**优化关键**：
- Vite 需要显式配置 `manualChunks`，否则会拆分过细
- Webpack 需要调整 `minSize / maxSize` 控制 chunk 大小

---

### 🔧 技术深度问题

#### Q10: 如何平衡代码分割的粒度？

**过度拆分**：
- chunk 数量多 → HTTP 请求多 → 并发限制（Chrome 最多 6 个）
- 每个 chunk 都有开销（gzip header）

**拆分不足**：
- 单个 chunk 太大 → 首屏加载慢
- 改一行代码 → 整个 chunk 缓存失效

**最佳实践**：
1. **基础库**：React/Vue 单独打包（变化少，长期缓存）
2. **UI 库**：Material-UI 单独打包（体积大）
3. **业务代码**：按路由拆分（按需加载）
4. **工具库**：lodash/dayjs 合并为一个 chunk

**目标**：
- 单个 chunk 大小：50KB - 200KB
- 总 chunk 数量：< 20 个
- 首屏关键 chunk：< 3 个

---

## 四、性能优化 (加载)

### 📌 技术实现细节

#### 4.1 依赖预构建

**原理**：Vite 首次启动时，将 CommonJS/UMD 依赖转为 ESM，并打包成单文件。

**配置优化**：
```javascript
optimizeDeps: {
  include: [
    // 强制预构建的库
    'lodash', 'axios', '@mui/material'
  ],
  exclude: [
    // 已经是 ESM 的库，跳过构建
    'some-esm-package'
  ]
}
```

**效果**：首次加载时间从 5s 降至 2s。

#### 4.2 资源内联（< 4KB）

**策略**：小文件直接 base64 内联，减少 HTTP 请求。

```javascript
build: {
  assetsInlineLimit: 4096 // 4KB 以下的文件内联
}
```

**实际场景**：
- 小图标 (logo.png, 3KB) → 内联
- 大图片 (banner.jpg, 100KB) → 单独请求

#### 4.3 Terser 压缩

**对比 esbuild**：
- esbuild：速度快（10x），但压缩率低
- Terser：速度慢，但压缩率高（额外 5-10%）

**配置**：
```javascript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true, // 删除 console.log
      drop_debugger: true
    }
  }
}
```

**权衡**：生产环境用 Terser，开发环境用 esbuild。

#### 4.4 优化结果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 首屏加载时间 | 6s | 2.5s | **58%** |
| Bundle 大小 | 5MB | 3MB | **40%** |
| Gzip 后大小 | 1.5MB | 900KB | **40%** |

---

### 🎯 高频面试问题（STAR 法则）

#### Q11: 如何分析首屏加载性能瓶颈?

**S**：首屏加载 6 秒，用户体验差。

**T**：定位瓶颈，优化至 3 秒以内。

**A**：
1. **Lighthouse 分析**：FCP 4s，LCP 6s（主要瓶颈）
2. **Network 瀑布图**：发现 `vendor.js` (2MB) 阻塞渲染
3. **Bundle Analyzer**：发现 Moment.js 打包了所有语言包
4. **优化措施**：
   - 替换 Moment.js 为 Day.js（体积减少 90%）
   - 动态导入非首屏组件
   - 启用 Gzip 压缩

**R**：
- 首屏加载时间降至 2.5s
- LCP 指标从 6s 降至 2.8s

---

#### Q12: Gzip 压缩在哪一层处理？前端还是后端？

**答案**：后端（Nginx）处理，但前端需要配合。

**前端职责**：
- 生成 `.gz` 文件（预压缩）
  ```javascript
  import viteCompression from 'vite-plugin-compression'
  
  plugins: [
    viteCompression({ algorithm: 'gzip' })
  ]
  ```

**后端职责**：
- Nginx 配置返回 `.gz` 文件
  ```nginx
  gzip_static on;
  gzip_types text/javascript application/javascript;
  ```

**优势**：
- 预压缩：构建时完成，运行时无 CPU 开销
- 压缩率：3MB → 900KB（70% 减少）

---

### 🔧 技术深度问题

#### Q13: Tree Shaking 失效的常见原因？

**问题场景**：明明没用的代码，却被打包进 bundle。

**失效原因**：
1. **CommonJS 导出**：`module.exports = {}` 无法静态分析
   ```javascript
   // ❌ 无法 Tree Shaking
   const utils = require('./utils')
   
   // ✅ 可以 Tree Shaking
   import { debounce } from './utils'
   ```

2. **副作用代码**：模块顶层有执行代码
   ```javascript
   // utils.js
   console.log('Module loaded') // 副作用 → 无法删除
   export const add = (a, b) => a + b
   ```

3. **未标记 sideEffects**：
   ```json
   // package.json
   "sideEffects": false // 告诉打包工具：无副作用，可以删除
   ```

**解决方案**：
- 使用 ESM 导入
- 在 `package.json` 标记 `sideEffects`
- 避免模块顶层有副作用代码

---

## 五、性能优化 (缓存)

### 📌 技术实现细节

#### 5.1 长期缓存策略（1 年）

**核心原理**：文件名 hash 化，内容变化才更新。

**Vite 配置**：
```javascript
build: {
  rollupOptions: {
    output: {
      // JS 文件：contenthash（内容变化才改变）
      entryFileNames: 'assets/[name].[hash].js',
      chunkFileNames: 'assets/[name].[hash].js',
      
      // CSS 文件
      assetFileNames: 'assets/[name].[hash].[ext]'
    }
  }
}
```

**Nginx 配置**：
```nginx
location ~* \.(js|css|png|jpg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location = /index.html {
  add_header Cache-Control "no-cache"; # HTML 每次都验证
}
```

**关键点**：
- **静态资源**：`Cache-Control: max-age=31536000, immutable`（1 年）
- **HTML 文件**：`Cache-Control: no-cache`（每次验证）

#### 5.2 缓存命中率 85%

**监控方式**：
- Nginx 日志统计：`$upstream_cache_status`
- CDN 控制台：查看 HIT/MISS 比例

**提升策略**：
1. **预加载关键资源**：
   ```html
   <link rel="preload" href="/vendor.js" as="script">
   ```
2. **Service Worker 缓存**：离线访问
3. **CDN 分发**：全球加速

#### 5.3 缓存更新策略

**问题**：发布新版本后，用户浏览器仍加载旧文件。

**方案**：
1. **HTML 不缓存**：每次请求都获取最新的 `index.html`
2. **JS/CSS 文件名带 hash**：内容变化 → 文件名变化 → 浏览器请求新文件
3. **自动更新检测**：
   ```javascript
   // 轮询检查版本
   setInterval(() => {
     fetch('/version.json').then(res => {
       if (res.version !== currentVersion) {
         showUpdateTip() // 提示用户刷新
       }
     })
   }, 5 * 60 * 1000) // 5 分钟检查一次
   ```

---

### 🎯 高频面试问题（STAR 法则）

#### Q14: 如何保证用户访问到最新的代码？

**S**：发布新版本后，用户浏览器加载旧的 JS 文件（强缓存）。

**T**：在不清空缓存的情况下，让用户访问最新代码。

**A**：
1. **文件名 hash 化**：`vendor.abc123.js` → 内容变化 → `vendor.def456.js`
2. **HTML 不缓存**：每次访问都获取最新 `index.html`
3. **HTML 中引用新文件**：`<script src="vendor.def456.js">`
4. **浏览器缓存未命中**：请求新文件

**R**：
- 用户无需手动清缓存
- 新版本发布后 5 分钟内，90% 用户自动更新

---

#### Q15: 强缓存和协商缓存的区别？

**强缓存**：
- 请求直接从浏览器缓存读取，**不发送请求到服务器**
- 响应头：`Cache-Control: max-age=31536000`
- 状态码：200 (from disk cache)

**协商缓存**：
- 发送请求到服务器，**验证资源是否过期**
- 请求头：`If-None-Match: "etag-value"`
- 响应：304 Not Modified（未修改，继续用缓存）

**最佳实践**：
- 静态资源（JS/CSS/图片）：强缓存 1 年
- HTML：协商缓存（每次验证）

---

### 🔧 技术深度问题

#### Q16: Service Worker 缓存和 HTTP 缓存的区别？

| 特性 | HTTP 缓存 | Service Worker |
|------|-----------|----------------|
| 控制权 | 浏览器 | JS 代码 |
| 离线访问 | ❌ 不支持 | ✅ 支持 |
| 缓存策略 | 固定（强缓存/协商缓存） | 灵活（可编程） |
| 更新时机 | 根据 HTTP 头 | 代码控制 |

**Service Worker 示例**：
```javascript
// 缓存优先策略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request)
    })
  )
})
```

**实际应用**：
- PWA 应用：Service Worker 缓存
- 普通网站：HTTP 缓存（更简单）

---

## 六、可视化工作流编辑器 (ReactFlow)

### 📌 技术实现细节

#### 6.1 ReactFlow 核心概念

**架构**：
- **Nodes**：工作流节点（开始、AI 代理、条件判断、结束）
- **Edges**：连接线（数据流向）
- **Handles**：节点的连接点

**数据结构**：
```javascript
const nodes = [
  {
    id: '1',
    type: 'aiAgent', // 自定义节点类型
    position: { x: 100, y: 100 },
    data: { label: 'GPT-4 代理', config: {...} }
  }
]

const edges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true
  }
]
```

#### 6.2 虚拟化渲染（支持 500+ 节点）

**问题**：渲染 500 个节点 → 500 个 DOM 元素 → 页面卡顿。

**方案**：视口外的节点不渲染。

**实现**：
1. **监听滚动/缩放事件**：计算当前视口范围
2. **过滤节点**：只渲染视口内的节点
   ```javascript
   const visibleNodes = nodes.filter(node => {
     return isInViewport(node.position, viewport)
   })
   ```
3. **ReactFlow 内置支持**：设置 `nodesDraggable={false}` 时自动启用

**优化效果**：
- 500 节点渲染时间：2s → 200ms（**90% 提升**）
- 拖拽流畅度：60 FPS
- 编辑效率提升 35%（响应更快）

#### 6.3 自定义节点组件

**示例**：AI 代理节点
```javascript
function AIAgentNode({ data }) {
  return (
    <div className="agent-node">
      <Handle type="target" position="top" />
      <div className="node-header">
        <AIIcon />
        <span>{data.label}</span>
      </div>
      <div className="node-body">
        <select value={data.model}>
          <option>GPT-4</option>
          <option>Claude</option>
        </select>
      </div>
      <Handle type="source" position="bottom" />
    </div>
  )
}

// 注册自定义节点
const nodeTypes = { aiAgent: AIAgentNode }
<ReactFlow nodeTypes={nodeTypes} />
```

#### 6.4 工作流持久化

**保存**：
```javascript
const flow = reactFlowInstance.toObject()
await api.saveFlow({ id, data: flow })
```

**加载**：
```javascript
const flow = await api.loadFlow(id)
setNodes(flow.nodes)
setEdges(flow.edges)
```

---

### 🎯 高频面试问题（STAR 法则）

#### Q17: 如何优化大型流程图的渲染性能？

**S**：用户创建了 500 个节点的工作流，页面卡顿严重。

**T**：优化渲染性能，保证流畅操作。

**A**：
1. **虚拟化渲染**：只渲染视口内的节点（类似虚拟列表）
2. **节点 memo 化**：避免不必要的重新渲染
   ```javascript
   export default React.memo(AIAgentNode, (prev, next) => {
     return prev.data === next.data
   })
   ```
3. **Canvas 降级**：超过 1000 节点时，用 Canvas 绘制（放弃交互）
4. **分层加载**：折叠子流程，按需展开

**R**：
- 渲染时间从 2s 降至 200ms
- 支持 500+ 节点流畅编辑
- 编辑效率提升 35%

---

#### Q18: ReactFlow 和自研 Canvas 方案如何选择？

**ReactFlow**：
- **优势**：开箱即用，支持拖拽、缩放、对齐
- **劣势**：大量节点性能一般（需要优化）
- **适用**：快速开发，节点数 < 1000

**Canvas**：
- **优势**：性能极致（10000 节点无压力）
- **劣势**：需要自己实现所有交互逻辑
- **适用**：超大规模流程图（如电路设计）

**实际选择**：ReactFlow + 虚拟化，兼顾开发效率和性能。

---

### 🔧 技术深度问题

#### Q19: ReactFlow 的拖拽是如何实现的？

**核心原理**：HTML5 Drag & Drop API + 状态管理。

**步骤**：
1. **监听 `onDragStart`**：记录起始位置
   ```javascript
   const onDragStart = (event, nodeType) => {
     event.dataTransfer.setData('application/reactflow', nodeType)
   }
   ```

2. **监听 `onDrop`**：创建新节点
   ```javascript
   const onDrop = (event) => {
     const type = event.dataTransfer.getData('application/reactflow')
     const position = reactFlowInstance.project({
       x: event.clientX,
       y: event.clientY
     })
     setNodes([...nodes, { id: uuid(), type, position }])
   }
   ```

3. **节点拖拽**：ReactFlow 内部处理（更新 `position`）

---

## 七、工程化 (Turbo monorepo)

### 📌 技术实现细节

#### 7.1 Turbo monorepo 架构

**目录结构**：
```
agent-factory/
├── apps/
│   └── web/          # 主应用
├── packages/
│   ├── ui/           # 共享 UI 组件
│   ├── utils/        # 工具函数
│   └── api-client/   # API 封装
├── turbo.json        # 任务编排
└── package.json      # 根配置
```

**优势**：
- **代码复用**：UI 组件跨项目共享
- **依赖管理**：统一版本，避免冲突
- **并行构建**：Turbo 自动分析依赖，并行执行任务

#### 7.2 Turbo 任务编排

**配置**：
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"], // 先构建依赖包
      "outputs": ["dist/**"]
    },
    "lint": {
      "cache": true // 缓存结果，未修改不重复执行
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

**执行**：
```bash
turbo run build --filter=web  # 只构建 web 应用及其依赖
turbo run lint                # 并行执行所有包的 lint
```

#### 7.3 ESLint + Prettier + Husky 规范

**ESLint 配置**：
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'no-console': 'warn',
    'react/prop-types': 'off' // 使用 TS，不需要 PropTypes
  }
}
```

**Prettier 配置**：
```json
{
  "singleQuote": true,
  "semi": false,
  "printWidth": 100
}
```

**Husky 钩子**：
```bash
# .husky/pre-commit
npm run lint-staged

# package.json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

#### 7.4 构建分析工具

**自研工具**：
```javascript
// scripts/analyze.js
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
}
```

**输出**：交互式依赖图，点击查看每个包的大小。

#### 7.5 CI/CD 自动化

**流程**：
```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: turbo run build --filter=web
      - run: turbo run test
      - run: deploy.sh  # 部署到服务器
```

**效果**：
- 代码推送 → 自动构建测试 → 自动部署
- 交付周期从 1 周缩短至 3-4 天（**30% 提升**）

---

### 🎯 高频面试问题（STAR 法则）

#### Q20: 为什么选择 Turbo monorepo？和 Lerna 的区别？

**S**：多个项目共享组件库，需要统一管理依赖和构建。

**T**：选择合适的 monorepo 工具。

**A**：
- **Lerna**：老牌工具，功能完善，但构建速度慢
- **Turbo**：基于 Rust，并行构建 + 智能缓存，速度快 10 倍
- **选择 Turbo 原因**：
  1. 并行构建（利用多核 CPU）
  2. 增量构建（只构建修改的包）
  3. 远程缓存（团队共享构建结果）

**R**：
- 构建时间从 5 分钟降至 30 秒
- 开发体验提升，热更新更快

---

#### Q21: 如何保证团队代码风格一致？

**S**：团队 10 人，代码风格混乱（有人用分号，有人不用）。

**T**：建立统一的代码规范，自动化执行。

**A**：
1. **ESLint**：语法检查，禁止不规范写法
2. **Prettier**：格式化，统一缩进、引号、分号
3. **Husky + lint-staged**：提交前自动格式化
4. **CI 检查**：未通过 lint 不允许合并

**R**：
- 代码风格 100% 一致
- Code Review 时间减少 40%（不再讨论格式问题）

---

### 🔧 技术深度问题

#### Q22: Turbo 的增量构建是如何实现的？

**原理**：内容寻址（Content-Addressed Storage）。

**步骤**：
1. **计算输入 hash**：源文件 + 依赖 + 配置 → SHA256
2. **查询缓存**：缓存中有相同 hash → 跳过构建，直接返回结果
3. **执行构建**：缓存未命中 → 执行任务 → 保存结果到缓存

**示例**：
```bash
# 第一次构建
turbo run build  # 5 秒

# 修改 package-a
turbo run build  # 只重新构建 package-a，1 秒

# 未修改任何文件
turbo run build  # 缓存命中，0 秒
```

**远程缓存**：
- 本地缓存：`.turbo/cache/`
- 远程缓存：Vercel Remote Cache（团队共享）

---

## 八、综合问题

### 🎯 项目亮点总结（电梯演讲）

**30 秒版本**：
我主导了 AgentFactory 这个 AI 代理平台的微前端架构设计，解决了"数千个 HTTP 请求"的性能问题，将请求数降低 90%+，首屏加载时间缩短 50%。同时实现了与主平台的 SSO 认证集成，认证成功率达 99.8%。通过 ReactFlow 和虚拟化技术，支持 500+ 节点的流程编辑而不卡顿。

**1 分钟版本**：
这是一个企业级的 AI 代理管理平台，我负责从 0 到 1 的架构设计。

**第一个挑战是微前端集成**：我选用 Wujie 方案，设计了事件总线实现主子应用状态同步，响应时间控制在 100ms 以内，并且支持独立部署和嵌入式部署两种模式。

**第二个挑战是性能优化**：初期首屏有 3000+ HTTP 请求，我通过 Vite 智能代码分割，将请求数降至 20-30 个，加载时间从 8 秒优化到 3 秒。同时配置了长期缓存策略，缓存命中率达到 85%。

**第三个挑战是复杂交互**：用户需要编辑大型工作流（500+ 节点），我使用 ReactFlow 结合虚拟化渲染技术，保证了流畅的编辑体验。

最终这个项目成功上线，支撑了公司核心 AI 业务，获得了用户和团队的认可。

---

### 🎯 高频综合问题

#### Q23: 项目中遇到的最大困难是什么？如何解决的？

**STAR 回答**：

**S**：项目上线前一周，测试团队反馈首屏加载 8 秒，用户无法接受。

**T**：必须在一周内将加载时间降至 3 秒以内。

**A**：
1. **紧急排查**：使用 Lighthouse 和 Bundle Analyzer 定位问题
2. **定位根因**：发现 3000+ HTTP 请求，依赖未预构建
3. **快速优化**：
   - 配置 Vite `optimizeDeps`，预构建第三方库
   - 手动分割 chunk，合并小文件
   - 启用 Gzip 压缩，减少传输大小
4. **验证效果**：在测试环境验证，加载时间降至 2.5 秒
5. **上线**：灰度发布 → 全量发布

**R**：
- 加载时间从 8 秒降至 2.5 秒（超出预期）
- 按时上线，用户满意度 90%+
- 总结经验，制定性能优化 checklist

---

#### Q24: 如果让你重新设计这个项目，会做哪些改进？

**回答**：
1. **架构层面**：
   - 引入 **Module Federation**，实现真正的运行时依赖共享
   - 使用 **GraphQL** 替代 REST API，减少请求次数

2. **性能层面**：
   - 引入 **Service Worker**，实现离线访问
   - 使用 **WebAssembly** 加速工作流执行引擎

3. **工程层面**：
   - 引入 **Storybook**，组件可视化开发
   - 增加 **E2E 测试**（Playwright），提高测试覆盖率

4. **用户体验**：
   - 增加 **骨架屏**，优化加载体验
   - 支持 **协同编辑**（WebSocket），多人实时协作

---

#### Q25: 你在项目中承担的角色是什么？

**回答**：
我在项目中担任 **前端架构负责人**，主要职责包括：

**技术决策**（40%）：
- 选型微前端方案（对比 qiankun/Wujie/Module Federation）
- 制定性能优化策略（构建、加载、缓存）
- 设计工程化规范（ESLint/Prettier/Husky）

**核心开发**（40%）：
- 实现微前端集成（Wujie 事件总线、SSO 认证）
- 优化构建配置（Vite 代码分割、Nginx 缓存）
- 开发工作流编辑器（ReactFlow 虚拟化）

**团队协作**（20%）：
- 指导 2 名初级开发完成功能模块
- 进行 Code Review，保证代码质量
- 编写技术文档，沉淀团队知识

---

## 九、技术栈深度问题

### React 18 新特性

#### Q26: React 18 的 Concurrent Mode 如何提升性能？

**核心特性**：
1. **并发渲染**：React 可以中断渲染，优先处理高优任务
2. **自动批处理**：多次 setState 合并为一次渲染（包括异步）
3. **Transition API**：标记低优先级更新

**实际应用**：
```javascript
import { useTransition } from 'react'

const [isPending, startTransition] = useTransition()

const handleSearch = (keyword) => {
  // 高优：立即更新输入框
  setInput(keyword)
  
  // 低优：延迟搜索结果（不阻塞输入）
  startTransition(() => {
    setSearchResults(searchAPI(keyword))
  })
}
```

**效果**：输入框响应流畅（60 FPS），搜索结果延迟加载。

---

### Redux Toolkit

#### Q27: Redux Toolkit 相比原生 Redux 的优势？

**原生 Redux 的痛点**：
- 样板代码多（action/reducer/constants）
- Immutable 更新复杂（深拷贝）
- 异步逻辑需要 redux-thunk/saga

**Redux Toolkit 的改进**：
1. **createSlice**：自动生成 action/reducer
   ```javascript
   const userSlice = createSlice({
     name: 'user',
     initialState: { name: '', age: 0 },
     reducers: {
       setUser(state, action) {
         state.name = action.payload.name // 内部用 Immer，看起来像 mutable
       }
     }
   })
   ```

2. **createAsyncThunk**：简化异步逻辑
   ```javascript
   const fetchUser = createAsyncThunk('user/fetch', async (id) => {
     return await api.getUser(id)
   })
   ```

3. **内置 DevTools**：无需额外配置

---

### TypeScript

#### Q28: 如何在 React 项目中充分利用 TypeScript？

**最佳实践**：
1. **Props 类型定义**：
   ```typescript
   interface ButtonProps {
     label: string
     onClick: () => void
     disabled?: boolean
   }
   
   const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => {
     // ...
   }
   ```

2. **泛型组件**：
   ```typescript
   interface SelectProps<T> {
     options: T[]
     onChange: (value: T) => void
   }
   
   function Select<T>({ options, onChange }: SelectProps<T>) {
     // ...
   }
   ```

3. **类型守卫**：
   ```typescript
   function isError(response: ApiResponse): response is ErrorResponse {
     return 'error' in response
   }
   
   if (isError(response)) {
     console.error(response.error) // TypeScript 知道这是 ErrorResponse
   }
   ```

---

## 十、面试话术技巧

### 1. 使用数据说话
- ❌ "我优化了性能"
- ✅ "我将首屏加载时间从 8 秒优化到 2.5 秒，HTTP 请求数减少 90%"

### 2. 突出个人贡献
- ❌ "我们团队做了微前端"
- ✅ "我主导设计了微前端架构，选型 Wujie 方案，并实现了事件总线"

### 3. 展示思考过程
- ❌ "我用了 Vite"
- ✅ "我对比了 Webpack 和 Vite，考虑到项目使用 React 18 + ESM，Vite 的热更新速度更快，所以选择了 Vite"

### 4. 承认不足，展示学习能力
- ❌ "我什么都会"
- ✅ "这个技术我之前没用过,但我会在面试后深入学习，我之前也是这样快速掌握 Wujie 的"

### 5. 准备反问环节
- "贵司的前端技术栈是什么？"
- "团队目前面临的最大技术挑战是什么？"
- "这个岗位的晋升路径是怎样的？"

---

## 十一、快速记忆清单

### 核心数据（必须记住）
- **HTTP 请求**：3000+ → 20-30（减少 90%+）
- **首屏加载**：8s → 2.5s（缩短 50%+）
- **Bundle 大小**：5MB → 3MB（减少 40%）
- **缓存命中率**：85%
- **认证成功率**：99.8%
- **状态同步**：< 100ms
- **支持节点数**：500+
- **交付周期**：缩短 30%

### 关键技术词
- **微前端**：Wujie、事件总线、iframe 沙箱、独立部署
- **性能优化**：代码分割、Tree Shaking、Gzip、长期缓存
- **工程化**：Turbo monorepo、ESLint、Husky、CI/CD
- **认证**：SSO、JWT、Token 刷新、防并发
- **可视化**：ReactFlow、虚拟化渲染、自定义节点

### 常见陷阱问题
1. **"你做过最难的项目是什么?"** → 讲 3000+ 请求优化
2. **"遇到过什么技术难题?"** → 讲 Token 并发刷新
3. **"为什么离职?"** → 寻求更大挑战（不吐槽前公司）
4. **"期望薪资?"** → 根据市场行情，15-20% 涨幅

---

## 十二、模拟面试问答（完整版）

### 场景 1：技术面（1 小时）

**面试官**：介绍一下你的 AgentFactory 项目。

**回答**：
这是一个企业级的 AI 代理管理平台，我负责前端架构设计。项目最大的特点是微前端架构，作为子应用嵌入到主平台。

我主要做了三件事：
1. **微前端集成**：基于 Wujie，实现主子应用状态同步，响应 < 100ms
2. **性能优化**：解决 3000+ HTTP 请求问题，降至 20-30 个，加载时间缩短 50%
3. **工作流编辑器**：支持 500+ 节点流畅编辑

最终项目成功上线，支撑了公司核心业务。

---

**面试官**：为什么选择 Wujie 而不是 qiankun？

**回答**：
我做过详细对比：

**qiankun**：基于 Proxy 沙箱，样式隔离依赖 Shadow DOM，但我们用的 Material-UI 有很多全局样式，容易冲突。

**Wujie**：基于 iframe 沙箱 + WebComponent，样式天然隔离。而且 Wujie 对 Vite 的兼容性更好，我们项目用的是 Vite。

所以综合考虑，选择了 Wujie。

---

**面试官**：3000+ HTTP 请求是怎么产生的？如何优化的？

**回答**：
**原因**：Vite 开发模式按需加载，每个模块一个请求。生产环境也是这个问题，因为依赖没有预构建。

**优化**：
1. **依赖预构建**：配置 `optimizeDeps.include`，将 lodash 等库打包成单文件
2. **手动分包**：配置 `manualChunks`，将 React、UI 库、业务代码分别打包
3. **路由懒加载**：使用 `React.lazy()` 按需加载页面
4. **合并小 chunk**：将 10 个弹窗组件合并为 1 个 chunk

**结果**：请求数降至 20-30 个，加载时间从 8 秒降至 2.5 秒。

---

**面试官**：缓存策略是怎么设计的？

**回答**：
**目标**：静态资源长期缓存，HTML 每次更新。

**实现**：
1. **文件名 hash 化**：`vendor.abc123.js`，内容变化才改变文件名
2. **Nginx 配置**：JS/CSS 缓存 1 年，HTML 不缓存
3. **自动更新检测**：轮询 `/version.json`，发现新版本提示用户刷新

**结果**：缓存命中率 85%，用户无需手动清缓存。

---

**面试官**：ReactFlow 如何支持 500+ 节点？

**回答**：
**核心技术：虚拟化渲染**。

类似虚拟列表，只渲染视口内的节点。实现步骤：
1. 监听滚动/缩放事件，计算视口范围
2. 过滤出视口内的节点
3. 只渲染这些节点，其他节点不渲染 DOM

**额外优化**：
- 节点 `React.memo`，避免不必要渲染
- 边的简化绘制（用 SVG path）

**效果**：渲染时间从 2 秒降至 200ms，拖拽流畅 60 FPS。

---

### 场景 2：项目经理面（30 分钟）

**面试官**：项目中遇到过什么困难？

**回答**：
最大的困难是上线前一周，测试反馈加载太慢（8 秒）。

我紧急排查，用 Lighthouse 和 Network 面板，发现 3000+ 请求。然后快速优化：预构建依赖、手动分包、启用压缩。

一周内将加载时间降至 2.5 秒，按时上线，用户满意度 90%+。

这次经历让我学会了性能优化的方法论，也制定了团队的性能 checklist。

---

**面试官**：你在团队中的角色？

**回答**：
我是前端架构负责人，负责：
1. **技术决策**：选型方案、制定规范
2. **核心开发**：微前端、性能优化、工作流编辑器
3. **团队协作**：指导初级开发、Code Review、编写文档

我喜欢既能做架构设计，又能写代码，还能帮助团队成长。

---

## 总结

这份文档涵盖了 AgentFactory 项目的所有技术点，包括：
- ✅ 每个技术点的详细实现过程
- ✅ 高频面试问题 + STAR 法则回答
- ✅ 技术深度问题 + 原理解析
- ✅ 项目亮点总结 + 电梯演讲
- ✅ 快速记忆清单 + 模拟面试

**使用建议**：
1. 先通读全文，理解每个技术点
2. 重点记忆"核心数据"和"关键技术词"
3. 练习 STAR 法则回答，录音自查
4. 模拟面试，和朋友互相提问
5. 面试前 1 天，快速复习"记忆清单"

**祝你面试顺利！🎉**
