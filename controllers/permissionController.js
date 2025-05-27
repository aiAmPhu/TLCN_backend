import * as permissionService from "../services/permissionService.js";

export const updatePermission = async (req, res) => {
    try {
        const { userId } = req.params;
        const { majorGroup } = req.body;

        const result = await permissionService.updatePermission(userId, majorGroup);
        res.json(result);
    } catch (error) {
        console.error("Error updating permissions:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Error updating permissions",
        });
    }
};

export const deletePermission = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await permissionService.deletePermission(userId);
        res.json(result);
    } catch (error) {
        console.error("Error deleting permissions:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Error deleting permissions",
        });
    }
};
