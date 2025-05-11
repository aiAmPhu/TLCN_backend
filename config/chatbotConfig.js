// config/chatbotConfig.js
const chatbotConfig = {
  // LLM configuration
  llm: {
    model: process.env.LLM_MODEL || "gpt-3.5-turbo",
    apiKey: process.env.LLM_API_KEY,
    temperature: 0.7,
    maxTokens: 500,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },

  // File upload configuration
  fileUpload: {
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    uploadDir: "./uploads/chatbot",
  },

  // Default system prompt
  defaultSystemPrompt:
    "You are a helpful assistant for the UTE university admission system. You can provide information about admission processes, majors, requirements, and other related topics.",

  // Response configuration
  responseConfig: {
    maxResponseLength: 2000,
    fallbackResponse: "I'm sorry, I couldn't process your request. Please try again later.",
  },
};

export default chatbotConfig;