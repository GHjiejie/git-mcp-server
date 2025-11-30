// API 服务器配置

export const API_CONFIG = {
  port: 3001,
  corsOrigin: "*",
  mcpServerPath: "dist/index.js",
  requestTimeout: 30000,
  streamDelay: 50,
} as const;
