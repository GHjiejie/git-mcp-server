# 💬 普通聊天功能说明

## ✨ 新增功能

现在支持两种使用模式：

### 1. 🔧 工具模式（原有功能）
- 点击工具按钮选择 Git 工具
- 填写工具参数
- 执行 Git 操作并查看结果

### 2. 💬 聊天模式（新增功能）
- **不选择工具**，直接输入消息
- 系统会调用 Ollama AI 模型（deepseek-r1:7b）进行对话
- **支持完整的 Markdown 渲染**

## 🎨 Markdown 渲染支持

聊天回复支持以下 Markdown 元素：

### 标题
```markdown
# H1 标题
## H2 标题
### H3 标题
```

### 文本格式
- **粗体**: `**文本**`
- *斜体*: `*文本*`
- `行内代码`: \`code\`

### 代码块
\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

### 列表
- 无序列表
  - 嵌套项
- 项目 2

1. 有序列表
2. 项目 2

### 引用
> 这是一个引用块
> 可以多行

### 表格
| 列 1 | 列 2 |
|------|------|
| 数据 | 数据 |

### 链接和图片
- 链接: `[文本](URL)`
- 图片: `![alt](URL)`

### 分隔线
---

## 🚀 使用方式

### 工具模式
1. 点击输入框左侧的 🔧 工具图标
2. 选择一个 Git 工具（如 `git_status`）
3. 填写参数（如仓库路径）
4. 点击发送
5. 查看执行结果

### 聊天模式
1. **不点击工具图标**，直接在输入框输入问题
2. 例如：
   - "什么是 Git？"
   - "如何使用 git rebase？"
   - "解释一下 git cherry-pick"
3. 按回车或点击发送
4. AI 会流式返回回答，**自动渲染 Markdown 格式**

## 🔄 切换模式

### 从工具模式切换到聊天模式
- 如果已选择工具，点击工具标签上的 × 按钮清除

### 从聊天模式切换到工具模式
- 点击 🔧 图标并选择工具

## ⚙️ 技术实现

### 前端 (Vue 3)
- **InputArea.vue**: 支持工具选择和普通输入
- **ChatArea.vue**: 使用 `marked` 库渲染 Markdown
- **App.vue**: 根据是否选择工具调用不同的 API

### 后端 (Express + Ollama)
- **chat-controller.ts**: 处理聊天请求
- **ollama-service.ts**: 与 Ollama API 集成
- **流式输出**: 使用 Server-Sent Events (SSE)

### API 端点
```
POST /api/chat/stream
Body: { message: string }
Response: text/event-stream (SSE)
```

## 🎯 工作流程

```
用户输入
   │
   ├─ 选择了工具？
   │  ├─ 是 → POST /api/tool/call → 执行 Git 工具
   │  └─ 否 → POST /api/chat/stream → 调用 Ollama AI
   │
   └─ 流式返回结果 → Markdown 渲染 → 显示在界面
```

## 📋 示例对话

### 示例 1：询问 Git 知识
```
用户: 什么是 Git 的三个区域？

AI: Git 主要有三个区域：

1. **工作区 (Working Directory)**
   - 实际的文件目录
   - 可以进行修改和编辑

2. **暂存区 (Staging Area/Index)**
   - 使用 `git add` 添加的文件
   - 准备提交的快照

3. **版本库 (Repository)**
   - 使用 `git commit` 提交的历史记录
   - 包含所有提交的完整历史
```

### 示例 2：代码示例
```
用户: 如何撤销上一次提交？

AI: 有几种方式：

**1. 保留修改，撤销提交**
\`\`\`bash
git reset --soft HEAD~1
\`\`\`

**2. 丢弃修改和提交**
\`\`\`bash
git reset --hard HEAD~1
\`\`\`

**3. 创建新提交撤销**
\`\`\`bash
git revert HEAD
\`\`\`
```

## 🔧 依赖要求

### Ollama 服务
确保 Ollama 服务正在运行：

```bash
# 检查 Ollama 服务
curl http://localhost:11434/api/tags

# 如果没有安装，请访问
# https://ollama.ai
```

### 已安装模型
默认使用 `deepseek-r1:7b` 模型：

```bash
# 拉取模型
ollama pull deepseek-r1:7b
```

## 🎨 样式特性

### 代码高亮
- 行内代码：粉红色背景
- 代码块：深色背景，固定宽度字体

### 表格样式
- 斑马纹行
- 边框分隔
- 响应式滚动

### 引用块
- 左侧边框
- 斜体文本
- 浅色背景

## 🐛 故障排除

### AI 不响应
1. 检查 Ollama 服务是否运行
2. 确认模型已下载
3. 查看浏览器控制台错误

### Markdown 渲染异常
1. 检查 `marked` 依赖是否安装
2. 查看控制台错误信息
3. 尝试刷新页面

### 流式输出卡顿
1. 检查网络连接
2. 确认 API 服务器正常运行
3. 查看 API 服务器日志

## 📚 相关文档

- **API_ARCHITECTURE.md** - API 架构说明
- **web/README.md** - 前端使用文档
- **REFACTORING_SUMMARY.md** - 代码重构总结

---

现在你可以享受工具执行和 AI 对话的双重体验！🎉
