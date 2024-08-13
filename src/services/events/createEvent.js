const mongoose = require('mongoose');
const Events = require('../../models/Events');

const createEvent = async (name, updatedBy) => {

    // mongoose.connect(process.env.MONGODB_URL);

    try{
        return await Events.create( {name: name, updatedBy: updatedBy} );
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = createEvent;