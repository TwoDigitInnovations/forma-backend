'use client';

const mongoose = require('mongoose');

const workActivitySchema = new mongoose.Schema(
    {
        itemNo: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        duration: {
            type: String,
            trim: true,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        rowType: {
            type: String,
            enum: ['activity', 'section'],
            default: 'activity',
        },
    },
    { timestamps: true }
);
const workPlanSchema = new mongoose.Schema(
    {
        planName: {
            type: String,
            required: true,
            trim: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        startDate: {
            type: Date,
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Under Review', 'Completed', 'On Hold', 'Cancelled'],
            default: 'Not Started',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        workActivities: [workActivitySchema],
    },
    { timestamps: true }
);


const WorkPlan = mongoose.model('workplan', workPlanSchema);
module.exports = WorkPlan;
