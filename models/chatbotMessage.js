import { DataTypes } from "sequelize"
import sequelize from "../config/db.js"
import ChatbotConversation from "./chatbotConversation.js"

const ChatbotMessage = sequelize.define(
  "ChatbotMessage",
  {
    messageId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ChatbotConversation,
        key: "conversationId",
      },
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["user", "bot"]],
      },
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "chatbot_messages",
    timestamps: false,
  },
)

// Define relationship with ChatbotConversation
ChatbotConversation.hasMany(ChatbotMessage, { foreignKey: "conversationId" })
ChatbotMessage.belongsTo(ChatbotConversation, { foreignKey: "conversationId" })

export default ChatbotMessage
