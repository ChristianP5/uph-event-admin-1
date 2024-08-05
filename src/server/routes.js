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
    getEventByIdHandler, getFormByIdHandler, getEditDepartmentUserPageHandler,
    editDepartmentUserHandler, getUsersByDepartmentIdHandler,
    deleteDepartmentUserHandler, getEditDepartmentAdminPageHandler,
    editDepartmentAdminHandler, getDepartmentAdminHandler,
    getEditEventAdminPageHandler, editEventAdminHandler,
    editEventHandler, getEditEventPageHandler, getEditDepartmentPageHandler,
    editDepartmentHandler, getAdminUserHandler, getEditAdminUserPageHandler,
    editAdminUserHandler, deleteFormHandler, deleteDepartmentHandler,
    deleteEventHandler, getEventsHandler, getEventAdminsHandler,
    postLogoutHandler, getViewEventsPageHandler
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
        path: '/auth/logout',
        method: 'POST',
        handler: postLogoutHandler,
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
    /*
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
    */
    {
        path: '/api/departments/{departmentId}/users',
        method: 'GET',
        handler: getUsersByDepartmentIdHandler,
    },
    {
        path: '/api/admin/user',
        method: 'GET',
        handler: getAdminUserHandler,
    },
    {
        path: '/api/admin/user/{userId}',
        method: 'PUT',
        handler: editAdminUserHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
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
        path: '/api/events',
        method: 'GET',
        handler: getEventsHandler,
    },
    {
        path: '/api/events/{eventId}',
        method: 'DELETE',
        handler: deleteEventHandler,
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
        path: '/api/event/{eventId}/departments',
        method: 'GET',
        handler: getDepartmentsByEventIdHandler,
    },
    {
        path: '/event/{eventId}/admin/users',
        method: 'GET',
        handler: getEventAdminsHandler,
    },
    {
        path: '/api/event/{eventId}/admin',
        method: 'PUT',
        handler: editEventAdminHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
            }
        }
    },
    {
        path: '/api/event/{eventId}',
        method: 'PUT',
        handler: editEventHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
            }
        }
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
        path: '/api/event/{eventId}/department/{departmentId}/users/{userId}',
        method: 'PUT',
        handler: editDepartmentUserHandler,
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
        method: 'DELETE',
        handler: deleteDepartmentHandler,
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}/admin/edit',
        method: 'PUT',
        handler: editDepartmentAdminHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
            }
        }
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}',
        method: 'PUT',
        handler: editDepartmentHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000,
            }
        }
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}/admin',
        method: 'GET',
        handler: getDepartmentAdminHandler,
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}/users/{userId}',
        method: 'DELETE',
        handler: deleteDepartmentUserHandler,
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}/forms/{formId}/export',
        method: 'GET',
        handler: getExportFormHandler,
    },
    {
        path: '/api/event/{eventId}/department/{departmentId}/forms/{formId}',
        method: 'DELETE',
        handler: deleteFormHandler,
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
        path: '/admin/events/view',
        method: 'GET',
        handler: getViewEventsPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/admin/user/{userId}/edit',
        method: 'GET',
        handler: getEditAdminUserPageHandler,
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
        path: '/event/{eventId}/edit',
        method: 'GET',
        handler: getEditEventPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/event/{eventId}/admin/edit',
        method: 'GET',
        handler: getEditEventAdminPageHandler,
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
        path: '/event/{eventId}/department/{departmentId}/edit',
        method: 'GET',
        handler: getEditDepartmentPageHandler,
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
        path: '/event/{eventId}/department/{departmentId}/users/{userId}',
        method: 'GET',
        handler: getEditDepartmentUserPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/event/{eventId}/department/{departmentId}/admin/edit',
        method: 'GET',
        handler: getEditDepartmentAdminPageHandler,
        options: {
            auth: {
                mode: 'try',
            }
        }
    },
    {
        path: '/event/{eventId}/department/{departmentId}/form/{formId}/dashboard',
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
        path: '/file/{filename*}',
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
        method: 'GET',
        handler: getLostHandler,
        options: {
            auth: {
                mode: 'try'
            }
        }
    }
]

module.exports = routes