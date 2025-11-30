# Git MCP Server Web UI

一个基于 Vue 3 + TypeScript 的 MCP 服务器 Web 界面。

## 功能特性

- 🎨 黑白配色的现代化 UI
- 💬 对话式交互界面
- 🔧 可视化工具选择和参数配置
- 📡 实时流式输出
- ⚙️ MCP 服务器设置面板
- 📝 多对话管理

## 快速开始

### 1. 安装依赖

```bash
# 安装主项目依赖
npm install

# 安装 Web 前端依赖
cd web
npm install
cd ..
```

### 2. 启动开发环境

方式一：同时启动 API 和 Web 服务
```bash
npm run dev:all
```

方式二：分别启动
```bash
# 终端 1：启动 API 服务器
npm run api

# 终端 2：启动 Web 前端
npm run web
```

### 3. 访问应用

打开浏览器访问：http://localhost:3000

## 项目结构

```
├── web/                    # Vue 3 前端应用
│   ├── src/
│   │   ├── components/     # Vue 组件
│   │   │   ├── Sidebar.vue          # 侧边栏
│   │   │   ├── Header.vue           # 头部
│   │   │   ├── ChatArea.vue         # 聊天区域
│   │   │   ├── InputArea.vue        # 输入区域
│   │   │   ├── ToolDialog.vue       # 工具参数对话框
│   │   │   └── SettingsPanel.vue    # 设置面板
│   │   ├── App.vue         # 主应用组件
│   │   ├── main.ts         # 入口文件
│   │   ├── types.ts        # 类型定义
│   │   └── style.scss      # 全局样式
│   ├── package.json
│   └── vite.config.ts
├── api-server.ts           # API 服务器
└── package.json
```

## 使用说明

### 1. 创建新对话

点击侧边栏顶部的"+ 新建对话"按钮。

### 2. 使用工具

1. 点击输入框左侧的工具图标 🔧
2. 从列表中选择要使用的工具
3. 在弹出的对话框中填写参数
4. 点击确认执行

### 3. 查看流式输出

工具执行时会实时显示结果，带有动画效果的加载指示器。

### 4. MCP 服务器设置

1. 点击右上角的设置按钮 ⚙️
2. 查看服务器状态和可用工具
3. 修改服务器配置
4. 重新连接服务器

## 可用脚本

- `npm run dev:all` - 同时启动 API 和 Web 服务
- `npm run api` - 只启动 API 服务器 (端口 3001)
- `npm run web` - 只启动 Web 前端 (端口 3000)
- `npm run build` - 构建 MCP 服务器

## 端口说明

- **3000** - Web 前端界面
- **3001** - API 服务器
- **11434** - Ollama 服务 (用于 AI 总结)

## 技术栈

### 前端
- Vue 3 (Composition API)
- TypeScript
- Vite
- SCSS

### 后端
- Express.js
- Node.js
- TypeScript

## 样式主题

应用使用黑白配色方案：

- **背景色**：深色系 (#1a1a1a, #2a2a2a, #3a3a3a)
- **文字色**：白色系 (#ffffff, #b0b0b0, #808080)
- **强调色**：白色 (#ffffff)
- **边框色**：灰色 (#404040)

## 开发建议

1. **修改样式**：编辑 `web/src/style.scss` 或组件内的 `<style>` 块
2. **添加新组件**：在 `web/src/components/` 目录下创建
3. **修改 API**：编辑 `api-server.ts`
4. **类型定义**：在 `web/src/types.ts` 中添加

## 常见问题

### 1. 端口被占用

修改 `web/vite.config.ts` 中的端口：
```typescript
server: {
  port: 3000, // 改为其他端口
}
```

修改 `api-server.ts` 中的端口：
```typescript
const PORT = 3001; // 改为其他端口
```

### 2. API 连接失败

确保 API 服务器正在运行：
```bash
npm run api
```

### 3. 工具列表为空

检查 `api-server.ts` 中的工具定义是否正确。

## License

ISC
