// 聊天路由

import { Router } from "express";
import { chatController } from "../controllers/chat-controller.js";

const router = Router();

// POST /api/chat/stream - 聊天流式输出
router.post("/chat/stream", (req, res) => chatController.stream(req, res));

export default router;
