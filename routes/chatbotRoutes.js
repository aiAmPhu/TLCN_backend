import express from "express"
import chatbotController from "../controllers/chatbotController.js"
import { authenticate } from "../middleware/authMiddleware.js"

const router = express.Router()

// Apply authentication middleware to all chatbot routes
router.use(authenticate)

// Create a new conversation
router.post("/conversations", chatbotController.createConversation)

// Get all conversations for the current user
router.get("/conversations", chatbotController.getUserConversations)

// Get messages for a specific conversation
router.get("/conversations/:conversationId/messages", chatbotController.getConversationMessages)

// Send a message in a conversation (without attachment)
router.post("/conversations/:conversationId/messages", chatbotController.sendMessage)

// Send a message with attachment
router.post(
  "/conversations/:conversationId/messages/attachment",
  chatbotController.uploadAttachment(),
  chatbotController.sendMessage,
)

// Delete a conversation
router.delete("/conversations/:conversationId", chatbotController.deleteConversation)

export default router
