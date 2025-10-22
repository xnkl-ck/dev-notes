## 前端面试全方位准备指南（基于陈康简历）

> 适用范围：社招前端工程师（React/Next.js/微前端/AI 方向）；重点覆盖技术深挖、项目攻防、系统设计、性能优化、行为面试与材料准备。

---

## 面试定位与目标

- 定位：高阶前端工程师（AI 平台方向），擅长前端架构、性能优化、微前端、RBAC/SSO、可视化编辑与 AI 标注工具。
- 求职卖点：
  - 1 年 AIGC/AI 平台实战 + 3 年前端工程经验；
  - 能落地企业级微前端与权限体系；
  - 性能优化成果可量化（HTTP 请求数 -90%+、首屏 -50%+、标注响应 -61%）。
- 面试目标：
  - 技术面：React/Next.js/TS、性能优化、工程化、微前端、Canvas/Fabric.js、React Query、架构能力；
  - 业务面：AI 代理平台/数据标注深挖 + 指标闭环；
  - 文化面：责任感、Owner 意识、协作与推动力。

---

## 电梯自我介绍（30s / 60s）

- 30 秒版：
  - 我有 3 年前端经验，近 1 年专注企业级 AI 平台，主导微前端集成、RBAC/SSO 与标注工具研发。在 AgentFactory 子应用中，将“数千请求”优化到 20-30 个，首屏缩短 50%+；基于 Fabric.js 的标注工具响应从 180ms 降到 70ms，视频标注流畅度提升 50%。熟悉 React/Next.js、Vite/Webpack、React Query、Zustand/Redux，能在复杂业务中兼顾架构与体验。
- 60 秒版：
  - 在道通科技负责 AI 主平台与 AgentFactory 子应用的前端研发。主导 Wujie 微前端集成，实现主题/语言/Token 100ms 同步；设计平台级 RBAC，细粒度 70+ 权限点，兼容多租户资源隔离与自定义角色；SSO 集成 JWT，认证成功率 99.8%。在构建侧通过 Vite 代码分割/依赖预构建/资源内联等，将请求数减少 90%+；Nginx 长缓存命中 85%。在 AI 标注方面，落地 Fabric.js 事件驱动与渲染优化，结合 React Query 做轮询与缓存，支持 1000+ 数据高性能展示。具备工程化与团队推动力（Turbo monorepo、规范化工具、CI/CD）。

---

## 简历核心卖点地图（面试官视角）

- AI 平台与工具链
  - Fabric.js 图像/视频标注、智能标注与追踪、流式聊天、多模态、ReactFlow 工作流编辑器。
- 架构与工程化
  - 微前端（Wujie）事件总线、主子应用通信、独立/嵌入式部署兼容；Turbo monorepo、CI/CD、规范落地。
- 权限与安全
  - 平台级 RBAC（70+ 权限点、15 模块）、多租户隔离、自定义角色；SSO（JWT 流程、自动登录、信息同步）。
- 性能优化（硬指标）
  - 构建/加载/缓存三板斧：请求数 -90%+、首屏 -50%+、Bundle -30~40%、缓存命中 85%。
  - 标注响应 180ms→70ms（-61%）、视频标注 +50% 流畅度；列表刷新延迟 -70%，千级数据不卡顿。
- 金融业务背景
  - 大型银行系统实战（国际业务/外汇监测），Webpack、路由懒加载、CDN/Nginx 缓存、表单与异步校验。

---

## 项目深挖与高频问答

### AI 智能开发平台（主平台）

- 你做了什么（一句话）：
  - 负责 AI 标注子系统研发与平台级 RBAC/SSO，打造端到端高性能标注与数据管理能力。
- 架构要点：
  - React 18 + Next.js 14 + TS + Zustand + React Query + Tailwind + shadcn/ui + Fabric.js；服务端配合长缓存与鉴权。
- 难点与指标：
  - Fabric 事件/渲染优化：响应 180ms→70ms；预加载与批处理降低重绘；智能标注工具解耦，效率 3~5 倍。
  - React Query：稳定轮询、缓存与回源策略，千级数据列表刷新延迟 -70%。
- 典型追问与要点：
  - Q：Fabric.js 卡顿的根因如何定位与治理？
    - A：避免频繁 render；renderOnAddRemove=false，批量变更后 requestRenderAll；开启 objectCaching；热点对象合并 update；事件节流；图层/裁剪区域优化。
  - Q：React Query 轮询与缓存如何做？
    - A：staleTime 控制陈旧度、refetchInterval + refetchOnWindowFocus；queryKey 细粒度拆分；列表与详情解耦；后端 ETag/Last-Modified 协同。

### AgentFactory - AI 代理平台（微前端子应用）

- 你做了什么（一句话）：
  - 主导 Wujie 微前端集成与构建/缓存优化，做到了主子应用 100ms 内同步、请求数 -90%+。
- 架构要点：
  - React 18 + Vite + TS + Redux Toolkit + MUI + ReactFlow；Wujie 事件总线传递主题/语言/Token。
- 难点与指标：
  - Code Splitting、依赖预构建、资源内联、压缩策略、Nginx 长缓存（1 年）→ 首屏 -50%+、Bundle -30~40%、命中 85%。
  - ReactFlow 虚拟化/分块渲染支持 500+ 节点编辑不卡顿。
- 典型追问与要点：
  - Q：为何“HTTP 请求数”能从“数千”降到“20-30”？
    - A：主要指开发/预构建/依赖分解阶段对大量模块请求的整合：Vite 依赖预构建（esbuild）合并大量 ESM 请求；手动拆分大模块（manualChunks）减少首次碎片化请求；静态资源内联与按需加载；CDN/缓存命中降低回源。
  - Q：微前端跨应用通信如何设计？
    - A：事件总线为主（主题/语言/Token），URL/Query 辅助；定义业务事件契约与版本；幂等与超时处理；回退到独立部署模式。

### 银行业务项目（河北银行/友利银行）

- 关键词：Webpack SplitChunks、路由懒加载、LightHouse 诊断、CDN/Nginx 缓存、异步表单校验、组件化封装。
- 指标：首屏 3s→1s；资源加载 -30%；报表加载 -25%，服务器负载 -20%。

---

## 技术专题攻防要点

### React/Next.js

- 关键点：SSR/SSG/ISR 的选择与缓存策略、服务端数据注水与去水、并发特性（Suspense/并发渲染）、Edge 与 Node 运行时差异。
- 高频问：
  - SSR 和 CSR 选择依据？如何避免 hydration mismatch？
  - 路由粒度的代码分割策略？
  - Next 中间件鉴权与缓存（HTML 不缓存、静态资源长缓存）？

### 状态管理（Zustand/Redux Toolkit）

- 原则：局部状态优先；服务端数据用 React Query；全局跨路由/会话用 Zustand/Redux。
- 设计：模块化切片、不可变更新、选择器避免重渲染、订阅粒度控制。

### 性能优化三段论

- 加载：代码分割、预构建、资源内联阈值、压缩器、图片与字体策略、HTTP/2、预取与预加载。
- 渲染：虚拟列表、列表分片、动画合成层、避免大对象 diff、memo/useMemo/useCallback/selector。
- 交互：阻塞任务切片、事件节流/防抖、Worker/OffscreenCanvas、批量 DOM 更新。

### 微前端（Wujie）

- 难点：隔离与通信、路由同步、样式冲突、运行时上下文、主子应用生命周期。
- 关键点：事件总线契约化、Token/主题/语言同步、独立/嵌入式双模式、错误边界与降级。

### RBAC/SSO

- RBAC：资源模型（菜单/按钮/接口/字段）、角色-权限映射、多租户隔离、前后端双鉴权、策略下发与本地缓存。
- SSO（JWT）：登录态交换、续期/刷新、跨域与安全、回跳与无感登录、失败兜底。

### Fabric.js/Canvas/视频追踪

- 关键优化：render 批处理、对象缓存、hit test 优化、视窗裁剪、GPU 合成层、帧预加载策略。
- 智能标注：工具抽象与 API 事件解耦；异步队列与状态可视化；撤销/重做与版本管理。

### React Query

- 要点：staleTime/cacheTime、依赖键、增量更新（setQueryData）、轮询/聚焦/网络状态、错误重试指数退避、与 SSR 配合。

### 构建优化（Vite/Webpack）

- Vite：optimizeDeps 预构建、manualChunks、assetsInlineLimit、splitVendorChunk、minify=esbuild/terser、hash 与长缓存。
- Webpack：SplitChunks、持久化缓存、Loader 顺序优化、Tree-shaking SideEffects、动态导入。

---

## 面试可用代码片段（精选）

```ts
// Vite - 代码分割与优化（vite.config.ts）
import { defineConfig, splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [splitVendorChunkPlugin()],
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1024,
    assetsInlineLimit: 4096, // <4KB 内联
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
```

```nginx
# Nginx - 长缓存与 HTML 不缓存
location ~* \.(js|css|svg|png|jpg|woff2)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
  try_files $uri =404;
}
location = /index.html {
  add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

```ts
// React Query - 轮询与缓存
useQuery({
  queryKey: ['dataset', datasetId],
  queryFn: fetchDataset,
  staleTime: 60_000,
  refetchInterval: 5_000,
  refetchOnWindowFocus: false,
});
```

```ts
// Wujie 事件总线（示意）
const bus = (window as any)?.$wujie?.bus;
bus?.$on?.('theme-change', (theme: 'light' | 'dark') => setTheme(theme));
bus?.$emit?.('token-sync', token);
```

```ts
// Fabric.js 性能要点（伪码）
canvas.renderOnAddRemove = false;
// 批处理
batchOps(objects, () => {
  objects.forEach(applyChange);
  canvas.requestRenderAll();
});
```

---

## 系统设计题（模板化答法）

- AI 标注系统
  - 核心流：上传/预处理 → 索引管理 → 标注会话（多用户并发/锁）→ 智能标注（异步任务）→ 版本与审计 → 导出。
  - 关键点：增量保存、冲突合并、撤销/重做、快照与回放、CDN 与权限签名、Worker/OffscreenCanvas。
- RBAC 平台
  - 模型：用户-角色-权限-资源（菜单/按钮/接口/字段）；多租户隔离；策略下发与本地缓存；前后端双重校验。
- SSO（JWT）
  - 流程：主登录 → 换票 → 子系统免登；Token 刷新与撤销；跨域安全（SameSite/HttpOnly）；回跳与兜底策略。
- AI 代理平台（微前端）
  - 主子应用集成：事件总线协议、沙箱与样式隔离、路由同步；崩溃隔离与降级；灰度与 A/B。

---

## 行为面（STAR）故事库

- 性能攻坚（AgentFactory 请求数 -90%+）
  - S：数千请求导致白屏与卡顿；T：控制首屏请求 <30；
  - A：Vite 预构建、manualChunks、资源内联、CDN+Nginx 长缓存、按需加载；
  - R：请求数降至 20-30；首屏 -50%+；命中率 85%。
- 体验优化（标注响应 -61%）
  - S：Fabric 标注卡顿；T：<100ms 响应；
  - A：批渲染、对象缓存、事件节流、智能标注解耦；
  - R：180ms→70ms；智能标注效率 3~5 倍。
- 架构推进（微前端集成）
  - S：多子应用集成混乱；T：100ms 内主题/语言/Token 同步；
  - A：事件总线契约化、独立/嵌入式双模式、错误边界；
  - R：稳定上线，协作效率提升，切换一体化。

---

## 高频追问与示范回答

- 为什么用 React Query 而不是把一切放全局状态？
  - 服务端数据有生命周期与陈旧度，React Query 内置缓存/重试/失焦/轮询等策略，避免全局状态臃肿和重复请求。
- 代码分割怎么避免产生过多小 chunk？
  - 通过 manualChunks 把高关联依赖打入稳定 vendor 包；对低频页面使用异步 import；用构建分析工具观察“过度切割”并合并。
- 微前端的样式冲突与全局变量污染如何处理？
  - 样式前缀化/Shadow DOM、运行时沙箱、严格事件命名空间；与主应用仅通过总线与协议通信，不直接共享可变全局对象。
- 标注系统如何保证数据一致性？
  - 增量提交 + 版本号/时间戳；冲突检测与合并策略；服务端审计与快照；离线/异常重试队列。

---

## 英文自我介绍与问答（精简版）

- Self-intro (20s)：I’m a frontend engineer with over three years of experience, one year focusing on AI platforms. I led micro-frontend integration, RBAC/SSO, and performance optimization. Notably, I reduced thousands of HTTP requests to around 20–30 through Vite optimizations and improved Fabric.js labeling responsiveness from 180ms to 70ms.
- Q：Why micro-frontend with Wujie?
  - Lightweight isolation, flexible integration, and fast cross-app communication through an event bus. It enables independent deployment while keeping consistent UX.

---

## 作品与材料准备

- Demo 清单：标注工具短视频（30s）、AgentFactory 工作流编辑、性能前后对比 GIF（网络/Timeline）。
- GitHub/文档：简化版组件或示例仓库；性能优化实战记录（前后指标对比）。
- 演示脚本：3 分钟结构（场景→方案→指标→总结）。

---

## 面试当天 Checklist

- 环境：网络/摄像头/耳机；IDE 与构建演示准备。
- 素材：关键截图（LightHouse 前后、Network 瀑布图、React Query 缓存图）、Nginx/Vite 片段。
- 沟通：问题澄清→方案权衡→边界条件→指标落地→风险与回滚。

---

## 7 天冲刺复盘计划

- D1-D2：React/Next.js SSR/ISR 深挖 + Hooks/Memo 优化套路。
- D3：React Query/Zustand/Redux Toolkit 场景化练习。
- D4：Vite/Webpack 构建分析 + manualChunks 实操。
- D5：Fabric.js/Canvas 性能优化小 Demo。
- D6：系统设计两题（RBAC + 标注系统）。
- D7：全套模拟面 + 复盘（记录 10 个改进点）。

---

## 附录：可复用片段与口径

- 指标口径表述
  - “请求数 -90%+（数千→20-30）”“首屏 -50%+”“Bundle -30~40%”“缓存命中 85%”
  - “标注响应 180ms→70ms（-61%）”“视频标注流畅度 +50%”“列表刷新延迟 -70%”
- 常见陷阱提示
  - 仅分割不等于变快：注意请求并发、首屏关键路径与缓存命中；
  - 仅缓存不等于稳定：版本哈希与不可变缓存、回滚策略必须到位；
  - 仅轮询不等于实时：可评估 SSE/WebSocket；权衡复杂度与收益。

---

## 反问清单（末问三选一）

- 团队在微前端、性能基线与可观测性方面是否有统一规范？是否支持技术推广与沉淀？
- 当前 AI 方向产品的主要挑战是效率、质量还是成本？最想在前端侧突破的点是什么？
- 是否有机会主导跨团队的工程化与性能优化专项？对任职前 3 个月的期望是什么？

---

## 最后建议（可直接照做）

- 准备一页“指标战报”图（前后对比）+ 三个 30 秒小视频（标注、工作流、性能瀑布）。
- 把本指南中的代码片段粘到个人 Snippets，面试中随取随用。
- 预演 3 次 STAR 故事，做到“问题-动作-指标-复盘”脱口而出。

—— 预祝面试顺利，拿到理想 Offer！


面试准备与技术要点拆解（陈康）
电梯陈述（30 秒）
3 年+ 前端经验，近 1 年聚焦 AIGC/AI 平台研发，主导微前端（Wujie）集成、RBAC 权限体系、SSO 统一认证、AI 标注工具链和极致性能优化。
最具代表性的成果：将“数千个 HTTP 请求”降到 20-30 个（90%+ 降幅），Fabric.js 标注响应从 180ms 优化到 70ms（61% 提升），支持 500+ 节点的 ReactFlow 编辑不掉帧。
技术点 → 具体实现方法（可落地）
React / Next.js（SSR/SSG、并发、流式）
数据获取：App Router 下 fetch + cache 策略、revalidate、generateStaticParams 组合；页面骨架 + 流式渲染优化白屏。
SEO 与性能：SSR 用于首屏/SEO关键页，SSG 用于长尾低频页，ISR 平衡动态与缓存。
组件层面：避免深层状态提升，精准 memo，事件处理函数稳定（useCallback），列表虚拟化。
错误边界与 Loading：分区 Suspense + ErrorBoundary，缩小失败影响面。
状态与数据（Zustand / Redux Toolkit / React Query）
React Query 管服务端数据：缓存（staleTime、gcTime）、增量获取、并发去重、失效/预取/轮询。
Redux/Zustand 管客户端 UI/跨页状态：如主题、语言、全局筛选等；避免把服务端数据放在全局状态。
数据一致性：乐观更新 + 失败回滚；关键写操作串行化，避免并发覆盖。
微前端（Wujie）：主子应用通信、独立/嵌入式双模式
选型：Wujie 运行时沙箱轻、多子应用并存性能优于路由切换型，CSS/JS 隔离更稳定；与 qiankun 对比，Wujie 更贴近生产动态接入需求。
通信：事件总线（主题/语言/Token），100ms 级同步；主应用维护单一可信源，子应用订阅。
路由：子应用可独立运行（dev）与嵌入主平台（prod），打包产物与基座约定资源前缀，避免冲突。
资源：外链依赖白名单，避免重复注入；跨源脚本通过策略放行。
统一认证（SSO / JWT）
登录：主平台颁发 JWT（短期）+ RefreshToken（长期）；子应用首屏通过父窗口消息或共享存储获取 Token。
自动续期：在 Token 将过期 T-30s 静默刷新；刷新失败触发登出，全局广播。
单点登出：清理所有子域/子应用存储，广播 logout 事件。
安全：RefreshToken 仅服务端可见（HttpOnly），前端只持有短期 JWT；接口走 Bearer 统一拦截器。
RBAC 权限系统（70+ 权限点、15 模块）
模型设计：User—Role—Permission（多对多），Permission 支持资源作用域（租户、组织、项目）。
校验链路：后端签发带权限声明的 Token/或登录后拉取权限字典；前端进行路由守卫 + 组件粒度指令控制；后端对关键资源二次校验。
性能：权限字典本地缓存（短期），菜单构建在内存完成；权限变更后增量刷新。
可观测：缺权限上报埋点，辅助产品纠偏权限配置。
AI 标注工具（Fabric.js）：事件解耦、渲染加速
架构：Canvas 状态（模型）与 UI/工具栏（视图）解耦，事件总线中转（控制器）；工具插件化（矩形、多边形、点/框分类、视频帧）。
性能：
降噪：合并频繁事件（drag/zoom）→ 节流/请求帧聚合。
局部重绘：objectCaching、按对象层级更新。
大图处理：分辨率自适配 + 离屏计算（WebWorker）做智能建议/追踪。
智能标注：与后端 AI 服务通过异步任务 decouple，结果到达后对齐当前帧/缩放，避免错位。
视频追踪：关键帧 + 光流/检测结果插值；预加载前后 N 帧，滚动窗口。
性能优化：从“数千请求”到“20-30 个”
构建分包（Vite Rollup）：手动 manualChunks 按业务域/第三方依赖拆包；共享依赖抽公共；防止碎片化。
资源策略：
依赖预构建（optimizeDeps）、小图内联（<4KB）、SVG 组件化。
路由与组件“真按需”：仅首屏关键路径打包，二级页面动态 import。
网络与缓存：
长缓存（文件名哈希，Cache-Control: max-age=31536000, immutable）。
HTML 不缓存/短缓存，加载后由路由接管。
Nginx：静态资源强缓存 + Gzip/Brotli；跨源预检缓存 Access-Control-Max-Age。
指标落地：requests、TTFB、FCP、LCP、CLS、JS Heap，对比基线，周报跟踪。
ReactFlow（500+ 节点平滑）
节点/边虚拟化：视窗内渲染 + 视窗外降级（占位/透明层）。
计算分摊：布局计算放 Worker；连线路径缓存；拖拽仅更新增量。
渲染优化：节点 memo + areEqual；样式隔离，避免级联重排。
工程化（Turbo Monorepo、CI/CD、规范）
目录：apps/*、packages/*；共享 UI/工具库；增量构建（turbo cache）。
规范：ESLint + Prettier + Husky（pre-commit lint-staged）。
构建分析：Bundle 可视化、依赖体积预算（Budget），超限报警。
CI/CD：缓存 node_modules、分阶段（lint→test→build→deploy），回滚策略。
Vue 项目优化（银行业务）
SplitChunks + 路由懒加载：主干包稳定、业务包分离；首屏模块控制在 200-300KB。
资源：url-loader/file-loader 阈值内联，小资源减少 RTT，大资源走 CDN。
表单与验证：ElementUI validator + 异步接口校验，失败可视反馈与节流。
STAR 法则（面试可复述）
1）将“数千请求”优化到“20-30 个”
S（情景）：Agent 平台首屏与懒加载触发大量分片请求，网络拥堵、白屏时间长。
T（任务）：减少请求数、降低首屏时延，确保灰度期间稳定。
A（行动）：手动分包（业务/依赖域）、二级页动态 import、资源内联阈值优化、Nginx 长缓存、依赖预构建；监控对比。
R（结果）：请求数降 90%+ 至 20-30 个；首屏时间缩短 50%+；缓存命中 85%。
2）Fabric.js 标注从 180ms 降至 70ms
S：图像标注交互卡顿，连线/框选明显延迟。
T：把交互延迟降至 100ms 内，不卡帧。
A：事件节流、局部重绘、离屏计算智能建议、对象缓存、重排合并；视频帧预加载。
R：交互延迟 70ms 左右（提升 61%），用户主观流畅度显著提升。
3）微前端 Wujie 主子应用 100ms 内上下文同步
S：多子应用主题/语言/Token 不一致，切换延后。
T：100ms 内全局同步，兼容独立运行与嵌入式。
A：事件总线 + 单一可信源；初始化握手；变更广播；异常降级。
R：100ms 内同步完成，切换一致性问题归零，易维护。
4）RBAC（70+ 权限、15 模块）
S：权限复杂、变更频繁、页面粒度控制需求高。
T：设计平台级 RBAC，菜单/路由/组件三层生效。
A：角色-权限-资源建模、前端字典缓存、路由守卫、组件指令、后端二次校验。
R：权限配置灵活稳定，审计清晰，误配率降低，开发效率提升。
高频面试题（含要点答案）
为什么选 Wujie？与 qiankun 比较？
Wujie 更轻、并行渲染更好、资源隔离更完善；qiankun 偏路由切换场景。我们需要主子应用并存与快速切换，Wujie 更贴合。
React Query 与 Redux/Zustand 如何分工？
Query 管服务端数据（缓存、请求生命周期），Redux/Zustand 管本地 UI 状态。职责清晰避免重复。
如何把几千请求降到 20-30？
手动分包、路由级动态 import、预构建、内联小资源、长缓存、Nginx 调优、监控验证。
RBAC 如何落地到组件级？
拉取权限字典→路由守卫→<Can perm="x" /> 指令控制元素→后端关键接口再校验。
SSO 如何保证安全？
RefreshToken 仅后端持有（HttpOnly），前端仅持短 Token；静默刷新；跨域安全配置；单点登出广播。
Fabric.js 性能优化关键点？
事件节流、局部重绘、对象缓存、离屏计算、按需渲染、视频帧预加载。
ReactFlow 500+ 节点不卡顿？
视窗虚拟化、计算下沉 worker、节点 memo、路径缓存、增量更新。
Next.js 何时 SSR/SSG/ISR？
SSR：首屏/SEO关键；SSG：静态长尾；ISR：需更新又想缓存。
前端安全（银行/平台）怎么做？
XSS（转义/白名单）、CSRF（SameSite/Token 双重）、CSP、依赖审计、敏感信息脱敏、HTTPS 全站。
技术深挖（如何/为什么/坑点）
手动分包的边界
过度拆包会导致请求碎片化；需结合路由路径热度与依赖图做域级拆分。
Token 同步的时序问题
子应用晚于主应用挂载时，需设计首次“握手同步”；失败重试策略避免丢消息。
Fabric 智能标注对齐
AI 返回的坐标基于原分辨率，需按当前缩放/平移做矩阵变换，避免错位。
React Query 轮询与失效
轮询避免与用户交互冲突（页面不可见暂停）；写操作后精准失效对应 key，避免全量刷新。
项目亮点话术（30-60 秒/条）
微前端统一上下文：通过事件总线 + 单一可信源，实现主子应用主题/语言/Token 100ms 内同步，兼容独立与嵌入式部署，极大降低接入成本。
极致加载优化：基于 Vite 手动分包、动态 import 与长缓存，把“数千请求”降到 20-30 个，首屏快 50%+，稳定支撑大体量路由与依赖。
AI 标注工具链：事件驱动 + 局部重绘 + 离屏计算，让 Fabric.js 在大图/视频场景仍然保持 70ms 级响应，智能标注效率提升 3-5 倍。
可视化工作流：ReactFlow 结合虚拟化和缓存策略，500+ 节点编辑无明显掉帧，提升复杂流程可视化编辑体验。
行为与团队协作（可复述）
数据驱动迭代：所有优化以指标为导向（请求数、FCP/LCP、交互延迟），灰度对比后再全量。
工程化推进：建立 ESLint/Prettier/Husky 标准化与 CI/CD 流水线，降低回归成本。
风险预案：Token/权限等核心链路均有降级与兜底（缓存、重试、只读模式）。
关键伪代码/配置片段（面试时辅助说明）
面试官可能的延伸追问（准备点）
如果要把 500 节点扩到 2000 节点怎么办？
降采样渲染、层级聚合（cluster）、服务端布局、按区域分页加载。
权限配置热更新如何做到无刷新生效？
变更事件推送（SSE/WebSocket）→ 前端失效权限缓存 → 触发 UI 刷新。
SSO 多域名/跨顶级域怎么办？
统一网关回调，子域共享同源策略；或引入中转服务，子应用仅与网关交互。
视频标注对低端设备的适配策略？
降级启用较低分辨率帧、降低预加载窗口、禁用复杂滤镜/阴影。
可量化指标清单（面试快速报数）
请求数：数千 → 20-30（-90%+）
首屏：-50%+（按页面而定）
缓存命中：85%
标注延迟：180ms → 70ms（+61%）
工作流编辑：500+ 节点流畅
SSO 成功率：99.8%
结束语
我能独立把复杂 AI 平台前端从架构到性能全链路落地，偏好用指标驱动决策与演进，擅长在微前端、权限体系、AI 可视化与极致性能优化的交叉领域创造价值。