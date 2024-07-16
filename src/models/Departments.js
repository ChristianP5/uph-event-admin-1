const mongoose = require('mongoose');

const departmentsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
    },
    event: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
});

const Departments = mongoose.model('Departments', departmentsSchema);

module.exports = Departments;