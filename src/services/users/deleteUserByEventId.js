const mongoose = require('mongoose');
const Users = require('../../models/Users');

const deleteUserByEventId = async (eventId) => {
    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const users = await Users.deleteMany( { role: { $regex: `/${eventId}/` } } );
        return users;
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = deleteUserByEventId;