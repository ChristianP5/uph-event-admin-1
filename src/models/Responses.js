const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    ratings: {
        type: [Number],
        required: true,
    },
    form: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
    }
})

const Responses = mongoose.model('Responses', responseSchema);

module.exports = Responses;