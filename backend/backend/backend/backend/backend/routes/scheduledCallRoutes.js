const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const ScheduledCall = require('../models/scheduledCall');
const { sendEmailReminder } = require('../utils/notificationService');
const Lead = require('../models/lead');

// CREATE a scheduled call
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { 
            leadId, 
            scheduledTime, 
            duration, 
            notes, 
            reminder,
            notificationPreferences 
        } = req.body;

        const newCall = new ScheduledCall({
            user: req.user.id,
            lead: leadId,
            scheduledTime,
            duration,
            notes,
            reminder,
            notificationPreferences: {
                email: {
                    enabled: notificationPreferences?.email?.enabled ?? true,
                    address: notificationPreferences?.email?.address
                },
                sms: {
                    enabled: notificationPreferences?.sms?.enabled ?? false,
                    number: notificationPreferences?.sms?.number
                },
                popup: {
                    enabled: notificationPreferences?.popup?.enabled ?? true,
                    soundEnabled: notificationPreferences?.popup?.soundEnabled ?? true
                },
                reminderTime: notificationPreferences?.reminderTime ?? 15
            }
        });

        const savedCall = await newCall.save();
        await savedCall.populate('lead');
        res.status(201).json(savedCall);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// GET all scheduled calls with lead name populated
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        const query = { user: req.user.id };

        if (status) query.status = status;

        if (startDate && endDate) {
            query.scheduledTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const calls = await ScheduledCall.find(query)
            .populate('lead', 'name email phone status')
            .sort({ scheduledTime: 1 });

        const populatedCalls = calls.map(call => {
            const callObj = call.toObject();
            if (!callObj.lead) {
                callObj.lead = { name: 'N/A', phone: '', email: '', status: 'unknown' };
            }
            return callObj;
        });

        res.json(populatedCalls);
    } catch (error) {
        console.error('Error fetching scheduled calls:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// UPDATE a scheduled call
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const call = await ScheduledCall.findById(req.params.id);

        if (!call || call.user.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Call not found or not authorized' });
        }

        const { scheduledTime, duration, status, notes, reminder, leadId } = req.body;

        if (scheduledTime) call.scheduledTime = scheduledTime;
        if (duration) call.duration = duration;
        if (status) call.status = status;
        if (notes) call.notes = notes;
        if (reminder !== undefined) call.reminder = reminder;
        if (leadId) call.lead = leadId;  // ✅ allow updating the lead
        
        const updatedCall = await call.save();
        await updatedCall.populate('lead');
        res.json(updatedCall);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// DELETE a scheduled call
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const call = await ScheduledCall.findById(req.params.id);

        if (!call || call.user.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Call not found or not authorized' });
        }

        await ScheduledCall.deleteOne({ _id: call._id });
        res.json({ msg: 'Scheduled call removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// CHECK reminders (must be before /:id)
router.get('/check-reminders', authMiddleware, async (req, res) => {
    try {
        const now = new Date();
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

        const upcomingCalls = await ScheduledCall.find({
            user: req.user.id,
            scheduledTime: { $gt: now, $lt: thirtyMinutesFromNow },
            reminderSent: false
        }).populate('lead');

        const results = [];

        for (const call of upcomingCalls) {
            const timeUntilCall = call.scheduledTime - now;
            const minutesUntilCall = Math.floor(timeUntilCall / (1000 * 60));

            if (minutesUntilCall <= (call.notificationPreferences?.reminderTime || 15)) {
                try {
                    if (call.notificationPreferences?.email?.enabled) {
                        await sendEmailReminder(call);
                    }
                    call.reminderSent = true;
                    await call.save();
                    results.push({ callId: call._id, status: 'success', minutesUntilCall });
                } catch (error) {
                    results.push({ callId: call._id, status: 'error', error: error.message });
                }
            }
        }

        res.json({
            upcomingCalls,
            reminderResults: results,
            message: "Reminders checked and processed"
        });
    } catch (error) {
        console.error('Check-reminders error:', error);
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
});

// GET single scheduled call (must be after /check-reminders)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const call = await ScheduledCall.findById(req.params.id);

        if (!call || call.user.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Call not found or not authorized' });
        }

        await call.populate('lead');
        res.json(call);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
