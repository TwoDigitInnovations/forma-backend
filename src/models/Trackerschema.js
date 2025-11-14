'use client';

const mongoose = require('mongoose');


const trackerSchema = new mongoose.Schema(
    {
        trackerName: {
            type: String,
            required: true,
            trim: true,
        },
        WorkplanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'workplan',
        },
        description: {
            type: String,
            trim: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        trackerActivityProgress: [],
    },
    { timestamps: true }
);


const WorkPlan = mongoose.model('Tracker', trackerSchema);
module.exports = WorkPlan;
