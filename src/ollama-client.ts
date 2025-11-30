// Ollama API 客户端

import { OLLAMA_API_URL, DEFAULT_MODEL } from "./config.js";

export async function generateSummaryWithOllama(
  commits: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  try {
    const prompt = `你是一个专业的技术周报撰写助手。请根据以下 Git 提交记录，生成一份专业的工作周报总结。

要求：
1. 总结本周的主要工作内容和成果
2. 按照功能开发、Bug修复、代码优化等分类
3. 突出重点工作和技术亮点
4. 使用简洁专业的语言
5. 使用中文回复

Git 提交记录：
${commits}

请生成周报总结：`;

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
            content: prompt,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API 请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || "生成总结失败";
  } catch (error: any) {
    console.error("Ollama API 调用失败:", error);
    return `⚠️ AI 总结生成失败: ${error.message}\n请确保 Ollama 服务正在运行 (http://localhost:11434)`;
  }
}
