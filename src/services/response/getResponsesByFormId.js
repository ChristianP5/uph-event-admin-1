const mongoose = require('mongoose');
const Responses = require('../../models/Responses');

const getResponsesByFormId = async (formId, direction = -1) => {
    mongoose.connect(process.env.MONGODB_URL);

    if(direction !== -1 && direction !== 1){
        direction = -1;
    }

    try{
        const responses = await Responses.find( {form: formId} ).sort( { createdAt: direction } );
        return responses;
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = getResponsesByFormId;