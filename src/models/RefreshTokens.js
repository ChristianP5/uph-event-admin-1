const mongoose = require('mongoose');

const rtSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
    }
});

const RefreshTokens = mongoose.model('RefreshTokens', rtSchema);

module.exports = RefreshTokens;