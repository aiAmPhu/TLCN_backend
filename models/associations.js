import Transcript from "./Transcript.js";
import Score from "./Score.js";
import User from "./user.js";
import Subject from "./Subject.js";

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

Score.belongsTo(Subject, {
    foreignKey: "subjectId", // key trong bảng Score
    targetKey: "suId", // key trong bảng Subject
    as: "subject", // tên alias dùng trong include
});

export { Transcript, Score, User };
