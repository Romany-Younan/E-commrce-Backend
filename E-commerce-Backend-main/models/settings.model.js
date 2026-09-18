const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    currentSeason: {
        type: String,
        enum: ['Spring', 'Summer', 'Autumn', 'Winter', 'All Year'],
        default: 'All Year'
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
