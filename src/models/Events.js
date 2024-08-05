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
    },
    updatedAt: {
        type: Date,
    },
    updatedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    status: {
        type: String,
        default: 'Ongoing',
    }

});

eventsSchema.pre('save', function(next){
    this.updatedAt = Date.now();
    next();
})

const Events = mongoose.model('Events', eventsSchema);

module.exports = Events;