import axios from "axios"
import chatbotConfig from "../config/chatbotConfig.js";

class LLMService {
  constructor() {
    this.config = chatbotConfig.llm
  }

  /**
   * Generate a response using the LLM
   * @param {string} prompt - The user's message
   * @param {Array} conversationHistory - Previous messages in the conversation
   * @returns {Promise<string>} - The LLM's response
   */
  async generateResponse(prompt, conversationHistory = []) {
    try {
      // Format conversation history for the LLM
      const messages = this._formatConversationHistory(conversationHistory)

      // Add the current prompt
      messages.push({
        role: "user",
        content: prompt,
      })

      // Make API request to OpenAI or other LLM provider
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_p: this.config.topP,
          frequency_penalty: this.config.frequencyPenalty,
          presence_penalty: this.config.presencePenalty,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        },
      )

      // Extract and return the response text
      return response.data.choices[0].message.content.trim()
    } catch (error) {
      console.error("Error generating LLM response:", error)
      return chatbotConfig.responseConfig.fallbackResponse
    }
  }

  /**
   * Format conversation history for the LLM API
   * @param {Array} conversationHistory - Array of message objects
   * @returns {Array} - Formatted messages for the LLM API
   */
  _formatConversationHistory(conversationHistory) {
    const messages = [
      {
        role: "system",
        content: chatbotConfig.defaultSystemPrompt,
      },
    ]

    // Add conversation history
    conversationHistory.forEach((message) => {
      messages.push({
        role: message.sender === "user" ? "user" : "assistant",
        content: message.content,
      })
    })

    return messages
  }
}

export default new LLMService()
