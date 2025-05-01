import sequelize from "../config/db.js";
import { Transcript, Score } from "../models/associations.js";
import Subject from "../models/Subject.js";

export const addTranscript = async (req, res) => {
    const { userId, scores } = req.body;
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
    const transaction = await sequelize.transaction(); // Tạo transaction để đảm bảo tính toàn vẹn dữ liệu
    try {
        const existingTranscript = await Transcript.findOne({ where: { userId } });
        if (existingTranscript) {
            return res.status(400).json({ message: "Người dùng đã có học bạ!" });
        }
        // Lấy id mới cho transcript
        const lastTranscript = await Transcript.findOne({
            order: [["tId", "DESC"]],
            transaction,
        });
        const newTranscriptId = lastTranscript ? lastTranscript.tId + 1 : 1;
        // Thêm vào bảng transcripts
        await Transcript.create(
            {
                tId: newTranscriptId,
                userId: userId,
                status: "waiting",
                feedback: null,
            },
            { transaction }
        );
        // Lấy danh sách môn học
        const subjects = await Subject.findAll({ attributes: ["suId", "subject"], transaction });
        //  Kiểm tra từng môn học trong dữ liệu `scores`
        // Lấy id cao nhất trong bảng scores
        const lastScore = await Score.findOne({
            order: [["scId", "DESC"]],
            transaction,
        });
        let newScoreId = lastScore ? lastScore.scId + 1 : 1;
        for (const subjectName in scores) {
            const subject = subjects.find((subj) => subj.subject === subjectName);
            if (!subject) {
                // Nếu môn học không có trong bảng subjects, rollback và trả lỗi
                await transaction.rollback();
                return res.status(400).json({ message: `Môn học ${subjectName} không tồn tại trong hệ thống!` });
            }

            // Duyệt qua từng điểm của môn học và thêm điểm vào bảng scores
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
        await transaction.commit(); // Lưu dữ liệu nếu không có lỗi
        res.status(201).json({ message: "Thêm học bạ thành công!" });
    } catch (error) {
        await transaction.rollback(); // Hủy thao tác nếu có lỗi
        console.error("Lỗi:", error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau!" });
    }
};

export const updateTranscript = async (req, res) => {
    const { scores } = req.body;
    const { userId } = req.params;

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

    const transaction = await sequelize.transaction();

    try {
        const transcript = await Transcript.findOne({ where: { userId }, transaction });

        if (!transcript) {
            return res.status(404).json({ message: "Không tìm thấy học bạ của người dùng!" });
        }

        // Reset status + feedback
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
                return res.status(400).json({ message: `Môn học ${subjectName} không tồn tại trong hệ thống!` });
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
        res.status(200).json({ message: "Cập nhật học bạ thành công!" });
    } catch (error) {
        await transaction.rollback();
        console.error("Lỗi khi cập nhật học bạ:", error);
        res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật học bạ!" });
    }
};

export const acceptTranscript = async (req, res) => {
    const { userId } = req.params;
    try {
        const transcript = await Transcript.findOne({ where: { userId } });
        if (!transcript) {
            return res.status(404).json({ message: "Không tìm thấy học bạ của người dùng!" });
        }
        transcript.status = "accepted";
        transcript.feedback = null;
        await transcript.save();
        res.status(200).json({ message: "Đã duyệt học bạ thành công!" });
    } catch (error) {
        console.error("Lỗi khi duyệt học bạ:", error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau!" });
    }
};

export const rejectTranscript = async (req, res) => {
    const { userId } = req.params;
    const { feedback } = req.body;
    try {
        const transcript = await Transcript.findOne({ where: { userId } });

        if (!transcript) {
            return res.status(404).json({ message: "Không tìm thấy học bạ của người dùng!" });
        }
        transcript.status = "rejected";
        transcript.feedback = feedback;
        await transcript.save();
        res.status(200).json({ message: "Đã từ chối học bạ!" });
    } catch (error) {
        console.error("Lỗi khi từ chối học bạ:", error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau!" });
    }
};

export const getAllTranscripts = async (req, res) => {
    try {
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

        res.status(200).json({ message: "Lấy danh sách học bạ thành công", data: transcripts });
    } catch (error) {
        console.error("Lỗi khi lấy học bạ:", error);
        res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
    }
};

export const getTranscriptByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const transcript = await Transcript.findOne({
            where: { userId },
            attributes: ["userId", "status", "feedback"],
            include: [
                {
                    model: Score,
                    as: "scores",
                    attributes: ["subjectID", "year", "score1", "score2"],
                },
            ],
        });

        if (!transcript) {
            return res.status(404).json({ message: "Không tìm thấy học bạ cho người dùng này." });
        }

        res.status(200).json({ message: "Lấy học bạ thành công", data: transcript });
    } catch (error) {
        console.error("Lỗi khi lấy học bạ theo userId:", error);
        res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
    }
};

export const getTranscriptStatusByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const transcript = await Transcript.findOne({
            where: { userId },
            attributes: ["status"],
        });

        if (!transcript) {
            return res.status(404).json({ message: "Không tìm thấy học bạ cho người dùng này." });
        }

        res.status(200).json({ message: "Lấy trạng thái thành công", status: transcript.status });
    } catch (error) {
        console.error("Lỗi khi lấy trạng thái học bạ:", error);
        res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
    }
};

export const getAverageScoreByUserIDAndSubject = async (req, res) => {
    const { userId, subjectName } = req.params;
    try {
        const transcript = await Transcript.findOne({ where: { userId } });
        if (!transcript) {
            return res.status(404).json({ message: "Không tìm thấy học bạ của người dùng." });
        }
        const subject = await Subject.findOne({ where: { subject: subjectName } });
        if (!subject) {
            return res.status(404).json({ message: "Không tìm thấy môn học." });
        }
        const scores = await Score.findAll({
            where: {
                transcriptId: transcript.tId,
                subjectId: subject.suId,
            },
        });
        if (scores.length === 0) {
            return res.status(404).json({ message: "Không có điểm cho môn học này." });
        }
        let total = 0;
        let count = 0;
        for (const s of scores) {
            if (s.score1 !== null) {
                total += s.score1;
                count++;
            }
            if (s.score2 !== null) {
                total += s.score2;
                count++;
            }
        }
        const average = count > 0 ? (total / count).toFixed(2) : null;
        res.status(200).json({
            userId,
            subject: subjectName,
            averageScore: average,
        });
    } catch (error) {
        console.error("Lỗi khi tính điểm trung bình:", error);
        res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
    }
};
