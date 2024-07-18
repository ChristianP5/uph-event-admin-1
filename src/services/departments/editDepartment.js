const mongoose = require('mongoose');
const Departments = require('../../models/Departments');

const editDepartment = async (departmentId, name) => {

    mongoose.connect(process.env.MONGODB_URL);

    try{
        const department = await Departments.findById(departmentId);
        department.name = name;
        await department.save();

        return department;
        
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = editDepartment;