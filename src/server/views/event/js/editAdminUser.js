/*
EDIT ADMIN USER PAGE
    1) Get UserInfo from Token
    2) Determine if either
        a) Role = "admin/admin/admin" or "admin/<this-event-id>/admin"
    3) Load Page Contents
*/

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');

    // 1)
    const userInfo = await getAuthUserInfo();

    // 2)
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

    const eventId = document.getElementById('event-id').textContent;

        // a)
        if(department_id !== "admin" || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
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

        const targetEndpoint = `/api/event/${eventId}/admin`;
        
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
        
        if(access_level === "admin" && department_id === "admin" && event_id === eventId){
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
        }

        location.href = `/event/${eventId}/dashboard`;
        return;
        
    })

        

})