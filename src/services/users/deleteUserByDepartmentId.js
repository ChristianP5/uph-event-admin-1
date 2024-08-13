const mongoose = require('mongoose');
const Users = require('../../models/Users');

const deleteUserByDepartmentId = async (departmentId) => {
    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const users = await Users.deleteMany( { role: { $regex: `${departmentId}/` } } );
        return users;
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = deleteUserByDepartmentId;