import * as admissionWishService from "../services/admissionWishService.js";
import AdmissionYear from "../models/admissionYear.js";

export const getAllYears = async (req, res) => {
    try {
        const years = await AdmissionYear.findAll({
            attributes: ["yearId", "yearName", "status"],
            order: [["yearName", "DESC"]],
        });

        res.status(200).json({
            message: "Lấy danh sách năm thành công",
            data: years,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách năm",
        });
    }
};

export const getWishFormData = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await admissionWishService.getActiveYearWishData(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi lấy dữ liệu nguyện vọng",
        });
    }
};

export const addAdmissionWish = async (req, res) => {
    try {
        const result = await admissionWishService.addAdmissionWish(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Đã xảy ra lỗi không xác định." });
    }
};

export const getAllWishesByUID = async (req, res) => {
    try {
        const { uId } = req.params;
        const wishes = await admissionWishService.getAllWishesByUID(uId);
        res.status(200).json({
            message: "Lấy danh sách nguyện vọng thành công.",
            wishes,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách nguyện vọng.",
        });
    }
};

export const getAcceptedWish = async (req, res) => {
    try {
        const wishes = await admissionWishService.getAcceptedWishes();
        res.status(200).json(wishes);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách nguyện vọng đã được chấp nhận.",
        });
    }
};

export const filterAdmissionResults = async (req, res) => {
    try {
        const result = await admissionWishService.filterAdmissionResults();
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Đã xảy ra lỗi trong quá trình lọc." });
    }
};

export const resetAllWishesStatus = async (req, res) => {
    try {
        const result = await admissionWishService.resetAllWishesStatus();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: "Đã xảy ra lỗi khi đặt lại trạng thái nguyện vọng.",
        });
    }
};

export const getFilteredAccepted = async (req, res) => {
    try {
        const { filterType, filterValue, limit } = req.query;
        const wishes = await admissionWishService.getFilteredAcceptedWishes(
            filterType || "all",
            filterValue,
            limit ? parseInt(limit) : null
        );
        res.status(200).json({
            message: "Lấy danh sách trúng tuyển thành công",
            data: wishes,
            count: wishes.length,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Lỗi khi lấy danh sách trúng tuyển",
        });
    }
};

export const getFilterOptions = async (req, res) => {
    try {
        const [majors, criteria] = await Promise.all([
            admissionWishService.getMajorOptions(),
            admissionWishService.getCriteriaOptions(),
        ]);

        res.status(200).json({
            message: "Lấy options thành công",
            data: {
                majors,
                criteria,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy options",
        });
    }
};

// New controller functions for delete and PDF export
export const deleteAdmissionWish = async (req, res) => {
    try {
        const { wishId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        const result = await admissionWishService.deleteAdmissionWish(wishId, userId, userRole);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Đã xảy ra lỗi khi xóa nguyện vọng.",
        });
    }
};

export const exportWishesToPDF = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestUserId = req.user.userId;
        const userRole = req.user.role;
        
        // Check permission: user can only export their own wishes, admin can export any
        if (userRole !== 'admin' && parseInt(userId) !== requestUserId) {
            return res.status(403).json({
                message: "Bạn không có quyền xuất phiếu đăng ký của người khác.",
            });
        }
        
        try {
            // Try to create PDF
            console.log('Creating PDF for user:', userId);
            const pdfBuffer = await admissionWishService.exportWishesToPDF(userId);
            
            // Set headers for PDF response
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="phieu-dang-ky-nguyen-vong-${userId}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.setHeader('Cache-Control', 'no-cache');
            
            console.log('PDF export successful for user:', userId, 'Size:', pdfBuffer.length, 'bytes');
            res.send(pdfBuffer);
            
        } catch (pdfError) {
            console.error('PDF creation failed:', pdfError.message);
            
            // On Heroku, if PDF fails, fallback to HTML temporarily
            const isHeroku = !!process.env.DYNO;
            if (isHeroku && pdfError.message.includes('Chrome')) {
                console.log('Heroku Chrome issue detected, falling back to HTML for user:', userId);
                
                try {
                    const htmlContent = await admissionWishService.exportWishesToHTML(userId);
                    
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.setHeader('Content-Disposition', `attachment; filename="phieu-dang-ky-nguyen-vong-${userId}.html"`);
                    
                    console.log('HTML fallback successful for user:', userId);
                    res.send(htmlContent);
                    return;
                } catch (htmlError) {
                    console.error('HTML fallback also failed:', htmlError.message);
                }
            }
            
            // If not Heroku or other errors, throw original error
            throw pdfError;
        }
        
    } catch (error) {
        console.error('PDF export failed:', {
            userId: req.params.userId,
            error: error.message,
            stack: error.stack
        });
        
        // Return specific error message
        const statusCode = error.statusCode || 500;
        const message = error.message || "Không thể tạo file PDF. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.";
        
        res.status(statusCode).json({
            message: message,
            error: "PDF_GENERATION_FAILED"
        });
    }
};
