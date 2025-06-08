import AdmissionWishes from "../models/admissionWishes.js";
import AdmissionYearConfig from "../models/admissionYearConfig.js";
import AdmissionYear from "../models/admissionYear.js";
import AdmissionMajor from "../models/admissionMajor.js";
import AdmissionCriteria from "../models/admissionCriteria.js";
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
import sequelize from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import * as statisticsSnapshotService from "./statisticsSnapshotService.js";
export const getFilteredWishesForAdmin = async (filterConditions) => {
    try {
        const whereCondition = {};

        if (filterConditions.majorIds) {
            whereCondition.majorId = { [Op.in]: filterConditions.majorIds };
        }

        if (filterConditions.criteriaIds) {
            whereCondition.criteriaId = { [Op.in]: filterConditions.criteriaIds };
        }

        if (filterConditions.blockIds) {
            whereCondition.admissionBlockId = { [Op.in]: filterConditions.blockIds };
        }

        if (filterConditions.status) {
            whereCondition.status = { [Op.in]: filterConditions.status };
        }

        if (filterConditions.minScore !== undefined || filterConditions.maxScore !== undefined) {
            whereCondition.scores = {};
            if (filterConditions.minScore !== undefined) {
                whereCondition.scores[Op.gte] = filterConditions.minScore;
            }
            if (filterConditions.maxScore !== undefined) {
                whereCondition.scores[Op.lte] = filterConditions.maxScore;
            }
        }

        const wishes = await AdmissionWishes.findAll({
            where: whereCondition,
            include: [
                {
                    model: AdmissionMajor,
                    attributes: ["majorId", "majorName"],
                },
                {
                    model: AdmissionCriteria,
                    attributes: ["criteriaId", "criteriaName"],
                },
                {
                    model: AdmissionBlocks,
                    attributes: [
                        "admissionBlockId",
                        "admissionBlockName",
                        "admissionBlockSubject1",
                        "admissionBlockSubject2",
                        "admissionBlockSubject3",
                    ],
                },
                {
                    model: User,
                    attributes: ["userId", "name", "email", "role"],
                },
            ],
            order: [
                ["priority", "ASC"],
                ["scores", "DESC"],
                ["createdAt", "DESC"],
            ],
        });

        return {
            message: "Lọc nguyện vọng cho admin thành công",
            data: wishes,
        };
    } catch (error) {
        console.error("Error filtering wishes for admin:", error);
        throw new ApiError(500, "Lỗi khi lọc nguyện vọng cho admin");
    }
};
export const getFilterStatistics = async (filterConditions) => {
    try {
        const whereCondition = buildWhereConditionFromFilter(filterConditions);

        // Thống kê cơ bản
        const totalWishes = await AdmissionWishes.count({
            where: whereCondition,
        });

        const uniqueStudents = await AdmissionWishes.count({
            where: whereCondition,
            distinct: true,
            col: "uId",
        });

        // Thống kê theo trạng thái
        const statusStats = await AdmissionWishes.findAll({
            where: whereCondition,
            attributes: ["status", [sequelize.fn("COUNT", sequelize.col("wishId")), "count"]],
            group: ["status"],
            raw: true,
        });

        // Thống kê theo ngành (top 10)
        const majorStats = await AdmissionWishes.findAll({
            where: whereCondition,
            include: [
                {
                    model: AdmissionMajor,
                    attributes: ["majorId", "majorName"],
                },
            ],
            attributes: [
                [sequelize.fn("COUNT", sequelize.col("AdmissionWishes.wishId")), "wishCount"],
                [sequelize.fn("COUNT", sequelize.fn("DISTINCT", sequelize.col("uId"))), "studentCount"],
                [sequelize.fn("AVG", sequelize.col("scores")), "avgScore"],
            ],
            group: ["AdmissionMajor.majorId", "AdmissionMajor.majorName"],
            order: [[sequelize.fn("COUNT", sequelize.col("AdmissionWishes.wishId")), "DESC"]],
            limit: 10,
            raw: true,
        });

        // Thống kê theo diện
        const criteriaStats = await AdmissionWishes.findAll({
            where: whereCondition,
            include: [
                {
                    model: AdmissionCriteria,
                    attributes: ["criteriaId", "criteriaName"],
                },
            ],
            attributes: [
                [sequelize.fn("COUNT", sequelize.col("AdmissionWishes.wishId")), "wishCount"],
                [sequelize.fn("COUNT", sequelize.fn("DISTINCT", sequelize.col("uId"))), "studentCount"],
                [sequelize.fn("AVG", sequelize.col("scores")), "avgScore"],
            ],
            group: ["AdmissionCriterium.criteriaId", "AdmissionCriterium.criteriaName"],
            order: [[sequelize.fn("COUNT", sequelize.col("AdmissionWishes.wishId")), "DESC"]],
            raw: true,
        });

        return {
            overview: {
                totalWishes,
                uniqueStudents,
                averageWishesPerStudent: totalWishes > 0 ? (totalWishes / uniqueStudents).toFixed(2) : 0,
            },
            statusBreakdown: statusStats,
            topMajors: majorStats,
            criteriaBreakdown: criteriaStats,
            filterApplied: filterConditions,
            generatedAt: new Date(),
        };
    } catch (error) {
        console.error("Error getting filter statistics:", error);
        throw new ApiError(500, "Lỗi khi lấy thống kê filter");
    }
};
const buildWhereConditionFromFilter = (filterConditions) => {
    const whereCondition = {};

    if (filterConditions.majorIds && filterConditions.majorIds.length > 0) {
        whereCondition.majorId = { [Op.in]: filterConditions.majorIds };
    }

    if (filterConditions.criteriaIds && filterConditions.criteriaIds.length > 0) {
        whereCondition.criteriaId = { [Op.in]: filterConditions.criteriaIds };
    }

    if (filterConditions.blockIds && filterConditions.blockIds.length > 0) {
        whereCondition.admissionBlockId = { [Op.in]: filterConditions.blockIds };
    }

    if (filterConditions.status && filterConditions.status.length > 0) {
        whereCondition.status = { [Op.in]: filterConditions.status };
    }

    if (filterConditions.minScore !== undefined || filterConditions.maxScore !== undefined) {
        whereCondition.scores = {};
        if (filterConditions.minScore !== undefined) {
            whereCondition.scores[Op.gte] = filterConditions.minScore;
        }
        if (filterConditions.maxScore !== undefined) {
            whereCondition.scores[Op.lte] = filterConditions.maxScore;
        }
    }

    return whereCondition;
};
export const getActiveYearWishData = async (userId) => {
    try {
        // Lấy năm active
        const activeYear = await AdmissionYear.findOne({
            where: { status: "active" },
        });
        if (!activeYear) {
            throw new ApiError(400, "Không có năm tuyển sinh nào đang hoạt động");
        }
        // Lấy config của năm active
        const config = await AdmissionYearConfig.findOne({
            where: {
                yearId: activeYear.yearId,
                isActive: true,
            },
        });
        if (!config) {
            throw new ApiError(400, "Năm tuyển sinh chưa được cấu hình");
        }
        // Lấy chi tiết criteria, majors, blocks dựa trên IDs trong config
        const [criteria, majors, allBlocks, userWishes] = await Promise.all([
            // Lấy criteria theo IDs
            AdmissionCriteria.findAll({
                where: {
                    criteriaId: { [Op.in]: config.criteriaIds || [] },
                },
                attributes: ["criteriaId", "criteriaName"],
            }),
            // Lấy majors theo IDs
            AdmissionMajor.findAll({
                where: {
                    majorId: { [Op.in]: config.majorIds || [] },
                },
                attributes: ["majorId", "majorName", "majorCombination"],
            }),
            // Lấy tất cả blocks
            AdmissionBlocks.findAll({
                attributes: ["admissionBlockId", "admissionBlockName"],
            }),
            // Lấy wishes của user
            AdmissionWishes.findAll({
                where: { uId: userId },
                attributes: ["wishId", "priority", "criteriaId", "admissionBlockId", "majorId", "scores", "status"],
                include: [
                    {
                        model: AdmissionMajor,
                        attributes: ["majorName"],
                    },
                    {
                        model: AdmissionCriteria,
                        attributes: ["criteriaName"],
                    },
                    {
                        model: AdmissionBlocks,
                        attributes: ["admissionBlockName"],
                    },
                ],
                order: [["priority", "ASC"]],
            }),
        ]);
        const formattedWishes = userWishes.map((wish) => {
            // Lấy data từ Sequelize instance
            const wishData = wish.get ? wish.get({ plain: true }) : wish;
            return {
                wishId: wishData.wishId,
                priority: wishData.priority,
                criteriaId: wishData.criteriaId,
                admissionBlockId: wishData.admissionBlockId,
                majorId: wishData.majorId,
                scores: wishData.scores,
                status: wishData.status,
                // Include data từ associations
                majorName: wishData.AdmissionMajor?.majorName || "",
                criteriaName: wishData.AdmissionCriterium?.criteriaName || "",
                admissionBlockName: wishData.AdmissionBlock?.admissionBlockName || "",
            };
        });

        // Tạo majors với available blocks
        const majorsWithBlocks = majors.map((major) => {
            const availableBlocks = allBlocks.filter(
                (block) => major.majorCombination && major.majorCombination.includes(block.admissionBlockId)
            );
            return {
                ...major.toJSON(),
                availableBlocks,
            };
        });
        // Filter user wishes chỉ lấy những cái thuộc config hiện tại
        // const allowedCriteriaIds = config.criteriaIds || [];
        // const allowedMajorIds = config.majorIds || [];
        // const filteredUserWishes = formattedWishes.filter(
        //     (wish) => allowedCriteriaIds.includes(wish.criteriaId) && allowedMajorIds.includes(wish.majorId)
        // );
        //console.log("Wishes:", filteredUserWishes);
        return {
            message: "Lấy dữ liệu nguyện vọng thành công",
            data: {
                criteria: criteria || [],
                majors: majorsWithBlocks,
                blocks: allBlocks,
                userWishes: formattedWishes,
                activeYear: activeYear.yearName,
                yearId: activeYear.yearId,
            },
        };
    } catch (error) {
        console.error("Error getting active year wish data:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Lỗi khi lấy dữ liệu nguyện vọng");
    }
};

export const addAdmissionWish = async (data) => {
    const { criteriaId, admissionBlockId, majorId, uId, status } = data;
    if (!criteriaId || !admissionBlockId || !majorId || !uId) {
        throw new ApiError(400, "Thiếu các trường bắt buộc: criteriaId, admissionBlockId, majorId, uId.");
    }
    // Kiểm tra với config năm active
    const activeYear = await AdmissionYear.findOne({
        where: { status: "active" },
    });
    if (!activeYear) {
        throw new ApiError(400, "Không có năm tuyển sinh nào đang hoạt động");
    }
    const config = await AdmissionYearConfig.findOne({
        where: {
            yearId: activeYear.yearId,
            isActive: true,
        },
    });
    if (!config) {
        throw new ApiError(400, "Năm tuyển sinh chưa được cấu hình");
    }
    // Validate options đơn giản
    if (!config.criteriaIds.includes(criteriaId)) {
        throw new ApiError(403, "Diện xét tuyển này không được phép trong năm hiện tại");
    }
    if (!config.majorIds.includes(majorId)) {
        throw new ApiError(403, "Ngành học này không được phép trong năm hiện tại");
    }
    // Validate block thuộc major
    const major = await AdmissionMajor.findByPk(majorId);
    if (!major || !major.majorCombination.includes(admissionBlockId)) {
        throw new ApiError(400, "Khối xét tuyển không phù hợp với ngành đã chọn");
    }
    // Kiểm tra duplicate
    const existingWish = await AdmissionWishes.findOne({
        where: { uId, criteriaId, majorId, admissionBlockId },
    });
    if (existingWish) {
        throw new ApiError(400, "Nguyện vọng này đã tồn tại");
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

export const getFilteredAcceptedWishes = async (filterType, filterValue = null, limit = null) => {
    let baseQuery = {
        where: { status: "accepted" },
        include: [
            {
                model: User,
                attributes: ["userId", "name", "email"],
            },
        ],
        order: [],
    };

    switch (filterType) {
        case "top3":
            // Lọc top 3 điểm cao nhất - Sửa theo kiểu dữ liệu scores
            if (
                typeof AdmissionWishes.rawAttributes.scores.type === "object" &&
                AdmissionWishes.rawAttributes.scores.type.constructor.name === "FLOAT"
            ) {
                // Nếu scores là FLOAT
                baseQuery.order = [["scores", "DESC"]];
            } else {
                // Nếu scores là JSON hoặc TEXT
                baseQuery.order = [[sequelize.literal("CAST(scores AS DECIMAL(5,2))"), "DESC"]];
            }
            baseQuery.limit = 3;
            break;

        case "byMajor":
            if (!filterValue) {
                throw new ApiError(400, "Vui lòng chọn ngành để lọc");
            }
            baseQuery.where.majorId = filterValue;
            baseQuery.order = [["scores", "DESC"]];
            break;

        case "byCriteria":
            if (!filterValue) {
                throw new ApiError(400, "Vui lòng chọn diện xét tuyển để lọc");
            }
            baseQuery.where.criteriaId = filterValue;
            baseQuery.order = [["scores", "DESC"]];
            break;

        case "all":
        default:
            baseQuery.order = [["scores", "DESC"]];
            break;
    }

    if (limit && filterType !== "top3") {
        baseQuery.limit = limit;
    }
    const wishes = await AdmissionWishes.findAll(baseQuery);
    console.log("Found wishes:", wishes.length);
    return wishes;
};

export const getMajorOptions = async () => {
    try {
        console.log("Getting major options...");
        const majors = await AdmissionWishes.findAll({
            where: { status: "accepted" },
            attributes: [[sequelize.fn("DISTINCT", sequelize.col("majorId")), "majorId"]],
            raw: true,
        });
        console.log("Found majors:", majors);
        return majors.map((m) => m.majorId);
    } catch (error) {
        console.error("Error in getMajorOptions:", error);
        throw error;
    }
};

export const getCriteriaOptions = async () => {
    try {
        const criteria = await AdmissionWishes.findAll({
            where: { status: "accepted" },
            attributes: [[sequelize.fn("DISTINCT", sequelize.col("criteriaId")), "criteriaId"]],
            raw: true,
        });
        console.log("Found criteria:", criteria);
        return criteria.map((c) => c.criteriaId);
    } catch (error) {
        console.error("Error in getCriteriaOptions:", error);
        throw error;
    }
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

export const getAllUsersWithWishes = async () => {
    try {
        // Lấy tất cả wishes để tìm unique userIds
        const wishes = await AdmissionWishes.findAll({
            attributes: ["uId"],
            raw: true,
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
        
        return users;
    } catch (error) {
        console.error("Error in getAllUsersWithWishes:", error);
        throw new ApiError(500, "Lỗi khi lấy danh sách người dùng có nguyện vọng");
    }
};
