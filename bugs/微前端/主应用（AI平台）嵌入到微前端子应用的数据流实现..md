# 微前端功能实现指南

> 本文档详细说明如何在主应用中添加新的微前端页面（如：工具集、变量、知识库等）

## 目录

- [架构概述](#架构概述)
- [技术栈](#技术栈)
- [实现步骤](#实现步骤)
- [关键文件说明](#关键文件说明)
- [数据流详解](#数据流详解)
- [配置说明](#配置说明)
- [示例：添加变量功能](#示例添加变量功能)
- [常见问题](#常见问题)

---

## 架构概述

本项目采用 **WujieReact（无界微前端）** 框架实现主子应用的集成。主应用（Next.js）负责：

- 侧边栏导航
- 路由管理
- 主题/语言切换
- 用户认证

子应用通过 iframe 沙箱加载，实现功能隔离。

### 架构图

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           主应用 (Next.js)                                    │
│                                                                              │
│  ┌─────────────────┐     ┌──────────────────┐     ┌────────────────────────┐ │
│  │  侧边栏菜单      │ ──▶ │   路由系统        │ ──▶ │   页面组件             │ │
│  │  app-sidebar    │     │   Next.js Router │     │   xxx/page.tsx        │ │
│  └─────────────────┘     └──────────────────┘     └────────────────────────┘ │
│                                                              │                │
│                                                              ▼                │
│                                                   ┌────────────────────────┐ │
│                                                   │     AgentMicro 组件     │ │
│                                                   │  (微前端容器组件)        │ │
│                                                   └────────────────────────┘ │
│                                                              │                │
│  ┌──────────────────────────────────────────────────────────┼───────────────┐│
│  │                        WujieReact (无界微前端)             ▼               ││
│  │  ┌─────────────┐    ┌─────────────┐    ┌────────────────────────────────┐││
│  │  │  事件总线    │    │  Props 传递  │    │      iframe 沙箱               │││
│  │  │  bus.$emit  │    │  locale/theme│    │  加载子应用                    │││
│  │  └─────────────┘    └─────────────┘    └────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          子应用 (外部应用)                                    │
│   URL: ${agentBaseUrl}/${pagePath}                                          │
│   例如: http://10.239.121.16:8091/variables                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 技术栈

| 技术             | 用途               |
| ---------------- | ------------------ |
| **Next.js 14**   | 主应用框架         |
| **WujieReact**   | 微前端框架（无界） |
| **React Query**  | 数据请求与缓存     |
| **next-intl**    | 国际化             |
| **next-themes**  | 主题切换           |
| **Lucide React** | 图标库             |

---

## 实现步骤

添加新的微前端页面需要以下 **4 个步骤**：

### 步骤 1：添加翻译文本

在 `messages/zh.json` 和 `messages/en.json` 中添加菜单名称：

```json
// messages/zh.json
{
  "sidebar": {
    "headerNav": {
      "YourFeature": "你的功能名称"
    }
  }
}

// messages/en.json
{
  "sidebar": {
    "headerNav": {
      "YourFeature": "Your Feature Name"
    }
  }
}
```

### 步骤 2：配置侧边栏菜单

在 `components/app-sidebar.tsx` 中：

1. **导入图标**（如需要）：

```typescript
import { YourIcon } from 'lucide-react';
```

2. **添加菜单项**：

```typescript
// 在 applicationNavMain 或其他导航组中添加
{
  title: t("sidebar.headerNav.tools"),  // 所属分组
  url: "#",
  items: [
    // ... 其他菜单项
    {
      title: t("sidebar.headerNav.YourFeature"),
      url: "/application/agent/your-feature",  // 路由地址
      icon: YourIcon,
    },
  ]
}
```

### 步骤 3：创建页面组件

创建 `app/(commonLayout)/application/agent/your-feature/page.tsx`：

```typescript
"use client"

import { useTranslations } from "next-intl"
import PageWrap from "@/components/page-wrap"
import dynamic from "next/dynamic"

// 动态导入微前端组件（禁用 SSR）
const AgentMicro = dynamic(
  () => import("../_components/agent-microfrontend"),
  {
    ssr: false,
    loading: () => <div> </div>,
  }
);

export default function YourFeature() {
  const t = useTranslations()

  const breadcrumbItems = [
    {
      title: t("sidebar.headerNav.YourFeature"),
      isCurrentPage: true
    }
  ]

  return (
    <PageWrap breadcrumbItems={breadcrumbItems}>
      <div className="h-full w-full">
        {/* url 参数对应子应用的路由路径 */}
        <AgentMicro url="your-feature" />
      </div>
    </PageWrap>
  )
}
```

### 步骤 4：确认子应用路由存在

确保子应用（agentBaseUrl）已实现对应的路由：

- 子应用需要有 `/your-feature` 路由
- 例如：`http://10.239.121.16:8091/your-feature`

---

## 关键文件说明

### 1. 侧边栏配置

**文件**: `components/app-sidebar.tsx`

**职责**:

- 定义导航菜单结构
- 管理导航状态
- 处理路由跳转

**关键配置**:

```typescript
export interface SidebarData {
  navMain: NavItem[]; // 模型相关导航
  systemNavMain: NavItem[]; // 系统管理导航
  applicationNavMain: NavItem[]; // 应用相关导航（Agent、工具、数据）
  mcpNavMain: NavItem[]; // MCP 相关导航
}
```

### 2. 微前端容器组件

**文件**: `app/(commonLayout)/application/agent/_components/agent-microfrontend.tsx`

**职责**:

- 获取微前端配置（baseUrl）
- 创建 WujieReact 实例
- 同步主应用状态到子应用（语言、主题、租户ID）

**关键代码**:

```typescript
export default function AgentMicro({ url, props = {} }) {
  const locale = useLocale()
  const { resolvedTheme } = useTheme()
  const { data: userInfo } = useUserInfo()
  const { data: config } = useMicroAppConfig()

  // 事件总线同步状态
  useEffect(() => {
    WujieReact.bus.$emit("i18n-change", locale)
    WujieReact.bus.$emit("theme-change", resolvedTheme)
    WujieReact.bus.$emit("tenant-id", userInfo?.tenantId)
  }, [locale, resolvedTheme, userInfo])

  return (
    <WujieReact
      name="agent"
      url={`${baseUrl}/${url}`}
      sync={true}
      props={{ locale, theme: resolvedTheme }}
    />
  )
}
```

### 3. 微前端配置服务

**文件**: `service/application/micor-app-config.ts`

**职责**:

- 从后端获取子应用的 URL 配置
- 缓存配置数据

**关键代码**:

```typescript
export interface MicroAppConfig {
  agentBaseUrl?: string; // Agent 子应用基础URL
  chatbotBaseUrl?: string; // Chatbot 子应用基础URL
}

export const useMicroAppConfig = () => {
  return useQuery({
    queryKey: ['microAppConfig'],
    queryFn: async () => {
      const response = await fetch('/manage-service/apps/config');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10分钟缓存
  });
};
```

---

## 数据流详解

### 完整时序图

```
用户                主应用                      WujieReact              子应用
 │                    │                           │                        │
 │ 1.点击菜单         │                           │                        │
 │ ─────────────────▶ │                           │                        │
 │                    │                           │                        │
 │                    │ 2.路由跳转                 │                        │
 │                    │ /application/agent/xxx    │                        │
 │                    │                           │                        │
 │                    │ 3.渲染页面组件             │                        │
 │                    │ xxx/page.tsx              │                        │
 │                    │                           │                        │
 │                    │ 4.加载 AgentMicro         │                        │
 │                    │                           │                        │
 │                    │ 5.获取配置                 │                        │
 │                    │ GET /manage-service/apps/config                    │
 │                    │ ◀─ { agentBaseUrl: "..." }│                        │
 │                    │                           │                        │
 │                    │ 6.创建 WujieReact         │                        │
 │                    │ ─────────────────────────▶│                        │
 │                    │                           │                        │
 │                    │                           │ 7.创建 iframe           │
 │                    │                           │ ───────────────────────▶│
 │                    │                           │ URL: baseUrl/xxx        │
 │                    │                           │                        │
 │                    │                           │ 8.加载子应用资源         │
 │                    │                           │ ◀───────────────────────│
 │                    │                           │                        │
 │                    │ 9.事件同步                 │                        │
 │                    │ bus.$emit("i18n-change")  │                        │
 │                    │ bus.$emit("theme-change") │ ───────────────────────▶│
 │                    │ bus.$emit("tenant-id")    │                        │
 │                    │                           │                        │
 │                    │                           │ 10.渲染页面内容          │
 │ ◀───────────────────────────────────────────────────────────────────────│
 │      用户看到完整页面                                                     │
```

### 主子应用通信机制

| 通信方式     | 方向    | 用途                               |
| ------------ | ------- | ---------------------------------- |
| **Props**    | 主 → 子 | 传递静态配置（locale, theme）      |
| **事件总线** | 主 → 子 | 动态状态同步（语言切换、主题切换） |
| **URL 同步** | 双向    | 路由状态同步 (sync: true)          |

---

## 配置说明

### 环境变量

```env
# .env.local (开发环境)
NEXT_PUBLIC_AGENT_BASE_URL=http://localhost:3001

# 生产环境由后端配置提供
```

### 后端配置 API

**接口**: `GET /manage-service/apps/config`

**响应示例**:

```json
{
  "agentBaseUrl": "http://10.239.121.16:8091",
  "chatbotBaseUrl": "http://10.239.121.16:8092"
}
```

---

## 示例：添加变量功能

以下是完整的变量功能实现示例：

### 1. 翻译文件

```json
// messages/zh.json
"Variables": "变量"

// messages/en.json
"Variables": "Variables"
```

### 2. 侧边栏配置

```typescript
// components/app-sidebar.tsx
import { Variable } from "lucide-react"

// 在 applicationNavMain 的 tools 分组中添加
{
  title: t("sidebar.headerNav.tools"),
  url: "#",
  items: [
    {
      title: t("sidebar.headerNav.Toolset"),
      url: "/application/agent/tools",
      icon: PencilRuler,
    },
    {
      title: t("sidebar.headerNav.Variables"),
      url: "/application/agent/variables",
      icon: Variable,
    },
  ]
}
```

### 3. 页面组件

```typescript
// app/(commonLayout)/application/agent/variables/page.tsx
"use client"

import { useTranslations } from "next-intl"
import PageWrap from "@/components/page-wrap"
import dynamic from "next/dynamic"

const AgentMicro = dynamic(
  () => import("../_components/agent-microfrontend"),
  { ssr: false, loading: () => <div> </div> }
);

export default function Variables() {
  const t = useTranslations()

  const breadcrumbItems = [
    { title: t("sidebar.headerNav.Variables"), isCurrentPage: true }
  ]

  return (
    <PageWrap breadcrumbItems={breadcrumbItems}>
      <div className="h-full w-full">
        <AgentMicro url="variables" />
      </div>
    </PageWrap>
  )
}
```

---

## 常见问题

### Q1: 子应用加载失败？

**检查项**:

1. 确认子应用服务已启动
2. 检查 `/manage-service/apps/config` 返回的 URL 是否正确
3. 检查网络是否可访问子应用地址
4. 查看浏览器控制台是否有跨域错误

### Q2: 主题/语言不同步？

**检查项**:

1. 确认子应用监听了事件总线：

```javascript
// 子应用代码
window.$wujie?.bus.$on("i18n-change", (locale) => { ... })
window.$wujie?.bus.$on("theme-change", (theme) => { ... })
```

### Q3: 开发环境如何指定子应用地址？

在 `.env.local` 中配置：

```env
NEXT_PUBLIC_AGENT_BASE_URL=http://localhost:3001
```

### Q4: 如何添加新的导航分组？

在 `app-sidebar.tsx` 的 `getSidebarData` 函数中添加新的分组：

```typescript
applicationNavMain: [
  // 现有分组...
  {
    title: t('sidebar.headerNav.newGroup'),
    url: '#',
    items: [
      { title: '子菜单1', url: '/path1', icon: Icon1 },
      { title: '子菜单2', url: '/path2', icon: Icon2 },
    ],
  },
];
```

---

## 相关文件清单

| 文件                                                                       | 说明           |
| -------------------------------------------------------------------------- | -------------- |
| `components/app-sidebar.tsx`                                               | 侧边栏导航配置 |
| `app/(commonLayout)/application/agent/_components/agent-microfrontend.tsx` | 微前端容器组件 |
| `service/application/micor-app-config.ts`                                  | 微前端配置服务 |
| `messages/zh.json`                                                         | 中文翻译       |
| `messages/en.json`                                                         | 英文翻译       |
| `app/(commonLayout)/application/agent/*/page.tsx`                          | 各功能页面组件 |

---

## 更新日志

| 日期       | 更新内容                       |
| ---------- | ------------------------------ |
| 2025-12-02 | 初始版本，添加变量功能实现说明 |
