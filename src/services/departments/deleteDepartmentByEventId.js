const mongoose = require('mongoose');
const Departments = require('../../models/Departments');

const deleteDepartmentByEventId = async (eventId) => {

    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const departments = await Departments.deleteMany( { event: eventId } );
        return departments;
        
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = deleteDepartmentByEventId;