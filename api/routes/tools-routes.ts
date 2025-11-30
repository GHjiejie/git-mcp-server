// 工具路由

import { Router } from "express";
import { toolsController } from "../controllers/tools-controller.js";

const router = Router();

// GET /api/tools - 获取工具列表
router.get("/tools", (req, res) => toolsController.getTools(req, res));

// POST /api/tool/call - 调用工具
router.post("/tool/call", (req, res) => toolsController.callTool(req, res));

export default router;
