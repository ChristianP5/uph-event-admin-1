/*
NEW USER PAGE
    1) Get UserInfo from Token
    2) Determine if Role = "admin/admin/admin" or "admin/<this-event-id>/admin" or "<this-department-id>/<this-event-id>/admin"
        - [false] redirect to '/authorization'
    3) Load Page Contents
*/

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');

    // 1)
    const userInfo = await getAuthUserInfo();

    // 2)
    const eventId = document.getElementById('event-id').textContent;
    const departmentId = document.getElementById('department-id').textContent;
    const userRole = userInfo.role;

    // Destructure Role
    const [department_id, event_id, access_level] = userRole.split('/');

    if((department_id !== "admin" && department_id !== departmentId ) || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        location.href = '/authorization';
        throw new Error("Unauthorized!");
    }

    // 3)
    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', async (e) => {
        submitButton.disabled = true;
        e.preventDefault();

        const form = document.getElementById('main-form');

        const formData = new FormData(form);

        const targetEndpoint = `/api/event/${eventId}/department/${departmentId}/users`;
        const result = await fetch(targetEndpoint, {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
            },
            body: formData,
        })

        const data = await result.json();

        if(!result.ok){
            if(data.message.split(" ")[0] === "E11000"){
                alert("Username already taken. Try another one");
            }else{
                alert(data.message);
            }
            throw new Error(data.error);
        }

        location.href = `/event/${eventId}/department/${departmentId}/dashboard`;
        return;
    })
})