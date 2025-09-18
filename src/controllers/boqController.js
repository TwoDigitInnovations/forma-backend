
const BOQ = require('../models/Boqdoc');
const Template = require('../models/Boqtemplate');
const response = require('./../../responses');

const BoqController = {

    createBoq: async (req, res) => {
        try {
            const payload = req?.body || {};
            payload.createdBy = req.user?.id || req.userId;

            // if source = "template", fetch template and use its items
            if (payload.source === "template" && payload.templateId) {
                const template = await Template.findById(payload.templateId);
                if (!template) {
                    return res.status(404).json({
                        status: false,
                        message: "Template not found"
                    });
                }
                payload.items = template.items;
            }


            payload.items = payload.items.map(item => ({
                ...item,
                amount: item.quantity * item.rate
            }));

            const newBoq = new BOQ(payload);
            await newBoq.save();

            return response.ok(res, {
                message: "BOQ created successfully",
                data: newBoq
            });
        } catch (error) {
            console.error("Create BOQ error:", error);
            return response.error(res, error.message || "Failed to create BOQ");
        }
    },

    // ✅ Get All BOQs for a Project
    getBoqsByProject: async (req, res) => {
        try {
            const { projectId } = req.params;

            const boqs = await BOQ.find({ projectId })
                .populate("createdBy", "name email")
                .populate("projectId", "name location");

            return response.ok(res, {
                message: "BOQs fetched successfully",
                data: boqs
            });
        } catch (error) {
            console.error("Get BOQs error:", error);
            return response.error(res, error.message || "Failed to fetch BOQs");
        }
    },

    // ✅ Get BOQ by ID
    getBoqById: async (req, res) => {
        try {
            const { id } = req.params;
            const boq = await BOQ.findById(id)
                .populate("createdBy", "name email")
                .populate("projectId", "name location");

            if (!boq) {
                return res.status(404).json({
                    status: false,
                    message: "BOQ not found"
                });
            }

            return response.ok(res, {
                message: "BOQ fetched successfully",
                data: boq
            });
        } catch (error) {
            console.error("Get BOQ error:", error);
            return response.error(res, error.message || "Failed to fetch BOQ");
        }
    },

    // ✅ Delete BOQ
    deleteBoq: async (req, res) => {
        try {
            const { id } = req.params;

            const deletedBoq = await BOQ.findByIdAndDelete(id);
            if (!deletedBoq) {
                return res.status(404).json({
                    status: false,
                    message: "BOQ not found"
                });
            }

            return response.ok(res, {
                message: "BOQ deleted successfully",
                data: deletedBoq
            });
        } catch (error) {
            console.error("Delete BOQ error:", error);
            return response.error(res, error.message || "Failed to delete BOQ");
        }
    }
};

module.exports = BoqController;