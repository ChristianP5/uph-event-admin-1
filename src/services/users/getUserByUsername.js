const mongoose = require('mongoose');
const Users = require('../../models/Users');

const getUserByUsername = async (username) => {

    mongoose.connect(process.env.MONGODB_URL);

    try{
        const user = await Users.findOne( {username: username} );
        
        return user;

    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = getUserByUsername;