# API 服务器架构说明

## 📁 目录结构

```
api/
├── index.ts                    # API 服务器主入口
├── types.ts                    # TypeScript 类型定义
├── config/
│   └── index.ts               # 配置文件
├── services/
│   ├── mcp-service.ts         # MCP 服务器管理服务
│   └── tools-service.ts       # 工具定义服务
├── controllers/
│   ├── tools-controller.ts    # 工具控制器
│   └── chat-controller.ts     # 聊天控制器
└── routes/
    ├── index.ts               # 路由汇总
    ├── tools-routes.ts        # 工具路由
    └── chat-routes.ts         # 聊天路由
```

## 🏗️ 架构设计

### 1. 分层架构

```
┌─────────────────────────────────────┐
│         Express Server              │
│         (api/index.ts)              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│           Routes Layer               │
│  ┌──────────────┐  ┌──────────────┐│
│  │ tools-routes │  │ chat-routes  ││
│  └──────────────┘  └──────────────┘│
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Controllers Layer             │
│  ┌─────────────┐  ┌───────────────┐│
│  │   tools     │  │     chat      ││
│  │ controller  │  │  controller   ││
│  └─────────────┘  └───────────────┘│
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Services Layer               │
│  ┌─────────────┐  ┌───────────────┐│
│  │    mcp      │  │     tools     ││
│  │   service   │  │    service    ││
│  └─────────────┘  └───────────────┘│
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       MCP Server Process             │
│       (dist/index.js)                │
└──────────────────────────────────────┘
```

### 2. 职责划分

#### **Config Layer (配置层)**
- `config/index.ts`: 集中管理所有配置项
  - 端口号、超时时间
  - MCP 服务器路径
  - CORS 设置等

#### **Routes Layer (路由层)**
- `routes/tools-routes.ts`: 工具相关路由
  - `GET /api/tools` - 获取工具列表
  - `POST /api/tool/call` - 调用工具
  
- `routes/chat-routes.ts`: 聊天相关路由
  - `POST /api/chat/stream` - 聊天流式输出

- `routes/index.ts`: 路由汇总，统一挂载

#### **Controllers Layer (控制器层)**
- `controllers/tools-controller.ts`: 处理工具相关请求
  - 参数验证
  - 调用 Service 层
  - 处理响应格式
  
- `controllers/chat-controller.ts`: 处理聊天相关请求
  - 流式输出处理
  - 错误处理

#### **Services Layer (服务层)**
- `services/mcp-service.ts`: MCP 服务器管理
  - 启动/停止 MCP 进程
  - 管理进程生命周期
  - 工具调用通信
  
- `services/tools-service.ts`: 工具定义管理
  - 存储工具定义
  - 提供工具查询

#### **Types Layer (类型层)**
- `types.ts`: TypeScript 类型定义
  - 请求/响应类型
  - MCP 协议类型
  - 工具定义类型

## 🔄 数据流

### 工具调用流程

```
前端发送请求
    │
    ▼
POST /api/tool/call
    │
    ▼
tools-routes.ts
    │
    ▼
tools-controller.callTool()
    │
    ├─► 验证工具是否存在 (tools-service)
    │
    ├─► 调用 MCP 工具 (mcp-service)
    │
    └─► 流式返回结果
```

### MCP 通信流程

```
tools-controller
    │
    ▼
mcp-service.callTool()
    │
    ├─► 构建 JSON-RPC 请求
    │
    ├─► 通过 stdin 发送给 MCP 进程
    │
    ├─► 监听 stdout 接收响应
    │
    └─► 解析并返回结果
```

## 🎯 设计优势

### 1. **解耦**
- 各层职责清晰，互不干扰
- Service 层可独立测试
- Controller 专注于 HTTP 处理

### 2. **可维护性**
- 模块化结构，易于定位问题
- 单一职责原则
- 代码复用性高

### 3. **可扩展性**
- 新增工具只需修改 `tools-service.ts`
- 新增路由只需创建新的 route 文件
- 新增功能只需添加新的 controller

### 4. **类型安全**
- 完整的 TypeScript 类型定义
- 编译时错误检查
- IDE 智能提示

## 🔧 配置说明

### API_CONFIG (api/config/index.ts)

```typescript
{
  port: 3001,                    // API 服务器端口
  corsOrigin: "*",               // CORS 允许的源
  mcpServerPath: "dist/index.js",// MCP 服务器路径
  requestTimeout: 30000,         // 请求超时时间 (ms)
  streamDelay: 50,               // 流式输出延迟 (ms)
}
```

## 📝 API 端点

### 健康检查
```
GET /health
Response: {
  status: "ok",
  mcpRunning: boolean,
  timestamp: string
}
```

### 工具相关
```
GET /api/tools
Response: ToolDefinition[]

POST /api/tool/call
Body: { tool: string, params: any }
Response: 流式文本
```

### 聊天相关
```
POST /api/chat/stream
Body: { message: string }
Response: Server-Sent Events
```

## 🚀 启动方式

### 开发模式
```bash
npm run api
```

### 与前端一起启动
```bash
npm run dev:all
```

## 📦 依赖关系

```
api/index.ts
  ├── express (Web 框架)
  ├── cors (跨域支持)
  ├── config (配置)
  ├── routes (路由)
  └── services/mcp-service (MCP 管理)

controllers
  └── services (业务逻辑)

routes
  └── controllers (请求处理)

services
  ├── child_process (进程管理)
  └── config (配置)
```

## 🎓 最佳实践

1. **单一职责**: 每个文件只负责一个功能
2. **依赖注入**: Service 通过单例模式共享
3. **错误处理**: 统一的错误处理机制
4. **类型安全**: 完整的 TypeScript 类型
5. **可测试性**: 各层可独立测试
