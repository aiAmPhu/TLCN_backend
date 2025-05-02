import AdmissionWishes from "../models/admissionWishes.js";
import Transcripts from "../models/Transcript.js";
import Scores from "../models/Score.js";
import AdmissionBlocks from "../models/admissionBlock.js";
import Subjects from "../models/Subject.js";
import AdmissionRegions from "../models/admissionRegion.js";
import AdmissionObjects from "../models/admissionObject.js";
import LearningProcess from "../models/learningProcess.js";
import AdmissionQuantity from "../models/admissionQuantity.js";
import { Op } from "sequelize";

export const addAdmissionWish = async (req, res) => {
    // try {
    //     const { criteriaId, admissionBlockId, majorId, uId, scores, status } = req.body;
    //     const lastWish = await AdmissionWishes.findOne({
    //         order: [["wishId", "DESC"]],
    //         attributes: ["wishId"],
    //     });
    //     const newWishId = lastWish ? lastWish.wishId + 1 : 1;
    //     const existingWishes = await AdmissionWishes.findAll({
    //         where: { uId },
    //         attributes: ["priority"],
    //         order: [["priority", "DESC"]],
    //     });
    //     const priority = existingWishes.length === 0 ? 1 : existingWishes[0].priority + 1;
    //     await AdmissionWishes.create({
    //         wishId: newWishId,
    //         priority,
    //         criteriaId,
    //         admissionBlockId,
    //         majorId,
    //         uId,
    //         scores,
    //         status,
    //     });
    //     res.status(201).json({
    //         message: "Thêm nguyện vọng thành công.",
    //     });
    // } catch (error) {
    //     if (error.name === "SequelizeUniqueConstraintError") {
    //         return res.status(409).json({
    //             message: "Nguyện vọng này đã tồn tại trong hệ thống.",
    //         });
    //     }
    //     if (error instanceof Sequelize.ForeignKeyConstraintError) {
    //         return res.status(422).json({
    //             message: "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại .",
    //         });
    //     }
    //     console.error("Lỗi khi thêm nguyện vọng:", error);
    //     res.status(500).json({ message: "Đã xảy ra lỗi khi thêm nguyện vọng." });
    // }
    try {
        // 1. Lấy dữ liệu từ req.body
        const { criteriaId, admissionBlockId, majorId, uId, status } = req.body;
        // Kiểm tra các trường bắt buộc
        if (!criteriaId || !admissionBlockId || !majorId || !uId) {
            return res
                .status(400)
                .json({ message: "Thiếu các trường bắt buộc: criteriaId, admissionBlockId, majorId, uId." });
        }
        // 2. Tạo wishId mới
        const lastWish = await AdmissionWishes.findOne({
            order: [["wishId", "DESC"]],
            attributes: ["wishId"],
        });
        const newWishId = lastWish ? lastWish.wishId + 1 : 1;
        // 3. Gán priority
        const existingWishes = await AdmissionWishes.findAll({
            where: { uId },
            attributes: ["priority"],
            order: [["priority", "DESC"]],
        });
        const priority = existingWishes.length === 0 ? 1 : existingWishes[0].priority + 1;
        // 4. Lấy transcriptId từ Transcripts
        const transcript = await Transcripts.findOne({
            where: { userId: uId },
            attributes: ["tId"],
        });
        if (!transcript) {
            return res.status(404).json({ message: `Không tìm thấy transcript cho userId ${uId}.` });
        }
        const transcriptId = transcript.tId;
        // 5. Lấy môn học từ AdmissionBlock
        const block = await AdmissionBlocks.findOne({
            where: { admissionBlockId },
            attributes: ["admissionBlockSubject1", "admissionBlockSubject2", "admissionBlockSubject3"],
        });
        if (!block) {
            return res.status(404).json({ message: `Không tìm thấy khối thi ${admissionBlockId}.` });
        }
        // Lấy danh sách môn học từ block
        const subjects = [
            block.admissionBlockSubject1,
            block.admissionBlockSubject2,
            block.admissionBlockSubject3,
        ].filter((subject) => subject); // Loại bỏ null nếu có
        // 6. Lấy suId từ Subject dựa trên tên môn
        const subjectRecords = await Subjects.findAll({
            where: { subject: { [Op.in]: subjects } },
            attributes: ["suId", "subject"],
        });
        const subjectMap = new Map(subjectRecords.map((record) => [record.suId, record.subject]));
        if (subjectRecords.length !== subjects.length) {
            return res.status(400).json({ message: "Một hoặc nhiều môn học trong khối thi không tồn tại." });
        }
        const subjectIds = subjectRecords.map((record) => record.suId);
        // 7. Lấy điểm từ Scores
        const scores = await Scores.findAll({
            where: {
                transcriptId,
                subjectId: { [Op.in]: subjectIds },
            },
            attributes: ["subjectId", "score1", "score2", "year"],
        });
        // console.log("Scores:", scores.length, "Subject IDs:", subjectIds.length);
        const scoresBySubject = new Map();
        scores.forEach((score) => {
            if (!scoresBySubject.has(score.subjectId)) {
                scoresBySubject.set(score.subjectId, []);
            }
            scoresBySubject.get(score.subjectId).push(score);
        });
        for (const suId of subjectIds) {
            if (!scoresBySubject.has(suId) || scoresBySubject.get(suId).length === 0) {
                return res.status(400).json({
                    message: `Thiếu điểm cho môn ${subjectMap.get(suId)}.`,
                });
            }
        }
        // 8. Tính điểm trung bình môn
        let totalSubjectScore = 0;
        for (const suId of subjectIds) {
            const subjectScores = scoresBySubject.get(suId);
            const validScores = subjectScores
                .flatMap((score) => [score.score1, score.score2])
                .filter((score) => score !== null);
            if (validScores.length === 0) {
                return res.status(400).json({
                    message: `Không có điểm hợp lệ cho môn ${subjectMap.get(suId)}.`,
                });
            }
            const avgScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
            totalSubjectScore += avgScore;
        }
        const avgSubjectScore = totalSubjectScore;
        // 9. Lấy điểm cộng vùng và đối tượng từ learning_process
        const learningProcess = await LearningProcess.findOne({
            where: { userId: uId },
            attributes: ["region", "priorityGroup"],
        });
        if (!learningProcess) {
            return res
                .status(404)
                .json({ message: `Không tìm thấy thông tin vùng/ đối tượng ưu tiên cho userId ${uId}.` });
        }
        // Lấy điểm vùng
        let regionScored = 0;
        if (learningProcess.region) {
            const region = await AdmissionRegions.findOne({
                where: { regionId: learningProcess.region },
                attributes: ["regionScored"],
            });
            regionScored = region ? region.regionScored : 0;
        }
        // Lấy điểm đối tượng ưu tiên
        let objectScored = 0;
        if (learningProcess.priorityGroup) {
            const object = await AdmissionObjects.findOne({
                where: { objectId: learningProcess.priorityGroup },
                attributes: ["objectScored"],
            });
            objectScored = object ? object.objectScored : 0;
        }
        // 10. Tính điểm tổng
        const totalScore = avgSubjectScore + regionScored + objectScored;
        // 11. Tạo nguyện vọng mới
        await AdmissionWishes.create({
            wishId: newWishId,
            priority,
            criteriaId,
            admissionBlockId,
            majorId,
            uId,
            scores: totalScore,
            status,
        });
        // 12. Trả về kết quả
        res.status(201).json({
            message: "Thêm nguyện vọng thành công.",
            wishId: newWishId,
            scores: totalScore,
        });
    } catch (error) {
        // Xử lý lỗi
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Nguyện vọng này đã tồn tại trong hệ thống.",
            });
        }
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            return res.status(422).json({
                message: "Dữ liệu không hợp lệ: liên kết khóa ngoại không tồn tại.",
            });
        }
        console.error("Lỗi khi thêm nguyện vọng:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi thêm nguyện vọng." });
    }
};

//Có thể sẽ bỏ
// export const getHighestPriorityAdmissionWishByUID = async (req, res) => {
//     const { uId } = req.params;
//     try {
//         const highestPriorityWish = await AdmissionWishes.findOne({
//             where: { uId },
//             order: [["priority", "DESC"]],
//             attributes: ["priority"], // Chỉ lấy trường priority
//         });
//         if (!highestPriorityWish) {
//             return res.status(404).json({ message: "Không tìm thấy nguyện vọng nào cho người dùng này." });
//         }
//         res.status(200).json({
//             priority: highestPriorityWish.priority,
//         });
//     } catch (error) {
//         console.error("Lỗi khi lấy độ ưu tiên cao nhất:", error);
//         res.status(500).json({ message: "Đã xảy ra lỗi khi lấy độ ưu tiên." });
//     }
// };

export const getAllWishesByUID = async (req, res) => {
    const { uId } = req.params;
    try {
        const wishes = await AdmissionWishes.findAll({
            where: { uId },
            attributes: ["wishId", "priority", "criteriaId", "admissionBlockId", "majorId", "scores", "status"],
            order: [["priority", "ASC"]],
        });
        if (wishes.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy nguyện vọng nào cho người dùng này." });
        }
        res.status(200).json({
            message: "Lấy danh sách nguyện vọng thành công.",
            wishes,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nguyện vọng:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách nguyện vọng." });
    }
};

// export const getAllUniqueEmails = async (req, res) => {
//     try {
//         // Sử dụng phương thức distinct để lấy tất cả các email khác nhau
//         const emails = await AdmissionWish.distinct("email");

//         if (emails.length === 0) {
//             return res.status(400).json({ message: "No emails found" });
//         }

//         // Trả về danh sách các email duy nhất
//         res.status(200).json({ message: "All unique emails found", data: emails });
//     } catch (error) {
//         console.error("Error fetching unique emails:", error); // Log chi tiết lỗi
//         res.status(500).json({ message: error.message });
//     }
// };

export const getWishesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const wishes = await AdmissionWishes.findAll({
            where: { status },
            attributes: ["wishId", "priority", "criteriaId", "admissionBlockId", "majorId", "uId", "scores", "status"],
        });
        if (wishes.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy nguyện vọng nào với trạng thái này." });
        }
        res.status(200).json({ wishes });
    } catch (error) {
        console.error("Lỗi khi lấy nguyện vọng theo trạng thái:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy nguyện vọng." });
    }
};

export const acceptWish = async (req, res) => {
    try {
        const { id } = req.params;
        const wish = await AdmissionWishes.findOne({ where: { wishId: id } });
        if (!wish) {
            return res.status(404).json({ message: "Không tìm thấy nguyện vọng với ID này." });
        }
        wish.status = "accepted";
        await wish.save();
        res.status(200).json({ message: "Nguyện vọng đã được chấp nhận." });
    } catch (error) {
        console.error("Lỗi khi chấp nhận nguyện vọng:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi chấp nhận nguyện vọng." });
    }
};

export const rejectWish = async (req, res) => {
    try {
        const { id } = req.params;
        const wish = await AdmissionWishes.findOne({ where: { wishId: id } });
        if (!wish) {
            return res.status(404).json({ message: "Không tìm thấy nguyện vọng với ID này." });
        }
        wish.status = "rejected";
        await wish.save();
        res.status(200).json({ message: "Nguyện vọng đã bị từ chối." });
    } catch (error) {
        console.error("Lỗi khi chấp nhận nguyện vọng:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi từ chối nguyện vọng." });
    }
};

export const waitingtWish = async (req, res) => {
    try {
        const { id } = req.params;
        const wish = await AdmissionWishes.findOne({ where: { wishId: id } });
        if (!wish) {
            return res.status(404).json({ message: "Không tìm thấy nguyện vọng với ID này." });
        }
        wish.status = "waiting";
        await wish.save();
        res.status(200).json({ message: "Nguyện vọng đã được đưa về trạng thái chờ." });
    } catch (error) {
        console.error("Lỗi khi chấp nhận nguyện vọng:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi điều chỉnh nguyện vọng." });
    }
};

export const getAcceptedWish = async (req, res) => {
    try {
        const acceptedWishes = await AdmissionWishes.findAll({
            where: { status: "accepted" },
            attributes: ["wishId", "priority", "criteriaId", "admissionBlockId", "majorId", "uId", "scores", "status"],
        });
        if (acceptedWishes.length === 0) {
            return res.status(404).json({ message: "Không có nguyện vọng nào được chấp nhận." });
        }
        res.status(200).json(acceptedWishes);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nguyện vọng đã được chấp nhận:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách nguyện vọng đã được chấp nhận." });
    }
};

export const filterAdmissionResults = async (req, res) => {
    try {
        // Lấy toàn bộ nguyện vọng
        const wishes = await AdmissionWishes.findAll({
            where: {
                status: { [Op.not]: "accepted" },
            },
            raw: true,
        });

        // Lấy chỉ tiêu từ bảng Quantity
        const quantities = await AdmissionQuantity.findAll({ raw: true });
        const quotaMap = {};
        for (const q of quantities) {
            const key = `${q.criteriaId}-${q.majorId}`;
            quotaMap[key] = q.quantity ?? 0;
        }

        // Gom nhóm theo criteriaId-majorId
        const grouped = {};
        for (const wish of wishes) {
            const key = `${wish.criteriaId}-${wish.majorId}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(wish);
        }

        const acceptedWishes = [];
        const acceptedUserIds = new Set();

        // Lọc theo từng nhóm
        for (const key in grouped) {
            const group = grouped[key];
            const quota = quotaMap[key] || 0;

            // Sắp xếp theo điểm giảm dần → ưu tiên tăng dần
            group.sort((a, b) => {
                if (b.scores !== a.scores) return b.scores - a.scores;
                return a.priority - b.priority;
            });

            let count = 0;
            for (const wish of group) {
                if (count >= quota) break;
                if (!acceptedUserIds.has(wish.uId)) {
                    acceptedWishes.push(wish);
                    acceptedUserIds.add(wish.uId);
                    count++;
                }
            }
        }

        // Cập nhật kết quả vào DB
        const acceptedIds = acceptedWishes.map((w) => w.wishId);
        const updatePromises = wishes.map((wish) => {
            const status = acceptedIds.includes(wish.wishId) ? "accepted" : "rejected";
            return AdmissionWishes.update({ status }, { where: { wishId: wish.wishId } });
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            message: "Đã lọc và cập nhật kết quả tuyển sinh thành công.",
        });
    } catch (error) {
        console.error("Lỗi lọc kết quả tuyển sinh:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình lọc." });
    }
};

export const resetAllWishesStatus = async (req, res) => {
    try {
        const [affectedRows] = await AdmissionWishes.update({ status: "waiting" }, { where: {} });
        res.status(200).json({
            message: `Đã đặt lại trạng thái cho ${affectedRows} nguyện vọng.`,
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi khi đặt lại trạng thái nguyện vọng.",
        });
    }
};
