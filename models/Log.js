const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    alarmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alarm' },
    scannedObject: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'Success' }
});

module.exports = mongoose.model('Log', LogSchema);
