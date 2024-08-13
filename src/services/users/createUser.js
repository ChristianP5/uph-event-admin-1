const mongoose = require('mongoose');
const Users = require('../../models/Users');

const createUser = async (username, password, role) => {

    // mongoose.connect(process.env.MONGODB_URL);

    try{
        return await Users.create( {username: username, password: password, role: role} );
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = createUser;