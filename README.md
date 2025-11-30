# Git MCP Server

一个用于执行 Git 操作的 Model Context Protocol (MCP) 服务器。

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

## 许可证

ISC
