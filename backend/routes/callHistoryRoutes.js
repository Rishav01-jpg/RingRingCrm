const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const CallHistory = require('../models/callHistory');
const Lead = require('../models/lead');

// Save a new call record
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { leadId, actualStartTime, duration, outcome, notes, followUpRequired, followUpDate } = req.body;

        const newCallHistory = new CallHistory({
            user: req.user.id,
            lead: leadId,
            actualStartTime,
            duration,
            outcome,
            notes,
            followUpRequired,
            followUpDate
        });

        const saved = await newCallHistory.save();
        await saved.populate(['lead', 'scheduledCall']);
        res.status(201).json(saved);
    } catch (error) {
        console.error('Call history save error:', error);
        res.status(500).json({ 
            message: 'Could not save call history',
            error: error.message 
        });
    }
});

// Get all calls for a user with filters
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate, outcome, leadName } = req.query;
        const query = { user: req.user.id };
        
        console.log('Search parameters:', { startDate, endDate, outcome, leadName });
        console.log('User ID:', req.user.id);

        // Add date range filter if provided
        if (startDate || endDate) {
            query.actualStartTime = {};
            if (startDate) query.actualStartTime.$gte = new Date(startDate);
            if (endDate) query.actualStartTime.$lte = new Date(endDate);
        }

        // Add outcome filter if provided
        if (outcome) {
            query.outcome = outcome;
        }

        // Add lead name filter if provided
        if (leadName) {
            console.log('Searching for leads with name:', leadName);
            const leads = await Lead.find({
                user: req.user.id,
                name: { $regex: leadName, $options: 'i' }
            });
            console.log('Found leads:', leads);
            
            if (leads.length > 0) {
                const leadIds = leads.map(lead => lead._id);
                query.lead = { $in: leadIds };
                console.log('Lead IDs for call history search:', leadIds);
            } else {
                console.log('No leads found with name:', leadName);
                return res.json([]);
            }
        }

        console.log('Final query:', query);
        const calls = await CallHistory.find(query)
            .populate(['lead', 'scheduledCall'])
            .sort({ actualStartTime: -1 });
        console.log('Found calls:', calls);

        res.json(calls);
    } catch (error) {
        console.error('Call history fetch error:', error);
        res.status(500).json({ 
            message: 'Could not get call history',
            error: error.message 
        });
    }
});

// Initiate a call tracking
router.post('/initiate', authMiddleware, async (req, res) => {
    try {
        const { leadId, phoneNumber, deviceInfo } = req.body;
        
        // Validate phone number
        if (!phoneNumber || !/^\+?[\d\s-()]+$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const newCallHistory = new CallHistory({
            user: req.user.id,
            lead: leadId,
            actualStartTime: new Date(),
            duration: 0,
            outcome: 'in-progress',
            deviceInfo
        });

        const saved = await newCallHistory.save();
        await saved.populate('lead');
        res.status(201).json(saved);
    } catch (error) {
        console.error('Call initiation error:', error);
        res.status(500).json({ 
            message: 'Could not initiate call tracking',
            error: error.message 
        });
    }
});
// Update call status, outcome, and notes
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        console.log('🛠️ Received update call request for:', req.params.id);
console.log('📦 Body:', req.body);

        const { outcome, notes, duration, followUpRequired, followUpDate } = req.body;

        const call = await CallHistory.findById(req.params.id);
        if (!call) {
            return res.status(404).json({ message: 'Call not found' });
        }

        // Update fields
        if (outcome) call.outcome = outcome;
        if (notes) call.notes = notes;
        if (duration !== undefined) call.duration = duration;
        if (followUpRequired !== undefined) call.followUpRequired = followUpRequired;
        if (followUpDate) call.followUpDate = followUpDate;
        
        console.log("✅ Updating call:", call);
        const updated = await call.save();
        await updated.populate('lead');

        res.json(updated);
    } catch (error) {
        console.error('Call update error:', error);
        res.status(500).json({ message: 'Could not update call', error: error.message });
    }
});

module.exports = router;
