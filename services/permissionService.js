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
    await user.update({ majorGroup });
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
    await user.update({ majorGroup: [] });
    return { message: "Permissions deleted successfully" };
};
