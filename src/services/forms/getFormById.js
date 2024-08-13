const mongoose = require('mongoose');
const Forms = require('../../models/Forms');

const getFormById = async (formId) => {

    // .connect(process.env.MONGODB_URL);

    try{
        const form = await Forms.findOne( { _id: formId } );

        if(!form){
            throw new Error("Form not found!");
        }

        return form;

    }catch(error){
        throw new Error(error.message);
    }

}

module.exports = getFormById;