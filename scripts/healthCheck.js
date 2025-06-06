import sequelize from "../config/db.js";
import Subject from "../models/Subject.js";

const healthCheck = async () => {
    try {
        console.log("🔍 Running deployment health check...");
        
        // 1. Check database connection
        await sequelize.authenticate();
        console.log("✅ Database connection: OK");
        
        // 2. Check if tables exist
        await sequelize.sync({ force: false });
        console.log("✅ Database sync: OK");
        
        // 3. Check if Subject table is accessible
        const subjectCount = await Subject.count();
        console.log(`✅ Subject table: OK (${subjectCount} records)`);
        
        // 4. Check environment variables
        const requiredVars = ['DB_NAME', 'DB_USER', 'DB_HOST', 'DB_PORT'];
        const missing = requiredVars.filter(v => !process.env[v]);
        if (missing.length === 0) {
            console.log("✅ Environment variables: OK");
        } else {
            throw new Error(`Missing environment variables: ${missing.join(', ')}`);
        }
        
        console.log("🎉 Health check passed! Deployment ready.");
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Health check failed:", error.message);
        console.error("Full error:", error);
        process.exit(1);
    }
};

healthCheck(); 