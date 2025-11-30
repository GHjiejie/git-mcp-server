// 聊天控制器

import { Request, Response } from "express";
import { ChatRequest } from "../types.js";

export class ChatController {
  /**
   * 聊天流式输出
   */
  async stream(req: Request, res: Response): Promise<void> {
    const { message } = req.body as ChatRequest;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      // 模拟 AI 响应
      const response = `这是一个模拟的 AI 响应。您说: "${message}"`;
      const words = response.split("");

      for (const word of words) {
        res.write(`data: ${JSON.stringify({ content: word })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
        })}\n\n`
      );
      res.end();
    }
  }
}

// 导出单例
export const chatController = new ChatController();
