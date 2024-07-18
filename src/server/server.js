const Hapi = require('@hapi/hapi');
const dotenv = require('dotenv');
const routes = require('./routes');
const path = require('path');
const getUserById = require('../services/users/getUserById');
const getUserByCredentials = require('../services/users/getUserByCredentials');
const getDepartmentById = require('../services/departments/getDepartmentById');
const getEventById = require('../services/events/getEventById');

dotenv.config();

const init = async ()=>{
    const server = Hapi.server({
        port: 9000,
        host: '0.0.0.0',
        routes: {
            files: {
                relativeTo: path.join(__dirname, 'views'),
            }
        }
    })

    await server.register([
        {
            plugin: require('@hapi/inert'),
        },
        {
            plugin: require('@hapi/vision'),
        },
        {
            plugin: require('@hapi/jwt'),
        }
    ]);

    server.auth.strategy('jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_SECRET,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            nbf: true,
            maxAgeSec: 0, 
            timeSkewSec: 0,
        },
        validate: async (artifacts, request, h) => {

            /*
            if(artifacts.decoded.payload.username === 'Bob'){
                console.log('Hello Bob!');
            }
                */

            const user = artifacts.decoded.payload._doc;

            try{
                // Relogin if User is Renamed by Someone Else
                let result = await getUserByCredentials(user.username, user.password);
                if(!result){
                    throw new Error('User not Found!');
                }

                // Relogin if User is Removed
                result = await getUserById(user._id);
                if(!result){
                    throw new Error('Invalid User ID!');
                }

                // Relogin if Event/Department is Removed
                const userRole = user.role;
                const [department_id, event_id, access_level] = userRole.split('/');

                if(department_id !== "admin"){
                    result = await getDepartmentById(department_id);
 
                    if(!result){
                        throw new Error('Invalid Department!');
                    };
                };

                if(event_id !== "admin"){
                    result = await getEventById(event_id);

                    if(!result){
                        throw new Error('Invalid Event!');
                    };
                };

            }catch(error){
                return {
                    isValid: false,
                }
            }


            return {
                
                isValid: true,
            }
        }
    });

    server.auth.default('jwt');

    server.views({
        engines: {
            ejs: require('ejs'),
        },
        path: path.join(__dirname, 'views'),
    })

    server.ext('onPreResponse',(request, h)=>{
        const response = request.response;

        if(response instanceof Error){
            // console.error(response);
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
                error: response.stack,
            })

            newResponse.code(500);
            return newResponse;
        }

        return h.continue;
    })

    server.route(routes);

    await server.start();
    console.log(`Server started at ${server.info.uri}`);
}

process.on('unhandledRejection', (error) =>{
    console.error(error.stack);
    console.error(`Process caugh Error!`);
    process.exit(1);
})

init();