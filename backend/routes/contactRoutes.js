const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Contact = require('../models/contact');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Create a contact
router.post('/', authMiddleware, async (req, res) => {
    const { name, email, phone, notes } = req.body;

    try {
        const newContact = new Contact({
            user: req.user.id, // link contact to logged-in user
            name,
            email,
            phone,
            notes
        });

        const savedContact = await newContact.save();
        res.status(201).json(savedContact);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get all contacts with search + pagination
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { search, page = 1, limit = 5 } = req.query;

        const query = {
            user: req.user.id
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const totalContacts = await Contact.countDocuments(query);
        const contacts = await Contact.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            totalContacts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalContacts / limit),
            contacts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update a contact
router.put('/:id', authMiddleware, async (req, res) => {
    const { name, email, phone, notes } = req.body;

    try {
        let contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ msg: 'Contact not found' });
        }

        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        contact.name = name || contact.name;
        contact.email = email || contact.email;
        contact.phone = phone || contact.phone;
        contact.notes = notes || contact.notes;

        const updatedContact = await contact.save();
        res.json(updatedContact);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Delete a contact
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ msg: 'Contact not found' });
        }

        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Contact.deleteOne({ _id: contact._id });
        res.json({ msg: 'Contact removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});
// Import contacts from CSV
router.post('/import-csv', authMiddleware, upload.single('file'), async (req, res) => {
    console.log("authMiddleware req.user:", req.user); // Add this line
    const results = [];
    const userId = req.user.id; // Capture user ID here

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', function (data) {
            if (data.name) {
                const contact = {
                    user: userId, // this MUST be defined
                    name: data.name?.trim() || '',
                    email: data.email?.trim() || '',
                    phone: data.phone?.trim() || '',
                    notes: data.notes?.trim() || ''
                };
                console.log("Parsed contact row:", contact); // DEBUG LINE
                results.push(contact);
            }
        })        
        .on('end', async () => {
            console.log("Final parsed results:", results); // <== DEBUG LINE
        
            try {
                if (results.length === 0) {
                    return res.status(400).json({ message: 'No valid contacts found in file' });
                }
        
                console.log("Trying to insert:", JSON.stringify(results, null, 2));

                await Contact.insertMany(results);
                
                fs.unlinkSync(req.file.path); // delete temp file
        
                res.json({ message: 'Contacts imported successfully', imported: results.length });
            } catch (err) {
                console.error("CSV import error:", err);
                res.status(500).json({ message: 'Error saving contacts' });
            }
        });
        
});
// Plan B: Paste CSV data as text
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
        console.log("REQ.USER in CSV import:", req.user);
if (!req.user || !req.user.id) {
  return res.status(401).json({ message: 'User not authenticated' });
}
        const contact = { user: req.user.id };

        headers.forEach((header, index) => {
            contact[header] = values[index] || '';
        });

        if (contact.name) {
            results.push(contact);
        }
    }

    try {
        if (results.length === 0) {
            return res.status(400).json({ message: 'No valid contacts found in pasted CSV' });
        }

        await Contact.insertMany(results);
        res.json({ message: 'Contacts imported successfully', imported: results.length });
    } catch (error) {
        console.error('CSV text import error:', error);
        res.status(500).json({ message: 'Error saving contacts' });
    }
});
const { Parser } = require('json2csv');

// Export contacts to CSV
router.get('/export-csv', authMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.find({ user: req.user.id });

        if (contacts.length === 0) {
            return res.status(404).json({ message: 'No contacts to export' });
        }

        const fields = ['name', 'email', 'phone', 'notes'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(contacts);

        res.header('Content-Type', 'text/csv');
        res.attachment('contacts.csv');
        res.send(csv);
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ message: 'Error exporting contacts' });
    }
});

module.exports = router;
