const mongoose = require('mongoose');
const Departments = require('../../models/Departments');

const createDepartment = async (name, eventId) => {

    // mongoose.connect(process.env.MONGODB_URL);

    try{
        return await Departments.create( {name: name, event: eventId} );
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = createDepartment;