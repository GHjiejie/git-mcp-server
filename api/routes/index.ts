// 路由汇总

import { Router } from "express";
import toolsRoutes from "./tools-routes.js";
import chatRoutes from "./chat-routes.js";

const router = Router();

// 挂载工具路由
router.use("/api", toolsRoutes);

// 挂载聊天路由
router.use("/api", chatRoutes);

export default router;
