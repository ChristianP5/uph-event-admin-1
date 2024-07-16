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

const getRootHandler = (request, h) => {
    const response = h.response({
        status: 'success',
        message: 'Welcome to Root!',
    })

    response.code(200);

    return response;
}

const getLostHandler = (request, h) => {
    const response = h.response({
        status: 'fail',
        message: 'Welcome to the Service, but you seem to be Lost!',
    })

    response.code(404);

    return response;
}

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
    const payload = user;
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
*/

const getAdminDashboardPageHandler = async (request, h) => {
    
    // 1)
    const events = await getAllEvents();

    const data = {
        events
    }

    return h.view('admin/dashboard.ejs', data);
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

    if(userRole !== "admin/admin/admin"){
        throw new Error("Unauthorized Access!");
    }

    // 2)
    const user = await getUserByUsername(username);
    if(user){
        throw new Error("Username already exists! Try again");
    }


    // 2)
    const event = await createEvent(name);

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
*/
const getEventDashboardPageHandler = async (request, h) => {
    const { eventId } = request.params;

    // 1)
    const event = await getEventById(eventId);

    // 2)
    const departments = await getDepartmentsByEventId(eventId);


    const data = {
        eventId : event._id,
        eventName : event.name,
        departments: departments,
    };

    return h.view('event/dashboard.ejs', data);
    
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
            departments,
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

    // 1)
    const event = await getEventById(eventId);

    // 2)
    const department = await getDepartmentById(departmentId);

    // 3)
    const forms = await getFormsByDepartmentId(departmentId);

    // 4)
    const users = await getUsersByDepartmentId(departmentId);

    const data = {
        event: event,
        department: department,
        forms: forms,
        users: users,
    };

    return h.view('department/dashboard.ejs', data);
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

    // 1)
    const event = await getEventById(eventId);
    const department = await getDepartmentById(departmentId);

    const data = {
        event: event,
        department: department,
    };

    return h.view("department/newForm.ejs", data);
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
    GET NEW USER PAGE Handler
    1) Get Department and Event Information
    2) Load Create User Page
*/
const getNewUserPageHandler = async (request, h) => {
    const { eventId, departmentId } = request.params;

    // 1)
    const department = await getDepartmentById(departmentId);
    const event = await getEventById(eventId);

    const data = {
        department: department,
        event: event,
    };

    // 2)
    return h.view('department/newUser.ejs', data);
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
    getFormByIdHandler
}