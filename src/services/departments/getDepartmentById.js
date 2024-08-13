const mongoose = require('mongoose');
const Departments = require('../../models/Departments');

const getDepartmentById = async (departmentId) => {

    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const department = await Departments.findOne( { _id: departmentId } );

        if(!department){
            throw new Error();
        }
        return department;
        
    }catch(error){
        throw new Error("Failed retrieving Department By Id!");
    }
}

module.exports = getDepartmentById;