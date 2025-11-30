# Git MCP Server

一个用于执行 Git 操作的 Model Context Protocol (MCP) 服务器，集成 Ollama AI 生成智能周报。

## 功能特性

该 MCP 服务器提供以下 Git 操作工具：

- **git_status** - 显示工作目录状态
- **git_log** - 查看提交历史
- **git_diff** - 显示文件变更内容
- **git_add** - 添加文件到暂存区
- **git_commit** - 提交更改
- **git_push** - 推送到远程仓库
- **git_pull** - 从远程仓库拉取更新
- **git_branch** - 管理分支（列出、创建、删除）
- **git_checkout** - 切换分支
- **git_remote** - 管理远程仓库
- **git_weekly_report** - 🆕 生成 AI 驱动的周报总结

## 前置要求

### Ollama 设置（用于 AI 周报功能）

1. 安装 Ollama: https://ollama.com
2. 拉取模型:
```bash
ollama pull deepseek-r1:1.5b
# 或使用其他模型，如:
# ollama pull qwen:7b
# ollama pull llama2
```
3. 确保 Ollama 服务运行在 `http://localhost:11434`

## 安装

```bash
npm install
npm run build
```

## 使用方法

### 构建项目

```bash
npm run build
```

### 运行服务器

```bash
npm start
```

### 开发模式

```bash
npm run dev
```

## 配置 Claude Desktop

在 Claude Desktop 的配置文件中添加此服务器：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "git": {
      "command": "node",
      "args": ["/Users/jie/Documents/Github/git-mcp-server/dist/index.js"]
    }
  }
}
```

记得将路径替换为您实际的项目路径。

## 工具示例

### 查看状态
```json
{
  "name": "git_status",
  "arguments": {
    "directory": "/path/to/your/repo"
  }
}
```

### 提交更改
```json
{
  "name": "git_commit",
  "arguments": {
    "directory": "/path/to/your/repo",
    "message": "feat: add new feature"
  }
}
```

### 推送到远程
```json
{
  "name": "git_push",
  "arguments": {
    "directory": "/path/to/your/repo",
    "remote": "origin",
    "branch": "main"
  }
}
```

### 🌟 生成 AI 周报（新功能）
```json
{
  "name": "git_weekly_report",
  "arguments": {
    "directory": "/path/to/your/repo",
    "days": 7,
    "author": "your-name",
    "branch": "main",
    "model": "deepseek-r1:1.5b",
    "useAI": true
  }
}
```

**参数说明**：
- `directory` (必需): Git 仓库路径
- `days` (可选): 统计天数，默认 7 天
- `author` (可选): 指定作者筛选
- `branch` (可选): 指定分支
- `model` (可选): Ollama 模型名称，默认 `deepseek-r1:1.5b`
- `useAI` (可选): 是否使用 AI 总结，默认 `true`

**功能亮点**：
- 📊 自动统计提交次数、代码行数、参与人数
- 📝 按日期整理提交记录
- 🤖 使用 Ollama AI 生成专业的工作总结
- 🎯 智能分类：新功能、Bug修复、代码优化
- 💡 支持多种开源模型：DeepSeek、Qwen、Llama 等

## 许可证

ISC
```json
{
  "name": "git_push",
  "arguments": {
    "directory": "/path/to/your/repo",
    "remote": "origin",
    "branch": "main"
  }
}
```

## 许可证

ISC
