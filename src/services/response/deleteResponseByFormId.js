const mongoose = require('mongoose');
const Responses = require('../../models/Responses');

const deleteResponseByFormId = async (formId) => {
    mongoose.connect(process.env.MONGODB_URL);

    try{
        const responses = await Responses.deleteMany( {form: formId} );
        return responses;
    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = deleteResponseByFormId;