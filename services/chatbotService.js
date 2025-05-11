import ChatbotConversation from "../models/ChatbotConversation.js"
import ChatbotMessage from "../models/chatbotMessage.js"
import llmService from "./llmService.js"

class ChatbotService {
  /**
   * Create a new conversation
   * @param {number} userId - The user ID
   * @param {string} initialMessage - The initial message from the user
   * @returns {Promise<Object>} - The created conversation and message
   */
  async createConversation(userId, initialMessage) {
    try {
      // Create a new conversation
      const conversation = await ChatbotConversation.create({
        userId,
        title: this._generateConversationTitle(initialMessage),
      })

      // Add the initial user message
      const userMessage = await ChatbotMessage.create({
        conversationId: conversation.conversationId,
        content: initialMessage,
        sender: "user",
      })

      // Generate bot response
      const botResponse = await llmService.generateResponse(initialMessage, [])

      // Save bot response
      const botMessage = await ChatbotMessage.create({
        conversationId: conversation.conversationId,
        content: botResponse,
        sender: "bot",
      })

      return {
        conversation,
        messages: [userMessage, botMessage],
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
      throw error
    }
  }

  /**
   * Send a message in an existing conversation
   * @param {number} conversationId - The conversation ID
   * @param {string} content - The message content
   * @param {string} attachmentUrl - Optional attachment URL
   * @returns {Promise<Object>} - The user message and bot response
   */
  async sendMessage(conversationId, content, attachmentUrl = null) {
    try {
      // Verify conversation exists
      const conversation = await ChatbotConversation.findByPk(conversationId)
      if (!conversation) {
        throw new Error("Conversation not found")
      }

      // Get conversation history
      const conversationHistory = await ChatbotMessage.findAll({
        where: { conversationId },
        order: [["timestamp", "ASC"]],
      })

      // Create user message
      const userMessage = await ChatbotMessage.create({
        conversationId,
        content,
        sender: "user",
        attachmentUrl,
      })

      // Generate bot response
      const botResponse = await llmService.generateResponse(content, conversationHistory)

      // Save bot response
      const botMessage = await ChatbotMessage.create({
        conversationId,
        content: botResponse,
        sender: "bot",
      })

      // Update conversation timestamp
      await conversation.update({ updatedAt: new Date() })

      return {
        userMessage,
        botMessage,
      }
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  /**
   * Get all conversations for a user
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} - List of conversations
   */
  async getUserConversations(userId) {
    try {
      return await ChatbotConversation.findAll({
        where: { userId, isActive: true },
        order: [["updatedAt", "DESC"]],
      })
    } catch (error) {
      console.error("Error getting user conversations:", error)
      throw error
    }
  }

  /**
   * Get messages for a conversation
   * @param {number} conversationId - The conversation ID
   * @returns {Promise<Array>} - List of messages
   */
  async getConversationMessages(conversationId) {
    try {
      return await ChatbotMessage.findAll({
        where: { conversationId },
        order: [["timestamp", "ASC"]],
      })
    } catch (error) {
      console.error("Error getting conversation messages:", error)
      throw error
    }
  }

  /**
   * Delete a conversation (soft delete)
   * @param {number} conversationId - The conversation ID
   * @param {number} userId - The user ID (for verification)
   * @returns {Promise<boolean>} - Success status
   */
  async deleteConversation(conversationId, userId) {
    try {
      const conversation = await ChatbotConversation.findOne({
        where: { conversationId, userId },
      })

      if (!conversation) {
        throw new Error("Conversation not found or not owned by user")
      }

      // Soft delete by marking as inactive
      await conversation.update({ isActive: false })
      return true
    } catch (error) {
      console.error("Error deleting conversation:", error)
      throw error
    }
  }

  /**
   * Generate a title for a new conversation based on the initial message
   * @param {string} initialMessage - The initial message
   * @returns {string} - Generated title
   */
  _generateConversationTitle(initialMessage) {
    // Simple title generation - take first few words
    const words = initialMessage.split(" ")
    const titleWords = words.slice(0, 5)
    let title = titleWords.join(" ")

    // Add ellipsis if truncated
    if (words.length > 5) {
      title += "..."
    }

    return title
  }
}

export default new ChatbotService()
