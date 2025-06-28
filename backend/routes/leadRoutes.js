const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Lead = require('../models/lead');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { Parser } = require('json2csv');

const upload = multer({ dest: 'uploads/' });

// Create a lead
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log("🔍 Mongoose DB Name:", mongoose.connection.name);
        const { name, email, phone, notes, status } = req.body;
        const newLead = new Lead({
            user: req.user.id,
            name,
            email,
            phone,
            notes,
            status: status || 'new'
        });
        const savedLead = await newLead.save();
        res.status(201).json(savedLead);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get all leads (optional search & pagination)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { search, page = 1, limit = 100, status } = req.query;
        const query = { user: req.user.id };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        const totalLeads = await Lead.countDocuments(query);
        const leads = await Lead.find(query)
            .sort({ name: 1 }) // Sort by name
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean(); // Use lean() for better performance

        res.json({
            totalLeads,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalLeads / limit),
            leads
        });
    } catch (err) {
        console.error('Error in GET /leads:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Update a lead
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (!lead || lead.user.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Lead not found or not authorized' });
        }

        const { name, email, phone, notes, status } = req.body;

        lead.name = name || lead.name;
        lead.email = email || lead.email;
        lead.phone = phone || lead.phone;
        lead.notes = notes || lead.notes;
        lead.status = status || lead.status;

        const updatedLead = await lead.save();
        res.json(updatedLead);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Delete a lead
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (!lead || lead.user.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Lead not found or not authorized' });
        }

        await Lead.deleteOne({ _id: lead._id });
        res.json({ msg: 'Lead deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Bulk delete leads
router.delete('/bulk/delete', authMiddleware, async (req, res) => {
    try {
        const { leadIds } = req.body;
        
        if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({ msg: 'No lead IDs provided for deletion' });
        }

        // Find all leads that belong to the user
        const leads = await Lead.find({
            _id: { $in: leadIds },
            user: req.user.id
        });

        // Extract IDs of leads that belong to the user
        const authorizedLeadIds = leads.map(lead => lead._id);
        
        if (authorizedLeadIds.length === 0) {
            return res.status(404).json({ msg: 'No authorized leads found for deletion' });
        }

        // Delete the authorized leads
        const result = await Lead.deleteMany({
            _id: { $in: authorizedLeadIds }
        });

        res.json({ 
            msg: 'Leads deleted successfully', 
            count: result.deletedCount,
            deletedIds: authorizedLeadIds
        });
    } catch (err) {
        console.error('Bulk delete error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Import leads from CSV file
router.post('/import-csv', authMiddleware, upload.single('file'), async (req, res) => {
    const results = [];
    const userId = req.user.id;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', function (data) {
            if (data.name) {
                const lead = {
                    user: userId,
                    name: data.name?.trim() || '',
                    email: data.email?.trim() || '',
                    phone: data.phone?.trim() || '',
                    notes: data.notes?.trim() || '',
                    status: data.status?.trim() || 'new'
                };
                results.push(lead);
            }
        })
        .on('end', async () => {
            try {
                if (results.length === 0) {
                    return res.status(400).json({ message: 'No valid leads found in file' });
                }

                await Lead.insertMany(results);
                fs.unlinkSync(req.file.path); // delete temp file
                res.json({ message: 'Leads imported successfully', imported: results.length });
            } catch (err) {
                console.error('CSV import error:', err);
                res.status(500).json({ message: 'Error saving leads' });
            }
        });
});

// Import leads from CSV text
router.post('/import-csv-text', authMiddleware, async (req, res) => {
    const { csvText } = req.body;

    if (!csvText) {
        return res.status(400).json({ message: 'No CSV text provided' });
    }

    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const lead = { user: req.user.id };

        headers.forEach((header, index) => {
            lead[header] = values[index] || '';
        });

        if (lead.name) {
            results.push(lead);
        }
    }

    try {
        if (results.length === 0) {
            return res.status(400).json({ message: 'No valid leads found in pasted CSV' });
        }

        await Lead.insertMany(results);
        res.json({ message: 'Leads imported successfully', imported: results.length });
    } catch (error) {
        console.error('CSV text import error:', error);
        res.status(500).json({ message: 'Error saving leads' });
    }
});

// Export leads to CSV
router.get('/export-csv', authMiddleware, async (req, res) => {
    try {
        const leads = await Lead.find({ user: req.user.id });

        if (leads.length === 0) {
            return res.status(404).json({ message: 'No leads to export' });
        }

        const fields = ['name', 'email', 'phone', 'notes', 'status'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(leads);

        res.header('Content-Type', 'text/csv');
        res.attachment('leads.csv');
        res.send(csv);
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ message: 'Error exporting leads' });
    }
});
// Get the next lead for calling
router.get('/next', authMiddleware, async (req, res) => {
    try {
        const lastCalledLeadId = req.query.lastLeadId;
        const query = { user: req.user.id };

        if (lastCalledLeadId) {
            query._id = { $gt: lastCalledLeadId }; // fetch next lead by ID
        }

        const nextLead = await Lead.findOne(query).sort({ _id: 1 });

        if (!nextLead) {
            return res.status(404).json({ msg: 'No more leads found' });
        }

        res.json(nextLead);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});
module.exports = router;
