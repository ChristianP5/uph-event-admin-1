const mongoose = require('mongoose');
const Forms = require('../../models/Forms');

const getFormsByDepartmentId = async (departmentId) => {

    mongoose.connect(process.env.MONGODB_URL);

    try{
        const forms = await Forms.find( { department: departmentId } ).sort( { createdAt: -1 } );
        return forms;
    }catch(error){
        throw new Error("Something Wrong when retrieving Forms by Department Id");
    }
}

module.exports = getFormsByDepartmentId;