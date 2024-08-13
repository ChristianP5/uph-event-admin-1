const mongoose = require('mongoose');
const Forms = require('../../models/Forms');

const createForm = async (name, departmentId, questions) => {
    // mongoose.connect(process.env.MONGODB_URL);

    try{
        const form = await Forms.create( { name: name, department: departmentId, questions: questions } );
        return form;
    }catch(error){
        throw new Error('Something wrong when creating Form!');
    }
}

module.exports = createForm;