# 项目结构说明

## 📁 目录结构

```
src/
├── index.ts                    # 主入口文件，MCP 服务器初始化
├── config.ts                   # 配置常量
├── types.ts                    # TypeScript 类型定义
├── git-executor.ts             # Git 命令执行器
├── ollama-client.ts            # Ollama API 客户端
├── handlers/
│   └── git-handlers.ts         # Git 工具请求处理器
└── tools/
    ├── definitions.ts          # 工具定义（schema）
    └── weekly-report.ts        # 周报生成器
```

## 📝 文件说明

### 核心文件

#### `index.ts`
- MCP 服务器主入口
- 初始化服务器实例
- 注册请求处理器
- 路由工具调用到相应的处理器

#### `config.ts`
- 集中管理配置常量
- Ollama API URL
- 默认模型名称
- 缓冲区大小等配置

#### `types.ts`
- TypeScript 类型定义
- 接口定义（GitCommit, GitStats, WeeklyReportArgs 等）
- 提供类型安全

### 功能模块

#### `git-executor.ts`
- 封装 Git 命令执行逻辑
- 统一的错误处理
- Shell 环境配置
- 返回标准化的结果格式

#### `ollama-client.ts`
- Ollama API 调用封装
- AI 总结生成
- Prompt 模板管理
- 错误处理和降级

#### `handlers/git-handlers.ts`
- 所有 Git 工具的处理器函数
- 每个工具对应一个独立的处理函数
- 统一的返回格式
- 参数验证和错误处理

#### `tools/definitions.ts`
- 所有工具的 JSON Schema 定义
- 参数说明和验证规则
- 工具描述信息

#### `tools/weekly-report.ts`
- 周报生成核心逻辑
- 提交数据收集和解析
- 统计计算
- AI 总结集成
- 报告格式化

## 🎯 模块化优势

### 1. **职责清晰**
每个文件专注于单一职责：
- 配置管理 → `config.ts`
- 类型定义 → `types.ts`
- Git 执行 → `git-executor.ts`
- AI 集成 → `ollama-client.ts`
- 业务逻辑 → `handlers/` 和 `tools/`

### 2. **易于维护**
- 修改某个功能只需要编辑对应的文件
- 代码组织清晰，容易定位问题
- 减少文件大小，提高可读性

### 3. **可测试性**
- 每个模块可以独立测试
- 便于编写单元测试
- 模拟依赖更容易

### 4. **可扩展性**
- 添加新工具：
  1. 在 `tools/definitions.ts` 添加定义
  2. 在 `handlers/git-handlers.ts` 添加处理器
  3. 在 `index.ts` 添加路由
- 添加新功能模块：直接创建新文件并导入

### 5. **代码复用**
- `git-executor.ts` 被所有 Git 操作共享
- `ollama-client.ts` 可用于其他需要 AI 的功能
- 工具定义和处理器分离，便于复用

## 🔄 调用流程

```
请求 → index.ts (路由)
  ↓
handlers/git-handlers.ts (处理)
  ↓
git-executor.ts (执行命令)
  或
tools/weekly-report.ts (生成报告)
  ↓
ollama-client.ts (AI 总结)
  ↓
返回结果
```

## 🚀 如何添加新工具

### 1. 定义工具 Schema
在 `tools/definitions.ts` 中添加：
```typescript
{
  name: "git_new_tool",
  description: "工具描述",
  inputSchema: {
    type: "object",
    properties: {
      directory: { type: "string", description: "..." },
      // 其他参数
    },
    required: ["directory"],
  },
}
```

### 2. 创建处理器
在 `handlers/git-handlers.ts` 中添加：
```typescript
export async function handleGitNewTool(args: GitCommandArgs) {
  const { directory } = args;
  // 实现逻辑
  return { content: [{ type: "text", text: "结果" }] };
}
```

### 3. 注册路由
在 `index.ts` 中添加：
```typescript
case "git_new_tool":
  return await handleGitNewTool(args as any);
```

## 📦 构建输出

编译后的文件在 `dist/` 目录，保持相同的目录结构：
```
dist/
├── index.js
├── config.js
├── types.js
├── git-executor.js
├── ollama-client.js
├── handlers/
│   └── git-handlers.js
└── tools/
    ├── definitions.js
    └── weekly-report.js
```
