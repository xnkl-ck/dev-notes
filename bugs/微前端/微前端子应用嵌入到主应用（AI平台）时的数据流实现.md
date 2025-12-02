# AgentFactory 微前端数据流架构文档

## 📋 文档概述

本文档详细说明 AgentFactory 作为微前端子应用嵌入到主应用（AI平台）时的数据流实现，便于后续查阅和类似功能开发参考。

**微前端框架**: 无界 (Wujie)  
**子应用**: AgentFactory (`packages/ui`)  
**主应用**: AI平台  

---

## 🏗️ 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           主应用 (AI平台)                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   Props 传递     │  │  Bus 事件总线   │  │  Cookie (auth_token)   │  │
│  │  - locale       │  │  $emit()        │  │                         │  │
│  │  - theme        │  │  $on()          │  │                         │  │
│  │  - authToken    │  │                 │  │                         │  │
│  │  - mounted()    │  │                 │  │                         │  │
│  └────────┬────────┘  └────────┬────────┘  └───────────┬─────────────┘  │
└───────────┼────────────────────┼───────────────────────┼────────────────┘
            │                    │                       │
            ▼                    ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        子应用 (AgentFactory)                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         App.jsx 入口                              │   │
│  │   - window.$wujie.props 获取初始数据                               │   │
│  │   - window.$wujie.bus.$on() 监听事件                               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                       API Client                                  │   │
│  │   - 自动注入认证头 (Authorization, X-Auth-From)                    │   │
│  │   - 处理认证失败重定向                                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ 初始化数据传递 (Props)

### 1.1 数据获取方式

主应用通过 `window.$wujie.props` 向子应用传递初始数据。

**核心代码位置**: `packages/ui/src/App.jsx`

```javascript
useEffect(() => {
    // 获取无界传递的props
    const wujieProps = window.$wujie?.props || {}
    const { locale, theme, authToken } = wujieProps

    console.log('无界传递的props:', wujieProps)

    // 处理AI平台的认证信息
    if (authToken) {
        console.log('检测到AI平台token，外部认证模式已启用')
    }
    
    // 如果props中有theme，立即应用
    if (theme) {
        const isDarkMode = theme === 'dark'
        dispatch({ type: SET_DARKMODE, isDarkMode })
        localStorage.setItem('isDarkMode', isDarkMode)
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    }

    // 如果props中有locale，立即应用
    if (locale) {
        i18n.changeLanguage(locale)
    }
}, [dispatch])
```

### 1.2 Props 数据结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `locale` | `string` | 否 | 语言设置，值为 `zh` 或 `en` |
| `theme` | `string` | 否 | 主题设置，值为 `dark` 或 `light` |
| `authToken` | `string` | 否 | AI平台的认证Token |
| `mounted` | `function` | 否 | 子应用挂载完成回调函数 |

### 1.3 主应用传递示例

```javascript
// 主应用代码示例
import { startApp } from 'wujie'

startApp({
    name: 'agentfactory',
    url: 'http://your-agentfactory-domain.com',
    el: '#subapp-container',
    sync: true,
    props: {
        locale: 'zh',
        theme: 'dark',
        authToken: 'your-auth-token',
        mounted: (isReady) => {
            console.log('子应用挂载状态:', isReady)
        }
    }
})
```

---

## 2️⃣ 事件总线通信 (Bus)

### 2.1 事件监听注册

子应用在 `App.jsx` 中注册事件监听器。

**核心代码位置**: `packages/ui/src/App.jsx`

```javascript
// 检查是否存在 wujie 环境
if (window.$wujie?.bus) {
    // 开始监听事件
    window.$wujie.bus.$on('theme-change', handleThemeChange)
    window.$wujie.bus.$on('i18n-change', handleLanguageChange)
    window.$wujie.bus.$on('token-update', handleTokenUpdate)

    console.log('已注册 wujie 事件监听器')
}

// 清理函数（组件卸载时调用）
return () => {
    if (window.$wujie?.bus) {
        window.$wujie.bus.$off('theme-change', handleThemeChange)
        window.$wujie.bus.$off('i18n-change', handleLanguageChange)
        window.$wujie.bus.$off('token-update', handleTokenUpdate)
        console.log('已清理 wujie 事件监听器')
    }
}
```

### 2.2 支持的事件类型

| 事件名称 | 方向 | 参数类型 | 参数值 | 说明 |
|---------|------|---------|--------|------|
| `theme-change` | 主 → 子 | `string` | `"dark"` / `"light"` | 主题切换 |
| `i18n-change` | 主 → 子 | `string` | `"zh"` / `"en"` | 语言切换 |
| `token-update` | 主 → 子 | `object` | `{ authToken }` | Token更新 |
| `create-dialog-open` | 主 → 子 | `boolean` | `true` / `false` | 打开创建对话框 |
| `route-change` | 子 → 主 | `string` | URL路径 | 路由变化通知 |

### 2.3 事件处理器实现

```javascript
// 主题切换处理器
const handleThemeChange = (theme) => {
    console.log('收到主题切换事件:', theme)
    const isDarkMode = theme === 'dark'
    dispatch({ type: SET_DARKMODE, isDarkMode })
    localStorage.setItem('isDarkMode', isDarkMode)
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
}

// 语言切换处理器
const handleLanguageChange = (locale) => {
    console.log('收到语言切换事件:', locale)
    i18n.changeLanguage(locale)
}

// Token更新处理器
const handleTokenUpdate = (tokenData) => {
    console.log('收到token更新事件:', tokenData)
    if (tokenData.authToken) {
        console.log('AI平台token已更新')
    }
}
```

### 2.4 主应用触发事件示例

```javascript
// React 主应用
import WujieReact from 'wujie-react'

// 触发主题切换
WujieReact.bus.$emit('theme-change', 'dark')

// 触发语言切换
WujieReact.bus.$emit('i18n-change', 'zh')

// 触发Token更新
WujieReact.bus.$emit('token-update', { authToken: 'new-token' })
```

```javascript
// Vue 主应用
this.$wujie.bus.$emit('theme-change', 'dark')
this.$wujie.bus.$emit('i18n-change', 'zh')
```

---

## 3️⃣ 认证数据流

### 3.1 Token 获取优先级

**核心代码位置**: `packages/ui/src/api/client.js`

```javascript
// 获取主应用传递的外部token
const getExternalToken = () => {
    if (typeof window === 'undefined') {
        return null
    }
    
    // 方法1：优先从微前端props获取（向后兼容）
    if (window.$wujie?.props?.authToken) {
        return window.$wujie.props.authToken
    }
    
    // 方法2：从 cookies 中获取 auth_token
    const authToken = getCookieValue('auth_token')
    if (authToken) {
        return authToken
    }
    
    return null
}
```

**获取优先级**:
1. `window.$wujie.props.authToken` (Props传递)
2. `Cookie` 中的 `auth_token`

### 3.2 微前端环境检测

```javascript
// 检查是否在微前端环境中
const isInMicrofrontend = () => {
    if (typeof window === 'undefined') {
        return false
    }
    
    // 检查 wujie 微前端框架
    if (window.$wujie) {
        return true
    }
    
    // 检查是否有 auth_token cookie（来自微前端的认证token）
    if (document.cookie.includes('auth_token=')) {
        return true
    }
    
    return false
}
```

### 3.3 请求拦截器

```javascript
// 请求拦截器：自动添加认证头
apiClient.interceptors.request.use(
    (config) => {
        const externalToken = getExternalToken()
        const inMicrofrontend = isInMicrofrontend()
        
        // 如果在微前端环境中，设置外部认证标识
        if (inMicrofrontend) {
            config.headers['X-Auth-From'] = 'ai-platform'
            // 如果有外部token，也设置在Authorization头部
            if (externalToken) {
                config.headers.Authorization = `Bearer ${externalToken}`
            }
        }
        
        return config
    },
    (error) => Promise.reject(error)
)
```

### 3.4 认证失败处理

```javascript
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const isExternalAuth = isInMicrofrontend() && getExternalToken()
            
            if (isExternalAuth) {
                // 外部认证失败 - 重定向到主应用登录页
                console.log('🚫 外部认证失败，重定向到主应用登录页')
                
                // 清除认证相关的cookie
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                
                // 重定向到主应用的登录页
                const mainAppUrl = process.env.REACT_APP_MAIN_APP_URL || window.location.origin
                window.location.href = `${mainAppUrl}/login`
                
                return Promise.reject(error)
            }
            // ... 内部认证逻辑
        }
        return Promise.reject(error)
    }
)
```

---

## 4️⃣ 配置数据流

### 4.1 配置初始化

**核心代码位置**: `packages/ui/src/utils/configUtils.js`

```javascript
/**
 * APP初始化时调用，从接口获取配置并保存到localStorage
 */
export const initializeConfig = async () => {
    try {
        const token = getTokenFromCookie()
        if (!token) {
            console.warn('[Config] 未找到 auth_token，使用默认配置')
            return null
        }

        const response = await fetch(`${window.location.origin}/manage-service/apps/config`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`接口请求失败: ${response.status}`)
        }

        const data = await response.json()
        
        // 缓存配置到 localStorage
        localStorage.setItem('agentBaseUrl', data?.agentBaseUrl)
        localStorage.setItem('chatbotBaseUrl', data?.chatbotBaseUrl)
        
        console.log('[Config] 配置初始化完成:', data?.agentBaseUrl)
        return data?.agentBaseUrl
    } catch (error) {
        console.error('[Config] 配置初始化失败:', error.message)
        return null
    }
}
```

### 4.2 配置获取

```javascript
/**
 * 获取 agentBaseUrl（从 localStorage 读取）
 */
export const getAgentBaseUrl = () => {
    const localOrigin = window.location.origin
    const inWujie = isWujieEmbedded()
    
    if (!inWujie) {
        return localOrigin  // 非微前端环境使用当前域名
    }
    
    return localStorage.getItem('agentBaseUrl') || `${localOrigin}:31002`
}

/**
 * 获取 chatbotBaseURL（从缓存读取）
 */
export const getChatbotBaseURL = () => {
    const cachedUrl = localStorage.getItem('chatbotBaseUrl')
    const defaultUrl = 'http://10.239.121.16:31003'
    return cachedUrl || defaultUrl
}
```

### 4.3 配置接口响应格式

```json
{
    "agentBaseUrl": "http://your-agent-server:31002",
    "chatbotBaseUrl": "http://your-chatbot-server:31003"
}
```

---

## 5️⃣ 嵌入模式检测

**核心代码位置**: `packages/ui/src/utils/embedHelper.js`

### 5.1 检测函数

```javascript
/**
 * 检测当前页面是否被嵌入在iframe中
 */
export const isEmbedded = () => {
    try {
        // 方法1：检查window.self是否等于window.top
        if (window.self !== window.top) return true
        
        // 方法2：检查window.parent是否等于window.self
        if (window.parent !== window.self) return true
        
        // 方法3：检查window.frameElement是否存在
        if (window.frameElement) return true
        
        return false
    } catch (error) {
        // 跨域iframe中会抛出异常
        return true
    }
}

/**
 * 检测当前页面是否被无界框架嵌入
 */
export const isWujieEmbedded = () => {
    try {
        if (typeof window !== 'undefined' && window.$wujie) return true
        if (typeof window !== 'undefined' && window.__WUJIE) return true
        return false
    } catch (error) {
        return false
    }
}

/**
 * 检测是否从URL参数中指定了嵌入模式
 */
export const isEmbedMode = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('embed') === 'true'
}

/**
 * 综合检测嵌入状态（用于决定是否隐藏导航）
 */
export const shouldHideNavigation = () => {
    if (isEmbedMode()) return true      // URL参数优先
    if (isWujieEmbedded()) return true  // 无界框架嵌入
    if (isEmbedded()) return true       // iframe嵌入
    return false
}
```

### 5.2 检测优先级

1. URL 参数 `embed=true`
2. 无界框架检测 (`window.$wujie` / `window.__WUJIE`)
3. iframe 检测 (`window.self !== window.top`)

---

## 6️⃣ 数据流时序图

```
主应用                                              子应用 (AgentFactory)
  │                                                       │
  │  1. startApp() 启动子应用，传递 props                   │
  │  ──────────────────────────────────────────────────►  │
  │        { locale, theme, authToken, mounted }          │
  │                                                       │
  │                                    2. App.jsx 初始化   │
  │                                    - 读取 props        │
  │                                    - 应用 theme/locale │
  │                                    - 注册事件监听       │
  │                                                       │
  │                                    3. initializeConfig()
  │  ◄──────────────────────────────────────────────────  │
  │        GET /manage-service/apps/config                │
  │  ──────────────────────────────────────────────────►  │
  │        { agentBaseUrl, chatbotBaseUrl }               │
  │                                                       │
  │  4. mounted(true) 回调                                 │
  │  ◄──────────────────────────────────────────────────  │
  │                                                       │
  │  5. 用户切换主题                                        │
  │  bus.$emit('theme-change', 'dark')                    │
  │  ──────────────────────────────────────────────────►  │
  │                                    6. handleThemeChange()
  │                                    dispatch(SET_DARKMODE)
  │                                                       │
  │  7. 用户切换语言                                        │
  │  bus.$emit('i18n-change', 'zh')                       │
  │  ──────────────────────────────────────────────────►  │
  │                                    8. i18n.changeLanguage()
  │                                                       │
  │                                    9. API 请求         │
  │                                    Headers:            │
  │                                    - X-Auth-From: ai-platform
  │                                    - Authorization: Bearer xxx
  │                                                       │
  │  10. Token 过期/更新                                    │
  │  bus.$emit('token-update', { authToken })             │
  │  ──────────────────────────────────────────────────►  │
  │                                    11. handleTokenUpdate()
  │                                                       │
```

---

## 7️⃣ 核心文件清单

| 文件路径 | 功能说明 |
|---------|---------|
| `packages/ui/src/App.jsx` | 应用入口，Props获取、事件监听注册 |
| `packages/ui/src/api/client.js` | Axios客户端，认证拦截器 |
| `packages/ui/src/utils/embedHelper.js` | 嵌入模式检测工具 |
| `packages/ui/src/utils/configUtils.js` | 配置初始化和获取 |
| `packages/ui/src/utils/streamRequestUtils.js` | 流式请求认证处理 |
| `packages/ui/src/views/agentflows/index.jsx` | 业务页面事件监听示例 |

---

## 8️⃣ 通信方式汇总

| 通信方式 | 使用场景 | 数据方向 | 核心API |
|---------|---------|---------|---------|
| **Props** | 初始化数据 | 主 → 子 | `window.$wujie.props` |
| **Bus 事件** | 运行时状态同步 | 主 ↔ 子 | `bus.$on()` / `bus.$emit()` |
| **Cookie** | 认证Token持久化 | 主 → 子 | `document.cookie` |
| **配置接口** | 动态配置获取 | 主 → 子 | `fetch('/manage-service/apps/config')` |
| **请求头** | API认证标识 | 子 → 后端 | `X-Auth-From` / `Authorization` |

---

## 9️⃣ 扩展指南

### 9.1 添加新的事件监听

```javascript
// 在 App.jsx 中添加
const handleCustomEvent = (data) => {
    console.log('收到自定义事件:', data)
    // 处理自定义事件逻辑
}

if (window.$wujie?.bus) {
    window.$wujie.bus.$on('custom-event', handleCustomEvent)
}

// 清理时移除
return () => {
    if (window.$wujie?.bus) {
        window.$wujie.bus.$off('custom-event', handleCustomEvent)
    }
}
```

### 9.2 子应用向主应用发送事件

```javascript
// 子应用中
if (window.$wujie?.bus) {
    window.$wujie.bus.$emit('sub-app-event', { 
        type: 'navigation',
        path: '/some-path' 
    })
}
```

### 9.3 添加新的配置项

1. 修改 `configUtils.js` 中的 `initializeConfig()` 获取新配置
2. 添加对应的 getter 函数
3. 在需要使用的地方调用 getter

---

## 🔧 故障排除

### 常见问题

1. **Props 未获取到**
   - 检查主应用是否正确传递了 props
   - 确认 `window.$wujie` 对象存在

2. **事件监听不生效**
   - 检查控制台是否有 "已注册 wujie 事件监听器" 日志
   - 确认事件名称拼写正确

3. **认证失败**
   - 检查 Cookie 中是否有 `auth_token`
   - 确认 Token 格式正确

4. **配置获取失败**
   - 检查网络请求是否成功
   - 确认接口返回数据格式正确

### 调试技巧

```javascript
// 在浏览器控制台中运行
console.log('Wujie 环境:', !!window.$wujie)
console.log('Props:', window.$wujie?.props)
console.log('Bus:', !!window.$wujie?.bus)
console.log('Token:', document.cookie)
```

---

## 📚 相关文档

- [无界微前端官方文档](https://wujie-micro.github.io/doc/)
- `packages/ui/EMBED_MODE_README.md` - 嵌入模式使用说明
- `packages/ui/WUJIE_EVENT_LISTENER_README.md` - 事件监听器详细说明

---

**文档版本**: 1.0  
**最后更新**: 2025-12-02  
**维护者**: AgentFactory Team

