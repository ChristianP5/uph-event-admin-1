const mongoose = require('mongoose');
const Users = require('../../models/Users');

const editUser = async (userId, username, password) => {
    mongoose.connect(process.env.MONGODB_URL);
    try{
        const user = await Users.findOne( { _id: userId } );
        user.username = username;
        user.password = password;
        await user.save();

        return user;

    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = editUser;