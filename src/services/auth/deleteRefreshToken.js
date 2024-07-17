const mongoose = require('mongoose');
const RefreshTokens = require('../../models/RefreshTokens');

const deleteRefreshToken = async (refreshToken) => {
    mongoose.connect(process.env.MONGODB_URL);

    try{
        const token = await RefreshTokens.deleteOne( { refreshToken: refreshToken } );

        return token;

    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = deleteRefreshToken;