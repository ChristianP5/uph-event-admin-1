const mongoose = require('mongoose');

const formsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    department: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    questions: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
    }, 
})

const Forms = mongoose.model('Forms', formsSchema);
module.exports = Forms;