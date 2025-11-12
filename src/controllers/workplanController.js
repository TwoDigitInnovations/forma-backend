const WorkPlan = require('../models/workplan');
const response = require('../../responses');

const workplanController = {

    createPlan: async (req, res) => {
        try {
            const payload = req.body || {};
            payload.owner = req.user?.id || req.userId;

            const existingPlan = await WorkPlan.findOne({
                planName: payload.planName,
                isActive: true,
            });

            if (existingPlan) {
                return response.error(res, 'A plan with this name already exists');
            }

            const newPlan = await WorkPlan.create(payload);

            return response.ok(res, {
                message: 'Work plan created successfully',
                data: newPlan,
            });
        } catch (error) {
            console.error('Create plan error:', error);
            return response.error(res, error.message || 'Failed to create plan');
        }
    },

    getAllPlans: async (req, res) => {
        try {
            const { page, limit, searchTerm, projectId } = req.query;

            const query = searchTerm
                ? { planName: { $regex: searchTerm, $options: 'i' } }
                : {};
            query.owner = req.user.id;
            query.projectId = projectId;
        
            const total = await WorkPlan.countDocuments(query);

            const plans = await WorkPlan.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit));

            return response.ok(res, {
                data: plans,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: Number(page),
                    itemsPerPage: Number(limit),
                },
            });
        } catch (error) {
            console.error('Get plans error:', error);
            return response.error(res, error.message || 'Failed to fetch plans');
        }
    },

    getPlanById: async (req, res) => {
        try {
            const { id } = req.params;
            const plan = await WorkPlan.findById(id);

            if (!plan) return response.error(res, 'Plan not found');

            return response.ok(res, { data: plan });
        } catch (error) {
            console.error('Get plan by ID error:', error);
            return response.error(res, error.message || 'Failed to fetch plan');
        }
    },

    updatePlan: async (req, res) => {
        try {
            const { id } = req.params;
            const updatedPlan = await WorkPlan.findByIdAndUpdate(id, req.body, {
                new: true,
            });

            if (!updatedPlan) return response.error(res, 'Plan not found');

            return response.ok(res, {
                message: 'Plan updated successfully',
                data: updatedPlan,
            });
        } catch (error) {
            console.error('Update plan error:', error);
            return response.error(res, error.message || 'Failed to update plan');
        }
    },

    deletePlan: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedPlan = await WorkPlan.findByIdAndDelete(id);

            if (!deletedPlan) return response.error(res, 'Plan not found');

            return response.ok(res, { message: 'Plan deleted successfully' });
        } catch (error) {
            console.error('Delete plan error:', error);
            return response.error(res, error.message || 'Failed to delete plan');
        }
    },

    addActivity: async (req, res) => {
        try {
            const { planId } = req.params;
            const newActivity = req.body;

            const plan = await WorkPlan.findById(planId);
            if (!plan) return response.error(res, 'Plan not found');

            plan.workActivities.push(newActivity);
            await plan.save();

            return response.ok(res, {
                message: 'Activity added successfully',
                data: plan.workActivities,
            });
        } catch (error) {
            console.error('Add activity error:', error);
            return response.error(res, error.message || 'Failed to add activity');
        }
    },

    getActivitiesByPlanId: async (req, res) => {
        try {
            const { planId } = req.params;
            const plan = await WorkPlan.findById(planId);

            if (!plan) return response.error(res, 'Plan not found');

            return response.ok(res, { data: plan.workActivities });
        } catch (error) {
            console.error('Get activities error:', error);
            return response.error(res, error.message || 'Failed to fetch activities');
        }
    },

    updateActivity: async (req, res) => {
        try {
            const { planId, activityId } = req.params;
            const plan = await WorkPlan.findById(planId);

            if (!plan) return response.error(res, 'Plan not found');

            const activity = plan.workActivities.id(activityId);
            if (!activity) return response.error(res, 'Activity not found');

            Object.assign(activity, req.body);
            await plan.save();

            return response.ok(res, {
                message: 'Activity updated successfully',
                data: activity,
            });
        } catch (error) {
            console.error('Update activity error:', error);
            return response.error(res, error.message || 'Failed to update activity');
        }
    },

    deleteActivity: async (req, res) => {
        try {
            const { planId, activityId } = req.params;
            const plan = await WorkPlan.findById(planId);

            if (!plan) return response.error(res, 'Plan not found');

            plan.workActivities = plan.workActivities.filter(
                (a) => a._id.toString() !== activityId
            );
            await plan.save();

            return response.ok(res, { message: 'Activity deleted successfully' });
        } catch (error) {
            console.error('Delete activity error:', error);
            return response.error(res, error.message || 'Failed to delete activity');
        }
    },
};

module.exports = workplanController;
