// API 服务器主入口

import express from "express";
import cors from "cors";
import { API_CONFIG } from "./config/index.js";
import { mcpService } from "./services/mcp-service.js";
import routes from "./routes/index.js";

const app = express();

// 中间件
app.use(cors({ origin: API_CONFIG.corsOrigin }));
app.use(express.json());

// 挂载路由
app.use(routes);

// 健康检查
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mcpRunning: mcpService.isRunning(),
    timestamp: new Date().toISOString(),
  });
});

// 启动服务器
app.listen(API_CONFIG.port, () => {
  console.log(`🚀 API Server running on http://localhost:${API_CONFIG.port}`);
  console.log(`📡 Health check: http://localhost:${API_CONFIG.port}/health`);

  // 启动 MCP 服务器
  mcpService.start();
});

// 优雅关闭
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down gracefully...");
  mcpService.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down gracefully...");
  mcpService.stop();
  process.exit(0);
});
