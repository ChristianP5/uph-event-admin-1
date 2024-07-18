const mongoose = require('mongoose');
const Events = require('../../models/Events');

const editEvent = async (eventId, name) => {

    mongoose.connect(process.env.MONGODB_URL);

    try{
        const event = await Events.findById(eventId);
        event.name = name;
        await event.save();

        return event;
        
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = editEvent;