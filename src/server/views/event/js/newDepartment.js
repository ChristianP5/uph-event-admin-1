
/*
NEW DEPARTMENT PAGE
    1) Get UserInfo from Token
    2) Determine if Role = "admin/admin/admin" or "admin/<this-event-id>/admin"
        - [false] redirect to '/authorization'
    3) Load Page Contents
*/

document.addEventListener('DOMContentLoaded', async () => {
    // 1)
    const accessToken = localStorage.getItem('accessToken');
    const userInfo = await getAuthUserInfo();

    // 2)
    const eventId = document.getElementById('event-id').textContent;
    const userRole = userInfo.role;
    
    // Destructure Role
    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        location.href = '/authorization';
        throw new Error("Unauthorized!");
    }

    // Create new Department
    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();

        
        const form = document.getElementById('main-form');

        const formData = new FormData(form);

        const targetEndpoint = "/api/departments";
        const result = await fetch(targetEndpoint, {
            method: 'POST',
            headers: {
                'Authorization' :  `Bearer ${accessToken}`,
            },
            body: formData,
        });

        const data = await result.json();

        
        if(!result.ok){
            alert(data.message);
            throw new Error(data.error);
        }

        location.href = `/event/${eventId}/dashboard`;
        return;
            
    })
    
})