// 聊天控制器

import { Request, Response } from "express";
import { ChatRequest } from "../types.js";
import { ollamaService } from "../services/ollama-service.js";

export class ChatController {
  /**
   * 聊天流式输出
   */
  async stream(req: Request, res: Response): Promise<void> {
    const { message } = req.body as ChatRequest;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // 禁用 Nginx 缓冲
    res.flushHeaders(); // 立即发送响应头

    try {
      // 检查 Ollama 服务是否可用
      const isAvailable = await ollamaService.isAvailable();

      if (!isAvailable) {
        res.write(
          `data: ${JSON.stringify({
            content: "⚠️ Ollama 服务不可用，请确保已启动 Ollama 服务。\n\n",
          })}\n\n`
        );
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      // 使用 Ollama 生成流式响应
      for await (const chunk of ollamaService.streamChat(message)) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
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
