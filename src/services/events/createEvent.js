const mongoose = require('mongoose');
const Events = require('../../models/Events');

const createEvent = async (name) => {

    mongoose.connect(process.env.MONGODB_URL);

    try{
        return await Events.create( {name: name} );
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = createEvent;