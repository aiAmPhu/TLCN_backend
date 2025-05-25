import User from "../models/user.js";

export const updatePermission = async (req, res) => {
    try {
        const { userId } = req.params;
        const { majorGroup } = req.body;

        console.log("Updating permissions for user:", userId);
        console.log("New majorGroup:", majorGroup);

        const user = await User.findByPk(userId);
        if (!user) {
            console.log("User not found:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Current user data:", user.toJSON());

        await user.update({ majorGroup });

        // Fetch updated user to verify changes
        const updatedUser = await User.findByPk(userId);
        console.log("Updated user data:", updatedUser.toJSON());

        res.json({ message: "Permissions updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating permissions:", error);
        res.status(500).json({ message: "Error updating permissions", error: error.message });
    }
};

export const deletePermission = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.update({ majorGroup: [] });
        res.json({ message: "Permissions deleted successfully" });
    } catch (error) {
        console.error("Error deleting permissions:", error);
        res.status(500).json({ message: "Error deleting permissions" });
    }
};
