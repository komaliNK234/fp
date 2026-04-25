const mongoose = require('mongoose');

const AlarmSchema = new mongoose.Schema({
    time: { type: String, required: true }, // Format HH:MM
    place: { type: String, enum: ['Hostel', 'Home', 'College'], required: true },
    assignedObject: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alarm', AlarmSchema);
