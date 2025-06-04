import * as transcriptService from "../services/transcriptService.js";
import { createTranscriptNotification } from "./notificationController.js";

export const addTranscript = async (req, res) => {
    const { userId, scores } = req.body;
    try {
        const result = await transcriptService.addTranscript(userId, scores);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Có lỗi xảy ra, vui lòng thử lại sau!",
        });
    }
};

export const updateTranscript = async (req, res) => {
    const { scores } = req.body;
    const { userId } = req.params;
    try {
        const result = await transcriptService.updateTranscript(userId, scores);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Có lỗi xảy ra khi cập nhật học bạ!",
        });
    }
};

export const acceptTranscript = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await transcriptService.acceptTranscript(userId);
        // Send notification
        await createTranscriptNotification(userId, 'accepted');
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Có lỗi xảy ra, vui lòng thử lại sau!",
        });
    }
};

export const rejectTranscript = async (req, res) => {
    const { userId } = req.params;
    const { feedback } = req.body;
    try {
        const result = await transcriptService.rejectTranscript(userId, feedback);
        // Send notification
        await createTranscriptNotification(userId, 'rejected', feedback);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Có lỗi xảy ra, vui lòng thử lại sau!",
        });
    }
};

export const getAllTranscripts = async (req, res) => {
    try {
        const transcripts = await transcriptService.getAllTranscripts();
        res.status(200).json({ message: "Lấy danh sách học bạ thành công", data: transcripts });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Có lỗi xảy ra",
        });
    }
};

export const getTranscriptByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const transcript = await transcriptService.getTranscriptByUserId(userId);
        res.status(200).json({ message: "Lấy học bạ thành công", data: transcript });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Có lỗi xảy ra",
        });
    }
};
