import Subject from "../models/Subject.js";

const seedSubjects = async () => {
    try {
        // Kiểm tra xem đã có dữ liệu môn học chưa
        const existingSubjects = await Subject.findAll();
        
        if (existingSubjects.length > 0) {
            console.log("✅ Subjects already exist in database");
            return;
        }

        // Dữ liệu 12 môn học cần khởi tạo
        const subjectsData = [
            { suId: 1, subject: "Toán" },
            { suId: 2, subject: "Vật Lý" },
            { suId: 3, subject: "Hóa học" },
            { suId: 4, subject: "Sinh học" },
            { suId: 5, subject: "Tin học" },
            { suId: 6, subject: "Ngữ văn" },
            { suId: 7, subject: "Lịch sử" },
            { suId: 8, subject: "Địa lý" },
            { suId: 9, subject: "Tiếng Anh" },
            { suId: 10, subject: "Giáo dục Công dân" },
            { suId: 11, subject: "Công nghệ" },
            { suId: 12, subject: "Giáo dục Quốc phòng An Ninh" }
        ];

        // Chèn dữ liệu vào database
        await Subject.bulkCreate(subjectsData);
        console.log("✅ Successfully seeded 12 subjects into database");
        
    } catch (error) {
        console.error("❌ Error seeding subjects:", error.message);
        throw error;
    }
};

export default seedSubjects; 
