// 工具控制器

import { Request, Response } from "express";
import { toolsService } from "../services/tools-service.js";
import { mcpService } from "../services/mcp-service.js";
import { API_CONFIG } from "../config/index.js";
import { ToolCallRequest } from "../types.js";

export class ToolsController {
  /**
   * 获取工具列表
   */
  async getTools(req: Request, res: Response): Promise<void> {
    try {
      const tools = toolsService.getAll();
      res.json(tools);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * 调用工具（流式输出）
   */
  async callTool(req: Request, res: Response): Promise<void> {
    const { tool, params } = req.body as ToolCallRequest;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    try {
      // 检查工具是否存在
      const toolDef = toolsService.getByName(tool);
      if (!toolDef) {
        res.write(`错误: 工具 "${tool}" 不存在`);
        res.end();
        return;
      }

      // 调用 MCP 工具
      const result = await mcpService.callTool(tool, params);

      // 模拟流式输出
      const chunks = result.match(/.{1,50}/g) || [result];
      for (const chunk of chunks) {
        res.write(chunk);
        await new Promise((resolve) =>
          setTimeout(resolve, API_CONFIG.streamDelay)
        );
      }

      res.end();
    } catch (error) {
      res.write(`错误: ${error instanceof Error ? error.message : "未知错误"}`);
      res.end();
    }
  }
}

// 导出单例
export const toolsController = new ToolsController();
