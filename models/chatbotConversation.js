import { DataTypes } from "sequelize"
import sequelize from "../config/db.js"
import User from "./user.js"

const ChatbotConversation = sequelize.define(
  "ChatbotConversation",
  {
    conversationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "userId",
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "chatbot_conversations",
    timestamps: true,
  },
)

// Define relationship with User
User.hasMany(ChatbotConversation, { foreignKey: "userId" })
ChatbotConversation.belongsTo(User, { foreignKey: "userId" })

export default ChatbotConversation
