const mongoose = require('mongoose');
const RefreshTokens = require('../../models/RefreshTokens');

const getRefreshTokenByRefreshToken = async (refreshToken) => {

    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const result = await RefreshTokens.find( {refreshToken: refreshToken} );
        if(result.length !== 1){
            throw new Error();
        }
    }catch(error){
        throw new Error("refreshToken not found!");
    }
}

module.exports = getRefreshTokenByRefreshToken;