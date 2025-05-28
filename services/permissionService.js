import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";

export const updatePermission = async (userId, majorGroup) => {
    console.log("Updating permissions for user:", userId);
    console.log("New majorGroup:", majorGroup);

    const user = await User.findByPk(userId);
    if (!user) {
        console.log("User not found:", userId);
        throw new ApiError(404, "User not found");
    }
    console.log("Current user data:", user.toJSON());
    // Tự động chuyển role thành reviewer nếu có majorGroup
    const updateData = { majorGroup };
    if (majorGroup && majorGroup.length > 0) {
        updateData.role = "reviewer";
        console.log("Auto-setting role to reviewer due to majorGroup assignment");
    } else {
        // Nếu xóa hết majorGroup thì chuyển về user
        updateData.role = "user";
        console.log("Auto-setting role to user due to empty majorGroup");
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
