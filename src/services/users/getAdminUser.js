const mongoose = require('mongoose');
const Users = require('../../models/Users');

const getAdminUser = async () => {
    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const user = await Users.find( { role: "admin/admin/admin" } );
        return user;
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = getAdminUser;