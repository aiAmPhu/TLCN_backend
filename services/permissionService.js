import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";

export const updatePermission = async (userId, role) => {
    console.log("Updating permissions for user:", userId);
    console.log("New role:", role);

    const user = await User.findByPk(userId);
    if (!user) {
        console.log("User not found:", userId);
        throw new ApiError(404, "User not found");
    }
    console.log("Current user data:", user.toJSON());
    
    // Validate role
    const validRoles = ["user", "reviewer", "admin"];
    if (!validRoles.includes(role)) {
        throw new ApiError(400, "Invalid role specified");
    }

    // Update user role
    const updateData = { role };
    
    // If setting to reviewer, clear majorGroup (since they can review all)
    // If setting to user, also clear majorGroup
    if (role === "reviewer" || role === "user") {
        updateData.majorGroup = [];
    }
    
    await user.update(updateData);
    
    // Fetch updated user to verify changes
    const updatedUser = await User.findByPk(userId);
    console.log("Updated user data:", updatedUser.toJSON());
    
    return { message: "Permissions updated successfully", user: updatedUser };
};

export const deletePermission = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    await user.update({
        majorGroup: [],
        role: "user",
    });
    return { message: "Permissions deleted successfully" };
};
