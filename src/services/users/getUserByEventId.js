const mongoose = require('mongoose');
const Users = require('../../models/Users');

const getUserByEventId = async (eventId) => {
    mongoose.connect(process.env.MONGODB_URL);

    try{
        const users = await Users.find();

        const filteredUsers = users.filter( user => {
            const userRole = user.role;
            const [department_id, event_id, access_level] = userRole.split('/');

            if(department_id === "admin" && event_id === eventId && access_level === "admin"){
                return true;
            }
        } );

        // NEXT: Make this function return an Array
        const adminUser = filteredUsers[0];

        return adminUser;

    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = getUserByEventId;