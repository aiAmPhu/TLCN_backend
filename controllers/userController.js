import User from "../models/user.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();
const otpStore = {};

const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Chuẩn hóa form email
    return regex.test(email);
};
const isValidPassword = (password) => {
    const regex = /^[A-Za-z0-9]{8,}$/; // Chỉ cho phép chữ cái và số, ít nhất 8 ký tự
    return regex.test(password);
};

export const addUser = async (req, res) => {
    const { name, email, password, role, pic } = req.body;
    try {
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "Mật khẩu phải ít nhất 8 ký tự và chỉ bao gồm chữ hoặc số" });
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được đăng ký" });
        }
        const lastUser = await User.findOne({ order: [["userId", "DESC"]] });
        const newUserId = lastUser ? lastUser.userId + 1 : 1;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            userId: newUserId,
            name,
            email,
            password: hashedPassword,
            role,
            pic,
        });
        res.status(201).json({ message: "Tạo người dùng thành công", user: newUser });
    } catch (error) {
        console.error("Lỗi khi tạo người dùng:", error.message);
        res.status(500).json({ message: "Tạo người dùng thất bại" });
    }
};

// Khả năng sẽ bỏ hàm này
// export const addUserNoOTP = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, email, password, role, pic } = req.body;

//         // Kiểm tra xem email có trùng với bất kỳ người dùng nào ngoài người dùng hiện tại không
//         const existingUser = await User.findOne({ email });

//         if (existingUser && existingUser._id.toString() !== id) {
//             // Nếu email đã tồn tại và không phải là của người dùng hiện tại
//             return res.status(400).json({ message: "Email already exists" });
//         }
//         const user = new User({ name, email, password, role, pic });
//         await user.save();
//         res.status(201).json({ message: "User created successfully" });
//         delete otps[email];
//     } catch (error) {
//         console.error("Error adding user:", error); // Log chi tiết lỗi
//         res.status(500).json({ message: error.message });
//     }
// };

// Lấy toàn bộ Users

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll(); // Lấy tất cả bản ghi trong bảng users
        res.status(200).json({ message: "Lấy thông tin người dùng thành công", data: users }); // Trả về danh sách users dưới dạng JSON
    } catch (error) {
        console.error("Lối khi lấy thông tin người dùng:", error.message);
        res.status(500).json({ message: "Lỗi trong quá trình lấy thông tin" });
    }
};

export const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { name, email, password, role, pic } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        if (email && !isValidEmail(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }
        if (password && !isValidPassword(password)) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 8 ký tự, chỉ gồm chữ cái và số" });
        }
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role;
        if (pic !== undefined) user.pic = pic;
        if (password !== undefined) {
            const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu với độ khó 10
            user.password = hashedPassword;
        }
        await user.save();
        res.status(200).json({ message: "Cập nhật người dùng thành công" });
    } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error.message);
        res.status(500).json({ message: "Cập nhật người dùng thất bại" });
    }
};

export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        await user.destroy();
        res.status(200).json({ message: "Xóa người dùng thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error.message);
        res.status(500).json({ message: "Xóa người dùng thất bại" });
    }
};

export const sendOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    try {
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được đăng ký!" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore[email] = otp;
        setTimeout(() => {
            delete otpStore[email];
        }, 5 * 60 * 1000); // 5 phút
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "bophantuyensinhute@gmail.com",
                pass: process.env.NODE_MAIL_PASSWORD,
            },
        });
        await transporter.sendMail({
            from: "Bộ phận tuyển sinh UTE",
            to: email,
            subject: "Mã xác nhận OTP",
            text: `Mã OTP của bạn là: ${otp}. Mã sẽ hết hạn sau 5 phút.`,
        });
        res.status(200).json({ message: "Đã gửi OTP tới email!" });
    } catch (error) {
        console.error("Lỗi gửi OTP:", error);
        res.status(500).json({ message: "Gửi OTP thất bại!" });
    }
};

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Thiếu email hoặc OTP" });
    const validOTP = otpStore[email];
    if (!validOTP) return res.status(400).json({ message: "OTP đã hết hạn hoặc không tồn tại" });
    if (parseInt(otp) !== validOTP) {
        return res.status(400).json({ message: "OTP không đúng" });
    }
    delete otpStore[email];
    res.status(200).json({ message: "Xác thực thành công!" });
};
