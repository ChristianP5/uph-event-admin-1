const mongoose = require('mongoose');
const Users = require('../../models/Users');

const deleteUserById = async ( userId ) => {
    mongoose.connect(process.env.MONGODB_URL);
    try{
        const user = await Users.deleteOne( { _id : userId } );
        return user;
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = deleteUserById;