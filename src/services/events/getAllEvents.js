const mongoose = require('mongoose');
const Events = require('../../models/Events');

const getAllEvents = async () => {

    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const events = await Events.find().sort( { createdAt: -1 } )

        return events;
        
    }catch(error){
        throw new Error("Problem retrieving Events!");
    }
}

module.exports = getAllEvents;