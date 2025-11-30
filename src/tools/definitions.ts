// Git 工具定义

export const tools = [
  {
    name: "git_status",
    description: "显示工作目录的状态，查看哪些文件被修改、添加或删除",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
      },
      required: ["directory"],
    },
  },
  {
    name: "git_log",
    description: "查看提交历史，显示最近的提交记录",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
        limit: {
          type: "number",
          description: "显示的提交数量限制（默认 10）",
          default: 10,
        },
      },
      required: ["directory"],
    },
  },
  {
    name: "git_diff",
    description: "显示工作目录中文件的变更内容",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
        file: {
          type: "string",
          description: "指定要查看差异的文件路径（可选）",
        },
        staged: {
          type: "boolean",
          description: "是否查看已暂存的更改（默认 false）",
          default: false,
        },
      },
      required: ["directory"],
    },
  },
  {
    name: "git_add",
    description: "将文件添加到暂存区",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
        files: {
          type: "array",
          items: { type: "string" },
          description: "要添加的文件列表（使用 ['.'] 添加所有文件）",
        },
      },
      required: ["directory", "files"],
    },
  },
  {
    name: "git_commit",
    description: "提交暂存区的更改",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
        message: {
          type: "string",
          description: "提交信息",
        },
      },
      required: ["directory", "message"],
    },
  },
  {
    name: "git_push",
    description: "将本地提交推送到远程仓库",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
        remote: {
          type: "string",
          description: "远程仓库名称（默认 origin）",
          default: "origin",
        },
        branch: {
          type: "string",
          description: "分支名称（默认当前分支）",
        },
      },
      required: ["directory"],
    },
  },
  {
    name: "git_pull",
    description: "从远程仓库拉取更新",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
        remote: {
          type: "string",
          description: "远程仓库名称（默认 origin）",
          default: "origin",
        },
        branch: {
          type: "string",
          description: "分支名称（默认当前分支）",
        },
      },
      required: ["directory"],
    },
  },
  {
    name: "git_branch",
    description: "列出、创建或删除分支",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
        action: {
          type: "string",
          enum: ["list", "create", "delete"],
          description: "操作类型：list（列出）、create（创建）、delete（删除）",
        },
        branchName: {
          type: "string",
          description: "分支名称（创建或删除时需要）",
        },
      },
      required: ["directory", "action"],
    },
  },
  {
    name: "git_checkout",
    description: "切换分支或恢复文件",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
        branch: {
          type: "string",
          description: "要切换到的分支名称",
        },
      },
      required: ["directory", "branch"],
    },
  },
  {
    name: "git_remote",
    description: "查看或管理远程仓库",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
        action: {
          type: "string",
          enum: ["list", "add", "remove"],
          description: "操作类型：list（列出）、add（添加）、remove（删除）",
        },
        name: {
          type: "string",
          description: "远程仓库名称（添加或删除时需要）",
        },
        url: {
          type: "string",
          description: "远程仓库 URL（添加时需要）",
        },
      },
      required: ["directory", "action"],
    },
  },
  {
    name: "git_weekly_report",
    description:
      "生成最近一周的 Git 提交周报，包含提交统计和详细信息，使用 AI 生成智能总结",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Git 仓库的目录路径",
        },
        author: {
          type: "string",
          description: "指定作者（可选，不指定则统计所有作者）",
        },
        branch: {
          type: "string",
          description: "指定分支（可选，不指定则使用当前分支）",
        },
        days: {
          type: "number",
          description: "统计天数（默认 7 天）",
          default: 7,
        },
        model: {
          type: "string",
          description: "使用的 Ollama 模型（默认 deepseek-r1:7b）",
          default: "deepseek-r1:7b",
        },
        useAI: {
          type: "boolean",
          description: "是否使用 AI 生成总结（默认 true）",
          default: true,
        },
      },
      required: ["directory"],
    },
  },
];
