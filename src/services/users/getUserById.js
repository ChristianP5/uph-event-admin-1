const mongoose = require('mongoose');
const Users = require('../../models/Users');

const getUserById = async (userId) => {
    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const user = await Users.findById(userId);
        return user;
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = getUserById;