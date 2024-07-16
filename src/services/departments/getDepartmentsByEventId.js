const mongoose = require('mongoose');
const Departments = require('../../models/Departments');

const getDepartmentsByEventId = async (eventId) => {

    mongoose.connect(process.env.MONGODB_URL);

    try{
        const departments = await Departments.find( { event: eventId } ).sort( { createdAt: -1 } )

        return departments;
        
    }catch(error){
        throw new Error("Problem retrieving Departments!");
    }
}

module.exports = getDepartmentsByEventId;