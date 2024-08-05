const generateAccessToken = require("../services/auth/generateAccessToken");
const generateRefreshToken = require("../services/auth/generateRefreshToken");
const getRefreshTokenByRefreshToken = require("../services/auth/getRefreshTokenByRefreshToken");
const saveRefreshToken = require("../services/auth/saveRefreshToken");
const createDepartment = require("../services/departments/createDepartment");
const getDepartmentsByEventId = require("../services/departments/getDepartmentsByEventId");
const createEvent = require("../services/events/createEvent");
const getAllEvents = require("../services/events/getAllEvents");
const getEventById = require("../services/events/getEventById");
const createUser = require("../services/users/createUser");
const getUserByCredentials = require("../services/users/getUserByCredentials");
const getDepartmentById = require('../services/departments/getDepartmentById');
const createForm = require("../services/forms/createForm");
const getFormsByDepartmentId = require("../services/forms/getFormsByDepartmentId");
const getUsersByDepartmentId = require("../services/users/getUsersByDepartmentId");
const getFormById = require("../services/forms/getFormById");
const createResponse = require("../services/response/createResponse");
const getResponsesByFormId = require("../services/response/getResponsesByFormId");
const exportFormResponse = require("../services/response/exportFormResponse");
const getUserByUsername = require("../services/users/getUserByUsername");
const getUserById = require("../services/users/getUserById");
const editUser = require("../services/users/editUser");
const deleteUserById = require("../services/users/deleteUserById");
const getUserByEventId = require("../services/users/getUserByEventId");
const editEvent = require("../services/events/editEvent");
const editDepartment = require("../services/departments/editDepartment");
const getAdminUser = require("../services/users/getAdminUser");
const deleteForm = require("../services/forms/deleteForm");
const deleteResponseByFormId = require("../services/response/deleteResponseByFormId");
const deleteDepartment = require("../services/departments/deleteDepartment");
const deleteUserByDepartmentId = require("../services/users/deleteUserByDepartmentId");
const deleteEvent = require("../services/events/deleteEvent");
const deleteUserByEventId = require("../services/users/deleteUserByEventId");
const deleteRefreshToken = require("../services/auth/deleteRefreshToken");

const LoadingError = require('./exceptions/LoadingError');

const getRootHandler = (request, h) => {

    return h.redirect('/authorization');
}

const getLostHandler = (request, h) => {
    const response = h.response({
        status: 'fail',
        message: 'Welcome to the Service, but you seem to be Lost!',
    })

    response.code(404);

    return response;
}

/*
    GET DEPARTMENT ADMIN Handler
    1) Get UserInfo from Token
    2) Validate if User is Authorized for role:
    - "admin/admin/admin"
    - "admin/<this-department-id>/admin"
    - "<this-event-id>/<this-department-id>/admin"
    - "<this-event-id>/<this-department-id>/user and <target-user-id> === <this-user-id>"
    3) Get Department User By Department ID
*/
const getDepartmentAdminHandler = async (request, h) => {
    const { eventId, departmentId } = request.params;

    // 1)
    const userInfo = request.auth.credentials._doc;
    
    // 2)
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');
    if( (department_id !== "admin" && department_id !== departmentId) || (event_id !== eventId && event_id !== "admin") || access_level !== "admin" ){
        throw new Error('Unauthorized');
    }

    // 3)
    const adminUser = await getUsersByDepartmentId(departmentId, "admin");

    const response = h.response({
        status: 'success',
        message: 'User retrieved successfully!',
        data: {
            adminUser: adminUser[0],
        }
    });

    response.code(200);

    return response;
}

/*
    EDIT DEPARTMENT PAGE Handler
    1) Get Event Info
    2) Get Department Info
    3) Load Page

*/
const getEditDepartmentPageHandler = async (request, h) => {
    const {eventId, departmentId} = request.params;

    try{
        // 1)
        const event = await getEventById(eventId);

        // 2)
        const department = await getDepartmentById(departmentId);

        // 3)
        const data = {
            event: event,
            department: department,
        };

        return h.view('event/editDepartment.ejs', data);

    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
};

/*
    EDIT DEPARTMENT Handler
    1) Get UserInfo from Token
    2) Validate if User is Authorized by role:
    - "admin/admin/admin"
    - "admin/<this-event-id>/admin"
    3) Edit the Department
    
*/
const editDepartmentHandler = async (request, h) => {
    const {eventId, departmentId} = request.params;
    const {name} = request.payload;

    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if( department_id !== "admin" || (event_id !== eventId && event_id !== "admin") || access_level !== "admin" ){
        throw new Error('Unauthorized!');
    }

    // 3)
    const department = await editDepartment(departmentId, name);

    const response = h.response({
        status: 'success',
        message: 'Department Updated Successfully!',
    });

    response.code(200);

    return response;
}

/*
    DELETE DEPARTMENT Handler
    1) Get User Info
    2) Validate User Role:
    - "admin/admin/admin"
    - "admin/<this-event-id>/admin"
    3) Delete Department
    4) and its Members
    5) and its Admin
    6) and its Forms
    7) and its Forms' Responses
*/
const deleteDepartmentHandler = async (request, h) => {
    const { eventId, departmentId } = request.params;

    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if( department_id !== "admin" || (event_id !== eventId && event_id !== "admin") || access_level !== "admin" ){
        throw new Error('Unauthorized!');
    };

    // 3)
    await deleteDepartment(departmentId);

    // 4) and 5)
    await deleteUserByDepartmentId(departmentId);

    // 6)
    const forms = await getFormsByDepartmentId(departmentId);
    forms.forEach(async form => {
        const formId = form._id;

        await deleteForm(formId);

        // 7)
        await deleteResponseByFormId(formId);
    });

    const response = h.response({
        status: 'success',
        message: 'Department deleted successfully!',
    });

    response.code(200);

    return response;
};

/*
    EDIT DEPARTMENT USER Handler
    1) Get UserInfo from Token
    2) Validate if User is Authorized by role:
    - "admin/admin/admin"
    - "admin/<this-event-id>/admin"
    - "<this-department-id>/<this-event-id>/admin"
    - "<this-department-id>/<this-event-id>/user and <target-user-id> === <this-user-id>"
    3) Edit the Target User. 
    - If Target User is the Current User:   Create New RT and Access Token
*/
const editDepartmentUserHandler = async (request, h) => {
    const { eventId, departmentId, userId } = request.params;
    const { username, password } = request.payload;

    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if( (department_id !== departmentId && department_id !== "admin") || (event_id !== eventId && event_id !== "admin") || (access_level !== "admin" && access_level !== "user") ){
        throw new Error('Unauthorized!');
    }

    const currentUserId = userInfo._id;
    const targetUserId = userId;
    if(access_level === "user" && currentUserId !== targetUserId){
        throw new Error('Unauthorized!');
    }

    // 3)
    const modifiedUser = await editUser(targetUserId, username, password);

    if(currentUserId === targetUserId){
        const payload = modifiedUser;

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await saveRefreshToken(refreshToken);

        const response = h.response({
            status: 'success',
            message: 'User Modified Successfully!',
            data: {
                accessToken: accessToken,
                refreshToken: refreshToken,
            }
        });
    
        response.code(200);
    
        return response;

    }

    const response = h.response({
        status: 'success',
        message: 'User Modified Successfully!',
    });

    response.code(200);

    return response;


}

/*
    GET EDIT DEPARTMENT USER PAGE Handler
    1) Get Event Information
    2) Get Department Information
    3) Get User Information
    4) Load Edit Department User Page
*/
const getEditDepartmentUserPageHandler = async (request, h) => {
    const { eventId, departmentId, userId } = request.params;

    try{
        // 1)
        const event = await getEventById(eventId);

        // 2)
        const department = await getDepartmentById(departmentId);

        // 3)
        const user = await getUserById(userId);

        const data = {
            event: event,
            department: department,
            user: user,
        };

        return h.view('department/editUser.ejs', data);
        
    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
}

/*
    TODO:
    - [DONE] Make Edit Event Functionality
    - [DONE] Make Edit Department Functionality
    - [DONE] Make Edit Admin User Functionaility
    - Make Delete Event Functionality
    - [DONE] Make Delete Department Functionality
    - [DONE] Make Delete Form Functionality
*/

/*
    EDIT EVENT Handler
    1) Get UserInfo
    2) Validate User Role:
    - "admin/admin/admin"
    - "admin/<this-event-id>/admin"
    3) Edit Event
*/
const editEventHandler = async (request, h) => {
    const { eventId } = request.params;
    const { name } = request.payload;

    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const userId = userInfo._id;

    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin"  || ( event_id !== "admin" && event_id !== eventId ) || access_level !== "admin"){
        throw new Error('Unauthorized');
    };

    // 3)
    const event = await editEvent(eventId, name, userId);

    const response = h.response({
        status: 'success',
        message: 'Department Updated Succesfully!',
    });

    response.code(200);

    return response;
}

/*
    DELETE EVENT Handler
    1) Get User Info
    2) Validate User Role:
    - "admin/admin/admin"
    3) Delete Event
    4) and its Event Admin
    5) and its Departments
    6) and each Department's Users
    7) and each Department's Admin
    8) and each Department's Form
    9) and each Form's Responses
*/
const deleteEventHandler = async (request, h) => {
    const { eventId } = request.params;

    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || event_id !== "admin" || access_level !== "admin"){
        throw new Error('Unauthorized');
    };

    // 3)
    await deleteEvent(eventId);

    // 4)
    await deleteUserByEventId(eventId);

    // 5)
    const departments = await getDepartmentsByEventId(eventId);
    departments.forEach(async department => {
        const departmentId = department._id;

        await deleteDepartment(departmentId);

        // 6) and 7)
        await deleteUserByDepartmentId(departmentId);

        // 8)
        const forms = await getFormsByDepartmentId(departmentId);
        forms.forEach(async form => {
            const formId = form._id;

            await deleteForm(formId);

            // 9)
            await deleteResponseByFormId(formId);
        });
    });

    const response = h.response({
        status: 'success',
        message: 'Event deleted successfully!',
    });

    response.code(200);

    return response;
}

/*
    EDIT EVENT PAGE Handler
    1) Get Event Info
    2) Load Event Page
*/
const getEditEventPageHandler = async (request, h) => {
    const { eventId } = request.params;

    try{
        // 1)
        const event = await getEventById(eventId);

        // 2)
        const data = {
            event: event,
        };

        return h.view('event/editEvent.ejs', data);
    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }

}


/*
    EDIT EVENT ADMIN Handler
    1) Get UserInfo
    2) Validate User Role:
    - "admin/admin/admin"
    - "admin/<this-event-id>/admin"
    3) Edit Event Admin
    - If the current user IS the Event Admin, then remake tokens
*/
const editEventAdminHandler = async (request, h) => {
    const { eventId } = request.params;
    const { username, password, userId } = request.payload;

    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin" ){
        throw new Error('Unauthorized');
    };

    // 3)
    const targetUserId = userId;
    const currentUserId = userInfo._id;

    const newUser = await editUser(targetUserId, username, password);

    if(targetUserId === currentUserId){
        const payload = newUser;
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await saveRefreshToken(refreshToken);

        const response = h.response({
            status: 'success',
            message: 'Event Admin User Updated!',
            data: {
                accessToken: accessToken,
                refreshToken: refreshToken,
            },
        });

        response.code(200);

        return response;

    }

    const response = h.response({
        status: 'success',
        message: 'Event Admin User Updated!',
    });

    response.code(200);

    return response;

}

/*
    EDIT DEPARTMENT ADMIN Handler
    1) Get UserInfo
    2) Validate UserRole:
    - "admin/admin/admin"
    - "admin/<this-event-id>/admin"
    - "<this-department-id>/<this-event-id>/admin"
    3) Edit the Department Admin
    - if current user is "<this-department-id>/<this-event-id>/admin", then remake tokens
*/
const editDepartmentAdminHandler = async (request, h) => {
    const { eventId, departmentId } = request.params;
    const { username, password } = request.payload;

    // 1)
    const userInfo = request.auth.credentials._doc;
    
    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if((department_id !== departmentId && department_id !== "admin") || (event_id !== eventId && event_id !=="admin" ) || access_level !== "admin"){
        throw new Error('Unauthorized');
    };

    // 3)
    const targetUser = await getUsersByDepartmentId(departmentId, "admin");

    const newUser = await editUser(targetUser[0]._id, username, password);

    // IF User is the Department Admin User being Modified
    if(department_id === departmentId && event_id === eventId && access_level === "admin"){
        
        const payload = newUser;

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await saveRefreshToken(refreshToken);

        const response = h.response({
            status: 'success',
            message: 'Department Admin Updated Successfully!',
            data: {
                accessToken: accessToken,
                refreshToken: refreshToken,
            },
        });

        response.code(200);

        return response;

    };

    const response = h.response({
        status: 'success',
        message: 'Department Admin Updated Successfully!',
    });

    response.code(200);

    return response;
}

/*
    CREATE USER Handler
*/
const createUserHandler = async (request, h) => {
    const { username, password, role } = request.payload;

    await createUser(username, password, role);

    const response = h.response({
        status: 'success',
        message: 'User Created Successfully!',
    })

    response.code(201);
    return response;
}

/*
    DELETE DEPARTMENT USER Handler
    1) Get UserInfo
    2) Validate User Role
    - "admin/admin/admin"
    - "admin/<this-event-id>/admin"
    - "<this-department-id>/<this-event-id>/admin"
    3) Delete Department User
*/
const deleteDepartmentUserHandler = async (request, h) => {
    const {eventId, departmentId, userId} = request.params;

    // 1)
    const userInfo = request.auth.credentials._doc;
    
    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if((department_id !== "admin" && department_id !== departmentId) || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        throw new Error('Unauthorized');
    }

    // 3)
    await deleteUserById(userId);

    const response = h.response({
        status: 'success',
        message: 'User deleted successfully!',
    });

    response.code(200);

    return response;


}

/*
    GET USERS BY DEPARTMENT ID Handler
    1) Get UserInfo
    2) Validate Role
        - "admin/admin/admin"
        - "<this-department-id>/<event-id>/admin"
        - "<this-department-id>/<event-id>/user"
    3) Retrieve Users
*/
const getUsersByDepartmentIdHandler = async (request, h) => {
    const { departmentId } = request.params;

    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if((department_id !== departmentId && department_id !== "admin") || (!event_id) || (access_level !== "admin" && access_level !== "user")){
        throw new Error('Unauthorized');
    }

    // 3)
    const users = await getUsersByDepartmentId(departmentId);

    const response = h.response({
        status: 'success',
        message: 'Users retrieved successfully!',
        data: {
            users: users,
        }
    });

    response.code(200);

    return response;
}

/*
LOG IN Handler

Steps:
1) Check if Logged In
2) Check if Valid Input
3) Check if Valid User
4) Give Access Token
5) Create Refresh Token
6) Store Refresh Token
END) Return the Access Token and Refresh Token

*/
const postLoginHandler = async (request, h) => {
    
    // 1)
    if(request.auth.isAuthenticated){
        throw new Error("Already Authenticated");
    }

    // 2)
    let username, password;
    try{
        const { username:checkUsername, password:checkPassword } = request.payload;
        if(!checkUsername || !checkPassword){
            throw new Error('Invalid Input');
        }

        username = checkUsername;
        password = checkPassword;

    }catch(error){
        throw new Error('Invalid Input');
    }

    // 3)
    const user = await getUserByCredentials(username, password);

    // 4)
    const payload = {
        _doc: {
            _id: user._id,
            role: user.role,
            username: username,
            password: password,
        }
    };
    const accessToken = generateAccessToken(payload);

    // 5)
    const refreshToken = generateRefreshToken(payload);
    await saveRefreshToken(refreshToken);

    // END)
    const response = h.response({
        status: 'success',
        message: 'Log In Successful!',
        data: {
            accessToken,
            refreshToken,
        }
    })

    response.code(200);
  
    return response;
}

/*
    LOG OUT Handler
    1) Check if Logged In
    2) Delete RefreshToken
*/

const postLogoutHandler = async (request, h) => {
    const { refreshToken } = request.payload;

    // console.log(refreshToken);

    // 1)
    try{
        const userInfo = request.auth.credentials._doc;
        if(!userInfo){
            throw new Error("Invalid Current User");
        }

        // 2) 
        await deleteRefreshToken(refreshToken);

        const response = h.response({
            status: 'success',
            message: 'Logged Out Successfully!'
        });

        response.code(200);

        return response;

    }catch(error){
        throw new Error(error.message);
    }
    
}


/*
LOAD LOG IN PAGE Handler
*/
const getLoginPageHandler = async (request, h) => {
    return h.view('auth/login.ejs');
}

/*
Search for Refresh Token By Refresh Token
*/
const postValidateRTHandler = async (request, h) => {
    const { refreshToken } = request.payload;

    await getRefreshTokenByRefreshToken(refreshToken);

    const response = h.response({
        status: 'success',
        message: 'Refresh Token is Valid',
    })

    response.code(200);

    return response;
}

const getAuthorizationPageHandler = async (request, h) => {
    return h.view('auth/authorization.ejs');
}


/*

GET AUTHENTICATED USER Handler
1) Get the User's Information from the JWT Access Token
2) Return the User's Information

*/
const getAuthUserHandler = async (request, h) => {
    const userInfo = request.auth.credentials._doc;

    const response = h.response({
        status: 'success',
        message: 'User Information received from Token!',
        data: {
            userInfo,
        }
    });

    response.code(200);

    return response;
}

/*
    GET ADMIN DASHBOARD PAGE Handler
    1) Get the Events Information
    2) Load Admin Dashbaord Page
*/

const getAdminDashboardPageHandler = async (request, h) => {
    
    try{
        // 1)
        const events = await getAllEvents();

        // 2)
        const data = {
            events
        }

        return h.view('admin/dashboard.ejs', data);
    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
}

/*
    GET VIEW EVENTS PAGE Handler
    // 1) Get All Events
    
*/
const getViewEventsPageHandler = async (request, h) => {
    const events = await getAllEvents();

    const data = {
        events: events,
    };

    return h.view('admin/viewEvents.ejs', data);
}

/*
    GET ADMIN USER Handler
    1) Get UserInfo
    2) Validate User Role:
    - "admin/admin/admin"
    3) Get Admin User
*/
const getAdminUserHandler= async (request, h) => {
    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || event_id !== "admin" || access_level !== "admin"){
        throw new Error('Unauthorized');
    }

    // 3)
    const users = await getAdminUser();

    const response = h.response({
        status: 'success',
        message: 'User retrieved successfully!',
        data: {
            users: users,
        },
    });

    response.code(200);

    return response;

}

/*
    GET EDIT ADMIN USER PAGE Handler
    1) Get Admin User Info
    2) Load Edit Admin User Page
*/
const getEditAdminUserPageHandler = async (request, h) => {
    const { userId } = request.params;
    
    try{
        // 1)
        const user = await getUserById(userId);

        // 2)
        const data = {
            user : user,
        };

        return h.view('admin/editAdminUser.ejs', data);
    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
}

/*
    EDIT ADMIN USER Handler
    1) Get UserInfo
    2) Validate User Role:
    - "admin/admin/admin"
    3) Edit Admin User
    - If Current User is the Edited Admin User
*/
const editAdminUserHandler = async (request, h) => {
    const { userId: targetUserId } = request.params;
    const { username, password } = request.payload;

    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || event_id !== "admin" || access_level !== "admin"){
        throw new Error('Unauthorized');
    };

    // 3)
    const newUser = await editUser(targetUserId, username, password);

    if(userInfo._id === targetUserId){
        const payload = newUser;

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await saveRefreshToken(refreshToken);

        const response = h.response({
            status: 'success',
            message: 'User Updated Successfully!',
            data: {
                accessToken: accessToken,
                refreshToken: refreshToken,
            },
        });

        response.code(200);

        return response;
    };

    const response = h.response({
        status: 'success',
        message: 'User Updated Successfully!',
    });

    response.code(200);

    return response;



}

/*
    CREATE EVENT Handler
    1) Validate if User has role = "admin/admin/admin"
    2) Validate if Event Admin's Username is Unique
    3) Create Event based on Request Payload
    4) Create the Event Admin based on Request Payload and Event ID
*/
const createEventHandler = async (request, h) => {
    const { name, username, password } = request.payload;

    // 1)
    const userInfo = request.auth.credentials._doc;
    const userRole = userInfo.role;
    const userId = userInfo._id;

    if(userRole !== "admin/admin/admin"){
        throw new Error("Unauthorized Access!");
    }

    // 2)
    const user = await getUserByUsername(username);
    if(user){
        throw new Error("Username already exists! Try again");
    }


    // 2)
    const event = await createEvent(name, userId);

    const eventId = event._id;
    // 3)
    const role = `admin/${eventId}/admin`;

    await createUser(username, password, role);

    const response = h.response({
        status: 'success',
        message: 'Event created Successfully!',
    })

    response.code(201);

    return response;
}

/*
    GET EVENTS Handler
    1) Get User Info
    2) Validate User Role:
    - "admin/admin/admin"
    3) Get Events
*/
const getEventsHandler = async (request, h) => {
    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || event_id !== "admin" || access_level !== "admin"){
        throw new Error('Unauthorized');
    };

    // 3)
    const events = await getAllEvents();

    const response = h.response({
        status: 'success',
        message: 'Events retrieved successfully!',
        data: {
            events: events,
        },
    });

    response.code(200);

    return response;
}

/*
    GET EVENT BY ID Handler
    1) Validate if User has role = "admin/admin/admin" or "admin/<this-event-id>/admin"
    2) Get Event By Id
*/
const getEventByIdHandler = async (request, h) => {
    const { eventId } = request.params;

    // 1)
    const userInfo = request.auth.credentials._doc;
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        throw new Error("Unauthorized Access!");
    }
    
    // 2)
    const event = await getEventById(eventId);

    const response = h.response({
        status: 'success',
        message: 'Event retrieved succesfully!',
        data: {
            event: event,
        }
    });

    response.code(200);
    return response;

}

/*
    GET EVENT DASHBOARD PAGE Handler
    1) Get the Event Information from eventId
    2) Get the Departments of the Event
    3) Get the Admin User of the Event
*/
const getEventDashboardPageHandler = async (request, h) => {
    const { eventId } = request.params;

    try{

        // 1)
        const event = await getEventById(eventId);

        // 2)
        const departments = await getDepartmentsByEventId(eventId);

        // 3)
        const adminUser = await getUserByEventId(eventId);

        const data = {
            eventId : event._id,
            eventName : event.name,
            departments: departments,
            adminUser: adminUser,
        };

        return h.view('event/dashboard.ejs', data);
    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
    
}

/*
    GET EVENT ADMIN Handler
    1) Get UserInfo
    2) Validate user with role:
    - "admin/admin/admin"
    - "admin/<this-event-id>/admin"
    3) Get Event Admin
*/

const getEventAdminsHandler = async (request, h) => {
    const { eventId } = request.params;

    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        throw new Error("Unauthorized Access!");
    }

    // 3) 
    const adminUser = await getUserByEventId(eventId);

    const response = h.response({
        status: 'success',
        message: 'Event Admin retrieved successfully!',
        data: {
            users: adminUser
        },
    });

    response.code(200);

    return response;

}


/*
    GET EDIT EVENT ADMIN PAGE Handler
    1) Get Event Information
    2) Get Event Admin Information
    3) Load Edit Event Admin Page
*/
const getEditEventAdminPageHandler = async (request, h) => {
    const {eventId} = request.params;

    try{
            
        // 1)
        const event = await getEventById(eventId);

        // 2)
        const eventAdmin = await getUserByEventId(eventId);

        // 3)
        const data = {
            event: event,
            eventAdmin: eventAdmin,
        };

        return h.view('event/editAdminUser.ejs', data);

    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
}

/*
    GET ADMIN's NEW EVENT PAGE Handler
    1) Return "Create Event" Page
*/
const getAdminNewEventPageHandler = async (request, h) => {
    return h.view('admin/newEvent.ejs');
}


/*
    GET EVENT'S NEW DEPARTMENT PAGE Handler
    1) Return "Create Department" Page
*/
const getEventNewDepartmentPageHandler = async (request, h) => {
    const { eventId } = request.params;
    const data = {
        eventId
    }
    return h.view('event/newDepartment.ejs', data);
}

/*
    CREATE DEPARTMENT Handler
    1) Validate if User has role = "admin/admin/admin" or "admin/<this-event-id>/admin"
    2) Validate if Department Admin's Username is Unique
    3) Create Department based on Request Payload
    4) Create the Department Admin based on Request Payload and Department ID
*/

const createDepartmentHandler = async (request, h) => {

    const { eventId, name, username, password } = request.payload;

    // 1)
    const userInfo = request.auth.credentials._doc;
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        throw new Error("Unauthorized Access!");
    }

    // 2)
    const user = await getUserByUsername(username);
    if(user){
        throw new Error("Username already exists! Try Again");
    }


    // 3)
    const department = await createDepartment(name, eventId);

    const departmentId = department._id;

    // 4)
    const role = `${departmentId}/${eventId}/admin`;

    await createUser(username, password, role);
    
    const response = h.response({
        status: 'success',
        message: 'Department created Successfully!',
    })

    response.code(201);

    return response;

}

/*
    GET EDIT DEPARTMENT ADMIN PAGE Handler
    1) Get Event Info
    2) Get Department Info
    3) Get User (Admin) Info
    4) Load Edit Department Admin Page
*/
const getEditDepartmentAdminPageHandler = async (request, h) => {
    const { eventId, departmentId } = request.params;
    
    try{

        // 1)
        const event = await getEventById(eventId);

        // 2)
        const department = await getDepartmentById(departmentId);

        // 3)
        const user = await getUsersByDepartmentId(departmentId, "admin");

        // 4)
        const data = {
            event: event,
            department: department,
            user: user[0],
        };

        return h.view('department/editAdminUser.ejs', data);

    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
    
}

/*
    GET DEPARTMENT BY ID Handler
    1) Validate if User has role =
        - "admin/admin/admin"
        - "<this-department-id>/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/user"
    2) Get Department by Department ID
*/
const getDepartmentByIdHandler = async (request, h) => {
    const { eventId, departmentId } = request.params;

     // 1)
     const userInfo = request.auth.credentials._doc;
     const userRole = userInfo.role;
 
     const [department_id, event_id, access_level] = userRole.split('/');
 
     if((department_id !== "admin" && department_id !== departmentId) || (event_id !== "admin" && event_id !== eventId) || (access_level !== "admin" && access_level !== "user")){
         throw new Error("Unauthorized Access!");
     };

     // 2)
     const department = await getDepartmentById(departmentId);

     const response = h.response({
        status: 'success',
        message: 'Department Found!',
        data: {
            department: department,
        },
     });

     response.code(200);

     return response;
}

/*
    GET DEPARTMENTS BY EVENT ID Handler
    1) Validate if User has role = "admin/admin/admin" or "admin/<this-event-id>/admin"
    2) Get Departments of Event ID

*/
const getDepartmentsByEventIdHandler = async (request, h) => {
    
    const { eventId } = request.params;

    // 1)
    const userInfo = request.auth.credentials._doc;
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        throw new Error("Unauthorized Access!");
    }

    // 2)
    const departments = await getDepartmentsByEventId(eventId);

    const response = h.response({
        status: 'success',
        message: 'Departments retrieved successfully!',
        data: {
            departments: departments,
        },
    });

    response.code(200);

    return response;

}


/*
    GET DEPARTMENT DASHBOARD PAGE Handler
    1) Get the Event Information
    2) Get the Department Information
    3) Get the Forms Information
    4) Get the Members Information
    5) Load the Department Dashboard Page

*/
const getDepartmentDashboardPageHandler = async (request, h) => {
    const { eventId, departmentId } = request.params;

    try{

        // 1)
        const event = await getEventById(eventId);

        // 2)
        const department = await getDepartmentById(departmentId);

        // 3)
        const forms = await getFormsByDepartmentId(departmentId);

        // 4)
        const users = await getUsersByDepartmentId(departmentId);

        // 5) 
        const adminUser = await getUsersByDepartmentId(departmentId, "admin");

        const data = {
            event: event,
            department: department,
            forms: forms,
            users: users,
            adminUser: adminUser[0],
        };

        return h.view('department/dashboard.ejs', data);

    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
}

/*
    CREATE FORM Handler
    1) Validate if User has Role:
        - "admin/admin/admin"
        - "admin/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/admin"
    2) Create Form based on Request Payload
*/
const createFormHandler = async (request, h) => {

    let name, departmentId, questions, eventId;
    try{
        const { name: reqName, departmentId: reqDepId, questions: reqQuestions, eventId: reqEventId } = request.payload;
        if(!reqName || !reqDepId || !reqQuestions || !reqEventId){
            throw new Error();
        }

        name = reqName;
        departmentId = reqDepId;
        questions = reqQuestions;
        eventId = reqEventId;

    }catch(error){
        throw new Error('Invalid Input!');
    }

    // 1)
    const userInfo = request.auth.credentials._doc;
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

    if((department_id !== "admin" && department_id !== departmentId ) || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        throw new Error("Unauthorized Access!");
    }

    // 2)
    const form = await createForm(name, departmentId, questions);

    const response = h.response({
        status: 'success',
        message: 'Form Created Successfully!'
    });

    response.code(200);

    return response;
}


/*
    GET NEW FORM PAGE Handler
    1) Get Event and Department Info
    2) Load Create Form Page
*/
const getNewFormPageHandler = async (request, h) => {
    const {eventId, departmentId} = request.params;

    try{

        // 1)
        const event = await getEventById(eventId);
        const department = await getDepartmentById(departmentId);

        const data = {
            event: event,
            department: department,
        };

        return h.view("department/newForm.ejs", data);

    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
}

/*
    GET FORMS BY ID Handler
    1) Validate if User has Role:
        - "admin/admin/admin"
        - "admin/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/user"
    2) Get Form based on ID
*/
const getFormByIdHandler = async (request, h) => {
    const { eventId, departmentId, formId } = request.params;
    
    // 1)
    const userInfo = request.auth.credentials._doc;
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

    if((department_id !== "admin" && department_id !== departmentId ) || (event_id !== "admin" && event_id !== eventId) || (access_level !== "admin" && access_level !== "user" )){
        throw new Error("Unauthorized Access!");
    };

    // 2)
    const form = await getFormById(formId);

    const response = h.response({
        status: 'success',
        message: 'Form Retrieved Successfully!',
        data: {
            form: form,
        },
    });

    response.code(200);

    return response;
}

/*
    GET FORMS BY DEPARTMENT ID Handler
    1) Validate if User has Role:
        - "admin/admin/admin"
        - "admin/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/user"
    2) Get All Forms based on Department ID
*/
const getFormsByDepartmentIdHandler = async (request, h) => {
    const { eventId, departmentId } = request.params;
    
    // 1)
    const userInfo = request.auth.credentials._doc;
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

    if((department_id !== "admin" && department_id !== departmentId ) || (event_id !== "admin" && event_id !== eventId) || (access_level !== "admin" && access_level !== "user" )){
        throw new Error("Unauthorized Access!");
    };

    // 2)
    const forms = await getFormsByDepartmentId(departmentId);

    const response = h.response({
        status: 'success',
        message: `Forms for Department ${departmentId} retrieved!`,
        data: {
            forms: forms,
        }
    })

    response.code(200);
    return response;

}

/*
    DELETE FORM Handler
    1) Get UserInfo
    2) Validate User Role:
    - "admin/admin/admin"
    - "admin/<this-event-id>/admin"
    - "<this-department-id>/<this-event-id>/admin"
    3) Delete the Form
    4) and its Responses
*/
const deleteFormHandler = async (request, h) => {
    const { eventId, departmentId, formId } = request.params;

    // 1)
    const userInfo = request.auth.credentials._doc;

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if( (department_id !== departmentId && department_id !== "admin") || ( event_id !== eventId && event_id !== "admin" ) || access_level !== "admin" ){
        throw new Error('Unauthorized');
    }

    // 3)
    await deleteForm(formId);

    // 4)
    await deleteResponseByFormId(formId);

    const response = h.response({
        status: 'success',
        message: 'Form Deleted Successfully!',
    });

    response.code(200);

    return response;

    
}

/*
    GET NEW USER PAGE Handler
    1) Get Department and Event Information
    2) Load Create User Page
*/
const getNewUserPageHandler = async (request, h) => {
    const { eventId, departmentId } = request.params;

    try{

        // 1)
        const department = await getDepartmentById(departmentId);
        const event = await getEventById(eventId);

        const data = {
            department: department,
            event: event,
        };

        // 2)
        return h.view('department/newUser.ejs', data);

    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
}

/*
    CREATE DEPARTMENT MEMBER Handler
    1) Validate if User has Role:
        - "admin/admin/admin"
        - "admin/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/admin"
    2) Create new User with Role:
        "<this-department-id>/<this-event-id>/user"
*/
const createDepartmentMemberHandler = async (request, h) => {
    const { eventId, departmentId } = request.params;
    const { username, password } = request.payload;
    
    // 1)
    const userInfo = request.auth.credentials._doc;
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

    if((department_id !== "admin" && department_id !== departmentId ) || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        throw new Error("Unauthorized Access!");
    };

    // 2
    const createdUserRole = `${departmentId}/${eventId}/user`;

    const user = await createUser(username, password, createdUserRole);

    const response = h.response({
        status: 'success',
        message: 'User Created Successfully!',
    });

    response.code(200);

    return response;

}

/*
    GET FORM PAGE Page Handler
    1) Get Event Information
    2) Get Department Information
    3) Get Form Information
    4) Get Responses related to Form
    5) Load Form Page Page
*/
const getFormPagePageHandler = async (request, h) => {
    const { eventId, departmentId, formId } = request.params;

    try{

        // 1)
        const event = await getEventById(eventId);
        
        // 2)
        const department = await getDepartmentById(departmentId);

        // 3)
        const form = await getFormById(formId);

        // 4)
        const responses = await getResponsesByFormId(formId);

        const data = {
            event: event,
            department: department,
            form: form,
            responses: responses,
        }

        return h.view('form/dashboard.ejs', data);

    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }
}

/*
    GET CREATE RESPONSE PAGE Page Handler
    1) Get Event Information
    2) Get Department Information
    3) Get Form Information
    
    5) Load Response Page Page
*/
const getCreateResponsePagePageHandler = async (request, h) => {
    const { eventId, departmentId, formId } = request.params;
    
    try{

        // 1)
        const event = await getEventById(eventId);

        // 2)
        const department = await getDepartmentById(departmentId);

        // 3)
        const form = await getFormById(formId);

        // 4)
        const data = {
            event: event,
            department: department,
            form: form,
        }

        return h.view('form/createResponse.ejs', data);

    }catch(error){
        throw new LoadingError('Something wrong when Loading Contents');
    }

}

/*
    CREATE DEPARTMENT RESPONSE Handler
    1) Validate if User has Role:
        - "admin/admin/admin"
        - "admin/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/user"
    2) Create new Response
*/
const createDepartmentResponseHandler = async (request, h) => {
    const { departmentId, eventId, ratings, formId } = request.payload;

    // console.log(request.payload);

    // 1)
    const userInfo = request.auth.credentials._doc;
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');
    if( (department_id !== departmentId && department_id !== "admin") || (event_id !== eventId && event_id !== "admin") || (access_level !== "admin" && access_level !== "user") ){
        throw new Error('Unauthorized!');
    }

    // 2)
    await createResponse(ratings, formId);

    const response = h.response({
        status: 'success',
        message: 'Response added Successfully!',
    });

    response.code(201);

    return response;
}

/*
    GET EXPORT FORM Handler
    1) Validate User Role is:
        - "admin/admin/admin"
        - "admin/<this-event>/admin"
        - "<this-department>/<this-event>/admin"
        - "<this-department>/<this-event>/user"
    2) Get Department Info
    3) Get Target Form Info
    3) Get Responses by Form
    4) Get Buffer for XLSX File
*/
const getExportFormHandler = async (request, h) => {
    const { eventId, departmentId, formId } = request.params;

    // 1)
    const userInfo = request.auth.credentials._doc;
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');
    if( (department_id !== departmentId && department_id !== "admin") || (event_id !== eventId && event_id !== "admin") || (access_level !== "admin" && access_level !== "user") ){
        throw new Error('Unauthorized!');
    }

    // 2)
    const department = await getDepartmentById(departmentId);

    const form = await getFormById(formId);

    // 3)
    const responses = await getResponsesByFormId(formId, 1);

    // 4)
    const buffer = await exportFormResponse(form, responses, department);

    return h.response(buffer)
    .type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    .header('Content-Disposition', 'attachment; filename=data.xlsx');
}

module.exports = {
    getRootHandler, getLostHandler, createUserHandler,
    postLoginHandler, getLoginPageHandler, postValidateRTHandler,
    getAuthorizationPageHandler, getAuthUserHandler, getAdminDashboardPageHandler,
    getEventDashboardPageHandler, createEventHandler, getAdminNewEventPageHandler,
    getEventNewDepartmentPageHandler, createDepartmentHandler, getDepartmentsByEventIdHandler,
    getDepartmentDashboardPageHandler, createFormHandler,
    getNewFormPageHandler, getFormsByDepartmentIdHandler,
    getNewUserPageHandler, createDepartmentMemberHandler,
    getFormPagePageHandler, getCreateResponsePagePageHandler,
    createDepartmentResponseHandler, getExportFormHandler,
    getDepartmentByIdHandler, getEventByIdHandler,
    getFormByIdHandler, getEditDepartmentUserPageHandler,
    editDepartmentUserHandler, getUsersByDepartmentIdHandler,
    deleteDepartmentUserHandler, getEditDepartmentAdminPageHandler,
    editDepartmentAdminHandler, getDepartmentAdminHandler,
    getEditEventAdminPageHandler, editEventAdminHandler,
    editEventHandler, getEditEventPageHandler,
    getEditDepartmentPageHandler, editDepartmentHandler, getAdminUserHandler,
    getEditAdminUserPageHandler, editAdminUserHandler,
    deleteFormHandler, deleteDepartmentHandler, deleteEventHandler,
    getEventsHandler, getEventAdminsHandler, postLogoutHandler,
    getViewEventsPageHandler
}