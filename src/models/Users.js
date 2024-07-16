const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
    }
});

const Users = mongoose.model('Users', usersSchema);

module.exports = Users;