import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.js";
import AdmissionInformation from "../models/admissionInfomation.js";
import LearningProcess from "../models/learningProcess.js";
import PhotoID from "../models/photoID.js";
import Transcript from "../models/Transcript.js";

// Check admission information status
export const checkAdmissionInfoStatus = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.params.id || req.user?.userId;
        
        console.log('🔍 checkAdmissionInfoStatus - userId:', userId);
        console.log('🔍 req.params:', req.params);
        console.log('🔍 req.user:', req.user);
        
        if (!userId) {
            console.log('❌ No userId found');
            return next(new ApiError(400, "Không tìm thấy ID người dùng"));
        }

        const admissionInfo = await AdmissionInformation.findByPk(userId, {
            attributes: ['userId', 'status']
        });

        console.log('🔍 admissionInfo found:', admissionInfo);

        if (!admissionInfo) {
            console.log('✅ No admission info exists, allowing creation');
            return next(); // Allow creation if doesn't exist
        }

        console.log('🔍 admissionInfo.status:', admissionInfo.status);

        if (admissionInfo.status === 'accepted') {
            console.log('🚫 BLOCKING UPDATE - Status is accepted');
            return next(new ApiError(403, "Thông tin xét tuyển đã được duyệt và không thể chỉnh sửa. Vui lòng liên hệ admin qua hệ thống chat để thay đổi thông tin."));
        }

        console.log('✅ Allowing update - Status is not accepted');
        next();
    } catch (error) {
        console.error('❌ Error in checkAdmissionInfoStatus middleware:', error);
        return next(new ApiError(500, "Lỗi hệ thống khi kiểm tra trạng thái thông tin xét tuyển"));
    }
};

// Check learning process status
export const checkLearningProcessStatus = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.params.id || req.user?.userId;
        
        if (!userId) {
            return next(new ApiError(400, "Không tìm thấy ID người dùng"));
        }

        const learningProcess = await LearningProcess.findByPk(userId, {
            attributes: ['userId', 'status']
        });

        if (!learningProcess) {
            return next(); // Allow creation if doesn't exist
        }

        if (learningProcess.status === 'accepted') {
            return next(new ApiError(403, "Quá trình học tập đã được duyệt và không thể chỉnh sửa. Vui lòng liên hệ admin qua hệ thống chat để thay đổi thông tin."));
        }

        next();
    } catch (error) {
        console.error('Error in checkLearningProcessStatus middleware:', error);
        return next(new ApiError(500, "Lỗi hệ thống khi kiểm tra trạng thái quá trình học tập"));
    }
};

// Check photo status
export const checkPhotoStatus = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.params.id || req.user?.userId;
        
        if (!userId) {
            return next(new ApiError(400, "Không tìm thấy ID người dùng"));
        }

        const photo = await PhotoID.findByPk(userId, {
            attributes: ['userId', 'status']
        });

        if (!photo) {
            return next(); // Allow creation if doesn't exist
        }

        if (photo.status === 'accepted') {
            return next(new ApiError(403, "Hồ sơ ảnh đã được duyệt và không thể chỉnh sửa. Vui lòng liên hệ admin qua hệ thống chat để thay đổi thông tin."));
        }

        next();
    } catch (error) {
        console.error('Error in checkPhotoStatus middleware:', error);
        return next(new ApiError(500, "Lỗi hệ thống khi kiểm tra trạng thái hồ sơ ảnh"));
    }
};

// Check transcript status
export const checkTranscriptStatus = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.params.id || req.user?.userId;
        
        if (!userId) {
            return next(new ApiError(400, "Không tìm thấy ID người dùng"));
        }

        const transcript = await Transcript.findOne({
            where: { userId },
            attributes: ['userId', 'status']
        });

        if (!transcript) {
            return next(); // Allow creation if doesn't exist
        }

        if (transcript.status === 'accepted') {
            return next(new ApiError(403, "Học bạ đã được duyệt và không thể chỉnh sửa. Vui lòng liên hệ admin qua hệ thống chat để thay đổi thông tin."));
        }

        next();
    } catch (error) {
        console.error('Error in checkTranscriptStatus middleware:', error);
        return next(new ApiError(500, "Lỗi hệ thống khi kiểm tra trạng thái học bạ"));
    }
};

// General middleware to check if ANY part of profile is accepted (for upload)
export const checkProfileStatusForUpdate = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.params.id || req.user?.userId;
        
        if (!userId) {
            return next(new ApiError(400, "Không tìm thấy ID người dùng"));
        }

        // Check all profile components
        const [admissionInfo, learningProcess, photo, transcript] = await Promise.all([
            AdmissionInformation.findByPk(userId, { attributes: ['status'] }),
            LearningProcess.findByPk(userId, { attributes: ['status'] }),
            PhotoID.findByPk(userId, { attributes: ['status'] }),
            Transcript.findOne({ where: { userId }, attributes: ['status'] })
        ]);

        // Check if any component is accepted
        const components = [
            { name: 'Thông tin xét tuyển', status: admissionInfo?.status },
            { name: 'Quá trình học tập', status: learningProcess?.status },
            { name: 'Hồ sơ ảnh', status: photo?.status },
            { name: 'Học bạ', status: transcript?.status }
        ];

        const acceptedComponents = components.filter(comp => comp.status === 'accepted');
        
        if (acceptedComponents.length > 0) {
            const acceptedNames = acceptedComponents.map(comp => comp.name).join(', ');
            return next(new ApiError(403, `${acceptedNames} đã được duyệt và không thể chỉnh sửa. Vui lòng liên hệ admin qua hệ thống chat để thay đổi thông tin.`));
        }

        next();
    } catch (error) {
        console.error('Error in checkProfileStatusForUpdate middleware:', error);
        return next(new ApiError(500, "Lỗi hệ thống khi kiểm tra trạng thái hồ sơ"));
    }
};

// Middleware specifically for checking user's own admission info updates
export const checkOwnAdmissionInfoStatus = async (req, res, next) => {
    try {
        const requestedUserId = req.params.userId || req.params.id;
        const currentUserId = req.user?.userId;
        
        console.log('🔍 checkOwnAdmissionInfoStatus - requestedUserId:', requestedUserId);
        console.log('🔍 checkOwnAdmissionInfoStatus - currentUserId:', currentUserId);
        console.log('🔍 checkOwnAdmissionInfoStatus - req.params:', req.params);
        
        // Check if user is trying to update their own profile
        if (requestedUserId && parseInt(requestedUserId) !== currentUserId) {
            console.log('❌ User trying to update different user profile');
            return next(new ApiError(403, "Bạn chỉ có thể cập nhật hồ sơ của chính mình"));
        }

        // Use the user ID from the authenticated user for status check
        // But keep the original route parameter structure
        const userIdToCheck = currentUserId;
        
        console.log('🔍 userIdToCheck:', userIdToCheck);
        
        // Check admission info status directly with currentUserId
        try {
            const admissionInfo = await AdmissionInformation.findByPk(userIdToCheck, {
                attributes: ['userId', 'status']
            });

            console.log('🔍 admissionInfo found:', admissionInfo);

            if (!admissionInfo) {
                console.log('✅ No admission info exists, allowing creation');
                return next(); // Allow creation if doesn't exist
            }

            console.log('🔍 admissionInfo.status:', admissionInfo.status);

            if (admissionInfo.status === 'accepted') {
                console.log('🚫 BLOCKING UPDATE - Status is accepted');
                return next(new ApiError(403, "Thông tin xét tuyển đã được duyệt và không thể chỉnh sửa. Vui lòng liên hệ admin qua hệ thống chat để thay đổi thông tin."));
            }

            console.log('✅ Allowing update - Status is not accepted');
            next();
        } catch (dbError) {
            console.error('❌ Database error in checkOwnAdmissionInfoStatus:', dbError);
            return next(new ApiError(500, "Lỗi database khi kiểm tra trạng thái thông tin xét tuyển"));
        }
    } catch (error) {
        console.error('❌ Error in checkOwnAdmissionInfoStatus middleware:', error);
        return next(new ApiError(500, "Lỗi hệ thống khi xác thực quyền cập nhật thông tin xét tuyển"));
    }
};

// Middleware for checking own learning process
export const checkOwnLearningProcessStatus = async (req, res, next) => {
    try {
        const requestedUserId = req.params.userId || req.params.id;
        const currentUserId = req.user?.userId;
        
        console.log('🔍 checkOwnLearningProcessStatus - requestedUserId:', requestedUserId);
        console.log('🔍 checkOwnLearningProcessStatus - currentUserId:', currentUserId);
        
        if (requestedUserId && parseInt(requestedUserId) !== currentUserId) {
            console.log('❌ User trying to update different user learning process');
            return next(new ApiError(403, "Bạn chỉ có thể cập nhật hồ sơ của chính mình"));
        }

        // Check learning process status directly
        const learningProcess = await LearningProcess.findByPk(currentUserId, {
            attributes: ['userId', 'status']
        });

        console.log('🔍 learningProcess found:', learningProcess);

        if (!learningProcess) {
            console.log('✅ No learning process exists, allowing creation');
            return next(); // Allow creation if doesn't exist
        }

        console.log('🔍 learningProcess.status:', learningProcess.status);

        if (learningProcess.status === 'accepted') {
            console.log('🚫 BLOCKING UPDATE - Learning process status is accepted');
            return next(new ApiError(403, "Quá trình học tập đã được duyệt và không thể chỉnh sửa. Vui lòng liên hệ admin qua hệ thống chat để thay đổi thông tin."));
        }

        console.log('✅ Allowing learning process update - Status is not accepted');
        next();
    } catch (error) {
        console.error('❌ Error in checkOwnLearningProcessStatus middleware:', error);
        return next(new ApiError(500, "Lỗi hệ thống khi xác thực quyền cập nhật quá trình học tập"));
    }
};

// Middleware for checking own photo
export const checkOwnPhotoStatus = async (req, res, next) => {
    try {
        const requestedUserId = req.params.userId || req.params.id;
        const currentUserId = req.user?.userId;
        
        console.log('🔍 checkOwnPhotoStatus - requestedUserId:', requestedUserId);
        console.log('🔍 checkOwnPhotoStatus - currentUserId:', currentUserId);
        
        if (requestedUserId && parseInt(requestedUserId) !== currentUserId) {
            console.log('❌ User trying to update different user photo');
            return next(new ApiError(403, "Bạn chỉ có thể cập nhật hồ sơ của chính mình"));
        }

        // Check photo status directly
        const photo = await PhotoID.findByPk(currentUserId, {
            attributes: ['userId', 'status']
        });

        console.log('🔍 photo found:', photo);

        if (!photo) {
            console.log('✅ No photo exists, allowing creation');
            return next(); // Allow creation if doesn't exist
        }

        console.log('🔍 photo.status:', photo.status);

        if (photo.status === 'accepted') {
            console.log('🚫 BLOCKING UPDATE - Photo status is accepted');
            return next(new ApiError(403, "Hồ sơ ảnh đã được duyệt và không thể chỉnh sửa. Vui lòng liên hệ admin qua hệ thống chat để thay đổi thông tin."));
        }

        console.log('✅ Allowing photo update - Status is not accepted');
        next();
    } catch (error) {
        console.error('❌ Error in checkOwnPhotoStatus middleware:', error);
        return next(new ApiError(500, "Lỗi hệ thống khi xác thực quyền cập nhật hồ sơ ảnh"));
    }
};

// Middleware for checking own transcript
export const checkOwnTranscriptStatus = async (req, res, next) => {
    try {
        const requestedUserId = req.params.userId || req.params.id;
        const currentUserId = req.user?.userId;
        
        console.log('🔍 checkOwnTranscriptStatus - requestedUserId:', requestedUserId);
        console.log('🔍 checkOwnTranscriptStatus - currentUserId:', currentUserId);
        
        if (requestedUserId && parseInt(requestedUserId) !== currentUserId) {
            console.log('❌ User trying to update different user transcript');
            return next(new ApiError(403, "Bạn chỉ có thể cập nhật hồ sơ của chính mình"));
        }

        // Check transcript status directly
        const transcript = await Transcript.findOne({
            where: { userId: currentUserId },
            attributes: ['userId', 'status']
        });

        console.log('🔍 transcript found:', transcript);

        if (!transcript) {
            console.log('✅ No transcript exists, allowing creation');
            return next(); // Allow creation if doesn't exist
        }

        console.log('🔍 transcript.status:', transcript.status);

        if (transcript.status === 'accepted') {
            console.log('🚫 BLOCKING UPDATE - Transcript status is accepted');
            return next(new ApiError(403, "Học bạ đã được duyệt và không thể chỉnh sửa. Vui lòng liên hệ admin qua hệ thống chat để thay đổi thông tin."));
        }

        console.log('✅ Allowing transcript update - Status is not accepted');
        next();
    } catch (error) {
        console.error('❌ Error in checkOwnTranscriptStatus middleware:', error);
        return next(new ApiError(500, "Lỗi hệ thống khi xác thực quyền cập nhật học bạ"));
    }
}; 