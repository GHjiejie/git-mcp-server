# 测试 Git Weekly Report

## 使用方法

在 MCP Inspector 中测试 `git_weekly_report` 工具：

### 基本使用（带 AI 总结）
```json
{
  "directory": "/Users/jie/Documents/Github/git-mcp-server",
  "days": 7,
  "useAI": true,
  "model": "deepseek-r1:1.5b"
}
```

### 指定作者和分支
```json
{
  "directory": "/Users/jie/Documents/Github/git-mcp-server",
  "days": 7,
  "author": "jie",
  "branch": "main",
  "useAI": true,
  "model": "deepseek-r1:1.5b"
}
```

### 不使用 AI（传统模式）
```json
{
  "directory": "/Users/jie/Documents/Github/git-mcp-server",
  "days": 7,
  "useAI": false
}
```

### 使用其他模型
```json
{
  "directory": "/Users/jie/Documents/Github/git-mcp-server",
  "days": 14,
  "model": "qwen:7b",
  "useAI": true
}
```

## 可用的 Ollama 模型

查看已安装的模型：
```bash
ollama list
```

推荐模型：
- `deepseek-r1:1.5b` - 轻量快速（默认）
- `qwen:7b` - 中文理解能力强
- `llama2` - 通用性强
- `gemma2` - Google 出品

拉取新模型：
```bash
ollama pull deepseek-r1:1.5b
ollama pull qwen:7b
```
