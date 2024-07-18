const mongoose = require('mongoose');
const Users = require('../../models/Users');

const getUsersByDepartmentId = async (departmentId, query_access_level = "user") => {
    mongoose.connect(process.env.MONGODB_URL);

    try{
        const users = await Users.find().sort( { createdAt: -1 } );

        /*
            Filter In the Users who have:
                1) Role = "<this-department-id>/.../user"
        */
        
        // 1)
        const filteredUsers = users.filter(user => {
            const userRole = user.role;
            const [department_id, event_id, access_level] = userRole.split('/');

            if(department_id === departmentId && access_level === query_access_level){
                return true;
            }
        })

        return filteredUsers;


    }catch(error){
        throw new Error(error.message);
    }
}

module.exports = getUsersByDepartmentId;