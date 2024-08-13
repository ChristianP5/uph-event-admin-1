// const mongoose = require('mongoose');
const Users = require('../../models/Users');

const getUserByCredentials = async (username, password) => {

    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const result = await Users.findOne( {username: username, password: password} );
        
        if(!result){
            throw new Error();
        }
        
        return result;

    }catch(error){
        throw new Error("Invalid Username/Password");
    }
}

module.exports = getUserByCredentials;