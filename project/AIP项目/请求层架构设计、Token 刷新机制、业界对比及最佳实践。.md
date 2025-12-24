# 🔐 请求与认证层技术文档

> 本文档详细解析项目的请求层架构设计、Token 刷新机制、业界对比及最佳实践。

---

## 📁 目录

- [一、架构概览](#一架构概览)
- [二、核心文件说明](#二核心文件说明)
- [三、双层请求封装详解](#三双层请求封装详解)
- [四、Token 刷新并发控制机制](#四token-刷新并发控制机制)
- [五、超时处理机制](#五超时处理机制)
- [六、错误处理系统](#六错误处理系统)
- [七、文件上传机制](#七文件上传机制)
- [八、请求中止机制](#八请求中止机制)
- [九、业界方案对比](#九业界方案对比)
- [十、优劣势分析](#十优劣势分析)
- [十一、适用场景](#十一适用场景)
- [十二、改进建议](#十二改进建议)
- [十三、使用指南](#十三使用指南)

---

## 一、架构概览

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                      应用层 (业务代码)                           │
│  get('/api/users')  post('/api/login', data)  upload(...)      │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ service/base.ts│   │services/request│   │  XHR Upload   │
│ (原生 Fetch)   │   │(Request Class)│   │  (文件上传)   │
└───────┬───────┘   └───────┬───────┘   └───────────────┘
        │                   │
        └───────┬───────────┘
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Token 刷新锁机制                              │
│     isRefreshing + refreshPromise (并发控制)                    │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      原生 Fetch API                              │
└─────────────────────────────────────────────────────────────────┘
```

### 技术栈

| 组件 | 技术选型 |
|------|----------|
| HTTP 客户端 | 原生 Fetch API |
| Cookie 管理 | js-cookie |
| 错误提示 | sonner (Toast) |
| Token 格式 | JWT |

---

## 二、核心文件说明

### 文件结构

```
├── service/
│   ├── base.ts              # 函数式请求封装 (主要使用)
│   └── error-code.ts        # 错误码映射表
│
└── services/
    └── request/
        ├── request-class.ts  # 面向对象请求封装
        ├── instance.ts       # Request 实例 (含拦截器)
        ├── constants.ts      # 配置常量
        ├── cookies.ts        # Cookie 处理器
        ├── token.ts          # Token 操作
        ├── type.ts           # TypeScript 类型定义
        └── index.ts          # 导出入口
```

### 文件职责

| 文件 | 职责 | 使用场景 |
|------|------|----------|
| `service/base.ts` | 函数式封装，导出 get/post/put/del/patch/upload | 大部分业务请求 |
| `services/request/request-class.ts` | 面向对象封装，支持拦截器 | 需要 SSR 或复杂拦截的场景 |
| `service/error-code.ts` | 错误码双语映射 | 错误提示国际化 |

---

## 三、双层请求封装详解

### 3.1 函数式封装 (service/base.ts)

#### 导出的核心方法

```typescript
export { get, post, put, del, patch, upload, request }
```

#### 基础配置

```typescript
// 超时时间：10分钟 (适合 AI 推理等长任务)
const TIME_OUT = 60000 * 10;

// 基础请求配置
const baseOptions = {
  method: "GET",
  mode: "cors",
  credentials: "include",  // 始终发送 cookies
  headers: new Headers({
    "Content-Type": "application/json",
  }),
  redirect: "follow",
}

// 内容类型常量
export const ContentType = {
  json: "application/json",
  stream: "text/event-stream",
  audio: "audio/mpeg",
  form: "application/x-www-form-urlencoded; charset=UTF-8",
  download: "application/octet-stream",
  upload: "multipart/form-data",
}
```

#### 可选配置类型

```typescript
export type IOtherOptions = {
  bodyStringify?: boolean      // 是否序列化请求体 (默认 true)
  getAbortController?: (ac: AbortController) => void  // 获取中止控制器
  needAllResponseContent?: boolean  // 是否需要完整响应
  silent?: boolean             // 是否静默处理错误 (不显示 Toast)
}
```

#### 使用示例

```typescript
import { get, post, del } from '@/service/base'

// GET 请求
const users = await get<User[]>('/api/users', {
  params: { page: 1, size: 10 }
})

// POST 请求
const result = await post<CreateResult>('/api/users', {
  body: { name: 'John', email: 'john@example.com' }
})

// DELETE 请求
await del('/api/users/123')

// 静默处理错误
await get('/api/data', {}, { silent: true })

// 获取中止控制器
let controller: AbortController
await get('/api/data', {}, {
  getAbortController: (ac) => { controller = ac }
})
// 取消请求
controller.abort()
```

### 3.2 面向对象封装 (services/request/)

#### Request 类结构

```typescript
class Request<T> {
  interceptors?: RequestInterceptors<T>;
  baseURL: string;
  timeout: number;

  constructor(config: RequestConfig<T>)
  setService(serviceType: ApiServiceType): this
  getFullUrl(path: string): string
  
  // HTTP 方法
  get<T>(url: string, config?: RequestConfig<T>): Promise<T>
  post<T>(url: string, data?: unknown, config?: RequestConfig<T>): Promise<T>
  put<T>(url: string, data?: unknown, config?: RequestConfig<T>): Promise<T>
  delete<T>(url: string, data?: unknown, config?: RequestConfig<T>): Promise<T>
  patch<T>(url: string, data?: unknown, config?: RequestConfig<T>): Promise<T>
  postForm<T>(url: string, data: FormData | Record<string, string>): Promise<T>
}
```

#### 拦截器接口

```typescript
interface RequestInterceptors<T> {
  requestInterceptor?: (config: RequestOptions<T>) => RequestOptions<T> | Promise<RequestOptions<T>>;
  requestInterceptorCatch?: (error: unknown) => unknown;
  responseInterceptor?: (res: T) => T;
  responseInterceptorCatch?: (error: unknown) => unknown;
}
```

#### 使用示例

```typescript
import request from '@/services/request/instance'

// 基本使用
const data = await request.get<UserInfo>('/api/user/info')

// 切换服务
const modelData = await request
  .setService('CLIENT_API_MODEL')
  .get<ModelInfo>('/models')

// 带查询参数
const list = await request.get<PageList>('/api/items', {
  params: { page: 1, size: 20, keyword: 'test' }
})
```

### 3.3 两套封装对比

| 特性 | `service/base.ts` | `services/request/` |
|------|-------------------|---------------------|
| **封装方式** | 函数式 | 面向对象 (Class) |
| **Token 存储** | `js-cookie` | `createCookieHandler` (SSR 兼容) |
| **拦截器** | 内置 | 可配置接口 |
| **超时时间** | 10 分钟 | 10 秒 |
| **SSR 支持** | 仅客户端 | Server/Client 双端 |
| **推荐场景** | 普通页面请求 | 需要拦截器的复杂场景 |

---

## 四、Token 刷新并发控制机制

### 4.1 核心问题

当多个请求同时发现 Token 即将过期时，如何确保：
1. 只调用一次刷新接口
2. 所有请求都能获得新 Token
3. 不产生竞态条件

### 4.2 解决方案：Promise 锁

```typescript
// 🔒 模块级锁变量
let isRefreshing = false
let refreshPromise: Promise<string> | null = null

const refreshToken = async () => {
  try {
    // ✅ 检查是否已有刷新在进行
    if (isRefreshing && refreshPromise) {
      return refreshPromise  // 直接复用已有的 Promise
    }

    // ✅ 获取锁
    isRefreshing = true
    
    // ✅ 创建刷新 Promise
    refreshPromise = (async () => {
      try {
        const token = getAccessToken()
        if (!token) {
          removeCookiesAndToLogin()
          throw new Error("token is undefined")
        }
        
        // 解析 JWT
        const tokenParts = token.split(".")
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          const currentTime = Math.floor(Date.now() / 1000)

          // 判断是否需要刷新：已过期 OR 剩余 < 23小时
          if (!payload.exp || 
              currentTime >= payload.exp || 
              payload.exp - currentTime < 3600 * 23) {
            
            const response = await fetch("/api/refresh-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token })
            })
            
            if (!response.ok) throw new Error("refreshToken failed")
            const data = await response.json()
            
            // 保存新 Token
            Cookies.set("auth_token", data.access_token, {
              expires: 1,
              sameSite: "strict",
              path: "/"
            })

            return data.access_token
          }
        }
        return token
      } catch {
        removeCookiesAndToLogin()
      } finally {
        // ✅ 释放锁
        isRefreshing = false
        refreshPromise = null
      }
    })()

    return refreshPromise
  } catch (error) {
    throw error
  }
}
```

### 4.3 流程图

```
时间轴 →
────────────────────────────────────────────────────────────────────
请求A ─►[检查token]─►[需刷新]─►[获取锁✓]─►[调用refresh]─►[保存token]─►[请求]
                                  │                           │
请求B ─►[检查token]─►[需刷新]─►[锁占用]─────等待────────────────►[获取token]─►[请求]
                                  │                           │
请求C ─►[检查token]─►[需刷新]─►[锁占用]─────等待────────────────►[获取token]─►[请求]
```

### 4.4 关键设计点

1. **双重检查**：`if (isRefreshing && refreshPromise)` 确保不重复刷新
2. **Promise 共享**：所有等待请求 await 同一个 Promise
3. **finally 释放**：无论成功失败都释放锁，防止锁死
4. **23小时阈值**：Token 24 小时有效，提前 1 小时刷新避免边界问题

---

## 五、超时处理机制

### 5.1 实现原理

使用 `Promise.race` 实现竞态超时：

```typescript
return Promise.race([
  // Promise 1: 超时定时器
  new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("request timeout"))
    }, TIME_OUT)  // 10 分钟
  }),
  
  // Promise 2: 实际请求
  (async () => {
    await addAuthTokenToHeaders()
    return fetch(url, options)
  })(),
])
```

### 5.2 流程图

```
┌────────────────────────────────────────────────────────────────┐
│                      Promise.race                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   超时 Promise              请求 Promise                       │
│   ┌─────────────┐         ┌─────────────┐                     │
│   │ setTimeout  │         │   fetch()   │                     │
│   │  10分钟     │         │             │                     │
│   └──────┬──────┘         └──────┬──────┘                     │
│          │                       │                            │
│          ▼                       ▼                            │
│      reject()               resolve(data)                     │
│          │                       │                            │
│          └───────────►◄──────────┘                            │
│                   │                                           │
│            谁先完成谁获胜                                       │
│                   │                                           │
│                   ▼                                           │
│            返回获胜的结果                                       │
└────────────────────────────────────────────────────────────────┘
```

---

## 六、错误处理系统

### 6.1 错误响应格式

```typescript
interface ErrorResponse {
  error: {
    code: string    // 格式: "MODULE.CODE" 如 "AUTH.10002"
    message: string
    details: string | null
  }
}
```

### 6.2 错误码模块

| 模块 | 前缀 | 说明 |
|------|------|------|
| COMMON | - | 通用 HTTP 错误 (400, 401, 403, 404, 500) |
| AUTH | AUTH.xxxxx | 认证相关 (用户、Token、权限) |
| MANAGE | MANAGE.xxxxx | 管理服务 (模型、服务、任务) |
| SAMPLE | SAMPLE.xxxxx | 数据样本 (数据集、标注) |
| STORAGE | STORAGE.xxxxx | 存储服务 |

### 6.3 HTTP 状态码处理

```typescript
if (!/^(2|3)\d{2}$/.test(String(res.status))) {
  switch (res.status) {
    case 401:  // 未授权
      removeCookiesAndToLogin()
      return Promise.reject(...)
    case 403:  // 禁止访问
      if (!silent) toast.error(getErrorMessage(data))
      break
    default:   // 其他错误
      if (!silent) toast.error(getErrorMessage(data))
  }
  return Promise.reject(resClone)
}
```

### 6.4 使用错误码

```typescript
import { getErrorMessage, getErrorMessageByKey } from '@/service/error-code'

// 从响应获取错误信息
const message = getErrorMessage(errorResponse)

// 从错误码获取信息
const message = getErrorMessageByKey('AUTH.10002')  // "用户名或密码错误"
```

---

## 七、文件上传机制

### 7.1 实现方式

使用原生 `XMLHttpRequest` 支持进度回调：

```typescript
interface UploadOptions {
  xhr: XMLHttpRequest
  method: string
  url: string
  headers?: Record<string, string>
  data?: FormData
  onprogress?: (event: ProgressEvent) => void
}

export const upload = (options: UploadOptions): Promise<unknown> => {
  const token = getAccessToken()
  
  return new Promise((resolve, reject) => {
    const xhr = options.xhr
    xhr.open(options.method, options.url)
    
    // 设置请求头
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    for (const key in options.headers) {
      xhr.setRequestHeader(key, options.headers[key])
    }

    xhr.withCredentials = true
    xhr.responseType = "json"
    
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) resolve(xhr.response)
        else reject(xhr)
      }
    }
    
    // 进度回调
    xhr.upload.onprogress = options.onprogress || null
    xhr.send(options.data)
  })
}
```

### 7.2 使用示例

```typescript
const xhr = new XMLHttpRequest()
const formData = new FormData()
formData.append('file', file)

await upload({
  xhr,
  method: 'POST',
  url: '/api/files/upload',
  data: formData,
  onprogress: (event) => {
    const percent = Math.round((event.loaded / event.total) * 100)
    console.log(`上传进度: ${percent}%`)
    setProgress(percent)
  }
})
```

---

## 八、请求中止机制

### 8.1 实现方式

```typescript
if (getAbortController) {
  const abortController = new AbortController()
  getAbortController(abortController)
  options.signal = abortController.signal
}
```

### 8.2 使用示例

```typescript
let controller: AbortController

// 发起请求
const promise = get('/api/large-data', {}, {
  getAbortController: (ac) => {
    controller = ac
  }
})

// 用户点击取消
const handleCancel = () => {
  controller.abort()
}

// 组件卸载时取消
useEffect(() => {
  return () => {
    controller?.abort()
  }
}, [])
```

---

## 九、业界方案对比

### 9.1 方案对比表

| 方案 | 刷新时机 | 并发控制 | 复杂度 | 依赖 |
|------|---------|---------|--------|------|
| **当前项目** | 请求前主动检查 | Promise 锁 | 中等 | 无 |
| **Axios 拦截器** | 401 响应后被动 | 请求队列 | 较高 | Axios |
| **RTK Query** | 内置处理 | 自动 | 低 | Redux Toolkit |
| **NextAuth.js** | 服务端 Session | N/A | 低 | Next.js |

### 9.2 各方案代码示例

#### Axios 响应拦截器 (业界主流)

```typescript
let isRefreshing = false
let failedQueue = []

axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          error.config.headers['Authorization'] = `Bearer ${token}`
          return axios(error.config)
        })
      }

      error.config._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post('/api/refresh-token')
        failedQueue.forEach(({ resolve }) => resolve(data.token))
        failedQueue = []
        return axios(error.config)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)
```

#### RTK Query

```typescript
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error?.status === 401) {
    const refreshResult = await baseQuery('/api/refresh', api, extraOptions)
    if (refreshResult.data) {
      api.dispatch(setCredentials(refreshResult.data))
      result = await baseQuery(args, api, extraOptions)
    }
  }
  return result
}
```

---

## 十、优劣势分析

### 10.1 优势 ✅

| 优势 | 说明 |
|------|------|
| **零依赖** | 只依赖原生 API + js-cookie，包体积小 |
| **主动刷新** | 请求前检查，避免发出无效的 401 请求 |
| **优雅并发** | Promise 复用比请求队列更简洁 |
| **灵活超时** | 10 分钟超时适合 AI 推理等长任务 |
| **完善国际化** | 错误码双语映射完整 |

### 10.2 劣势 ❌

| 劣势 | 说明 | 建议 |
|------|------|------|
| **双层封装** | 两套请求方式增加心智负担 | 统一为一套 |
| **Token 安全** | Cookie 可被 XSS 读取 | 使用 httpOnly Cookie |
| **硬编码阈值** | 23小时刷新阈值是硬编码 | 改为动态计算 |
| **依赖 JWT** | 需要客户端能解析 JWT | 添加兼容处理 |
| **无重试机制** | 请求失败直接拒绝 | 添加指数退避重试 |

---

## 十一、适用场景

### 11.1 最适合 ✅

| 场景 | 原因 |
|------|------|
| 中小型 B 端应用 | 复杂度适中，无需重型框架 |
| 长时间操作 | 10 分钟超时适合 AI 推理 |
| JWT 认证系统 | 主动解析判断过期 |
| Next.js CSR 为主 | 客户端渲染足够 |

### 11.2 不太适合 ⚠️

| 场景 | 更好方案 |
|------|----------|
| 高并发 C 端 | SWR / React Query |
| 全栈 SSR | NextAuth.js |
| 离线支持 | Service Worker |
| 非 JWT 认证 | Axios 拦截器 |

---

## 十二、改进建议

### 12.1 短期优化

```typescript
// 1. 统一超时配置
const TIMEOUT_CONFIG = {
  DEFAULT: 10000,      // 普通请求 10 秒
  LONG: 60000 * 10,    // 长请求 10 分钟
}

// 2. 动态刷新阈值
const shouldRefresh = (payload: JWTPayload) => {
  const totalLifetime = payload.exp - payload.iat
  const remaining = payload.exp - Math.floor(Date.now() / 1000)
  return remaining < totalLifetime * 0.1  // 剩余 10% 时刷新
}

// 3. 添加重试机制
export const fetchWithRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
    }
  }
  throw new Error('Max retries exceeded')
}
```

### 12.2 中期优化

```typescript
// 统一请求接口
interface UnifiedRequestConfig {
  timeout?: number
  retry?: number
  silent?: boolean
  auth?: boolean
}

export const http = {
  get: <T>(url: string, config?: UnifiedRequestConfig) => ...,
  post: <T>(url: string, data?: unknown, config?: UnifiedRequestConfig) => ...,
}
```

### 12.3 长期优化

考虑迁移到：
- **方案 A**: NextAuth.js + Server Actions + tRPC
- **方案 B**: React Query + Axios + httpOnly Cookie

---

## 十三、使用指南

### 13.1 快速参考

```typescript
// ✅ 推荐：普通请求使用 service/base.ts
import { get, post, put, del, patch } from '@/service/base'

// GET
const users = await get<User[]>('/api/users')

// POST
const user = await post<User>('/api/users', { body: userData })

// PUT
await put('/api/users/1', { body: updates })

// DELETE
await del('/api/users/1')

// 静默错误
await get('/api/data', {}, { silent: true })

// 带中止
let ctrl: AbortController
await get('/api/data', {}, { getAbortController: c => ctrl = c })
ctrl.abort()
```

### 13.2 文件上传

```typescript
import { upload } from '@/service/base'

const xhr = new XMLHttpRequest()
const formData = new FormData()
formData.append('file', file)

await upload({
  xhr,
  method: 'POST',
  url: '/api/upload',
  data: formData,
  onprogress: e => console.log(`${(e.loaded/e.total*100).toFixed(0)}%`)
})
```

### 13.3 错误处理

```typescript
import { getErrorMessage } from '@/service/error-code'

try {
  await post('/api/action', { body: data })
} catch (error) {
  // 错误已自动 Toast 显示
  // 如需自定义处理：
  const message = getErrorMessage(error)
  console.error(message)
}
```

---

## 附录：常见问题

### Q1: 该用 base.ts 还是 request-class?

**A**: 优先使用 `service/base.ts`，除非需要 SSR 或自定义拦截器。

### Q2: 为什么超时是 10 分钟？

**A**: 项目涉及 AI 推理等耗时操作，AWS 环境网络延迟较高。

### Q3: Token 刷新失败怎么办？

**A**: 当前设计会静默失败，等下次请求再试。401 响应会跳转登录页。

### Q4: 如何处理并发请求的 Token 刷新？

**A**: 使用 Promise 锁机制，所有并发请求共享同一个刷新 Promise。

---

> 📅 文档版本: 1.0  
> 📝 最后更新: 2024年12月

