const mongoose = require('mongoose');
const Events = require('../../models/Events');

const deleteEvent = async (eventId) => {

    mongoose.connect(process.env.MONGODB_URL);

    try{
        const event = await Events.deleteOne( {_id: eventId} );
        if(!event){
            throw new Error();
        }

        return event;
        
    }catch(error){
        throw new Error("Event Not Found!");
    }
}

module.exports = deleteEvent;