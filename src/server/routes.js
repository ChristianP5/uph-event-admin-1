const {
    getRootHandler, getLostHandler,
    createUserHandler, postLoginHandler,
    getLoginPageHandler, postValidateRTHandler,
    getAuthorizationPageHandler, getAuthUserHandler,
    getAdminDashboardPageHandler, getEventDashboardPageHandler,
    createEventHandler, getAdminNewEventPageHandler,
    getEventNewDepartmentPageHandler, createDepartmentHandler,
    getDepartmentsByEventIdHandler, getDepartmentDashboardPageHandler,
    createFormHandler, getNewFormPageHandler,
    getFormsByDepartmentIdHandler, getNewUserPageHandler,
    createDepartmentMemberHandler, getFormPagePageHandler,
    getCreateResponsePagePageHandler, createDepartmentResponseHandler,
    getExportFormHandler, getDepartmentByIdHandler,
    getEventByIdHandler, getFormByIdHandler
} = require('./handler');

const path = require('path');

const routes = [
    {
        path: '/',
        method: 'GET',
        handler: getRootHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    // Auth API
    {
        path: '/auth/login',
        method: 'POST',
        handler: postLoginHandler,
        options: {
            auth: {
                mode: 'try',
            },
            payload: {
                multipart: true,
                allow: 'multipart/form-data',
                maxBytes: 1000000,
            }
        }
    },
    {
        path: '/auth/validateRT',
        method: 'POST',
        handler: postValidateRTHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/auth/user',
        method: 'GET',
        handler: getAuthUserHandler,
    },
    // API
    {
        path: '/api/users',
        method: 'POST',
        handler: createUserHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/api/events',
        method: 'POST',
        handler: createEventHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
            }
        }
    },
    {
        path: '/api/events/{eventId}',
        method: 'GET',
        handler: getEventByIdHandler,
    },
    {
        path: '/api/departments',
        method: 'POST',
        handler: createDepartmentHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
            }
        }
    },
    {
        path: '/api/events/{eventId}/departments/{departmentId}',
        method: 'GET',
        handler: getDepartmentByIdHandler,
    },
    {
        path: '/api/event/{id}/departments',
        method: 'GET',
        handler: getDepartmentsByEventIdHandler,
    },
    {
        path: '/api/forms',
        method: 'POST',
        handler: createFormHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
            }
        }
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}/forms',
        method: 'GET',
        handler: getFormsByDepartmentIdHandler,
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}/forms/{formId}',
        method: 'GET',
        handler: getFormByIdHandler,
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}/users',
        method: 'POST',
        handler: createDepartmentMemberHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
            }
        }
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}/responses',
        method: 'POST',
        handler: createDepartmentResponseHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
            }
        }
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}/forms/{formId}/export',
        method: 'GET',
        handler: getExportFormHandler,
    },
    // Pages
    {
        path: '/login',
        method: 'GET',
        handler: getLoginPageHandler,
        options: {
            auth: {
                mode: 'try',
            },
        }
    },
    {
        path: '/authorization',
        method: 'GET',
        handler: getAuthorizationPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/admin/dashboard',
        method: 'GET',
        handler: getAdminDashboardPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/admin/event/new',
        method: 'GET',
        handler: getAdminNewEventPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/event/{eventId}/dashboard',
        method: 'GET',
        handler: getEventDashboardPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/event/{eventId}/department/new',
        method: 'GET',
        handler: getEventNewDepartmentPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/event/{eventId}/department/{departmentId}/dashboard',
        method: 'GET',
        handler: getDepartmentDashboardPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/event/{eventId}/department/{departmentId}/form/new',
        method: 'GET',
        handler: getNewFormPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/event/{eventId}/department/{departmentId}/users/new',
        method: 'GET',
        handler: getNewUserPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/event/{eventId}/department/{departmentId}/form/{formId}',
        method: 'GET',
        handler: getFormPagePageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/event/{eventId}/department/{departmentId}/form/{formId}/response/new',
        method: 'GET',
        handler: getCreateResponsePagePageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    // Utils
    {
        path: '/{filename*}',
        method: 'GET',
        handler: {
            directory: {
                path: path.join(__dirname, 'views'),
                index: ['index'],
            }
        },
        options: {
            auth: {
                mode: 'try',
            }
        }
        
    },
    {
        path: '/{any*}',
        method: '*',
        handler: getLostHandler,
    }
]

module.exports = routes