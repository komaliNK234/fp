const express = require('express');
const router = express.Router();

// Mock database
let alarms = [];
let logs = [];
let alarmIdCounter = 1;

const objectsByPlace = {
    Hostel: ['bottle', 'cup', 'chair', 'bed'],
    Home: ['tv', 'couch', 'refrigerator', 'potted plant'],
    College: ['laptop', 'book', 'keyboard', 'mouse']
};

// Create a new alarm
router.post('/alarms', (req, res) => {
    try {
        const { time, place } = req.body;
        if (!time || !place) return res.status(400).json({ error: 'Time and place are required' });
        
        const availableObjects = objectsByPlace[place];
        if (!availableObjects) return res.status(400).json({ error: 'Invalid place selected' });

        const assignedObject = availableObjects[Math.floor(Math.random() * availableObjects.length)];

        const newAlarm = {
            _id: String(alarmIdCounter++),
            time,
            place,
            assignedObject,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        alarms.push(newAlarm);
        res.status(201).json(newAlarm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all alarms
router.get('/alarms', (req, res) => {
    try {
        res.json(alarms.slice().reverse());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stop alarm (create log, deactivate alarm)
router.post('/alarms/:id/stop', (req, res) => {
    try {
        const { id } = req.params;
        const { scannedObject } = req.body;

        const alarm = alarms.find(a => a._id === id);
        if (!alarm) return res.status(404).json({ error: 'Alarm not found' });

        if (alarm.assignedObject !== scannedObject) {
            return res.status(400).json({ error: 'Scanned object does not match assigned object' });
        }

        alarm.isActive = false;

        const log = {
            _id: String(new Date().getTime()),
            alarmId: id,
            scannedObject,
            timestamp: new Date().toISOString(),
            status: 'Success'
        };
        logs.push(log);

        res.json({ message: 'A very warm good morning 😊', log });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get logs
router.get('/logs', (req, res) => {
    res.json(logs.slice().reverse());
});

module.exports = router;
