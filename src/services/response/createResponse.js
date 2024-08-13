const mongoose = require('mongoose');

const Responses = require('../../models/Responses');

const createResponse = async (ratings, formId) => {
    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const response = await Responses.create( {ratings: ratings, form: formId} );
        return response;
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = createResponse;