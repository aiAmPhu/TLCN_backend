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
        
        const isHeroku = !!process.env.DYNO;
        console.log('PDF export request for user:', userId, 'Environment:', { isHeroku });
        
        try {
            // Try to create PDF
            const pdfBuffer = await admissionWishService.exportWishesToPDF(userId);
            
            // Set headers for PDF response
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="phieu-dang-ky-nguyen-vong-${userId}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            console.log('PDF export successful for user:', userId, 'Size:', pdfBuffer.length, 'bytes');
            res.send(pdfBuffer);
            
        } catch (pdfError) {
            console.error('PDF creation failed:', {
                userId,
                error: pdfError.message,
                statusCode: pdfError.statusCode,
                isHeroku
            });
            
            // On Heroku or if PDF service is unavailable, automatically fallback to HTML
            if (isHeroku || pdfError.statusCode === 503 || pdfError.message.includes('Chrome') || pdfError.message.includes('browser')) {
                console.log('Attempting HTML fallback for user:', userId);
                
                try {
                    const htmlContent = await admissionWishService.exportWishesToHTML(userId);
                    
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.setHeader('Content-Disposition', `inline; filename="phieu-dang-ky-nguyen-vong-${userId}.html"`);
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                    
                    console.log('HTML fallback successful for user:', userId);
                    res.send(htmlContent);
                    return;
                    
                } catch (htmlError) {
                    console.error('HTML fallback also failed:', htmlError.message);
                    throw new Error(`Không thể tạo phiếu đăng ký dưới bất kỳ định dạng nào. PDF: ${pdfError.message}. HTML: ${htmlError.message}`);
                }
            }
            
            // If not Heroku and not a service issue, throw original error
            throw pdfError;
        }
        
    } catch (error) {
        console.error('Complete export failure:', {
            userId: req.params.userId,
            error: error.message,
            statusCode: error.statusCode,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
        
        // Return appropriate error response
        const statusCode = error.statusCode || 500;
        let message = error.message || "Đã xảy ra lỗi khi xuất phiếu đăng ký.";
        
        // User-friendly error messages
        if (statusCode === 503) {
            message = "Dịch vụ tạo PDF tạm thời không khả dụng. Vui lòng thử lại sau ít phút.";
        } else if (statusCode === 404) {
            message = "Không tìm thấy dữ liệu nguyện vọng để xuất.";
        } else if (message.includes('Chrome') || message.includes('browser')) {
            message = "Hệ thống tạo PDF đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.";
        }
        
        res.status(statusCode).json({
            message: message,
            error: "EXPORT_FAILED",
            canRetry: statusCode === 503
        });
    }
};
