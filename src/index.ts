#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";

const execAsync = promisify(exec);

// Git 操作的工具定义
const tools = [
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
    description: "生成最近一周的 Git 提交周报，包含提交统计和详细信息",
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
      },
      required: ["directory"],
    },
  },
];

// 执行 git 命令的辅助函数
async function executeGitCommand(
  directory: string,
  command: string
): Promise<{ stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: directory,
      shell: process.env.SHELL || "/bin/zsh",
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
    return { stdout, stderr };
  } catch (error: any) {
    throw new Error(`Git 命令执行失败: ${error.message}`);
  }
}

// 创建服务器实例
const server = new Server(
  {
    name: "git-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 处理工具列表请求
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// 处理工具调用请求
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "git_status": {
        const { directory } = args as { directory: string };
        const result = await executeGitCommand(directory, "git status");
        return {
          content: [
            {
              type: "text",
              text: result.stdout || result.stderr,
            },
          ],
        };
      }

      case "git_log": {
        const { directory, limit = 10 } = args as {
          directory: string;
          limit?: number;
        };
        const result = await executeGitCommand(
          directory,
          `git log --oneline -n ${limit}`
        );
        return {
          content: [
            {
              type: "text",
              text: result.stdout || "没有提交记录",
            },
          ],
        };
      }

      case "git_diff": {
        const {
          directory,
          file,
          staged = false,
        } = args as {
          directory: string;
          file?: string;
          staged?: boolean;
        };
        const stagedFlag = staged ? "--staged" : "";
        const fileArg = file ? `-- ${file}` : "";
        const result = await executeGitCommand(
          directory,
          `git diff ${stagedFlag} ${fileArg}`.trim()
        );
        return {
          content: [
            {
              type: "text",
              text: result.stdout || "没有变更",
            },
          ],
        };
      }

      case "git_add": {
        const { directory, files } = args as {
          directory: string;
          files: string[];
        };
        const filesArg = files.join(" ");
        const result = await executeGitCommand(
          directory,
          `git add ${filesArg}`
        );
        return {
          content: [
            {
              type: "text",
              text: result.stdout || `成功添加文件: ${filesArg}`,
            },
          ],
        };
      }

      case "git_commit": {
        const { directory, message } = args as {
          directory: string;
          message: string;
        };
        const result = await executeGitCommand(
          directory,
          `git commit -m "${message.replace(/"/g, '\\"')}"`
        );
        return {
          content: [
            {
              type: "text",
              text: result.stdout || result.stderr,
            },
          ],
        };
      }

      case "git_push": {
        const {
          directory,
          remote = "origin",
          branch,
        } = args as {
          directory: string;
          remote?: string;
          branch?: string;
        };
        const branchArg = branch ? branch : "";
        const result = await executeGitCommand(
          directory,
          `git push ${remote} ${branchArg}`.trim()
        );
        return {
          content: [
            {
              type: "text",
              text: result.stdout || result.stderr || "推送成功",
            },
          ],
        };
      }

      case "git_pull": {
        const {
          directory,
          remote = "origin",
          branch,
        } = args as {
          directory: string;
          remote?: string;
          branch?: string;
        };
        const branchArg = branch ? branch : "";
        const result = await executeGitCommand(
          directory,
          `git pull ${remote} ${branchArg}`.trim()
        );
        return {
          content: [
            {
              type: "text",
              text: result.stdout || result.stderr,
            },
          ],
        };
      }

      case "git_branch": {
        const { directory, action, branchName } = args as {
          directory: string;
          action: string;
          branchName?: string;
        };

        let command = "";
        if (action === "list") {
          command = "git branch -a";
        } else if (action === "create" && branchName) {
          command = `git branch ${branchName}`;
        } else if (action === "delete" && branchName) {
          command = `git branch -d ${branchName}`;
        } else {
          throw new Error("无效的分支操作或缺少分支名称");
        }

        const result = await executeGitCommand(directory, command);
        return {
          content: [
            {
              type: "text",
              text: result.stdout || result.stderr,
            },
          ],
        };
      }

      case "git_checkout": {
        const { directory, branch } = args as {
          directory: string;
          branch: string;
        };
        const result = await executeGitCommand(
          directory,
          `git checkout ${branch}`
        );
        return {
          content: [
            {
              type: "text",
              text: result.stdout || result.stderr,
            },
          ],
        };
      }

      case "git_remote": {
        const { directory, action, name, url } = args as {
          directory: string;
          action: string;
          name?: string;
          url?: string;
        };

        let command = "";
        if (action === "list") {
          command = "git remote -v";
        } else if (action === "add" && name && url) {
          command = `git remote add ${name} ${url}`;
        } else if (action === "remove" && name) {
          command = `git remote remove ${name}`;
        } else {
          throw new Error("无效的远程仓库操作或缺少必要参数");
        }

        const result = await executeGitCommand(directory, command);
        return {
          content: [
            {
              type: "text",
              text: result.stdout || result.stderr || "操作成功",
            },
          ],
        };
      }

      case "git_weekly_report": {
        const {
          directory,
          author,
          branch,
          days = 7,
        } = args as {
          directory: string;
          author?: string;
          branch?: string;
          days?: number;
        };

        // 获取最近 N 天的提交
        const sinceDate = `${days}.days.ago`;
        const authorFilter = author ? `--author="${author}"` : "";
        const branchFilter = branch ? branch : "";

        // 获取详细的提交信息
        const logCommand = `git log ${branchFilter} ${authorFilter} --since="${sinceDate}" --pretty=format:"%h|%an|%ae|%ad|%s" --date=short`;
        const logResult = await executeGitCommand(directory, logCommand);

        // 获取统计信息
        const statsCommand = `git log ${branchFilter} ${authorFilter} --since="${sinceDate}" --pretty=tformat: --numstat`;
        const statsResult = await executeGitCommand(directory, statsCommand);

        // 获取提交次数
        const countCommand = `git log ${branchFilter} ${authorFilter} --since="${sinceDate}" --oneline | wc -l`;
        const countResult = await executeGitCommand(directory, countCommand);

        // 获取参与的作者列表
        const authorsCommand = `git log ${branchFilter} --since="${sinceDate}" --pretty=format:"%an" | sort -u`;
        const authorsResult = await executeGitCommand(
          directory,
          authorsCommand
        );

        if (!logResult.stdout.trim()) {
          return {
            content: [
              {
                type: "text",
                text: `📊 最近 ${days} 天内没有提交记录`,
              },
            ],
          };
        }

        // 解析提交记录
        const commits = logResult.stdout
          .trim()
          .split("\n")
          .map((line) => {
            const [hash, authorName, email, date, message] = line.split("|");
            return { hash, authorName, email, date, message };
          });

        // 计算代码统计
        let additions = 0;
        let deletions = 0;
        if (statsResult.stdout.trim()) {
          statsResult.stdout
            .trim()
            .split("\n")
            .forEach((line) => {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 2) {
                const add = parseInt(parts[0]) || 0;
                const del = parseInt(parts[1]) || 0;
                additions += add;
                deletions += del;
              }
            });
        }

        const commitCount = commits.length;
        const authors = authorsResult.stdout
          .trim()
          .split("\n")
          .filter((a) => a);

        // 按日期分组提交
        const commitsByDate: { [key: string]: typeof commits } = {};
        commits.forEach((commit) => {
          if (!commitsByDate[commit.date]) {
            commitsByDate[commit.date] = [];
          }
          commitsByDate[commit.date].push(commit);
        });

        // 生成周报
        const report: string[] = [];
        report.push("# 📊 Git 提交周报\n");
        report.push(`📅 统计周期：最近 ${days} 天`);
        if (branch) {
          report.push(`🌿 分支：${branch}`);
        }
        if (author) {
          report.push(`👤 作者：${author}`);
        }
        report.push("");
        report.push("## 📈 总体统计\n");
        report.push(`- 📝 总提交次数：${commitCount} 次`);
        report.push(`- 👥 参与人数：${authors.length} 人`);
        report.push(`- ➕ 新增代码：${additions} 行`);
        report.push(`- ➖ 删除代码：${deletions} 行`);
        report.push(`- 📊 净增代码：${additions - deletions} 行\n`);

        if (authors.length > 0) {
          report.push("## 👥 参与人员\n");
          authors.forEach((author) => {
            const authorCommits = commits.filter(
              (c) => c.authorName === author
            ).length;
            report.push(`- ${author}：${authorCommits} 次提交`);
          });
          report.push("");
        }

        report.push("## 📝 提交详情\n");

        // 按日期倒序排列
        const sortedDates = Object.keys(commitsByDate).sort().reverse();

        sortedDates.forEach((date) => {
          report.push(`### ${date}\n`);
          commitsByDate[date].forEach((commit) => {
            report.push(`- **[${commit.hash}]** ${commit.message}`);
            report.push(`  👤 ${commit.authorName}`);
          });
          report.push("");
        });

        report.push("## 💡 工作总结\n");
        report.push("本周主要工作内容：");

        // 根据提交信息生成简要总结
        const featureCommits = commits.filter(
          (c) =>
            c.message.toLowerCase().includes("feat") ||
            c.message.toLowerCase().includes("feature") ||
            c.message.includes("新增") ||
            c.message.includes("添加")
        );
        const fixCommits = commits.filter(
          (c) =>
            c.message.toLowerCase().includes("fix") ||
            c.message.includes("修复") ||
            c.message.includes("bug")
        );
        const refactorCommits = commits.filter(
          (c) =>
            c.message.toLowerCase().includes("refactor") ||
            c.message.includes("重构") ||
            c.message.includes("优化")
        );

        if (featureCommits.length > 0) {
          report.push(`\n**新功能开发** (${featureCommits.length} 项)：`);
          featureCommits.slice(0, 5).forEach((c) => {
            report.push(`- ${c.message}`);
          });
        }

        if (fixCommits.length > 0) {
          report.push(`\n**问题修复** (${fixCommits.length} 项)：`);
          fixCommits.slice(0, 5).forEach((c) => {
            report.push(`- ${c.message}`);
          });
        }

        if (refactorCommits.length > 0) {
          report.push(`\n**代码优化** (${refactorCommits.length} 项)：`);
          refactorCommits.slice(0, 5).forEach((c) => {
            report.push(`- ${c.message}`);
          });
        }

        return {
          content: [
            {
              type: "text",
              text: report.join("\n"),
            },
          ],
        };
      }

      default:
        throw new Error(`未知的工具: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `错误: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Git MCP Server 已启动");
}

main().catch((error) => {
  console.error("服务器启动失败:", error);
  process.exit(1);
});
