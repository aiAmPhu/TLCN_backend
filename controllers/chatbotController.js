import chatbotService from "../services/chatbotService.js"
import fileService from "../services/fileService.js"

class ChatbotController {
  /**
   * Create a new conversation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createConversation(req, res) {
    try {
      const { message } = req.body
      const userId = req.user.userId

      if (!message) {
        return res.status(400).json({ message: "Message is required" })
      }

      const result = await chatbotService.createConversation(userId, message)

      res.status(201).json({
        message: "Conversation created successfully",
        data: result,
      })
    } catch (error) {
      console.error("Error in createConversation:", error)
      res.status(500).json({ message: "Error creating conversation", error: error.message })
    }
  }

  /**
   * Send a message in an existing conversation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendMessage(req, res) {
    try {
      const { conversationId } = req.params
      const { message } = req.body
      const userId = req.user.userId

      if (!message) {
        return res.status(400).json({ message: "Message is required" })
      }

      // Check if user owns the conversation
      const conversations = await chatbotService.getUserConversations(userId)
      const conversationExists = conversations.some((conv) => conv.conversationId === Number.parseInt(conversationId))

      if (!conversationExists) {
        return res.status(403).json({ message: "Unauthorized access to conversation" })
      }

      // Process attachment if present
      let attachmentUrl = null
      if (req.file) {
        const fileInfo = fileService.processUploadedFile(req.file)
        attachmentUrl = fileInfo.url
      }

      const result = await chatbotService.sendMessage(Number.parseInt(conversationId), message, attachmentUrl)

      res.status(200).json({
        message: "Message sent successfully",
        data: result,
      })
    } catch (error) {
      console.error("Error in sendMessage:", error)
      res.status(500).json({ message: "Error sending message", error: error.message })
    }
  }

  /**
   * Get all conversations for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserConversations(req, res) {
    try {
      const userId = req.user.userId
      const conversations = await chatbotService.getUserConversations(userId)

      res.status(200).json({
        message: "Conversations retrieved successfully",
        data: conversations,
      })
    } catch (error) {
      console.error("Error in getUserConversations:", error)
      res.status(500).json({ message: "Error retrieving conversations", error: error.message })
    }
  }

  /**
   * Get messages for a specific conversation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getConversationMessages(req, res) {
    try {
      const { conversationId } = req.params
      const userId = req.user.userId

      // Check if user owns the conversation
      const conversations = await chatbotService.getUserConversations(userId)
      const conversationExists = conversations.some((conv) => conv.conversationId === Number.parseInt(conversationId))

      if (!conversationExists) {
        return res.status(403).json({ message: "Unauthorized access to conversation" })
      }

      const messages = await chatbotService.getConversationMessages(Number.parseInt(conversationId))

      res.status(200).json({
        message: "Messages retrieved successfully",
        data: messages,
      })
    } catch (error) {
      console.error("Error in getConversationMessages:", error)
      res.status(500).json({ message: "Error retrieving messages", error: error.message })
    }
  }

  /**
   * Delete a conversation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params
      const userId = req.user.userId

      await chatbotService.deleteConversation(Number.parseInt(conversationId), userId)

      res.status(200).json({
        message: "Conversation deleted successfully",
      })
    } catch (error) {
      console.error("Error in deleteConversation:", error)
      res.status(500).json({ message: "Error deleting conversation", error: error.message })
    }
  }

  /**
   * Upload file middleware
   * @returns {Function} - Multer middleware
   */
  uploadAttachment() {
    return fileService.getUploadMiddleware()
  }
}

export default new ChatbotController()
