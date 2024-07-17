/*
EDIT USER PAGE
    1) Get UserInfo from Token
    2) Determine if either
        a) Role = "admin/admin/admin" or "admin/<this-event-id>/admin" or "<this-department-id>/<this-event-id>/admin"
        b) Role = "<this-department-id>/<this-event-id>/user" AND <this-user-id> === <current-user-id>
            - [false] redirect to '/authorization'
    3) Load Page Contents
*/

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');

    // 1)
    const userInfo = await getAuthUserInfo();
    const currentUserId = userInfo._id;

    // 2)
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

    const departmentId = document.getElementById('department-id').textContent;
    const eventId = document.getElementById('event-id').textContent;

        // a)
        if((department_id !== "admin" && department_id !== departmentId) || (event_id !== "admin" && event_id !== eventId) || (access_level !== "admin" && access_level !== "user")){
            location.href = '/authorization';
            throw new Error('Unauthorized');
        }

        // b)
        const targetUserId = document.getElementById('user-id').textContent;
        if(access_level === "user" && currentUserId !== targetUserId){
            location.href = '/authorization';
            throw new Error('Unauthorized');
        }

    // 3)
    /*
        ADD EVENT LISTENERS
        a) Submit Button Click Listener
    */

    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const form = document.getElementById('main-form');

        const formData = new FormData(form);

        const targetEndpoint = `/api/event/${eventId}/department/${departmentId}/users/${targetUserId}`;
        
        const result = await fetch(targetEndpoint, {
            method: 'PUT',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
            },
            body: formData,
        })

        const data = await result.json();

        if(!result.ok){
            alert(data.message);
            throw new Error(data.error);
        }

        if(access_level === "user" && currentUserId === targetUserId){
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
        }

        location.href = `/event/${eventId}/department/${departmentId}/dashboard`;
        return;
    })

        

})