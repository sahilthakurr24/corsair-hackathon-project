import express, { Router } from "express";
import {
  createConversation,
  sendMessage,
  listConversations,
  getMessages,
} from "../controller/chat";
const router: Router = express.Router();

router.post("/chat", createConversation);
router.get("/chat", listConversations);
router.post("/chat/:conversationId/messages", sendMessage);
router.get("/chat/:conversationId/messages", getMessages);

export default router;
