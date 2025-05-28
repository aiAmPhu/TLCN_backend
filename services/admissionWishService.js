import AdmissionWishes from "../models/admissionWishes.js";
import Transcripts from "../models/Transcript.js";
import Scores from "../models/Score.js";
import AdmissionBlocks from "../models/admissionBlock.js";
import Subjects from "../models/Subject.js";
import AdmissionRegions from "../models/admissionRegion.js";
import AdmissionObjects from "../models/admissionObject.js";
import LearningProcess from "../models/learningProcess.js";
import AdmissionQuantity from "../models/admissionQuantity.js";
import User from "../models/user.js";
import { Op } from "sequelize";
import { ApiError } from "../utils/ApiError.js";

export const addAdmissionWish = async (data) => {
    const { criteriaId, admissionBlockId, majorId, uId, status } = data;
    if (!criteriaId || !admissionBlockId || !majorId || !uId) {
        throw new ApiError(400, "Thiếu các trường bắt buộc: criteriaId, admissionBlockId, majorId, uId.");
    }
    const lastWish = await AdmissionWishes.findOne({ order: [["wishId", "DESC"]], attributes: ["wishId"] });
    const newWishId = lastWish ? lastWish.wishId + 1 : 1;
    const existingWishes = await AdmissionWishes.findAll({
        where: { uId },
        attributes: ["priority"],
        order: [["priority", "DESC"]],
    });
    const priority = existingWishes.length === 0 ? 1 : existingWishes[0].priority + 1;
    const transcript = await Transcripts.findOne({ where: { userId: uId }, attributes: ["tId"] });
    if (!transcript) throw new ApiError(404, `Không tìm thấy transcript cho userId ${uId}.`);
    const transcriptId = transcript.tId;
    const block = await AdmissionBlocks.findOne({
        where: { admissionBlockId },
        attributes: ["admissionBlockSubject1", "admissionBlockSubject2", "admissionBlockSubject3"],
    });
    if (!block) throw new ApiError(404, `Không tìm thấy khối thi ${admissionBlockId}.`);
    const subjects = [block.admissionBlockSubject1, block.admissionBlockSubject2, block.admissionBlockSubject3].filter(
        Boolean
    );
    const subjectRecords = await Subjects.findAll({
        where: { subject: { [Op.in]: subjects } },
        attributes: ["suId", "subject"],
    });
    if (subjectRecords.length !== subjects.length)
        throw new ApiError(400, "Một hoặc nhiều môn học trong khối thi không tồn tại.");
    const subjectIds = subjectRecords.map((r) => r.suId);
    const subjectMap = new Map(subjectRecords.map((r) => [r.suId, r.subject]));
    const scores = await Scores.findAll({
        where: { transcriptId, subjectId: { [Op.in]: subjectIds } },
        attributes: ["subjectId", "score1", "score2", "year"],
    });
    const scoresBySubject = new Map();
    scores.forEach((s) => {
        if (!scoresBySubject.has(s.subjectId)) scoresBySubject.set(s.subjectId, []);
        scoresBySubject.get(s.subjectId).push(s);
    });
    for (const suId of subjectIds) {
        if (!scoresBySubject.has(suId) || scoresBySubject.get(suId).length === 0) {
            throw new ApiError(400, `Thiếu điểm cho môn ${subjectMap.get(suId)}.`);
        }
    }
    let totalSubjectScore = 0;
    for (const suId of subjectIds) {
        const subjectScores = scoresBySubject.get(suId);
        const validScores = subjectScores.flatMap((s) => [s.score1, s.score2]).filter((s) => s !== null);
        if (validScores.length === 0) throw new ApiError(400, `Không có điểm hợp lệ cho môn ${subjectMap.get(suId)}.`);
        totalSubjectScore += validScores.reduce((sum, s) => sum + s, 0) / validScores.length;
    }
    const learningProcess = await LearningProcess.findOne({
        where: { userId: uId },
        attributes: ["region", "priorityGroup"],
    });
    if (!learningProcess)
        throw new ApiError(404, `Không tìm thấy thông tin vùng/ đối tượng ưu tiên cho userId ${uId}.`);
    let regionScored = 0;
    if (learningProcess.region) {
        const region = await AdmissionRegions.findOne({
            where: { regionId: learningProcess.region },
            attributes: ["regionScored"],
        });
        regionScored = region ? region.regionScored : 0;
    }
    let objectScored = 0;
    if (learningProcess.priorityGroup) {
        const object = await AdmissionObjects.findOne({
            where: { objectId: learningProcess.priorityGroup },
            attributes: ["objectScored"],
        });
        objectScored = object ? object.objectScored : 0;
    }
    const totalScore = totalSubjectScore + regionScored + objectScored;
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
    return { message: "Thêm nguyện vọng thành công.", wishId: newWishId, scores: totalScore };
};

export const getAllWishesByUID = async (uId) => {
    if (!uId) {
        throw new ApiError(400, "Thiếu userId.");
    }
    const wishes = await AdmissionWishes.findAll({
        where: { uId },
        attributes: ["wishId", "priority", "criteriaId", "admissionBlockId", "majorId", "scores", "status"],
        order: [["priority", "ASC"]],
    });
    if (!wishes || wishes.length === 0) {
        throw new ApiError(404, "Không tìm thấy nguyện vọng nào của user này.");
    }
    return wishes;
};

export const getAcceptedWishes = async () => {
    const wishes = await AdmissionWishes.findAll({
        where: { status: "accepted" },
        attributes: ["wishId", "priority", "criteriaId", "admissionBlockId", "majorId", "uId", "scores", "status"],
        order: [["priority", "ASC"]],
    });
    if (!wishes || wishes.length === 0) {
        throw new ApiError(404, "Không có nguyện vọng nào được chấp nhận.");
    }
    return wishes;
};

export const filterAdmissionResults = async () => {
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
    return {
        message: "Đã lọc và cập nhật kết quả tuyển sinh thành công.",
    };
};

export const resetAllWishesStatus = async () => {
    const [affectedRows] = await AdmissionWishes.update({ status: "waiting" }, { where: {} });
    return {
        message: `Đã đặt lại trạng thái cho ${affectedRows} nguyện vọng.`,
    };
};

export const getWishesByReviewerPermission = async (reviewerUserId) => {
    // Lấy majorGroup của reviewer
    const reviewer = await User.findByPk(reviewerUserId);
    if (!reviewer || !reviewer.majorGroup || reviewer.majorGroup.length === 0) {
        throw new ApiError(403, "Reviewer chưa được phân quyền ngành nào");
    }
    // Lấy wishes có majorId trong majorGroup của reviewer
    const wishes = await AdmissionWishes.findAll({
        where: {
            majorId: {
                [Op.in]: reviewer.majorGroup,
            },
        },
        attributes: ["wishId", "priority", "criteriaId", "admissionBlockId", "majorId", "uId", "scores", "status"],
    });
    if (wishes.length === 0) {
        return [];
    }
    // Lấy unique userIds từ wishes
    const userIds = [...new Set(wishes.map((wish) => wish.uId))];
    // Lấy thông tin user
    const users = await User.findAll({
        where: {
            userId: {
                [Op.in]: userIds,
            },
        },
        attributes: ["userId", "name", "email"],
    });
    return users; // Trả về danh sách users thay vì wishes
};
