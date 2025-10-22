# AI 平台项目面试准备文档

## 📋 核心需求总结

你需要：
1. ✅ 理解简历中每个工作职责的**具体实现过程**
2. ✅ 预测面试官针对每个技术点的**常见提问**
3. ✅ 掌握使用 **STAR 法则**（Situation-Task-Action-Result）回答问题
4. ✅ 准备**技术深度问题**的回答（如何实现、为什么这样做、遇到什么问题）
5. ✅ 准备**项目亮点**的展开说明

---

## 🎯 面试回答框架（通用）

### STAR 法则
- **S (Situation)**: 项目背景/遇到的问题
- **T (Task)**: 你的任务/目标
- **A (Action)**: 你采取的具体行动/技术方案
- **R (Result)**: 最终结果/数据成果

### 技术问题回答结构
1. **简要回答**（30秒）：直接说结论
2. **技术方案**（1-2分钟）：说明具体实现
3. **难点与挑战**（30秒）：遇到的问题
4. **优化与结果**（30秒）：如何优化及效果

---

## 一、统一权限系统 (RBAC)

### 📌 可能的面试问题

#### 问题1：你们的 RBAC 权限系统是如何设计的？包含哪些核心模块？

**回答思路（STAR）：**

**S - 背景**：
"我们的 AI 平台需要支持多租户、多角色的复杂权限管理场景，包括租户管理员、组织管理员、开发者、普通用户等多种角色，每个角色对数据集、模型、应用等资源有不同的访问权限。"

**T - 任务**：
"我负责参与权限系统的前端架构设计和核心功能开发，需要实现 70+ 细粒度权限控制，覆盖 15 个业务模块。"

**A - 行动**：
```
我们的 RBAC 系统包含以下核心模块：

1. **权限配置模块**：
   - 定义了 70+ 个细粒度权限点
   - 覆盖 15 个业务模块（数据集、模型、应用、MCP、工具等）
   - 每个权限包含：资源类型、操作类型（增删改查）

2. **角色管理模块**：
   - 预设角色：管理员、开发者、普通用户、访客
   - 支持自定义角色创建
   - 角色与权限的多对多关系

3. **角色分配/解绑模块**：
   - 用户-角色绑定（支持租户用户、组织用户）
   - 组织-角色绑定
   - 支持批量分配

4. **资源管理模块**：
   - 资源的层级隔离（租户 > 组织 > 用户）
   - 资源所有权验证

5. **前端权限控制**：
   - 基于路由的权限拦截
   - 基于组件的权限显示/隐藏
   - 基于按钮的操作权限控制
```

**技术实现**：
```typescript
// 1. 权限检查 Hook
const usePermission = (requiredPermissions: string[]) => {
  const userPermissions = useUserStore(state => state.permissions)
  
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  )
}

// 2. 权限组件
<PermissionGuard permissions={['dataset:create']}>
  <Button>创建数据集</Button>
</PermissionGuard>

// 3. 路由权限拦截
// middleware.ts
if (!hasPermission(requiredPermission)) {
  return NextResponse.redirect('/403')
}
```

**R - 结果**：
"实现了完整的多租户权限管理体系，支持 70+ 权限点的灵活配置，确保了系统的安全性和可扩展性。权限验证响应时间控制在 50ms 以内。"

---

#### 问题2：前端如何与后端配合实现权限验证？

**回答要点**：

**前后端配合流程**：
```
1. **登录阶段**：
   - 用户登录后，后端返回 JWT Token
   - Token 中包含用户基本信息和角色 ID
   - 前端存储 Token 到 localStorage

2. **权限获取**：
   - 首次进入系统时，调用 /api/user/permissions 获取完整权限列表
   - 权限列表存储到全局状态（Zustand）
   - 权限列表格式：['dataset:read', 'dataset:create', 'model:read', ...]

3. **前端权限验证**：
   - 路由跳转前检查权限（middleware）
   - 组件渲染前检查权限（PermissionGuard）
   - API 请求时携带 Token（Axios 拦截器）

4. **后端权限验证**：
   - 所有 API 请求都需要验证 Token
   - 后端解析 Token，查询用户角色和权限
   - 验证用户是否有操作该资源的权限
   - 返回 403 或数据

5. **权限更新**：
   - 管理员修改用户权限后，前端通过轮询或 WebSocket 更新权限缓存
   - 用户下次操作时自动生效
```

**技术细节**：
```typescript
// Axios 拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 权限状态管理（Zustand）
interface PermissionStore {
  permissions: string[]
  roles: string[]
  setPermissions: (permissions: string[]) => void
  hasPermission: (permission: string) => boolean
}

export const usePermissionStore = create<PermissionStore>(set => ({
  permissions: [],
  roles: [],
  setPermissions: (permissions) => set({ permissions }),
  hasPermission: (permission) => get().permissions.includes(permission)
}))
```

---

#### 问题3：你们如何实现多租户的数据隔离？

**回答思路**：

**1. 数据层面隔离**：
```
- 每个数据集、模型、应用都有 tenantId 和 orgId 字段
- 用户只能访问自己租户/组织下的数据
- 后端 API 自动根据用户身份过滤数据
```

**2. 前端实现**：
```typescript
// 用户信息包含租户和组织信息
interface User {
  id: string
  tenantId: string
  orgId?: string
  roles: string[]
}

// API 请求时自动带上租户信息
const getDatasetList = (params) => {
  const user = useUserStore.getState().user
  return get('/api/datasets', {
    params: {
      ...params,
      tenantId: user.tenantId, // 自动添加
      orgId: user.orgId
    }
  })
}
```

**3. 路由隔离**：
```
- 租户管理员只能访问 /tenant/* 路由
- 普通用户无法访问系统管理相关页面
- 通过 middleware.ts 进行路由拦截
```

---

## 二、AI 标注工具研发 (Fabric.js)

### 📌 可能的面试问题

#### 问题1：为什么选择 Fabric.js？它解决了什么问题？

**回答思路**：

**S - 背景**：
"我们需要开发一个功能丰富的图片/视频标注工具，支持矩形、多边形、拖拽、缩放、快捷键等复杂交互。"

**原生 Canvas 的局限**：
```
1. 没有对象管理：需要手动管理所有绘制对象
2. 没有事件系统：需要手动计算鼠标位置，判断点击了哪个对象
3. 没有交互支持：拖拽、缩放需要从零实现
4. 没有序列化：保存和恢复画布状态需要自己实现
```

**Fabric.js 的优势**：
```
1. **对象模型**：
   - 每个标注框是一个对象（fabric.Rect, fabric.Polygon）
   - 可以直接操作对象属性（位置、大小、颜色）
   
2. **事件系统**：
   - 对象级别的事件（object:selected, object:moving）
   - 画布级别的事件（mouse:down, mouse:move）
   
3. **内置交互**：
   - 自动支持拖拽、缩放、旋转
   - 自动计算边界检测
   
4. **序列化/反序列化**：
   - canvas.toJSON() 可以保存整个画布状态
   - canvas.loadFromJSON() 可以恢复
```

**技术对比示例**：
```typescript
// 原生 Canvas（复杂）
const drawRect = (x, y, width, height) => {
  ctx.strokeRect(x, y, width, height)
  // 需要自己存储坐标、监听鼠标事件、处理拖拽...
}

// Fabric.js（简洁）
const rect = new fabric.Rect({
  left: x,
  top: y,
  width: width,
  height: height,
  fill: 'transparent',
  stroke: '#00ff00'
})
canvas.add(rect) // 自动支持拖拽、缩放、事件
```

---

#### 问题2：你是如何优化标注响应时间的？从 180ms 降到 70ms 具体做了什么？

**回答思路（重点）**：

**S - 问题背景**：
"初期版本在频繁操作时（快速绘制多个标注框、拖拽），会出现明显卡顿，响应时间达到 180ms，用户体验较差。"

**T - 优化目标**：
"将标注操作的响应时间降低到 100ms 以内，达到流畅的交互体验。"

**A - 具体优化措施**：

**1. 事件节流与防抖**
```typescript
// 问题：鼠标移动事件触发频率太高
canvas.on('mouse:move', (e) => {
  updateCursor(e) // 每次移动都触发，导致卡顿
})

// 优化：使用节流
import { throttle } from 'lodash'

canvas.on('mouse:move', throttle((e) => {
  updateCursor(e)
}, 16)) // 约 60fps
```

**2. 减少不必要的重渲染**
```typescript
// 问题：每次修改对象都触发整个画布重绘
rect.set({ left: newLeft })
canvas.renderAll() // 重绘整个画布，性能差

// 优化：批量更新
canvas.renderOnAddRemove = false // 关闭自动渲染
objects.forEach(obj => {
  obj.set({ opacity: 0.5 })
})
canvas.renderAll() // 只渲染一次
```

**3. 对象池管理**
```typescript
// 问题：频繁创建和销毁标注对象
const createNewRect = () => new fabric.Rect({...}) // 每次都创建新对象

// 优化：对象池复用
class ObjectPool {
  private pool: fabric.Rect[] = []
  
  getRect() {
    return this.pool.pop() || new fabric.Rect()
  }
  
  releaseRect(rect: fabric.Rect) {
    rect.set({ visible: false })
    this.pool.push(rect)
  }
}
```

**4. Canvas 层级分离**
```typescript
// 问题：标注和底图在同一个 Canvas，每次标注都要重绘底图

// 优化：双 Canvas 结构
<div style={{ position: 'relative' }}>
  <canvas id="image-canvas" /> {/* 底层：只显示图片，不重绘 */}
  <canvas id="annotation-canvas" /> {/* 上层：标注层，频繁重绘 */}
</div>
```

**5. 减少计算复杂度**
```typescript
// 问题：每次鼠标移动都计算所有对象的边界框
canvas.on('mouse:move', (e) => {
  objects.forEach(obj => {
    const bounds = obj.getBoundingRect() // 计算复杂
    if (isInside(e.pointer, bounds)) {
      // ...
    }
  })
})

// 优化：使用空间索引（四叉树）
class QuadTree {
  insert(obj: fabric.Object) { /* ... */ }
  query(point: Point): fabric.Object[] { /* 只返回附近的对象 */ }
}

canvas.on('mouse:move', (e) => {
  const nearby = quadTree.query(e.pointer) // 只检查附近对象
  nearby.forEach(obj => {
    // ...
  })
})
```

**6. 虚拟化渲染**
```typescript
// 问题：画布上有 1000+ 个标注对象时，全部渲染会卡顿

// 优化：只渲染可见区域的对象
const viewport = canvas.viewportTransform
const visibleObjects = objects.filter(obj => {
  const bounds = obj.getBoundingRect()
  return isInViewport(bounds, viewport)
})

canvas.remove(...invisibleObjects) // 移除不可见对象
canvas.add(...visibleObjects) // 只添加可见对象
```

**R - 优化结果**：
```
- 标注响应时间：180ms → 70ms（降低 61%）
- 支持流畅操作 500+ 标注对象
- CPU 占用率降低 40%
- 内存占用降低 30%
```

---

#### 问题3：撤销/重做功能是如何实现的？

**回答思路**：

**技术方案**：
```typescript
// 1. 状态快照管理
class HistoryManager {
  private history: string[] = [] // 存储 JSON 快照
  private currentIndex: number = -1
  private maxHistory: number = 50 // 最多保存 50 个状态
  
  // 保存当前状态
  saveState(canvas: fabric.Canvas) {
    const json = JSON.stringify(canvas.toJSON(['id', 'label']))
    
    // 清除当前索引后的所有历史
    this.history = this.history.slice(0, this.currentIndex + 1)
    
    // 添加新状态
    this.history.push(json)
    
    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    } else {
      this.currentIndex++
    }
  }
  
  // 撤销
  undo(canvas: fabric.Canvas): boolean {
    if (this.currentIndex <= 0) return false
    
    this.currentIndex--
    const json = this.history[this.currentIndex]
    canvas.loadFromJSON(json, () => {
      canvas.renderAll()
    })
    return true
  }
  
  // 重做
  redo(canvas: fabric.Canvas): boolean {
    if (this.currentIndex >= this.history.length - 1) return false
    
    this.currentIndex++
    const json = this.history[this.currentIndex]
    canvas.loadFromJSON(json, () => {
      canvas.renderAll()
    })
    return true
  }
}

// 2. 监听画布变化，自动保存状态
const historyManager = new HistoryManager()

canvas.on('object:added', () => {
  historyManager.saveState(canvas)
})

canvas.on('object:modified', () => {
  historyManager.saveState(canvas)
})

canvas.on('object:removed', () => {
  historyManager.saveState(canvas)
})

// 3. 快捷键绑定
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault()
        historyManager.undo(canvas)
      }
      if (e.key === 'y') {
        e.preventDefault()
        historyManager.redo(canvas)
      }
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

**优化要点**：
```
1. 使用 JSON 序列化而非深拷贝对象（性能更好）
2. 限制历史记录数量（避免内存溢出）
3. 防抖保存（避免频繁操作时保存过多状态）
4. 只序列化必要的属性（减少 JSON 大小）
```

---

#### 问题4：数据持久化的三层存储策略是什么？

**回答思路**：

**三层存储架构**：
```
第一层：内存缓存（Map）
  ↓ （实时同步）
第二层：LocalStorage（持久化）
  ↓ （定时/手动保存）
第三层：服务端（最终存储）
```

**技术实现**：
```typescript
// 1. 内存缓存层（最快，丢失风险高）
const annotationCache = new Map<string, AnnotationData>()

// 保存到内存
const saveToMemory = (sampleId: string, data: AnnotationData) => {
  annotationCache.set(sampleId, data)
}

// 从内存读取
const loadFromMemory = (sampleId: string) => {
  return annotationCache.get(sampleId)
}

// 2. LocalStorage 层（持久化，容量限制 5-10MB）
const STORAGE_KEY_PREFIX = 'annotation_'

// 保存到 LocalStorage
const saveToLocal = (sampleId: string, data: AnnotationData) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${sampleId}`
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    // LocalStorage 满了，清理旧数据
    clearOldAnnotations()
  }
}

// 从 LocalStorage 读取
const loadFromLocal = (sampleId: string): AnnotationData | null => {
  const key = `${STORAGE_KEY_PREFIX}${sampleId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

// 3. 服务端层（最可靠，网络延迟）
const saveToServer = async (sampleId: string, data: AnnotationData) => {
  return await post('/api/annotations/save', {
    body: {
      sampleId,
      annotations: data.annotations
    }
  })
}

// 4. 统一的保存逻辑
const saveAnnotation = async (sampleId: string, data: AnnotationData) => {
  // 立即保存到内存
  saveToMemory(sampleId, data)
  
  // 立即保存到 LocalStorage
  saveToLocal(sampleId, data)
  
  // 异步保存到服务端（防抖）
  debouncedSaveToServer(sampleId, data)
}

// 5. 读取逻辑（优先级：内存 > LocalStorage > 服务端）
const loadAnnotation = async (sampleId: string): Promise<AnnotationData> => {
  // 先从内存读取
  let data = loadFromMemory(sampleId)
  if (data) return data
  
  // 再从 LocalStorage 读取
  data = loadFromLocal(sampleId)
  if (data) {
    saveToMemory(sampleId, data) // 同步到内存
    return data
  }
  
  // 最后从服务端读取
  data = await loadFromServer(sampleId)
  saveToMemory(sampleId, data)
  saveToLocal(sampleId, data)
  return data
}

// 6. 定时同步到服务端（每 30 秒）
useEffect(() => {
  const syncInterval = setInterval(() => {
    annotationCache.forEach((data, sampleId) => {
      saveToServer(sampleId, data)
    })
  }, 30000)
  
  return () => clearInterval(syncInterval)
}, [])

// 7. 页面卸载前强制保存
useEffect(() => {
  const handleBeforeUnload = () => {
    const currentData = getCurrentAnnotation()
    saveToLocal(sampleId, currentData)
    // 注意：这里无法使用异步请求，可以用 navigator.sendBeacon
    navigator.sendBeacon('/api/annotations/save', JSON.stringify(currentData))
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [])
```

**数据恢复流程**：
```
用户打开标注页面
  ↓
1. 检查内存缓存（是否已加载过）
  ↓ 没有
2. 检查 LocalStorage（上次未保存的数据）
  ↓ 没有
3. 从服务端加载（历史保存的数据）
  ↓
显示标注数据
```

**优势**：
```
- 数据丢失率降低至 0.3%
- 即使网络断开，用户仍可继续标注
- 页面刷新后数据不丢失
- 多设备间数据同步（通过服务端）
```

---

## 三、智能标注与视频追踪

### 📌 可能的面试问题

#### 问题1：智能标注工具的 API 解耦是如何实现的？

**回答思路**：

**S - 问题背景**：
"我们需要集成多种智能标注工具（魔法棒、一键标注、智能矩形），每种工具调用不同的 AI 模型 API，且未来可能会增加新工具。如果直接在组件中硬编码 API 调用，会导致代码耦合、难以维护。"

**T - 解决方案**：
"设计一套工具注册机制，将 API 调用逻辑与 UI 组件解耦。"

**A - 技术实现**：

**1. 工具注册机制**
```typescript
// types.ts
export enum ToolEnum {
  MAGIC_WAND = 'magicWand',      // 魔法棒
  ONE_CLICK = 'oneClick',        // 一键标注
  SMART_RECT = 'smartRect',      // 智能矩形
  RECT = 'rect',                 // 普通矩形
}

export interface ToolConfig {
  apiHandler?: (
    canvas: fabric.Canvas,
    options: {
      data: ConfirmToolData
      initData: AnnotationData
    }
  ) => Promise<ApiResponse>
  
  onConfirm?: (result: ApiResponse) => void
  enabled?: boolean
}

export interface ToolRegistry {
  [ToolEnum.MAGIC_WAND]?: ToolConfig
  [ToolEnum.ONE_CLICK]?: ToolConfig
  [ToolEnum.SMART_RECT]?: ToolConfig
}
```

**2. 在页面中注册工具**
```typescript
// page.tsx
<ImageAnnotator
  ref={annotatorRef}
  initData={sampleDetail}
  tools={{
    [ToolEnum.MAGIC_WAND]: {
      apiHandler: async (canvas, options) => {
        // 调用魔法棒 API
        return await getMagicWand({
          imageUrl: options.initData.downloadUrl,
          pointCoords: options.data.pointCoords,
          pointLabels: options.data.pointLabels,
        })
      }
    },
    [ToolEnum.ONE_CLICK]: {
      apiHandler: async (canvas, options) => {
        // 调用一键标注 API
        return await getOneClick({
          imageUrl: options.initData.downloadUrl,
        })
      }
    },
    [ToolEnum.SMART_RECT]: {
      apiHandler: async (canvas, options) => {
        // 调用智能矩形 API
        return await getSmartRect({
          imageUrl: options.initData.downloadUrl,
          bbox: options.data.bbox,
        })
      }
    }
  }}
/>
```

**3. 组件内部统一处理**
```typescript
// ImageAnnotator.tsx
const ImageAnnotator = ({ tools, initData }) => {
  const handleToolConfirm = async (toolType: ToolEnum, data: ConfirmToolData) => {
    const toolConfig = tools[toolType]
    
    if (!toolConfig?.apiHandler) {
      // 普通工具，直接确认
      confirmAnnotation(data)
      return
    }
    
    try {
      // 显示加载状态
      setLoading(true)
      
      // 调用 API（通过注册的 handler）
      const result = await toolConfig.apiHandler(canvas, {
        data,
        initData
      })
      
      // 处理 API 返回结果
      if (result.success) {
        // 将 AI 返回的标注数据渲染到画布
        renderAIAnnotations(result.annotations)
        
        // 回调
        toolConfig.onConfirm?.(result)
      } else {
        message.error('智能标注失败')
      }
    } catch (error) {
      message.error('API 调用失败')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      <Toolbar onToolChange={setCurrentTool} />
      <Canvas 
        tool={currentTool}
        onConfirm={handleToolConfirm}
      />
    </div>
  )
}
```

**4. 工具扩展示例**
```typescript
// 未来新增工具，只需要在 page.tsx 中注册
<ImageAnnotator
  tools={{
    // 新增：多边形智能标注
    [ToolEnum.SMART_POLYGON]: {
      apiHandler: async (canvas, options) => {
        return await getSmartPolygon({
          imageUrl: options.initData.downloadUrl,
          points: options.data.points,
        })
      }
    }
  }}
/>
```

**R - 优势**：
```
1. 组件内部不需要知道具体的 API 调用逻辑
2. 新增工具时，只需注册 handler，无需修改组件代码
3. 不同页面可以注册不同的工具集合
4. API 调用逻辑可以单独测试
5. 开发周期从 10 天缩短到 6 天
```

---

#### 问题2：视频追踪功能是如何实现的？具体流程是什么？

**回答思路**：

**功能描述**：
"视频追踪是指在视频的第一帧标注一个或多个对象后，AI 模型自动在后续帧中追踪这些对象的位置，生成完整的标注序列。"

**技术流程**：

**1. 用户操作流程**
```
1. 用户在视频第一帧绘制标注框（矩形/多边形）
2. 用户点击"开始追踪"按钮
3. 前端收集标注数据，调用追踪 API
4. 后端异步处理追踪任务，返回 taskId
5. 前端轮询任务状态，实时显示进度
6. 追踪完成后，下载追踪结果文件
7. 前端解析结果，渲染到视频播放器
```

**2. 核心代码实现**
```typescript
// 1. 开始追踪
const startTracking = async () => {
  // 获取当前帧的标注数据
  const postData = imageAnnotatorRef.current?.getPostData(false)
  
  // 构造追踪请求数据
  const trackingData = {
    datasetId: params.datasetId,
    sampleId: params.sampleId,
    annotations: postData.annotations.map(ann => ({
      label: ann.label,
      points: ann.points,  // 标注框坐标
      trackId: generateTrackId()  // 分配追踪 ID
    }))
  }
  
  // 调用追踪 API
  const res = await getTrackTaskId(trackingData)
  
  if (res.taskId) {
    // 开始轮询任务状态
    pollTrackingStatus(res.taskId)
  }
}

// 2. 轮询任务状态
const pollTrackingStatus = async (taskId: string) => {
  const maxAttempts = 60  // 最多轮询 60 次
  let attempts = 0
  
  const poll = async () => {
    attempts++
    
    const status = await getTrackTaskStatus(taskId)
    
    if (status.state === 'COMPLETED') {
      // 追踪完成，下载结果
      downloadTrackingResult(status.resultUrl)
    } else if (status.state === 'FAILED') {
      message.error('追踪失败')
    } else if (attempts < maxAttempts) {
      // 继续轮询
      setTimeout(poll, 2000)  // 每 2 秒轮询一次
    } else {
      message.error('追踪超时')
    }
  }
  
  poll()
}

// 3. 下载并解析追踪结果
const downloadTrackingResult = async (url: string) => {
  const response = await fetch(url)
  const result = await response.json()
  
  // 结果格式：{ frames: { "1": [...], "2": [...], ... } }
  // 将结果存储到全局状态
  result.frames.forEach((frameData, frameId) => {
    annotationsMap.current.set(frameId, {
      frameId: frameId,
      annotations: frameData.annotations
    })
  })
  
  // 刷新视频播放器
  imageFramePlayerRef.current?.refreshAnnotation()
  
  message.success('追踪完成')
}

// 4. 视频播放器渲染追踪结果
const handleFrame = (frameId: number) => {
  // 获取当前帧的标注数据
  const frameAnnotations = annotationsMap.current.get(frameId)
  
  // 渲染到视频播放器上层的 SVG/Canvas
  if (frameAnnotations) {
    setAnnotations(frameAnnotations.annotations)
  }
}
```

**3. 视频帧管理**
```typescript
// 帧数据结构
interface AnnotationsItem {
  frameId: number
  annotations: Annotation[]
}

// 全局帧数据 Map
const annotationsMap = useRef<Map<string, AnnotationsItem>>(new Map())

// 预加载策略：当前帧前后 24 帧
const getImages = async (start: number, end: number) => {
  const size = end - start
  const params = {
    page: Math.floor(start / size) + 1,
    size: size,
  }
  
  const response = await getFrameList(datasetId, sampleId, params)
  
  return {
    images: response.items.map(item => ({
      url: item.downloadUrl,
      frameId: item.frameId
    }))
  }
}
```

**4. 优化要点**
```typescript
// 优化1：帧预加载（减少加载等待）
const FramePlayer = {
  totalFramesToFetch: 24,  // 预加载 24 帧
  onFrame: (frameId) => {
    // 提前加载下一批帧
    if (frameId % 12 === 0) {
      prefetchNextFrames(frameId + 12, frameId + 36)
    }
  }
}

// 优化2：标注数据缓存
const frameCache = new Map<number, AnnotationsItem>()

const getFrameAnnotations = (frameId: number) => {
  if (frameCache.has(frameId)) {
    return frameCache.get(frameId)  // 从缓存读取
  }
  
  const data = loadFromServer(frameId)
  frameCache.set(frameId, data)  // 缓存
  return data
}

// 优化3：虚拟化渲染（只渲染可见标注）
const renderAnnotations = (annotations: Annotation[]) => {
  const viewport = getViewport()
  
  const visibleAnnotations = annotations.filter(ann => {
    return isInViewport(ann.bbox, viewport)
  })
  
  // 只渲染可见的标注
  renderToCanvas(visibleAnnotations)
}
```

**R - 结果**：
```
- 支持同时追踪 4 个对象
- 追踪准确率 90% 以上
- 视频标注流畅度提升 50%
- 视频标注效率提升 60%（vs 手动逐帧标注）
```

---

## 四、前端性能优化

### 📌 可能的面试问题

#### 问题1：HTTP 请求从数千个减少到 20-30 个，具体是怎么做的？

**回答思路（重点）**：

**S - 问题背景**：
"项目初期部署后，首次加载页面时会发起数千个 HTTP 请求，主要是因为 Vite 默认配置会将每个模块都打包成单独的文件。这导致首屏加载时间长达 10+ 秒，用户体验极差。"

**问题分析**：
```
1. 依赖库文件分散：
   - react, react-dom, react-router 等每个都是独立文件
   - @radix-ui 的 50+ 个组件每个都是独立文件
   - lucide-react 的 1000+ 个图标每个都是独立请求

2. 业务代码过度分割：
   - 每个组件都是独立的 .js 文件
   - 每个工具函数都是独立文件

3. 浏览器并发限制：
   - Chrome 对同一域名最多并发 6 个请求
   - 数千个请求需要排队加载
```

**A - 优化方案**：

**1. 配置 Vite 的代码分割策略**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 1. React 核心库打包到一起
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router')) {
            return 'react-vendor'
          }
          
          // 2. UI 组件库打包到一起
          if (id.includes('node_modules/@radix-ui') ||
              id.includes('node_modules/lucide-react')) {
            return 'ui-vendor'
          }
          
          // 3. 数据请求库
          if (id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/axios')) {
            return 'data-vendor'
          }
          
          // 4. 图表库
          if (id.includes('node_modules/echarts') ||
              id.includes('node_modules/fabric')) {
            return 'chart-vendor'
          }
          
          // 5. AI SDK
          if (id.includes('node_modules/ai') ||
              id.includes('node_modules/@ai-sdk')) {
            return 'ai-vendor'
          }
          
          // 6. 工具库
          if (id.includes('node_modules/lodash') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/zustand')) {
            return 'utils-vendor'
          }
          
          // 7. 国际化
          if (id.includes('node_modules/next-intl')) {
            return 'i18n-vendor'
          }
          
          // 8. 其他第三方库
          if (id.includes('node_modules')) {
            return 'other-vendor'
          }
          
          // 9. 业务代码按模块分组
          if (id.includes('/app/(commonLayout)/data-service')) {
            return 'data-service'
          }
          if (id.includes('/app/(commonLayout)/model-square')) {
            return 'model-square'
          }
          if (id.includes('/app/(commonLayout)/permission')) {
            return 'permission'
          }
          
          // 10. 公共组件
          if (id.includes('/components/')) {
            return 'components'
          }
        },
        
        // 配置入口 chunk 名称
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // 调整 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    
    // 关闭 source map（生产环境）
    sourcemap: false,
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 移除 console
        drop_debugger: true,
      }
    }
  }
})
```

**2. 依赖预构建配置**
```typescript
export default defineConfig({
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      // ... 列出所有需要预构建的依赖
    ],
    // 强制预构建
    force: true
  }
})
```

**3. 资源内联配置**
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        // 小于 4KB 的文件自动内联
        {
          name: 'inline-small-assets',
          generateBundle(_, bundle) {
            Object.keys(bundle).forEach(key => {
              const file = bundle[key]
              if (file.type === 'asset' && file.source.length < 4096) {
                // 转换为 base64 内联
                delete bundle[key]
              }
            })
          }
        }
      ]
    }
  }
})
```

**4. 路由懒加载**
```typescript
// 不要这样（全部打包）
import DatasetPage from './dataset/page'
import ModelPage from './model/page'

// 应该这样（按需加载）
const DatasetPage = lazy(() => import('./dataset/page'))
const ModelPage = lazy(() => import('./model/page'))

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dataset" element={<DatasetPage />} />
    <Route path="/model" element={<ModelPage />} />
  </Routes>
</Suspense>
```

**5. 动态 import**
```typescript
// 不要这样
import { HeavyComponent } from './heavy-component'

// 应该这样
const HeavyComponent = lazy(() => import('./heavy-component'))

// 或者条件加载
if (needFeature) {
  const module = await import('./feature-module')
  module.init()
}
```

**R - 优化结果**：
```
优化前：
- HTTP 请求数：2000-3000 个
- 首屏加载时间：10-15 秒
- Bundle 总大小：8-10 MB
- FCP (First Contentful Paint)：5-8 秒

优化后：
- HTTP 请求数：20-30 个（减少 90%+）
- 首屏加载时间：2-3 秒（缩短 70%+）
- Bundle 总大小：5-6 MB（减少 40%）
- FCP：1-2 秒（缩短 75%+）

具体 chunk 分布：
- react-vendor.js: 500KB
- ui-vendor.js: 800KB
- data-vendor.js: 300KB
- chart-vendor.js: 1.2MB
- ai-vendor.js: 600KB
- components.js: 400KB
- data-service.js: 350KB
- model-square.js: 400KB
- ...
```

---

#### 问题2：除了代码分割，还做了哪些性能优化？

**补充优化措施**：

**1. 长期缓存策略**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'  // 缓存 1 年
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}
```

**2. 图片优化**
```typescript
// 使用 Next.js Image 组件
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={100}
  alt="Logo"
  loading="lazy"  // 懒加载
  placeholder="blur"  // 模糊占位符
/>

// 图片压缩（在上传时）
import Compressor from 'compressorjs'

const compressImage = (file: File) => {
  return new Promise((resolve) => {
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 1920,
      success: resolve
    })
  })
}
```

**3. 虚拟滚动**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const VirtualList = ({ items }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,  // 每项高度
    overscan: 5  // 预渲染 5 个
  })
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**4. React Query 缓存优化**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 分钟内不重新请求
      cacheTime: 10 * 60 * 1000,  // 缓存保留 10 分钟
      refetchOnWindowFocus: false,  // 窗口聚焦不刷新
      retry: 1  // 失败重试 1 次
    }
  }
})
```

**5. 预加载关键资源**
```typescript
// 预加载下一个页面的代码
<Link
  href="/dataset"
  onMouseEnter={() => {
    // 鼠标悬停时预加载
    router.prefetch('/dataset')
  }}
>
  数据集
</Link>

// 预加载关键 API
useEffect(() => {
  queryClient.prefetchQuery(['datasets'], fetchDatasets)
}, [])
```

---

## 五、数据管理与交互优化

### 📌 可能的面试问题

#### 问题1：React Query 的轮询机制是如何实现的？为什么列表刷新延迟降低 70%？

**回答思路**：

**S - 业务需求**：
"数据集列表页需要实时显示数据集的导入进度、处理状态等信息。这些状态由后端异步任务更新，前端需要定期刷新列表。"

**传统方案的问题**：
```typescript
// 问题方案：手动轮询
useEffect(() => {
  const timer = setInterval(() => {
    fetchDatasets().then(setDatasets)  // 每次都重新请求
  }, 5000)  // 每 5 秒刷新一次
  
  return () => clearInterval(timer)
}, [])

// 缺点：
// 1. 页面切换后仍在轮询（浪费资源）
// 2. 多个组件重复轮询（重复请求）
// 3. 无缓存，每次都重新渲染（闪烁）
// 4. 网络慢时会堆积请求
```

**A - React Query 优化方案**：
```typescript
// 1. 启用轮询
const { data: datasetList, isLoading } = useQuery({
  queryKey: ['datasets', { page, size, search }],
  queryFn: () => fetchDatasets({ page, size, search }),
  
  // 轮询配置
  refetchInterval: 5000,  // 每 5 秒刷新
  refetchIntervalInBackground: false,  // 页面不可见时停止轮询
  
  // 缓存配置
  staleTime: 0,  // 立即过期，允许频繁刷新
  cacheTime: 10 * 60 * 1000,  // 缓存保留 10 分钟
  
  // 智能刷新
  refetchOnMount: true,  // 组件挂载时刷新
  refetchOnWindowFocus: true,  // 窗口聚焦时刷新
  
  // 保留上次数据
  keepPreviousData: true  // 刷新时保留旧数据，避免闪烁
})

// 2. 条件轮询（只在有进行中的任务时轮询）
const { data: datasetList } = useQuery({
  queryKey: ['datasets'],
  queryFn: fetchDatasets,
  
  refetchInterval: (data) => {
    // 如果有进行中的任务，5 秒刷新一次
    const hasProcessing = data?.items?.some(
      item => item.status === 'PROCESSING'
    )
    return hasProcessing ? 5000 : false  // false 停止轮询
  }
})

// 3. 智能合并请求
// React Query 会自动合并同一个 queryKey 的多次请求
// 例如：3 个组件同时请求 ['datasets']，只会发起 1 个 HTTP 请求

// 4. 后台刷新（Background Refetch）
// 刷新时保留旧数据，新数据准备好后再替换
// 用户感知不到刷新过程，没有"闪烁"

// 5. 乐观更新（Optimistic Update）
const { mutate: updateDataset } = useMutation({
  mutationFn: updateDatasetApi,
  
  onMutate: async (newData) => {
    // 取消进行中的轮询
    await queryClient.cancelQueries(['datasets'])
    
    // 保存旧数据
    const previousData = queryClient.getQueryData(['datasets'])
    
    // 立即更新缓存（乐观更新）
    queryClient.setQueryData(['datasets'], (old) => {
      return {
        ...old,
        items: old.items.map(item =>
          item.id === newData.id ? { ...item, ...newData } : item
        )
      }
    })
    
    return { previousData }
  },
  
  onError: (err, newData, context) => {
    // 失败时回滚
    queryClient.setQueryData(['datasets'], context.previousData)
  },
  
  onSettled: () => {
    // 最终刷新
    queryClient.invalidateQueries(['datasets'])
  }
})
```

**性能对比**：
```
传统方案：
- 每次刷新：重新请求 → 等待响应 → 解析数据 → 重新渲染
- 刷新延迟：500-800ms（网络 + 渲染）
- 用户体验：明显的"闪烁"

React Query 方案：
- 后台刷新：保留旧数据 → 后台请求 → 新数据准备好后无缝替换
- 刷新延迟：100-200ms（只有渲染时间，无白屏）
- 用户体验：无感知刷新
- 延迟降低：70%
```

---

#### 问题2：如何支持 1000+ 条数据的流畅展示？

**优化方案**：

**1. 虚拟滚动（关键）**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const DataTable = ({ data }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,  // 每行高度 60px
    overscan: 10  // 预渲染上下各 10 行
  })
  
  return (
    <div
      ref={parentRef}
      style={{
        height: '600px',
        overflow: 'auto'
      }}
    >
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => {
          const row = data[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <DataRow data={row} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 性能对比：
// 1000 条数据：
// - 全部渲染：1000 个 DOM 节点，渲染时间 2-3 秒
// - 虚拟滚动：20-30 个 DOM 节点，渲染时间 50-100ms
```

**2. 分页加载**
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['datasets'],
  queryFn: ({ pageParam = 1 }) => fetchDatasets({ page: pageParam, size: 50 }),
  getNextPageParam: (lastPage) => {
    return lastPage.hasMore ? lastPage.page + 1 : undefined
  }
})

// 滚动到底部自动加载更多
useEffect(() => {
  const handleScroll = () => {
    if (isScrolledToBottom() && hasNextPage) {
      fetchNextPage()
    }
  }
  
  window.addEventListener('scroll', throttle(handleScroll, 200))
  return () => window.removeEventListener('scroll', handleScroll)
}, [hasNextPage])
```

**3. 懒加载图片**
```typescript
<img
  src={item.thumbnail}
  loading="lazy"  // 浏览器原生懒加载
  onError={(e) => {
    e.target.src = '/placeholder.png'  // 加载失败时显示占位图
  }}
/>
```

**4. 防抖搜索**
```typescript
import { useDebouncedValue } from 'use-debounce'

const [search, setSearch] = useState('')
const [debouncedSearch] = useDebouncedValue(search, 500)

// 只在用户停止输入 500ms 后才请求
const { data } = useQuery({
  queryKey: ['datasets', debouncedSearch],
  queryFn: () => fetchDatasets({ search: debouncedSearch })
})
```

**5. Memoization**
```typescript
// 避免不必要的重渲染
const DataRow = memo(({ data }) => {
  return <div>{data.name}</div>
}, (prevProps, nextProps) => {
  // 只有 data.id 变化时才重新渲染
  return prevProps.data.id === nextProps.data.id
})

// 缓存计算结果
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name))
}, [data])  // 只在 data 变化时重新排序
```

---

## 六、通用面试问题

### 📌 项目难点与挑战

#### 问题：在这个项目中，你遇到的最大挑战是什么？如何解决的？

**回答示例（STAR）**：

**S - 背景**：
"最大的挑战是标注工具的性能优化。初期版本在标注大量对象时（100+ 个标注框），会出现明显卡顿，响应时间达到 180ms，用户反馈体验很差。"

**T - 任务**：
"需要将响应时间降低到 100ms 以内，同时支持 500+ 个标注对象的流畅操作。"

**A - 行动**：
```
1. **问题定位**：
   - 使用 Chrome DevTools Profiler 分析性能瓶颈
   - 发现主要问题：
     a) 鼠标移动事件触发频率过高
     b) 每次修改都触发全画布重绘
     c) 对象边界检测计算量大

2. **优化方案**：
   a) 事件节流：将 mouse:move 事件从每帧触发改为每 16ms 触发一次
   b) 批量更新：关闭 Fabric.js 的自动渲染，手动批量 renderAll
   c) 空间索引：使用四叉树优化对象查找，避免遍历所有对象
   d) 双 Canvas：底图和标注层分离，减少重绘范围
   e) 对象池：复用标注对象，减少创建/销毁开销

3. **效果验证**：
   - 使用 Chrome DevTools 测量优化前后的性能指标
   - 在测试环境进行压力测试（500+ 对象）
```

**R - 结果**：
```
- 响应时间从 180ms 降至 70ms（降低 61%）
- 支持 500+ 对象流畅操作
- CPU 占用率降低 40%
- 用户满意度从 60% 提升到 95%
```

---

### 📌 技术选型

#### 问题：为什么选择 Next.js 而不是 CRA（Create React App）？

**回答要点**：

**Next.js 的优势**：
```
1. **SSR/SSG 支持**：
   - 首屏性能更好（服务端渲染）
   - SEO 友好（虽然我们是内部平台，但有利于搜索）

2. **文件路由系统**：
   - 不需要手动配置路由
   - 支持动态路由（[id]）、路由组（(group)）
   - 自动代码分割（每个页面是独立的 chunk）

3. **API Routes**：
   - 可以在前端项目中写后端接口
   - 我们用来做代理（/api/chat）、文件上传等

4. **性能优化**：
   - 自动图片优化（next/image）
   - 自动字体优化（next/font）
   - 自动预加载（<Link>）

5. **生产就绪**：
   - 内置 TypeScript 支持
   - 内置 ESLint 配置
   - 生产环境优化配置

6. **生态丰富**：
   - 与 Vercel 深度集成
   - 大量优质插件（next-intl、next-themes）
```

**项目中的实际应用**：
```typescript
// 1. 文件路由
app/
  (commonLayout)/
    dataset/
      page.tsx  // 自动映射到 /dataset
      [id]/
        page.tsx  // 自动映射到 /dataset/:id

// 2. API Routes
app/api/chat/route.ts  // 自动映射到 /api/chat

export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = await streamText({ ... })
  return result.toDataStreamResponse()
}

// 3. 服务端组件
// page.tsx（服务端组件，可以直接查询数据库）
async function Page() {
  const data = await fetchDataFromDB()
  return <ClientComponent data={data} />
}

// 4. Middleware（路由拦截）
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  if (!token) {
    return NextResponse.redirect('/login')
  }
}
```

---

## 七、面试技巧

### 🎯 回答技巧总结

**1. 使用 STAR 法则**
- S (Situation): 1-2 句话说明背景
- T (Task): 1 句话说明任务目标
- A (Action): 2-3 分钟详细说明技术方案
- R (Result): 1-2 句话量化结果

**2. 层次分明**
- 先说结论（What）
- 再说原因（Why）
- 最后说实现（How）

**3. 主动展示深度**
- 不要等面试官追问，主动说出关键细节
- 例如："为了解决 XXX 问题，我做了 3 个优化：第一...第二...第三..."

**4. 准备代码片段**
- 关键技术点准备代码示例
- 可以提前写在笔记本/iPad 上，面试时展示

**5. 强调业务价值**
- 不要只说技术，要说对业务的影响
- 例如："通过这个优化，用户投诉率降低了 80%"

**6. 诚实回答**
- 不懂的不要装懂
- 可以说："这个我了解不深，但我知道大概原理是..."

---

## 八、补充：其他可能的问题

### 📌 团队协作

#### 问题：你是如何与后端配合的？

**回答要点**：
```
1. **接口文档**：
   - 使用 Swagger/Apifox 定义 API 接口
   - 前后端共同确认字段类型、错误码

2. **Mock 数据**：
   - 后端接口未完成时，使用 Mock 数据开发
   - 使用 MSW (Mock Service Worker) 模拟 API

3. **联调流程**：
   - 后端提供测试环境接口
   - 前端通过 proxy 代理请求到测试环境
   - 发现问题及时沟通修改

4. **错误处理**：
   - 统一的错误码规范
   - 前端根据错误码显示对应提示
```

---

### 📌 代码质量

#### 问题：你们如何保证代码质量？

**回答要点**：
```
1. **代码规范**：
   - ESLint + Prettier 自动格式化
   - Husky + lint-staged 提交前检查
   - TypeScript 强类型约束

2. **Code Review**：
   - 所有代码必须经过 Code Review
   - 使用 GitLab/GitHub 的 MR/PR 流程

3. **单元测试**：
   - 关键工具函数编写单元测试
   - 使用 Jest + React Testing Library
   - 覆盖率要求 80% 以上

4. **组件文档**：
   - 关键组件编写 README
   - 使用 JSDoc 注释
```

---

### 📌 持续学习

#### 问题：你最近在学习什么新技术？

**回答思路**：
```
可以结合简历中的 AI 工具经验：

"最近在深入学习 AI 与前端的结合：

1. **AI SDK 的使用**：
   - Vercel AI SDK、LangChain.js
   - 流式对话的实现原理
   - 多模态交互（文本 + 图片）

2. **性能优化**：
   - React Compiler（即将发布）
   - Server Components 的最佳实践

3. **工程化**：
   - Turbo（monorepo 管理）
   - Biome（新一代 linter/formatter）

同时也在关注 AI 辅助开发工具，如 Cursor、GitHub Copilot，
提升开发效率的同时，思考如何将 AI 能力集成到产品中。"
```

---

---

## 九、微前端架构（补充）

### 📌 可能的面试问题

#### 问题1：你们的平台采用微前端架构，具体是如何实现的？

**回答思路（STAR）**：

**S - 背景**：
"我们的 AI 平台需要集成多个子应用（AgentFactory、数据标注、模型训练等），每个子应用由不同团队维护。为了实现独立开发、独立部署，我们采用了微前端架构。"

**T - 任务**：
"我参与了微前端架构的设计和实施，需要确保各个子应用能够无缝集成到主平台中。"

**A - 技术方案**：

**1. 架构设计**
```
主应用（Main App）
  ├── 公共组件（Header、Sidebar、Footer）
  ├── 路由分发
  └── 子应用容器
      ├── AgentFactory（独立部署）
      ├── 数据标注系统（独立部署）
      ├── 模型训练平台（独立部署）
      └── 其他子应用...
```

**2. 技术选型对比**
```typescript
// 方案 A：iframe（未采用）
// 优点：完全隔离
// 缺点：样式不统一、通信复杂、性能差

// 方案 B：qiankun（我们的选择）
// 优点：
// - 样式隔离（Shadow DOM）
// - 生命周期管理
// - 路由劫持
// - 应用通信（全局状态）
```

**3. 主应用配置**
```typescript
// main-app/src/micro-apps.ts
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'agent-factory',
    entry: '//localhost:3001',  // 子应用地址
    container: '#subapp-viewport',  // 挂载容器
    activeRule: '/agent-factory',  // 激活路由
    props: {
      // 传递给子应用的数据
      token: getToken(),
      userInfo: getUserInfo(),
      basePath: '/agent-factory'
    }
  },
  {
    name: 'annotation',
    entry: '//localhost:3002',
    container: '#subapp-viewport',
    activeRule: '/annotation',
    props: {
      token: getToken(),
      apiBase: '/api/annotation'
    }
  }
])

// 启动 qiankun
start({
  sandbox: {
    experimentalStyleIsolation: true  // 样式隔离
  }
})
```

**4. 子应用配置**
```typescript
// agent-factory/src/public-path.ts
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}

// agent-factory/src/main.tsx
let instance: any = null

// 导出生命周期钩子
export async function bootstrap() {
  console.log('子应用 bootstrap')
}

export async function mount(props: any) {
  console.log('子应用 mount', props)
  
  // 接收主应用传递的数据
  const { token, userInfo, container } = props
  
  // 挂载 React 应用
  instance = ReactDOM.createRoot(
    container ? container.querySelector('#root') : document.getElementById('root')
  )
  
  instance.render(<App token={token} userInfo={userInfo} />)
}

export async function unmount(props: any) {
  console.log('子应用 unmount')
  instance?.unmount()
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  mount({})
}
```

**5. 应用间通信**
```typescript
// 主应用：发送消息
import { initGlobalState } from 'qiankun'

const actions = initGlobalState({
  user: userInfo,
  token: token
})

actions.onGlobalStateChange((state, prev) => {
  console.log('主应用监听到状态变化', state)
})

actions.setGlobalState({ user: newUserInfo })

// 子应用：接收消息
export async function mount(props: any) {
  props.onGlobalStateChange((state, prev) => {
    console.log('子应用监听到状态变化', state)
    updateUserInfo(state.user)
  })
  
  // 子应用修改全局状态
  props.setGlobalState({ ... })
}
```

**6. 路由同步**
```typescript
// 主应用路由配置
<Routes>
  <Route path="/dataset" element={<DatasetPage />} />
  <Route path="/model" element={<ModelPage />} />
  
  {/* 微前端子应用路由 */}
  <Route path="/agent-factory/*" element={<div id="subapp-viewport" />} />
  <Route path="/annotation/*" element={<div id="subapp-viewport" />} />
</Routes>

// 子应用内部路由（BrowserRouter）
<BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? '/agent-factory' : '/'}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/create" element={<Create />} />
  </Routes>
</BrowserRouter>
```

**7. 样式隔离**
```typescript
// 方案1：CSS Modules
import styles from './App.module.css'
<div className={styles.container}>...</div>

// 方案2：CSS-in-JS
import styled from 'styled-components'
const Container = styled.div`...`

// 方案3：命名空间
.agent-factory-container { ... }
.annotation-container { ... }
```

**8. 公共依赖共享**
```typescript
// webpack.config.js（主应用和子应用都配置）
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'react-router-dom': 'ReactRouterDOM'
  }
}

// index.html（主应用）
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>

// 子应用直接使用，不打包
```

**R - 结果**：
```
- 实现了 3+ 个子应用的独立开发和部署
- 各团队可以独立选择技术栈
- 主应用体积减小 40%
- 子应用独立部署时间从 30 分钟缩短到 5 分钟
- 支持子应用独立调试和独立运行
```

**关键问题处理**：
```
1. 样式冲突：使用 Shadow DOM + CSS Modules
2. 路由冲突：子应用使用 basename 隔离
3. 全局变量污染：qiankun 的 JS 沙箱机制
4. 性能问题：公共依赖 CDN 加载 + 预加载
```

---

#### 问题2：微前端架构的优缺点是什么？

**回答要点**：

**优点**：
```
1. **技术栈无关**：各子应用可以选择不同的框架
2. **独立开发部署**：互不影响，提升开发效率
3. **增量升级**：可以逐步升级老项目
4. **团队自治**：各团队负责各自的子应用
5. **故障隔离**：一个子应用崩溃不影响其他应用
```

**缺点**：
```
1. **首屏加载慢**：需要加载主应用 + 子应用
2. **样式冲突**：需要额外处理 CSS 隔离
3. **应用间通信复杂**：需要设计通信机制
4. **调试困难**：涉及多个应用，问题定位困难
5. **重复依赖**：可能导致 React 等库重复加载
```

**我们的优化方案**：
```
1. 首屏加载：预加载关键子应用
2. 样式冲突：强制使用 CSS Modules
3. 应用通信：使用 qiankun 的全局状态管理
4. 调试困难：统一的错误上报和日志系统
5. 重复依赖：公共依赖提取到 CDN
```

---

## 十、AI 智能助手研发（补充）

### 📌 可能的面试问题

#### 问题1：AI 智能助手的技术架构是什么？如何实现流式对话？

**回答思路（STAR）**：

**S - 背景**：
"平台需要集成 AI 智能助手，支持多模态交互（文本 + 图片）、流式对话、附件上传等功能，类似 ChatGPT 的交互体验。"

**T - 任务**：
"我负责 AI 智能助手的前端开发，需要实现流式对话、实时状态更新、多模态交互等功能。"

**A - 技术实现**：

**1. 技术栈选择**
```typescript
// 使用 Vercel AI SDK
import { useChat } from '@ai-sdk/react'
import { streamText } from 'ai'

// 为什么选择 AI SDK：
// 1. 开箱即用的 React Hooks
// 2. 自动处理流式响应
// 3. 内置重试、错误处理
// 4. 支持多种 LLM（OpenAI、Claude、本地模型）
```

**2. 流式对话实现**
```typescript
// ========== 前端实现 ==========
// components/Chat.tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

export default function Chat() {
  const {
    messages,           // 消息列表
    input,             // 输入框内容
    handleInputChange, // 输入框变化
    handleSubmit,      // 提交消息
    isLoading,         // 加载状态
    error,             // 错误信息
    reload,            // 重新生成
    stop               // 停止生成
  } = useChat({
    api: '/api/chat',  // API 端点
    initialMessages: [],
    onError: (error) => {
      console.error('Chat error:', error)
    },
    onFinish: (message) => {
      console.log('Message finished:', message)
    }
  })

  return (
    <div className="chat-container">
      {/* 消息列表 */}
      <div className="messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role}`}
          >
            {message.role === 'user' ? (
              <div className="user-message">
                <Avatar />
                <div className="content">{message.content}</div>
              </div>
            ) : (
              <div className="assistant-message">
                <AIAvatar />
                <div className="content">
                  {/* 支持 Markdown 渲染 */}
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* 加载状态 */}
        {isLoading && (
          <div className="loading">
            <Spinner />
            <span>AI 正在思考...</span>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="input-form">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        
        {isLoading ? (
          <button type="button" onClick={stop}>停止</button>
        ) : (
          <button type="submit">发送</button>
        )}
      </form>
    </div>
  )
}


// ========== 后端 API 实现 ==========
// app/api/chat/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    // 解析请求体
    const { messages } = await req.json()

    // 调用 LLM
    const result = await streamText({
      model: openai('gpt-4-turbo'),  // 或者其他模型
      messages: messages,
      temperature: 0.7,
      maxTokens: 2000,
      
      // 流式回调
      onChunk: ({ chunk }) => {
        console.log('Received chunk:', chunk)
      },
      
      onFinish: ({ text, finishReason }) => {
        console.log('Finished:', finishReason)
      }
    })

    // 返回流式响应
    return result.toDataStreamResponse()
    
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}


// ========== 流式响应原理 ==========
/*
1. 客户端发送 POST 请求到 /api/chat
2. 服务端调用 LLM API（如 OpenAI）
3. LLM 返回 Server-Sent Events (SSE) 流
4. 服务端将 SSE 流转发给客户端
5. 客户端监听 SSE 事件，实时更新 UI

数据格式：
data: {"type":"text","text":"我"}
data: {"type":"text","text":"是"}
data: {"type":"text","text":"AI"}
data: {"type":"text","text":"助手"}
data: [DONE]
*/
```

**3. 多模态交互（文本 + 图片）**
```typescript
// ========== 图片上传 ==========
'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

export default function MultimodalChat() {
  const { messages, append, isLoading } = useChat({
    api: '/api/chat'
  })
  
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  const handleSend = async () => {
    // 1. 上传图片到 CDN/OSS
    const imageUrls = await Promise.all(
      selectedImages.map(file => uploadImage(file))
    )

    // 2. 构造多模态消息
    await append({
      role: 'user',
      content: [
        { type: 'text', text: '这张图片是什么？' },
        { type: 'image', image: imageUrls[0] }
      ]
    })

    setSelectedImages([])
  }

  return (
    <div>
      {/* 图片选择 */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
      />

      {/* 图片预览 */}
      <div className="preview">
        {selectedImages.map((file, i) => (
          <img key={i} src={URL.createObjectURL(file)} alt="" />
        ))}
      </div>

      <button onClick={handleSend} disabled={isLoading}>
        发送
      </button>
    </div>
  )
}


// ========== 后端处理多模态 ==========
// app/api/chat/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai('gpt-4-vision-preview'),  // 支持视觉的模型
    messages: messages.map(msg => {
      if (Array.isArray(msg.content)) {
        // 多模态消息
        return {
          role: msg.role,
          content: msg.content.map(part => {
            if (part.type === 'text') {
              return { type: 'text', text: part.text }
            } else if (part.type === 'image') {
              return { type: 'image_url', image_url: { url: part.image } }
            }
          })
        }
      } else {
        // 纯文本消息
        return msg
      }
    })
  })

  return result.toDataStreamResponse()
}
```

**4. 附件上传与处理**
```typescript
// ========== 文件上传 ==========
const handleFileUpload = async (files: File[]) => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  // 上传到服务器
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })

  const { urls } = await response.json()
  
  // 发送包含附件的消息
  await append({
    role: 'user',
    content: [
      { type: 'text', text: '请分析这些文件' },
      ...urls.map(url => ({ type: 'file', url }))
    ]
  })
}


// ========== 后端文件处理 ==========
// app/api/upload/route.ts
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  const urls = await Promise.all(
    files.map(async (file) => {
      // 保存到本地或上传到 OSS
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const path = join('/tmp', file.name)
      await writeFile(path, buffer)

      // 返回可访问的 URL
      return `/uploads/${file.name}`
    })
  )

  return Response.json({ urls })
}
```

**5. 实时状态更新**
```typescript
// ========== 打字机效果 ==========
const TypewriterMessage = ({ content }: { content: string }) => {
  const [displayedContent, setDisplayedContent] = useState('')

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < content.length) {
        setDisplayedContent(content.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 50)  // 每 50ms 显示一个字符

    return () => clearInterval(timer)
  }, [content])

  return <div>{displayedContent}</div>
}


// ========== 实时滚动到底部 ==========
const ChatContainer = ({ messages }: { messages: Message[] }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 自动滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="messages">
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      <div ref={messagesEndRef} />
    </div>
  )
}
```

**R - 结果**：
```
- 实现了类 ChatGPT 的流式对话体验
- 支持文本 + 图片的多模态交互
- 支持附件上传（PDF、Word、Excel 等）
- 响应速度：首字延迟 < 500ms
- 用户满意度：92%
```

**技术亮点**：
```
1. Server-Sent Events (SSE) 实现流式响应
2. 多模态消息处理（文本 + 图片 + 文件）
3. 实时状态更新（打字机效果）
4. 错误处理与重试机制
5. 长连接管理与超时处理
```

---

#### 问题2：如何处理 AI 响应的错误和超时？

**回答要点**：

**1. 错误处理**
```typescript
const { messages, error, reload } = useChat({
  api: '/api/chat',
  
  onError: (error) => {
    // 根据错误类型显示不同提示
    if (error.message.includes('timeout')) {
      toast.error('请求超时，请重试')
    } else if (error.message.includes('429')) {
      toast.error('请求过于频繁，请稍后再试')
    } else if (error.message.includes('401')) {
      toast.error('未登录，请先登录')
      router.push('/login')
    } else {
      toast.error('AI 服务异常，请稍后再试')
    }
  }
})

// 显示错误消息
{error && (
  <div className="error-message">
    <span>{error.message}</span>
    <button onClick={reload}>重试</button>
  </div>
)}
```

**2. 超时处理**
```typescript
// 后端设置超时
export async function POST(req: Request) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)  // 30 秒超时

  try {
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages: messages,
      abortSignal: controller.signal  // 传递 abort signal
    })

    clearTimeout(timeoutId)
    return result.toDataStreamResponse()
    
  } catch (error) {
    if (error.name === 'AbortError') {
      return new Response('Request timeout', { status: 504 })
    }
    throw error
  }
}
```

**3. 重试机制**
```typescript
const { messages, reload, stop } = useChat({
  api: '/api/chat',
  
  // 自动重试配置
  onError: async (error) => {
    if (shouldRetry(error)) {
      await sleep(1000)  // 等待 1 秒
      reload()  // 重新发送
    }
  }
})

const shouldRetry = (error: Error): boolean => {
  // 只重试网络错误和超时，不重试业务错误
  return error.message.includes('timeout') ||
         error.message.includes('network')
}
```

**4. 流断开恢复**
```typescript
const [lastMessageId, setLastMessageId] = useState<string | null>(null)

const { append } = useChat({
  api: '/api/chat',
  
  onFinish: (message) => {
    setLastMessageId(message.id)
  },
  
  onError: (error) => {
    // 如果流断开，从上一条消息继续
    if (lastMessageId) {
      resumeFromMessage(lastMessageId)
    }
  }
})
```

---

## 十一、Zustand 状态管理（补充）

### 📌 可能的面试问题

#### 问题：为什么选择 Zustand 而不是 Redux？

**回答要点**：

**Zustand 的优势**：
```typescript
// 1. 极简 API
import { create } from 'zustand'

// Redux 需要：action、reducer、dispatch
// Zustand 只需要：
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}))

// 使用
function Counter() {
  const { count, increment } = useStore()
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+1</button>
    </div>
  )
}


// 2. 无需 Provider
// Redux 需要 <Provider store={store}>
// Zustand 不需要，直接使用


// 3. 性能更好（选择性订阅）
// Redux：组件会在整个 state 变化时重新渲染
// Zustand：只在订阅的部分变化时重新渲染
const count = useStore((state) => state.count)  // 只订阅 count


// 4. 支持中间件
import { devtools, persist } from 'zustand/middleware'

const useStore = create(
  devtools(
    persist(
      (set) => ({ ... }),
      { name: 'my-storage' }  // 持久化到 localStorage
    )
  )
)


// 5. TypeScript 支持更好
interface StoreState {
  count: number
  increment: () => void
}

const useStore = create<StoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))


// 6. 异步支持
const useStore = create((set) => ({
  user: null,
  fetchUser: async (id: string) => {
    const user = await getUser(id)
    set({ user })
  }
}))
```

**项目中的实际应用**：
```typescript
// stores/annotation-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AnnotationStore {
  // 状态
  annotations: Annotation[]
  currentTool: ToolEnum
  selectedAnnotation: Annotation | null
  
  // 操作
  addAnnotation: (annotation: Annotation) => void
  removeAnnotation: (id: string) => void
  updateAnnotation: (id: string, data: Partial<Annotation>) => void
  setCurrentTool: (tool: ToolEnum) => void
  selectAnnotation: (annotation: Annotation | null) => void
  
  // 批量操作
  clearAnnotations: () => void
  loadAnnotations: (annotations: Annotation[]) => void
}

export const useAnnotationStore = create<AnnotationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        annotations: [],
        currentTool: ToolEnum.RECT,
        selectedAnnotation: null,
        
        // 操作实现
        addAnnotation: (annotation) =>
          set((state) => ({
            annotations: [...state.annotations, annotation]
          })),
        
        removeAnnotation: (id) =>
          set((state) => ({
            annotations: state.annotations.filter((a) => a.id !== id),
            selectedAnnotation:
              state.selectedAnnotation?.id === id ? null : state.selectedAnnotation
          })),
        
        updateAnnotation: (id, data) =>
          set((state) => ({
            annotations: state.annotations.map((a) =>
              a.id === id ? { ...a, ...data } : a
            )
          })),
        
        setCurrentTool: (tool) => set({ currentTool: tool }),
        
        selectAnnotation: (annotation) => set({ selectedAnnotation: annotation }),
        
        clearAnnotations: () => set({ annotations: [], selectedAnnotation: null }),
        
        loadAnnotations: (annotations) => set({ annotations })
      }),
      {
        name: 'annotation-storage',  // localStorage key
        partialize: (state) => ({
          // 只持久化 annotations，不持久化 selectedAnnotation
          annotations: state.annotations
        })
      }
    ),
    { name: 'AnnotationStore' }  // Redux DevTools 名称
  )
)


// ========== 使用示例 ==========
// 1. 完整订阅
function AnnotationPanel() {
  const store = useAnnotationStore()
  return (
    <div>
      <div>工具: {store.currentTool}</div>
      <div>标注数: {store.annotations.length}</div>
    </div>
  )
}

// 2. 选择性订阅（性能优化）
function AnnotationCount() {
  const count = useAnnotationStore((state) => state.annotations.length)
  // 只在 annotations.length 变化时重新渲染
  return <div>标注数: {count}</div>
}

// 3. 只使用操作（不触发重新渲染）
function ToolBar() {
  const setCurrentTool = useAnnotationStore((state) => state.setCurrentTool)
  // setCurrentTool 变化不会触发重新渲染
  return (
    <button onClick={() => setCurrentTool(ToolEnum.POLYGON)}>
      多边形
    </button>
  )
}

// 4. 在非组件中使用
function saveAnnotations() {
  const annotations = useAnnotationStore.getState().annotations
  await api.save(annotations)
}
```

**性能对比**：
```
Redux：
- 文件数：actions.ts、reducer.ts、store.ts、types.ts
- 代码行数：~200 行
- 学习曲线：陡峭

Zustand：
- 文件数：store.ts
- 代码行数：~50 行
- 学习曲线：平缓
- 性能：更优（选择性订阅）
```

---

## 十二、TailwindCSS + Shadcn/ui（补充）

### 📌 可能的面试问题

#### 问题：为什么选择 TailwindCSS + Shadcn/ui？

**回答要点**：

**TailwindCSS 优势**：
```typescript
// 1. 原子化 CSS（Utility-First）
// 传统 CSS：
<style>
.card {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
<div className="card">...</div>

// TailwindCSS：
<div className="p-4 bg-white rounded-lg shadow-sm">...</div>


// 2. 响应式设计
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* 移动端 100%，平板 50%，桌面 33% */}
</div>


// 3. 暗黑模式
<div className="bg-white dark:bg-gray-900">
  {/* 自动切换 */}
</div>


// 4. 自定义配置
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
        secondary: '#ff6b6b'
      },
      spacing: {
        '72': '18rem',
        '84': '21rem'
      }
    }
  }
}

// 使用
<div className="bg-primary w-72">...</div>
```

**Shadcn/ui 优势**：
```typescript
// 不是一个组件库，而是可复制的组件代码

// 1. 安装组件（复制到项目中）
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog

// 2. 完全可定制（源码在你的项目中）
// components/ui/button.tsx
export const Button = ({ variant, size, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        variant === 'default' && 'bg-primary text-white',
        variant === 'outline' && 'border border-gray-300',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'lg' && 'h-12 px-8 text-lg'
      )}
      {...props}
    />
  )
}

// 3. 使用
import { Button } from '@/components/ui/button'

<Button variant="default" size="lg">
  点击我
</Button>


// 4. 优势对比
/**
 * Ant Design / Material-UI:
 * - 优点：功能完善、开箱即用
 * - 缺点：样式定制困难、bundle 体积大、品牌感强
 * 
 * Shadcn/ui:
 * - 优点：完全可定制、按需导入、无品牌感、代码可见
 * - 缺点：需要手动安装每个组件
 */
```

**项目中的实际应用**：
```typescript
// 1. 表单组件
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

function CreateDatasetDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>创建数据集</Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建数据集</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">名称</Label>
            <Input id="name" placeholder="输入数据集名称" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="desc">描述</Label>
            <Textarea id="desc" placeholder="输入描述" />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline">取消</Button>
          <Button>确认</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


// 2. 数据表格
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

function DatasetTable({ data }: { data: Dataset[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名称</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant={item.status === 'READY' ? 'success' : 'warning'}>
                {item.status}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(item.createdAt)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">编辑</Button>
              <Button variant="ghost" size="sm">删除</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


// 3. 自定义主题
// app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ... */
  }
}


// 4. 响应式布局
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card>...</Card>
    <Card>...</Card>
    <Card>...</Card>
  </div>
</div>
```

---

## 总结

以上是针对你简历中每个工作职责的**完整、详细**的面试问答准备。

**新增内容总结**：
1. ✅ 微前端架构（qiankun）
2. ✅ AI 智能助手（Vercel AI SDK）
3. ✅ Zustand 状态管理
4. ✅ TailwindCSS + Shadcn/ui

**核心要点**：
1. ✅ 每个技术点都用 STAR 法则回答
2. ✅ 准备代码示例（可以提前写好）
3. ✅ 强调数据成果（61%、70%、90% 等）
4. ✅ 说明业务价值（不只是技术）
5. ✅ 诚实回答，不懂的不要装懂

**面试前准备清单**：
- [ ] 通读这份文档 3 遍
- [ ] 对着镜子练习 STAR 回答
- [ ] 准备代码示例（写在笔记本上）
- [ ] 准备 2-3 个项目亮点故事
- [ ] 准备 3-5 个技术难点问题
- [ ] 控制每个问题的回答时间（2-3 分钟）

**面试技巧**：
1. 回答问题时，先说结论，再展开细节
2. 用数据说话（性能提升 XX%，延迟降低 XX%）
3. 主动引导面试官问你擅长的问题
4. 如果不懂，坦诚说明，但可以说相关知识
5. 展示学习能力和解决问题的思路

祝面试顺利！🎉

---

## 附录：快速记忆卡片

### 🎯 权限系统
- **70+ 权限点**，覆盖 **15 个模块**
- 前端权限验证：**路由拦截 + 组件守卫 + 按钮控制**
- 多租户隔离：**tenantId + orgId**

### 🎯 Fabric.js 标注
- 响应时间：**180ms → 70ms（降低 61%）**
- 优化手段：**节流 + 批量渲染 + 空间索引 + 双 Canvas + 对象池**
- 支持：**500+ 标注对象流畅操作**

### 🎯 智能标注
- **工具注册机制**，API 解耦
- 标注效率：**提升 3-5 倍**
- 视频追踪：**流畅度提升 50%**

### 🎯 性能优化
- HTTP 请求：**2000+ → 20-30（减少 90%+）**
- 首屏加载：**10-15s → 2-3s（缩短 70%+）**
- 优化手段：**代码分割 + 虚拟滚动 + 缓存策略**

### 🎯 React Query
- 列表刷新延迟：**降低 70%**
- 轮询机制：**条件轮询 + 后台刷新 + 缓存复用**
- 支持：**1000+ 数据流畅展示**

### 🎯 微前端
- 技术选型：**qiankun**
- 优势：**独立开发 + 独立部署 + 技术栈无关**
- 部署时间：**30min → 5min**

### 🎯 AI 助手
- 技术栈：**Vercel AI SDK + Server-Sent Events**
- 功能：**流式对话 + 多模态 + 附件上传**
- 首字延迟：**< 500ms**

