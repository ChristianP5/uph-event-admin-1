/*
    EDIT EVENT Page
    1) Get User Info
    2) Validate User Role =
    - "admin/admin/admin"
    - "admin/<this-event-id>/admin"
    3) Edit the Event
*/

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');

    // 1)
    const userInfo = await getAuthUserInfo();

    // 2)
    const userRole = userInfo.role;
    const eventId = document.getElementById('event-id').textContent;

    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        location.href = '/authorization';
        throw new Error('Unauthorized');
    }

    // 3)
    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', async (e) => {
        submitButton.disabled = true;
        e.preventDefault();

        const form = document.getElementById('main-form');

        const formData = new FormData(form);

        const targetEndpoint = `/api/event/${eventId}`;
        const result = await fetch(targetEndpoint, {
            method: 'PUT',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
            },
            body: formData,
        });

        const data = await result.json();

        if(!result.ok){
            alert(data.message);
            throw new Error(data.error);
        };

        location.href = `/admin/dashboard`;
        return;
    })
    
})