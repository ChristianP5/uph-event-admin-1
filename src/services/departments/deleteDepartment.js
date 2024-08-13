const mongoose = require('mongoose');
const Departments = require('../../models/Departments');

const deleteDepartment = async (departmentId) => {

    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const department = await Departments.deleteOne( { _id: departmentId } );

        if(!department){
            throw new Error();
        }
        return department;
        
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = deleteDepartment;