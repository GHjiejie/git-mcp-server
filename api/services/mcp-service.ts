// MCP 服务器管理服务

import { spawn, ChildProcess } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { API_CONFIG } from "../config/index.js";
import { MCPRequest, MCPResponse } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MCPService {
  private mcpProcess: ChildProcess | null = null;

  /**
   * 启动 MCP 服务器进程
   */
  start(): void {
    if (this.mcpProcess) {
      console.log("MCP Server is already running");
      return;
    }

    const mcpPath = join(__dirname, "../../", API_CONFIG.mcpServerPath);
    this.mcpProcess = spawn("node", [mcpPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.mcpProcess.stderr?.on("data", (data: Buffer) => {
      console.error("MCP Server stderr:", data.toString());
    });

    this.mcpProcess.on("error", (error: Error) => {
      console.error("❌ MCP Server error:", error);
    });

    this.mcpProcess.on("exit", (code: number) => {
      console.log(`⚠️  MCP Server exited with code ${code}`);
      this.mcpProcess = null;
    });

    console.log("✅ MCP Server started");
  }

  /**
   * 停止 MCP 服务器进程
   */
  stop(): void {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
      console.log("MCP Server stopped");
    }
  }

  /**
   * 检查 MCP 服务器是否正在运行
   */
  isRunning(): boolean {
    return this.mcpProcess !== null;
  }

  /**
   * 调用 MCP 工具
   */
  async callTool(toolName: string, params: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mcpProcess) {
        return reject(new Error("MCP Server not running"));
      }

      const request: MCPRequest = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: params,
        },
      };

      let response = "";

      const timeout = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, API_CONFIG.requestTimeout);

      const dataHandler = (data: Buffer) => {
        response += data.toString();

        try {
          const result: MCPResponse = JSON.parse(response);
          clearTimeout(timeout);

          // 移除监听器
          this.mcpProcess?.stdout?.off("data", dataHandler);

          if (result.error) {
            reject(new Error(result.error.message));
          } else if (result.result) {
            const content = result.result.content[0]?.text || "";
            resolve(content);
          }
        } catch (e) {
          // 还没有接收完整的响应
        }
      };

      this.mcpProcess.stdout?.on("data", dataHandler);
      this.mcpProcess.stdin?.write(JSON.stringify(request) + "\n");
    });
  }
}

// 导出单例
export const mcpService = new MCPService();
