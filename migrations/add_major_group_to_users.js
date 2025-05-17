import sequelize from "../config/db.js";

const addMajorGroupColumn = async () => {
    try {
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN majorGroup JSON DEFAULT ('[]')
        `);
        console.log("✅ Added majorGroup column to users table");
    } catch (error) {
        console.error("❌ Error adding majorGroup column:", error);
    }
};

addMajorGroupColumn(); 