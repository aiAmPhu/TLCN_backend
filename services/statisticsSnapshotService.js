import sequelize from "../config/db.js";
import { QueryTypes, Op } from "sequelize";
import StatisticsSnapshot from "../models/statisticsSnapshot.js";
import AdmissionWishes from "../models/admissionWishes.js";
import AdmissionMajor from "../models/admissionMajor.js";
import AdmissionCriteria from "../models/admissionCriteria.js";
import AdmissionBlocks from "../models/admissionBlock.js";
import AdmissionYear from "../models/admissionYear.js";
import { ApiError } from "../utils/ApiError.js";
export const createYearlySnapshot = async (yearId, userId = null, notes = null, snapshotType = "yearly_summary") => {
    try {
        const targetYear = yearId
            ? await AdmissionYear.findByPk(yearId)
            : await AdmissionYear.findOne({ where: { status: "active" } });

        if (!targetYear) {
            throw new ApiError(404, "Không tìm thấy năm tuyển sinh");
        }

        // 1. Thống kê tổng quan toàn bộ năm (không filter)
        const totalStudents = await sequelize.query(
            `
            SELECT COUNT(DISTINCT uId) as total
            FROM admission_wishes
        `,
            { type: QueryTypes.SELECT }
        );

        const totalWishes = await sequelize.query(
            `
            SELECT COUNT(*) as total
            FROM admission_wishes
        `,
            { type: QueryTypes.SELECT }
        );

        // 2. Thống kê theo trạng thái
        const statusStats = await sequelize.query(
            `
            SELECT
                status,
                COUNT(*) as count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM admission_wishes)), 2) as percentage
            FROM admission_wishes
            GROUP BY status
        `,
            { type: QueryTypes.SELECT }
        );

        // 3. Thống kê chi tiết theo ngành
        const studentsByMajor = await sequelize.query(
            `
            SELECT
                am.majorId,
                am.majorName,
                am.majorCombination,
                COUNT(DISTINCT aw.uId) as uniqueStudents,
                COUNT(aw.wishId) as totalWishes,
                COUNT(CASE WHEN aw.status = 'accepted' THEN aw.wishId END) as acceptedWishes,
                COUNT(CASE WHEN aw.status = 'rejected' THEN aw.wishId END) as rejectedWishes,
                COUNT(CASE WHEN aw.status = 'pending' THEN aw.wishId END) as pendingWishes,
                ROUND(AVG(aw.scores), 2) as avgScore,
                MIN(aw.scores) as minScore,
                MAX(aw.scores) as maxScore,
                ROUND(COUNT(CASE WHEN aw.status = 'accepted' THEN aw.wishId END) * 100.0 / NULLIF(COUNT(aw.wishId), 0), 2) as acceptanceRate
            FROM admission_majors am
            LEFT JOIN admission_wishes aw ON am.majorId = aw.majorId
            GROUP BY am.majorId, am.majorName, am.majorCombination
            ORDER BY uniqueStudents DESC, totalWishes DESC
        `,
            { type: QueryTypes.SELECT }
        );

        // 4. Thống kê chi tiết theo diện xét tuyển
        const studentsByCriteria = await sequelize.query(
            `
            SELECT
                ac.criteriaId,
                ac.criteriaName,
                ac.criteriaDescription,
                COUNT(DISTINCT aw.uId) as uniqueStudents,
                COUNT(aw.wishId) as totalWishes,
                COUNT(CASE WHEN aw.status = 'accepted' THEN aw.wishId END) as acceptedWishes,
                ROUND(AVG(aw.scores), 2) as avgScore,
                ROUND(COUNT(CASE WHEN aw.status = 'accepted' THEN aw.wishId END) * 100.0 / NULLIF(COUNT(aw.wishId), 0), 2) as acceptanceRate
            FROM admission_criterias ac
            LEFT JOIN admission_wishes aw ON ac.criteriaId = aw.criteriaId
            GROUP BY ac.criteriaId, ac.criteriaName, ac.criteriaDescription
            ORDER BY uniqueStudents DESC
        `,
            { type: QueryTypes.SELECT }
        );

        // 5. Thống kê theo khối thi
        const studentsByBlock = await sequelize.query(
            `
            SELECT
                ab.admissionBlockId,
                ab.admissionBlockName,
                ab.admissionBlockSubject1,
                ab.admissionBlockSubject2,
                ab.admissionBlockSubject3,
                COUNT(DISTINCT aw.uId) as uniqueStudents,
                COUNT(aw.wishId) as totalWishes,
                ROUND(AVG(aw.scores), 2) as avgScore
            FROM admission_blocks ab
            LEFT JOIN admission_wishes aw ON ab.admissionBlockId = aw.admissionBlockId
            GROUP BY ab.admissionBlockId, ab.admissionBlockName, ab.admissionBlockSubject1, ab.admissionBlockSubject2, ab.admissionBlockSubject3
            ORDER BY uniqueStudents DESC
        `,
            { type: QueryTypes.SELECT }
        );

        // 6. Lấy danh sách đầy đủ các danh mục
        const [majorDetails, criteriaDetails, blockDetails] = await Promise.all([
            AdmissionMajor.findAll({
                attributes: ["majorId", "majorName", "majorCombination"],
                raw: true,
            }),
            AdmissionCriteria.findAll({
                attributes: ["criteriaId", "criteriaName", "criteriaDescription"],
                raw: true,
            }),
            AdmissionBlocks.findAll({
                attributes: [
                    "admissionBlockId",
                    "admissionBlockName",
                    "admissionBlockSubject1",
                    "admissionBlockSubject2",
                    "admissionBlockSubject3",
                ],
                raw: true,
            }),
        ]);

        // Tính toán các giá trị
        const totalStudentsCount = totalStudents[0]?.total || 0;
        const totalWishesCount = totalWishes[0]?.total || 0;
        const pendingWishes = statusStats.find((s) => s.status === "pending")?.count || 0;
        const acceptedWishes = statusStats.find((s) => s.status === "accepted")?.count || 0;
        const rejectedWishes = statusStats.find((s) => s.status === "rejected")?.count || 0;

        // Tạo snapshot
        const snapshot = await StatisticsSnapshot.create({
            yearId: targetYear.yearId,
            yearName: targetYear.yearName,
            snapshotType: snapshotType,
            totalStudents: totalStudentsCount,
            totalWishes: totalWishesCount,
            totalMajors: majorDetails.length,
            totalCriteria: criteriaDetails.length,
            totalBlocks: blockDetails.length,
            pendingWishes,
            acceptedWishes,
            rejectedWishes,
            studentsByMajor,
            studentsByCriteria,
            studentsByBlock,
            majorDetails,
            criteriaDetails,
            blockDetails,
            filterConditions: null, // Không có filter cho yearly snapshot
            createdBy: userId,
            notes: notes || `Thống kê tổng kết năm ${targetYear.yearName} - ${new Date().toLocaleString("vi-VN")}`,
        });

        return {
            message: `Tạo snapshot thống kê năm ${targetYear.yearName} thành công`,
            data: {
                snapshotId: snapshot.snapshotId,
                snapshot: snapshot.toJSON(),
                summary: {
                    year: targetYear.yearName,
                    totalStudents: totalStudentsCount,
                    totalWishes: totalWishesCount,
                    totalMajors: majorDetails.length,
                    totalCriteria: criteriaDetails.length,
                    acceptanceRate: totalWishesCount > 0 ? ((acceptedWishes / totalStudents) * 100).toFixed(2) : 0,
                    createdAt: snapshot.createdAt,
                },
            },
        };
    } catch (error) {
        console.error("Error creating yearly snapshot:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Lỗi khi tạo snapshot thống kê năm");
    }
};

// Tạo snapshot thủ công
export const createManualSnapshot = async (yearId = null, userId = null, notes = null) => {
    try {
        // Tạo snapshot mà không có filter conditions
        return await createSnapshotFromFilter({}, yearId, userId);
    } catch (error) {
        console.error("Error creating manual snapshot:", error);
        throw new ApiError(500, "Lỗi khi tạo snapshot thủ công");
    }
};

// Lấy danh sách snapshots
export const getSnapshots = async (filters = {}) => {
    try {
        const whereCondition = {};

        if (filters.yearId) {
            whereCondition.yearId = filters.yearId;
        }

        if (filters.snapshotType) {
            whereCondition.snapshotType = filters.snapshotType;
        }

        if (filters.startDate && filters.endDate) {
            whereCondition.createdAt = {
                [Op.between]: [filters.startDate, filters.endDate],
            };
        }

        const snapshots = await StatisticsSnapshot.findAll({
            where: whereCondition,
            order: [["createdAt", "DESC"]],
            limit: filters.limit || 50,
        });
        return {
            message: "Lấy snapshots thành công",
            data: snapshots,
        };
    } catch (error) {
        console.error("Error getting snapshots:", error);
        throw new ApiError(500, "Lỗi khi lấy snapshots");
    }
};

// So sánh snapshots
export const compareSnapshots = async (snapshotIds) => {
    try {
        console.log("Comparing snapshots with IDs:", snapshotIds);

        if (!snapshotIds || snapshotIds.length < 2) {
            throw new ApiError(400, "Cần ít nhất 2 snapshots để so sánh");
        }

        const snapshots = await StatisticsSnapshot.findAll({
            where: {
                snapshotId: { [Op.in]: snapshotIds },
            },
            order: [["createdAt", "ASC"]],
        });

        if (snapshots.length !== snapshotIds.length) {
            throw new ApiError(404, "Một số snapshot không tồn tại");
        }

        // 1. So sánh cơ bản
        const basicComparison = snapshots.map((snapshot) => ({
            snapshotId: snapshot.snapshotId,
            yearName: snapshot.yearName || "Unknown",
            totalStudents: snapshot.totalStudents || 0,
            totalWishes: snapshot.totalWishes || 0,
            totalMajors: snapshot.totalMajors || 0,
            acceptedWishes: snapshot.acceptedWishes || 0,
            rejectedWishes: snapshot.rejectedWishes || 0,
            acceptanceRate:
                (snapshot.totalWishes || 0) > 0
                    ? (((snapshot.acceptedWishes || 0) / snapshot.totalStudents) * 100).toFixed(2)
                    : "0.00",
            createdAt: snapshot.createdAt,
        }));

        // 2. Phân tích tăng trưởng
        const baseSnapshot = snapshots[0];
        const latestSnapshot = snapshots[snapshots.length - 1];

        const growthAnalysis = [
            {
                metric: "Sinh viên đăng ký",
                change: calculatePercentageChange(baseSnapshot.totalStudents || 0, latestSnapshot.totalStudents || 0),
            },
            {
                metric: "Nguyện vọng",
                change: calculatePercentageChange(baseSnapshot.totalWishes || 0, latestSnapshot.totalWishes || 0),
            },
            {
                metric: "Số ngành tuyển sinh",
                change: calculatePercentageChange(baseSnapshot.totalMajors || 0, latestSnapshot.totalMajors || 0),
            },
        ];
        console.log("Growth analysis:", growthAnalysis);
        console.log("Basic Compare:", basicComparison);
        // ⚠️ QUAN TRỌNG: Trả về object chứa data, KHÔNG phải array
        return {
            message: "So sánh snapshots thành công",
            data: {
                basicComparison,
                growthAnalysis,
                totalSnapshots: snapshots.length,
                comparisonPeriod: {
                    from: baseSnapshot.yearName || "Unknown",
                    to: latestSnapshot.yearName || "Unknown",
                },
            },
        };
    } catch (error) {
        console.error("Error comparing snapshots:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Lỗi khi so sánh snapshots: " + error.message);
    }
};
const calculatePercentageChange = (oldValue, newValue) => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return (((newValue - oldValue) / oldValue) * 100).toFixed(2);
};

// const compareMajorPopularity = (snapshots) => {
//     const majorTrends = {};

//     snapshots.forEach((snapshot) => {
//         if (snapshot.studentsByMajor) {
//             snapshot.studentsByMajor.forEach((major) => {
//                 if (!majorTrends[major.majorId]) {
//                     majorTrends[major.majorId] = {
//                         majorName: major.majorName,
//                         majorCodeName: major.majorCodeName,
//                         trend: [],
//                     };
//                 }
//                 majorTrends[major.majorId].trend.push({
//                     year: snapshot.yearName,
//                     students: major.uniqueStudents || 0,
//                     wishes: major.totalWishes || 0,
//                 });
//             });
//         }
//     });

//     // Lấy top 10 ngành có nhiều thay đổi nhất
//     return Object.values(majorTrends)
//         .filter((major) => major.trend.length > 1)
//         .slice(0, 10);
// };

// const compareCriteriaPopularity = (snapshots) => {
//     const criteriaTrends = {};

//     snapshots.forEach((snapshot) => {
//         if (snapshot.studentsByCriteria) {
//             snapshot.studentsByCriteria.forEach((criteria) => {
//                 if (!criteriaTrends[criteria.criteriaId]) {
//                     criteriaTrends[criteria.criteriaId] = {
//                         criteriaName: criteria.criteriaName,
//                         trend: [],
//                     };
//                 }
//                 criteriaTrends[criteria.criteriaId].trend.push({
//                     year: snapshot.yearName,
//                     students: criteria.uniqueStudents || 0,
//                     wishes: criteria.totalWishes || 0,
//                 });
//             });
//         }
//     });

//     return Object.values(criteriaTrends).filter((criteria) => criteria.trend.length > 1);
// };
