const mongoose = require('mongoose');
const RefreshTokens = require('../../models/RefreshTokens');

const saveRefreshToken = async (refreshToken) => {

    mongoose.connect(process.env.MONGODB_URL);

    try{
        await RefreshTokens.create( {refreshToken: refreshToken} );
    }catch(error){
        throw new Error("Something went wrong when creating refreshToken");
    }
}

module.exports = saveRefreshToken;