// Ollama 服务 - 用于 API 服务器

const OLLAMA_API_URL = "http://localhost:11434/api/chat";
const DEFAULT_MODEL = "deepseek-r1:7b";

export class OllamaService {
  /**
   * 流式生成聊天响应
   */
  async *streamChat(
    message: string,
    model: string = DEFAULT_MODEL
  ): AsyncGenerator<string> {
    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API 请求失败: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // 保留最后一个不完整的行
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              // /api/chat 接口返回的字段是 message.content
              if (data.message?.content) {
                yield data.message.content;
              }
              if (data.done) {
                return;
              }
            } catch (e) {
              // 跳过无效的 JSON
            }
          }
        }
      }

      // 处理剩余的 buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.message?.content) {
            yield data.message.content;
          }
        } catch (e) {
          // 忽略
        }
      }
    } catch (error: any) {
      yield `\n\n⚠️ AI 服务调用失败: ${error.message}\n请确保 Ollama 服务正在运行 (http://localhost:11434)`;
    }
  }

  /**
   * 检查 Ollama 服务是否可用
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch("http://localhost:11434/api/tags", {
        method: "GET",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// 导出单例
export const ollamaService = new OllamaService();
