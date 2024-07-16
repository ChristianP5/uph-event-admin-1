const Hapi = require('@hapi/hapi');
const dotenv = require('dotenv');
const routes = require('./routes');
const path = require('path');

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