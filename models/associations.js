import Transcript from "./Transcript.js";
import Score from "./Score.js";
import User from "./user.js";

// Quan hệ
Transcript.hasMany(Score, {
    foreignKey: "transcriptId",
    as: "scores",
});

Score.belongsTo(Transcript, {
    foreignKey: "transcriptId",
    as: "transcript",
});

Transcript.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasOne(Transcript, {
    foreignKey: "userId",
    as: "transcript",
});

export { Transcript, Score, User };
