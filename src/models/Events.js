const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
    }
});

const Events = mongoose.model('Events', eventsSchema);

module.exports = Events;