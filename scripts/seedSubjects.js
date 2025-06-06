import Subject from "../models/Subject.js";
import sequelize from "../config/db.js";

const seedSubjects = async () => {
    try {
        // Đảm bảo kết nối database
        await sequelize.authenticate();
        console.log("✅ Database connection successful");
        
        // Kiểm tra xem đã có dữ liệu môn học chưa
        const existingSubjects = await Subject.findAll();
        
        if (existingSubjects.length > 0) {
            console.log("✅ Subjects already exist in database");
            return;
        }

        // Dữ liệu 12 môn học cần khởi tạo (không include suId vì nó autoIncrement)
        const subjectsData = [
            { subject: "Toán" },
            { subject: "Vật Lý" },
            { subject: "Hóa học" },
            { subject: "Sinh học" },
            { subject: "Tin học" },
            { subject: "Ngữ văn" },
            { subject: "Lịch sử" },
            { subject: "Địa lý" },
            { subject: "Tiếng Anh" },
            { subject: "Giáo dục Công dân" },
            { subject: "Công nghệ" },
            { subject: "Giáo dục Quốc phòng An Ninh" }
        ];

        // Chèn dữ liệu vào database
        const createdSubjects = await Subject.bulkCreate(subjectsData);
        console.log(`✅ Successfully seeded ${createdSubjects.length} subjects into database`);
        
        return createdSubjects;
        
    } catch (error) {
        console.error("❌ Error seeding subjects:", error.message);
        console.error("Full error:", error);
        throw error;
    }
};


export default seedSubjects; 

