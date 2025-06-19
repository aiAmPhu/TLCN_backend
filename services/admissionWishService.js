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
import puppeteer from "puppeteer";

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
    // Kiểm tra duplicate theo unique constraint (criteriaId, majorId, admissionBlockId, uId)
    const existingWish = await AdmissionWishes.findOne({
        where: { uId, criteriaId, majorId, admissionBlockId },
    });
    if (existingWish) {
        throw new ApiError(400, "Nguyện vọng này đã tồn tại (cùng ngành, diện, khối)");
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
    const transaction = await sequelize.transaction();

    try {
        console.log("Starting filter process...");

        // 1. Lấy toàn bộ nguyện vọng
        const wishes = await AdmissionWishes.findAll({
            where: { status: { [Op.not]: "accepted" } },
            raw: true,
            transaction,
        });

        // 2. Lấy chỉ tiêu
        const quantities = await AdmissionQuantity.findAll({
            raw: true,
            transaction,
        });

        const quotaMap = {};
        for (const q of quantities) {
            const key = `${q.criteriaId}-${q.majorId}`;
            quotaMap[key] = q.quantity ?? 0;
        }

        // 3. Sắp xếp TẤT CẢ nguyện vọng theo ưu tiên trước, điểm sau
        wishes.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority; // Ưu tiên 1, 2, 3...
            return b.scores - a.scores; // Điểm cao trước trong cùng ưu tiên
        });

        const acceptedWishes = [];
        const rejectedWishes = [];
        const acceptedUserIds = new Set();
        const quotaUsed = {}; // Theo dõi quota đã dùng

        // 4. Duyệt từng nguyện vọng theo thứ tự ưu tiên
        for (const wish of wishes) {
            const key = `${wish.criteriaId}-${wish.majorId}`;
            const quota = quotaMap[key] || 0;
            const used = quotaUsed[key] || 0;

            if (acceptedUserIds.has(wish.uId)) {
                // User đã trúng nguyện vọng khác -> reject nguyện vọng này
                rejectedWishes.push(wish);
            } else if (used < quota) {
                // Còn chỗ và user chưa trúng -> accept
                acceptedWishes.push(wish);
                acceptedUserIds.add(wish.uId);
                quotaUsed[key] = used + 1;
            } else {
                // Hết chỗ -> reject
                rejectedWishes.push(wish);
            }
        }

        console.log(`Processing: ${acceptedWishes.length} accepted, ${rejectedWishes.length} rejected`);

        // 5. Cập nhật database theo batch
        const BATCH_SIZE = 100;

        // Update accepted
        const acceptedIds = acceptedWishes.map((w) => w.wishId);
        for (let i = 0; i < acceptedIds.length; i += BATCH_SIZE) {
            const batch = acceptedIds.slice(i, i + BATCH_SIZE);
            await AdmissionWishes.update(
                { status: "accepted" },
                {
                    where: { wishId: { [Op.in]: batch } },
                    transaction,
                }
            );
        }

        // Update rejected
        const rejectedIds = rejectedWishes.map((w) => w.wishId);
        for (let i = 0; i < rejectedIds.length; i += BATCH_SIZE) {
            const batch = rejectedIds.slice(i, i + BATCH_SIZE);
            await AdmissionWishes.update(
                { status: "rejected" },
                {
                    where: { wishId: { [Op.in]: batch } },
                    transaction,
                }
            );
        }

        await transaction.commit();

        return {
            message: "Đã lọc và cập nhật kết quả tuyển sinh thành công.",
            processed: wishes.length,
            accepted: acceptedWishes.length,
            rejected: rejectedWishes.length,
            quotaUsage: quotaUsed,
        };
    } catch (error) {
        await transaction.rollback();
        throw new ApiError(500, `Lỗi trong quá trình lọc: ${error.message}`);
    }
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
        // Lấy tất cả users để reviewer có thể xét duyệt tất cả hồ sơ (kể cả chưa có nguyện vọng)
        const users = await User.findAll({
            where: {
                role: "user", // Chỉ lấy user thường, không lấy admin/reviewer
            },
            attributes: ["userId", "name", "email"],
        });

        return users;
    } catch (error) {
        console.error("Error in getAllUsersWithWishes:", error);
        throw new ApiError(500, "Lỗi khi lấy danh sách người dùng");
    }
};

// New service functions for delete and PDF export
export const deleteAdmissionWish = async (wishId, userId, userRole) => {
    if (!wishId) {
        throw new ApiError(400, "Thiếu wishId.");
    }

    // Find the wish to delete
    const wish = await AdmissionWishes.findByPk(wishId);
    if (!wish) {
        throw new ApiError(404, "Không tìm thấy nguyện vọng.");
    }

    // Check permission: user can only delete their own wishes, admin can delete any
    if (userRole !== "admin" && wish.uId !== userId) {
        throw new ApiError(403, "Bạn không có quyền xóa nguyện vọng này.");
    }

    // Check if wish is already accepted
    if (wish.status === "accepted") {
        throw new ApiError(400, "Không thể xóa nguyện vọng đã được chấp nhận.");
    }

    // Get all wishes of the user to update priorities
    const userWishes = await AdmissionWishes.findAll({
        where: { uId: wish.uId },
        order: [["priority", "ASC"]],
    });

    // Delete the wish
    await AdmissionWishes.destroy({
        where: { wishId },
    });

    // Update priorities of remaining wishes
    const remainingWishes = userWishes.filter((w) => w.wishId !== parseInt(wishId));
    const updatePromises = remainingWishes.map((w, index) => {
        const newPriority = index + 1;
        if (w.priority !== newPriority) {
            return AdmissionWishes.update({ priority: newPriority }, { where: { wishId: w.wishId } });
        }
        return Promise.resolve();
    });

    await Promise.all(updatePromises);

    return {
        message: "Xóa nguyện vọng thành công.",
        deletedWishId: wishId,
    };
};

// HTML fallback export function
export const exportWishesToHTML = async (userId) => {
    if (!userId) {
        throw new ApiError(400, "Thiếu userId.");
    }

    // Get user information
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(404, "Không tìm thấy người dùng.");
    }

    // Get user's wishes with related information
    const wishes = await AdmissionWishes.findAll({
        where: { uId: userId },
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
                attributes: ["admissionBlockId", "admissionBlockName"],
            },
        ],
        order: [["priority", "ASC"]],
    });

    if (wishes.length === 0) {
        throw new ApiError(404, "Người dùng chưa đăng ký nguyện vọng nào.");
    }

    return createSimpleHTMLResponse(user, wishes);
};

export const exportWishesToPDF = async (userId) => {
    if (!userId) {
        throw new ApiError(400, "Thiếu userId.");
    }

    // Get user information
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(404, "Không tìm thấy người dùng.");
    }

    // Get user's wishes with related information
    const wishes = await AdmissionWishes.findAll({
        where: { uId: userId },
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
                attributes: ["admissionBlockId", "admissionBlockName"],
            },
        ],
        order: [["priority", "ASC"]],
    });

    if (wishes.length === 0) {
        throw new ApiError(404, "Người dùng chưa đăng ký nguyện vọng nào.");
    }

    // Create HTML template for PDF
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Phiếu Đăng Ký Nguyện Vọng Xét Tuyển</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                font-size: 13px;
                line-height: 1.4;
                margin: 0;
                padding: 0;
                color: #000;
                background: white;
            }
            .document-header {
                text-align: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 3px double #000;
            }
            .ministry-info {
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 3px;
                text-transform: uppercase;
            }
            .university-main {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 3px;
                text-transform: uppercase;
            }
            .university-english {
                font-size: 11px;
                font-style: italic;
                margin-bottom: 8px;
            }
            .document-number {
                font-size: 11px;
                margin-bottom: 15px;
            }
            .form-title {
                font-size: 18px;
                font-weight: bold;
                text-transform: uppercase;
                margin: 15px 0;
                letter-spacing: 1px;
            }
            .form-subtitle {
                font-size: 14px;
                margin-bottom: 10px;
                font-style: italic;
            }
            .academic-year {
                font-size: 13px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .content-section {
                margin-bottom: 20px;
            }
            .section-title {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 10px;
                text-transform: uppercase;
                background-color: #f5f5f5;
                padding: 8px 12px;
                border-left: 4px solid #1a365d;
            }
            .info-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
            }
            .info-table td {
                padding: 8px 12px;
                border: 1px solid #ccc;
                vertical-align: top;
            }
            .info-label {
                background-color: #f8f9fa;
                font-weight: bold;
                width: 35%;
                text-align: left;
            }
            .info-value {
                background-color: white;
                border-bottom: 1px dotted #999;
                min-height: 20px;
            }
            .wishes-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                font-size: 12px;
            }
            .wishes-table th {
                background-color: #1a365d;
                color: white;
                padding: 10px 6px;
                text-align: center;
                font-weight: bold;
                border: 1px solid #000;
                font-size: 11px;
            }
            .wishes-table td {
                padding: 8px 6px;
                border: 1px solid #666;
                text-align: center;
                vertical-align: middle;
            }
            .wishes-table tbody tr:nth-child(odd) {
                background-color: #fafafa;
            }
            .priority-col {
                background-color: #fff3cd;
                font-weight: bold;
                font-size: 13px;
            }
            .major-col {
                text-align: left;
                padding-left: 8px;
            }
            .major-name {
                font-weight: bold;
                display: block;
                margin-bottom: 2px;
            }
            .major-code {
                font-size: 10px;
                color: #666;
                font-style: italic;
            }
            .score-col {
                font-weight: bold;
                color: #1a365d;
            }
            .declaration-section {
                margin-top: 25px;
                padding: 15px;
                border: 2px solid #1a365d;
                background-color: #f8f9fa;
            }
            .declaration-title {
                font-weight: bold;
                text-align: center;
                margin-bottom: 10px;
                text-transform: uppercase;
                font-size: 13px;
            }
            .declaration-text {
                text-align: justify;
                font-size: 12px;
                line-height: 1.5;
                margin-bottom: 10px;
            }
            .signature-section {
                margin-top: 30px;
                width: 100%;
                table-layout: fixed;
            }
            .signature-section-table {
                width: 100%;
                border-collapse: collapse;
            }
            .signature-section-table td {
                width: 50%;
                vertical-align: top;
                padding: 0 10px;
                border: none;
            }
            .signature-box {
                text-align: center;
                width: 220px;
            }
            .signature-date {
                font-size: 12px;
                margin-bottom: 5px;
            }
            .signature-title {
                font-weight: bold;
                margin-bottom: 60px;
                font-size: 13px;
                text-transform: uppercase;
            }
            .signature-name {
                border-top: 1px solid #000;
                padding-top: 5px;
                font-weight: bold;
            }
            .footer-note {
                font-size: 10px;
                font-style: italic;
                color: #666;
                text-align: left;
            }
        </style>
    </head>
    <body>
        <div class="document-header">
            <div class="ministry-info">BỘ GIÁO DỤC VÀ ĐÀO TẠO</div>
            <div class="university-main">TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT TP.HCM</div>
            <div class="university-english">HO CHI MINH CITY UNIVERSITY OF TECHNOLOGY AND EDUCATION</div>
            <div class="document-number">Số: ........./ĐKXTNV-${new Date().getFullYear()}</div>

            <div class="form-title">PHIẾU ĐĂNG KÝ NGUYỆN VỌNG XÉT TUYỂN</div>
            <div class="form-subtitle">Admission Application Form</div>
            <div class="academic-year">NĂM HỌC ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</div>
        </div>

        <div class="content-section">
            <div class="section-title">I. THÔNG TIN THÍ SINH</div>
            <table class="info-table">
                <tr>
                    <td class="info-label">Họ và tên thí sinh:</td>
                    <td class="info-value">${user.name || "............................."}</td>
                    <td class="info-label">Mã số thí sinh:</td>
                    <td class="info-value">${userId}</td>
                </tr>
                <tr>
                    <td class="info-label">Email:</td>
                    <td class="info-value">${user.email || "............................."}</td>
                    <td class="info-label">Ngày đăng ký:</td>
                    <td class="info-value">${new Date().toLocaleDateString("vi-VN")}</td>
                </tr>
                <tr>
                    <td class="info-label">Số điện thoại:</td>
                    <td class="info-value">...............................</td>
                    <td class="info-label">Tổng số nguyện vọng:</td>
                    <td class="info-value"><strong>${wishes.length}</strong></td>
                </tr>
            </table>
        </div>

        <div class="content-section">
            <div class="section-title">II. DANH SÁCH NGUYỆN VỌNG XÉT TUYỂN</div>
            <table class="wishes-table">
                <thead>
                    <tr>
                        <th style="width: 8%">STT</th>
                        <th style="width: 10%">Thứ tự<br>ưu tiên</th>
                        <th style="width: 40%">Ngành đăng ký</th>
                        <th style="width: 20%">Diện xét tuyển</th>
                        <th style="width: 20%">Khối xét tuyển</th>
                        <th style="width: 12%">Điểm xét<br>tuyển</th>
                    </tr>
                </thead>
                <tbody>
                    ${wishes
                        .map((wish, index) => {
                            const wishData = wish.get ? wish.get({ plain: true }) : wish;

                            return `
                            <tr>
                                <td>${index + 1}</td>
                                <td class="priority-col">${wishData.priority}</td>
                                <td class="major-col">
                                    <span class="major-name">${
                                        wishData.AdmissionMajor?.majorName || wishData.majorId
                                    }</span>
                                    <span class="major-code">Mã ngành: ${wishData.majorId}</span>
                                </td>
                                <td>${wishData.AdmissionCriterium?.criteriaName || wishData.criteriaId}</td>
                                <td>
                                    ${wishData.AdmissionBlock?.admissionBlockName || wishData.admissionBlockId}<br>
                                    <small style="font-size: 10px; color: #666;">(${wishData.admissionBlockId})</small>
                                </td>
                                <td class="score-col">${wishData.scores ? wishData.scores.toFixed(2) : "---"}</td>
                            </tr>
                        `;
                        })
                        .join("")}
                </tbody>
            </table>
        </div>

        <div class="declaration-section">
            <div class="declaration-title">CAM ĐOAN</div>
            <div class="declaration-text">
                Tôi xin cam đoan rằng tất cả các thông tin đã khai trong phiếu đăng ký này là đúng sự thật.
                Nếu có sai sót, tôi xin hoàn toàn chịu trách nhiệm và chấp nhận mọi hình thức xử lý của nhà trường
                theo quy định hiện hành.
            </div>
            <div class="declaration-text">
                Tôi đã đọc và hiểu rõ các quy định về xét tuyển của trường và cam kết thực hiện đúng
                các quy định này trong suốt quá trình học tập.
            </div>
        </div>

        <div class="signature-section">
            <table class="signature-section-table">
                <tr>
                    <td>
                        <div class="footer-note">
                            <strong>Ghi chú:</strong><br>
                            - Phiếu đăng ký này có giá trị pháp lý<br>
                            - Liên hệ: (028) 3896 7641 - Email: tuyensinh@hcmute.edu.vn
                        </div>
                    </td>
                    <td>
                        <div class="signature-box">
                            <div class="signature-date">
                                TP.Hồ Chí Minh, ngày ${new Date().getDate()} tháng ${
        new Date().getMonth() + 1
    } năm ${new Date().getFullYear()}
                            </div>
                            <div class="signature-title">Thí sinh</div>
                            <div class="signature-name">
                                ${user.name || "(Ký và ghi rõ họ tên)"}
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
            <em>Phiếu được tạo tự động từ hệ thống vào lúc ${new Date().toLocaleString(
                "vi-VN"
            )} - Mã số: HCMUTE-${userId}-${Date.now().toString().slice(-6)}</em>
        </div>
    </body>
    </html>
    `;

    // Environment detection
    const isProduction = process.env.NODE_ENV === "production";
    const isHeroku = !!process.env.DYNO;

    console.log("PDF Generation Environment:", { isProduction, isHeroku, userId });

    // Use Puppeteer to create PDF with enhanced Heroku support
    let browser = null;
    let retries = isHeroku ? 2 : 3; // Fewer retries on Heroku

    while (retries > 0) {
        try {
            console.log(`PDF creation attempt ${(isHeroku ? 2 : 3) - retries + 1} for user:`, userId);

            // Configure Puppeteer launch options
            let launchOptions = {
                headless: "new",
                timeout: 30000, // Reduced timeout for Heroku
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-web-security",
                    "--disable-features=VizDisplayCompositor",
                    "--disable-extensions",
                    "--disable-plugins",
                    "--disable-background-timer-throttling",
                    "--disable-backgrounding-occluded-windows",
                    "--disable-renderer-backgrounding",
                    "--disable-default-apps",
                    "--no-first-run",
                    "--no-zygote",
                ],
            };

            // Heroku-specific configuration
            if (isHeroku) {
                // Try multiple Chrome paths for Heroku
                const possibleChromePaths = [
                    process.env.GOOGLE_CHROME_BIN,
                    "/app/.chrome-for-testing/chrome-linux64/chrome",
                    "/app/.apt/usr/bin/google-chrome-stable",
                    "/app/.apt/opt/google/chrome/chrome",
                    "/usr/bin/google-chrome-stable",
                    "/usr/bin/chromium-browser",
                ].filter(Boolean);

                if (possibleChromePaths.length > 0) {
                    launchOptions.executablePath = possibleChromePaths[0];
                }

                // Additional Heroku-specific args
                launchOptions.args.push(
                    "--single-process",
                    "--memory-pressure-off",
                    "--max_old_space_size=460",
                    "--disable-background-networking",
                    "--disable-default-apps",
                    "--disable-sync"
                );

                console.log("Heroku Chrome config:", {
                    executablePath: launchOptions.executablePath,
                    args: launchOptions.args.length,
                });
            }

            browser = await puppeteer.launch(launchOptions);

            const page = await browser.newPage();

            // Optimized page configuration for Heroku
            await page.setViewport({
                width: 1024,
                height: 1448,
            });

            // Set reduced timeout for Heroku
            const pageTimeout = isHeroku ? 20000 : 60000;

            // Set content with reduced wait conditions for Heroku
            await page.setContent(htmlTemplate, {
                waitUntil: isHeroku ? "domcontentloaded" : ["load", "domcontentloaded"],
                timeout: pageTimeout,
            });

            // Shorter wait time for Heroku
            await new Promise((resolve) => setTimeout(resolve, isHeroku ? 1000 : 2000));

            // Generate PDF with reduced options for Heroku
            const pdfOptions = {
                format: "A4",
                printBackground: true,
                margin: {
                    top: "20mm",
                    right: "15mm",
                    bottom: "20mm",
                    left: "15mm",
                },
                timeout: pageTimeout,
            };

            const pdfBuffer = await page.pdf(pdfOptions);

            console.log("PDF created successfully, buffer size:", pdfBuffer.length, "Environment:", {
                isHeroku,
                isProduction,
            });

            // Validate PDF buffer
            if (!pdfBuffer || pdfBuffer.length === 0) {
                throw new Error("PDF buffer is empty");
            }

            if (pdfBuffer.length < 1000) {
                throw new Error("PDF buffer too small, likely corrupted");
            }

            // Success
            return pdfBuffer;
        } catch (error) {
            retries--;
            console.error(`PDF creation attempt failed (${retries} retries left):`, {
                message: error.message,
                name: error.name,
                isHeroku,
                userId,
            });

            // On Heroku, fail fast after 1 retry
            if (retries === 0 || (isHeroku && retries <= 0)) {
                console.error("All PDF creation attempts failed for user:", userId, "Environment:", {
                    isHeroku,
                    isProduction,
                });

                // Specific error message for Heroku
                if (isHeroku && (error.message.includes("Chrome") || error.message.includes("browser"))) {
                    throw new ApiError(
                        503,
                        `Dịch vụ tạo PDF tạm thời không khả dụng trên hệ thống. Vui lòng thử lại sau ít phút.`
                    );
                } else {
                    throw new ApiError(500, `Không thể tạo file PDF: ${error.message}. Vui lòng thử lại sau.`);
                }
            } else {
                // Wait before retry (shorter on Heroku)
                await new Promise((resolve) => setTimeout(resolve, isHeroku ? 500 : 1000));
            }
        } finally {
            // Always close the browser
            if (browser) {
                try {
                    await browser.close();
                    console.log("Browser closed successfully");
                } catch (closeError) {
                    console.error("Error closing browser:", closeError);
                }
                browser = null;
            }
        }
    }
};

// Create simple HTML response as fallback
const createSimpleHTMLResponse = (user, wishes) => {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Phiếu Đăng Ký Nguyện Vọng Xét Tuyển</title>
        <style>
            body {
                font-family: 'Times New Roman', serif;
                font-size: 14px;
                line-height: 1.6;
                margin: 20px;
                color: #333;
                background: white;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                text-transform: uppercase;
                color: #1a365d;
                margin: 10px 0;
            }
            .subtitle {
                font-size: 16px;
                margin-bottom: 20px;
            }
            .info-section {
                margin: 20px 0;
                padding: 15px;
                border: 1px solid #ddd;
                background-color: #f9f9f9;
            }
            .info-section h3 {
                color: #1a365d;
                border-bottom: 1px solid #1a365d;
                padding-bottom: 5px;
            }
            .wishes-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .wishes-table th,
            .wishes-table td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
            }
            .wishes-table th {
                background-color: #1a365d;
                color: white;
                font-weight: bold;
            }
            .wishes-table tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            .priority {
                text-align: center;
                font-weight: bold;
                color: #d63384;
            }
            .score {
                text-align: center;
                font-weight: bold;
                color: #198754;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
            @media print {
                body { margin: 0; }
                .header { border-bottom: 3px double #000; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div style="font-weight: bold;">BỘ GIÁO DỤC VÀ ĐÀO TẠO</div>
            <div style="font-weight: bold; font-size: 18px;">TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT TP.HCM</div>
            <div class="title">Phiếu Đăng Ký Nguyện Vọng Xét Tuyển</div>
            <div class="subtitle">Năm học ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</div>
        </div>

        <div class="info-section">
            <h3>I. Thông tin thí sinh</h3>
            <p><strong>Họ và tên:</strong> ${user.name || "Chưa cập nhật"}</p>
            <p><strong>Email:</strong> ${user.email || "Chưa cập nhật"}</p>
            <p><strong>Mã thí sinh:</strong> ${user.userId}</p>
            <p><strong>Ngày đăng ký:</strong> ${new Date().toLocaleDateString("vi-VN")}</p>
            <p><strong>Tổng số nguyện vọng:</strong> ${wishes.length}</p>
        </div>

        <div class="info-section">
            <h3>II. Danh sách nguyện vọng</h3>
            <table class="wishes-table">
                <thead>
                    <tr>
                        <th style="width: 50px;">STT</th>
                        <th style="width: 80px;">Thứ tự ưu tiên</th>
                        <th>Ngành đăng ký</th>
                        <th>Diện xét tuyển</th>
                        <th>Khối xét tuyển</th>
                        <th style="width: 100px;">Điểm xét tuyển</th>
                    </tr>
                </thead>
                <tbody>
                    ${wishes
                        .map((wish, index) => {
                            const wishData = wish.get ? wish.get({ plain: true }) : wish;
                            return `
                            <tr>
                                <td style="text-align: center;">${index + 1}</td>
                                <td class="priority">${wishData.priority}</td>
                                <td>
                                    <strong>${wishData.AdmissionMajor?.majorName || wishData.majorId}</strong><br>
                                    <small style="color: #666;">Mã ngành: ${wishData.majorId}</small>
                                </td>
                                <td>${wishData.AdmissionCriterium?.criteriaName || wishData.criteriaId}</td>
                                <td>
                                    ${wishData.AdmissionBlock?.admissionBlockName || wishData.admissionBlockId}
                                    <br><small>(${wishData.admissionBlockId})</small>
                                </td>
                                <td class="score">${wishData.scores ? wishData.scores.toFixed(2) : "---"}</td>
                            </tr>
                        `;
                        })
                        .join("")}
                </tbody>
            </table>
        </div>

        <div class="info-section">
            <h3>III. Cam đoan</h3>
            <p style="text-align: justify;">
                Tôi xin cam đoan rằng tất cả các thông tin đã khai trong phiếu đăng ký này là đúng sự thật.
                Nếu có sai sót, tôi xin hoàn toàn chịu trách nhiệm và chấp nhận mọi hình thức xử lý của nhà trường
                theo quy định hiện hành.
            </p>
            <div style="margin-top: 40px; text-align: right;">
                <p><em>TP.Hồ Chí Minh, ngày ${new Date().getDate()} tháng ${
        new Date().getMonth() + 1
    } năm ${new Date().getFullYear()}</em></p>
                <p style="margin-top: 20px;"><strong>Thí sinh</strong></p>
                <p style="margin-top: 60px; border-top: 1px solid #000; display: inline-block; padding-top: 5px;">
                    <strong>${user.name || "(Ký và ghi rõ họ tên)"}</strong>
                </p>
            </div>
        </div>

        <div class="footer">
            <p><strong>Ghi chú:</strong> Phiếu đăng ký này có giá trị pháp lý</p>
            <p>Liên hệ: (028) 3896 7641 - Email: tuyensinh@hcmute.edu.vn</p>
            <p><em>Phiếu được tạo tự động từ hệ thống vào lúc ${new Date().toLocaleString("vi-VN")}</em></p>
        </div>
    </body>
    </html>
    `;
};
