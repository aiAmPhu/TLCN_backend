import sequelize from "../config/db.js";
import { Transcript, Score } from "../models/associations.js";
import Subject from "../models/Subject.js";
import { ApiError } from "../utils/ApiError.js";
import { Sequelize } from "sequelize";

const mergeSemesters = (subjectScores) => {
    const merged = {};
    for (const entry of subjectScores) {
        const { year, semester, score } = entry;
        if (!merged[year]) merged[year] = {};
        if (semester === "Học kỳ 1") merged[year].score1 = score;
        if (semester === "Học kỳ 2") merged[year].score2 = score;
    }
    return Object.entries(merged).map(([year, scores]) => ({
        year,
        score1: scores.score1 ?? null,
        score2: scores.score2 ?? null,
    }));
};

export const addTranscript = async (userId, scores) => {
    const transaction = await sequelize.transaction();
    try {
        const existingTranscript = await Transcript.findOne({ where: { userId } });
        if (existingTranscript) {
            throw new ApiError(400, "Người dùng đã có học bạ!");
        }
        const lastTranscript = await Transcript.findOne({
            order: [["tId", "DESC"]],
            transaction,
        });
        const newTranscriptId = lastTranscript ? lastTranscript.tId + 1 : 1;
        await Transcript.create(
            {
                tId: newTranscriptId,
                userId: userId,
                status: "waiting",
                feedback: null,
            },
            { transaction }
        );
        const subjects = await Subject.findAll({ attributes: ["suId", "subject"], transaction });
        const lastScore = await Score.findOne({
            order: [["scId", "DESC"]],
            transaction,
        });
        let newScoreId = lastScore ? lastScore.scId + 1 : 1;
        for (const subjectName in scores) {
            const subject = subjects.find((subj) => subj.subject === subjectName);
            if (!subject) {
                await transaction.rollback();
                throw new ApiError(400, `Môn học ${subjectName} không tồn tại trong hệ thống!`);
            }
            const mergedScores = mergeSemesters(scores[subjectName]);
            for (const entry of mergedScores) {
                await Score.create(
                    {
                        scId: newScoreId++,
                        subjectId: subject.suId,
                        transcriptId: newTranscriptId,
                        year: entry.year,
                        score1: entry.score1,
                        score2: entry.score2,
                    },
                    { transaction }
                );
            }
        }
        await transaction.commit();
        return { message: "Thêm học bạ thành công!" };
    } catch (error) {
        await transaction.rollback();
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            throw new ApiError(422, "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại (userId không tồn tại).");
        }
        throw new ApiError(error.statusCode || 500, error.message || "Có lỗi xảy ra, vui lòng thử lại sau!");
    }
};

export const updateTranscript = async (userId, scores) => {
    const transaction = await sequelize.transaction();
    try {
        const transcript = await Transcript.findOne({ where: { userId }, transaction });
        if (!transcript) {
            throw new ApiError(404, "Không tìm thấy học bạ của người dùng!");
        }
        await transcript.update(
            {
                status: "waiting",
                feedback: null,
            },
            { transaction }
        );
        // Xóa điểm cũ
        await Score.destroy({
            where: { transcriptId: transcript.tId },
            transaction,
        });
        // Lấy danh sách môn học
        const subjects = await Subject.findAll({ attributes: ["suId", "subject"], transaction });
        // Lấy scId hiện tại
        const lastScore = await Score.findOne({
            order: [["scId", "DESC"]],
            transaction,
        });
        let newScoreId = lastScore ? lastScore.scId + 1 : 1;
        for (const subjectName in scores) {
            const subject = subjects.find((subj) => subj.subject === subjectName);
            if (!subject) {
                await transaction.rollback();
                throw new ApiError(400, `Môn học ${subjectName} không tồn tại trong hệ thống!`);
            }
            const mergedScores = mergeSemesters(scores[subjectName]);
            for (const entry of mergedScores) {
                await Score.create(
                    {
                        scId: newScoreId++,
                        subjectId: subject.suId,
                        transcriptId: transcript.tId,
                        year: entry.year,
                        score1: entry.score1,
                        score2: entry.score2,
                    },
                    { transaction }
                );
            }
        }
        await transaction.commit();
        return { message: "Cập nhật học bạ thành công!" };
    } catch (error) {
        await transaction.rollback();
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            throw new ApiError(422, "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại.");
        }
        throw new ApiError(error.statusCode || 500, error.message || "Có lỗi xảy ra khi cập nhật học bạ!");
    }
};

export const acceptTranscript = async (userId) => {
    const transcript = await Transcript.findOne({ where: { userId } });
    if (!transcript) {
        throw new ApiError(404, "Không tìm thấy học bạ của người dùng!");
    }
    transcript.status = "accepted";
    transcript.feedback = null;
    await transcript.save();
    return { message: "Đã duyệt học bạ thành công!" };
};

export const rejectTranscript = async (userId, feedback) => {
    const transcript = await Transcript.findOne({ where: { userId } });
    if (!transcript) {
        throw new ApiError(404, "Không tìm thấy học bạ của người dùng!");
    }
    transcript.status = "rejected";
    transcript.feedback = feedback;
    await transcript.save();
    return { message: "Đã từ chối học bạ!" };
};

export const getAllTranscripts = async () => {
    const transcripts = await Transcript.findAll({
        attributes: ["userId", "status", "feedback"],
        include: [
            {
                model: Score,
                as: "scores",
                attributes: ["year", "score1", "score2", "subjectID"],
            },
        ],
    });
    if (!transcripts || transcripts.length === 0) {
        throw new ApiError(404, "Không có học bạ nào!");
    }
    return transcripts;
};

export const getTranscriptByUserId = async (userId) => {
    const transcript = await Transcript.findOne({
        where: { userId },
        attributes: ["userId", "status", "feedback"],
        include: [
            {
                model: Score,
                as: "scores",
                attributes: ["subjectID", "year", "score1", "score2"],
                include: [
                    {
                        model: Subject,
                        as: "subject",
                        attributes: ["subject"],
                    },
                ],
            },
        ],
    });
    if (!transcript) {
        throw new ApiError(404, "Không tìm thấy học bạ cho người dùng này.");
    }
    const plainTranscript = transcript.toJSON();
    plainTranscript.scores = plainTranscript.scores.map((score) => ({
        year: score.year,
        subject: score.subject?.subject || "Không rõ môn",
        score1: score.score1,
        score2: score.score2,
    }));
    return plainTranscript;
};
