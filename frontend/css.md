# CSS 技巧与问题

---

## 📝 知识点记录

### 🎯 SVG 图标的 currentColor 问题

#### 💬 发现场景
在项目中使用 `<img>` 标签加载 SVG 图标，想通过 CSS 的 `color` 属性控制图标颜色，但发现 `currentColor` 不生效。

#### ❌ 问题代码
```html
<!-- SVG 文件：icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="currentColor" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
</svg>

<!-- HTML 中使用 -->
<div style="color: red;">
  <img src="icon.svg" alt="icon" />  <!-- ❌ currentColor 不会变成红色 -->
</div>
```

#### 🔍 原因分析
当使用 `<img>` 标签加载 SVG 时：
1. SVG 被当作**外部资源**（external resource）加载
2. 浏览器会将其视为一个独立的文档
3. SVG 内部**无法访问父文档的 CSS 上下文**
4. 因此 `currentColor` 无法继承父元素的 `color` 属性
5. 这是浏览器的**安全和隔离机制**

#### ✅ 解决方案

**方案 1：内联 SVG（推荐）**
```html
<div style="color: red;">
  <!-- 直接将 SVG 代码嵌入 HTML -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path fill="currentColor" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
  </svg>
  <!-- ✅ currentColor 会正确继承为红色 -->
</div>
```

**方案 2：使用 CSS mask（适合纯色图标）**
```html
<style>
  .icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: currentColor;
    mask: url('icon.svg') no-repeat center / contain;
    -webkit-mask: url('icon.svg') no-repeat center / contain;
  }
</style>

<div style="color: red;">
  <i class="icon"></i>  <!-- ✅ 图标会显示为红色 -->
</div>
```

**方案 3：使用 SVG sprite + `<use>`**
```html
<!-- 定义 SVG sprite（通常放在页面顶部或单独文件） -->
<svg style="display: none;">
  <symbol id="icon-shield" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
  </symbol>
</svg>

<!-- 使用 -->
<div style="color: red;">
  <svg width="24" height="24">
    <use href="#icon-shield" />  <!-- ✅ currentColor 生效 -->
  </svg>
</div>
```

**方案 4：CSS filter（hack，不推荐）**
```html
<style>
  .icon-red {
    filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
    /* 复杂的 filter 值来近似颜色，不够精确 */
  }
</style>

<img src="icon.svg" class="icon-red" />  <!-- ⚠️ 不精确，难维护 -->
```

#### 📊 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **内联 SVG** | currentColor 完美支持 | HTML 体积增大 | 图标少、需要灵活控制颜色 |
| **CSS mask** | 支持 currentColor | 不支持多色图标 | 纯色图标、现代浏览器 |
| **SVG sprite** | 复用性好、支持 currentColor | 需要额外管理 sprite | 图标多、需要复用 |
| **img 标签** | 缓存友好 | ❌ 不支持 currentColor | 不需要改变颜色的图标 |

#### 💡 总结与最佳实践

**推荐策略**：
1. **图标系统**：使用 SVG sprite + `<use>`（React 可以用组件封装）
2. **少量图标**：直接内联 SVG
3. **纯色图标**：CSS mask（现代项目）
4. **静态图标**：`<img>` 标签就够了（不需要改颜色）

**在 React 中的实践**：
```tsx
// Icon.tsx
interface IconProps {
  name: string;
  color?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, color, size = 24 }) => (
  <svg 
    width={size} 
    height={size}
    style={{ color }}  // currentColor 会继承这个 color
  >
    <use href={`#icon-${name}`} />
  </svg>
);

// 使用
<Icon name="shield" color="red" size={32} />  // ✅ 完美工作
```

#### 🔖 标签
`#css` `#svg` `#currentColor` `#icon` `#frontend`

---

**最后更新：** 2025-10-16

