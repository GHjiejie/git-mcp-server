// 工具定义服务

import { ToolDefinition } from "../types.js";

export class ToolsService {
  private tools: ToolDefinition[] = [
    {
      name: "git_status",
      description: "显示工作目录的状态",
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
      description: "查看提交历史",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git 仓库的目录路径",
          },
          limit: {
            type: "number",
            description: "显示的提交数量限制",
            default: 10,
          },
        },
        required: ["directory"],
      },
    },
    {
      name: "git_diff",
      description: "查看文件变更",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git 仓库的目录路径",
          },
          file: {
            type: "string",
            description: "指定文件路径（可选）",
          },
        },
        required: ["directory"],
      },
    },
    {
      name: "git_add",
      description: "添加文件到暂存区",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git 仓库的目录路径",
          },
          files: {
            type: "array",
            description: "要添加的文件路径数组",
            items: {
              type: "string",
            },
          },
        },
        required: ["directory", "files"],
      },
    },
    {
      name: "git_commit",
      description: "提交更改",
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
      description: "推送到远程仓库",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git 仓库的目录路径",
          },
          remote: {
            type: "string",
            description: "远程仓库名称",
            default: "origin",
          },
          branch: {
            type: "string",
            description: "分支名称",
          },
        },
        required: ["directory"],
      },
    },
    {
      name: "git_pull",
      description: "从远程仓库拉取",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git 仓库的目录路径",
          },
          remote: {
            type: "string",
            description: "远程仓库名称",
            default: "origin",
          },
          branch: {
            type: "string",
            description: "分支名称",
          },
        },
        required: ["directory"],
      },
    },
    {
      name: "git_branch",
      description: "管理分支",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git 仓库的目录路径",
          },
          action: {
            type: "string",
            description: "操作类型",
            enum: ["list", "create", "delete"],
          },
          name: {
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
          target: {
            type: "string",
            description: "分支名称或文件路径",
          },
        },
        required: ["directory", "target"],
      },
    },
    {
      name: "git_remote",
      description: "管理远程仓库",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git 仓库的目录路径",
          },
          action: {
            type: "string",
            description: "操作类型",
            enum: ["list", "add", "remove"],
          },
          name: {
            type: "string",
            description: "远程仓库名称",
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
      description: "生成最近一周的 Git 提交周报",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git 仓库的目录路径",
          },
          days: {
            type: "number",
            description: "统计天数",
            default: 7,
          },
          author: {
            type: "string",
            description: "指定作者",
          },
          branch: {
            type: "string",
            description: "指定分支",
          },
          useAI: {
            type: "boolean",
            description: "是否使用 AI 生成总结",
            default: true,
          },
        },
        required: ["directory"],
      },
    },
  ];

  /**
   * 获取所有工具列表
   */
  getAll(): ToolDefinition[] {
    return this.tools;
  }

  /**
   * 根据名称获取工具
   */
  getByName(name: string): ToolDefinition | undefined {
    return this.tools.find((tool) => tool.name === name);
  }
}

// 导出单例
export const toolsService = new ToolsService();
