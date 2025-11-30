#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { tools } from "./tools/definitions.js";
import {
  handleGitStatus,
  handleGitLog,
  handleGitDiff,
  handleGitAdd,
  handleGitCommit,
  handleGitPush,
  handleGitPull,
  handleGitBranch,
  handleGitCheckout,
  handleGitRemote,
  handleGitWeeklyReport,
} from "./handlers/git-handlers.js";

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
    // 确保 args 存在
    if (!args) {
      throw new Error("缺少必要的参数");
    }

    switch (name) {
      case "git_status":
        return await handleGitStatus(args as any);

      case "git_log":
        return await handleGitLog(args as any);

      case "git_diff":
        return await handleGitDiff(args as any);

      case "git_add":
        return await handleGitAdd(args as any);

      case "git_commit":
        return await handleGitCommit(args as any);

      case "git_push":
        return await handleGitPush(args as any);

      case "git_pull":
        return await handleGitPull(args as any);

      case "git_branch":
        return await handleGitBranch(args as any);

      case "git_checkout":
        return await handleGitCheckout(args as any);

      case "git_remote":
        return await handleGitRemote(args as any);

      case "git_weekly_report":
        return await handleGitWeeklyReport(args as any);

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
