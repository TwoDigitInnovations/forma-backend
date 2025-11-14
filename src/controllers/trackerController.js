const tracker = require('../models/Trackerschema');
const response = require('../../responses');

const trackerController = {


    createTracker: async (req, res) => {
        try {
            const payload = req.body || {};
            payload.owner = req.user?.id || req.userId;


            const existingTracker = await tracker.findOne({
                trackerName: payload.trackerName,
                owner: payload.owner
            });

            if (existingTracker) {
                return response.error(res, 'Tracker with this name already exists');
            }

            const newTracker = await tracker.create(payload);

            return response.ok(res, {
                message: 'Tracker created successfully',
                data: newTracker,
            });
        } catch (error) {
            console.error('Create Tracker Error:', error);
            return response.error(res, error.message || 'Failed to create tracker');
        }
    },


    getAllTracker: async (req, res) => {
        try {
            const trackers = await tracker.find({ owner: req.user?.id })
                .populate('WorkplanId')
                .populate('owner')
                .sort({ createdAt: -1 });

            return response.ok(res, trackers);
        } catch (error) {
            console.error('Get All Tracker Error:', error);
            return response.error(res, error.message || 'Failed to fetch trackers');
        }
    },

    getTrackerById: async (req, res) => {
        try {
            const { id } = req.params;

            const trackerData = await tracker.findById(id)
                .populate('WorkplanId', 'planName')
                .populate('owner', 'name email');

            if (!trackerData) return response.error(res, 'Tracker not found');

            return response.ok(res, { data: trackerData });
        } catch (error) {
            console.error('Get Tracker By ID Error:', error);
            return response.error(res, error.message || 'Failed to fetch tracker');
        }
    },

    updateTracker: async (req, res) => {
        try {
            const { id } = req.params;
            const { trackerActivityProgress } = req.body;

            const updatedTracker = await tracker.findById(id);

            if (!updatedTracker)
                return response.error(res, 'Tracker not found');
            updatedTracker.trackerActivityProgress = trackerActivityProgress;
            await updatedTracker.save();

            return response.ok(res, {
                message: 'Tracker updated successfully',
                data: updatedTracker,
            });

        } catch (error) {
            console.error('Update Tracker Error:', error);
            return response.error(res, error.message || 'Failed to update tracker');
        }
    },




    deleteTracker: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedTracker = await tracker.findByIdAndDelete(id);

            if (!deletedTracker) return response.error(res, 'Tracker not found');

            return response.ok(res, { message: 'Tracker deleted successfully' });
        } catch (error) {
            console.error('Delete Tracker Error:', error);
            return response.error(res, error.message || 'Failed to delete tracker');
        }
    },

};

module.exports = trackerController;
