const mongoose = require('mongoose');
const Forms = require('../../models/Forms');

const deleteForm = async (formId) => {

    mongoose.connect(process.env.MONGODB_URL);

    try{
        const form = await Forms.deleteOne( { _id: formId } );

        if(!form){
            throw new Error("Form not found!");
        }

        return form;

    }catch(error){
        throw new Error(error.message);
    }

}

module.exports = deleteForm;