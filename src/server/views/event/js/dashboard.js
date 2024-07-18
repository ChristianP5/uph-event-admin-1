/*
Event DASHBOARD PAGE
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

    // 3)
    /*
        a) Get Departments of Event
        b) Display Departments of Event
    */

    // a)
    const targetEndpoint = `/api/event/${eventId}/departments`;
    const result = await fetch(targetEndpoint, {
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${accessToken}`,
        },
    });

    const data = await result.json();

    if(!result.ok){
        alert(data.message);
        throw new Error(data.error);
    }

    const departments = data.data.departments;

    const departmentsList = document.getElementById('main-list');
    departments.forEach(department => {
        console.log('Working');
        const item = document.createElement('div');
        item.classList = "row mt-2";
        item.innerHTML = `
        <div class="col d-flex">
          <a
            href="/event/${eventId}/department/${department._id}/edit"
            class="btn btn-primary me-2"
            >Edit Department</a
          >
          <button class="btn btn-danger me-2 delete-department-btn">
            Delete Department
          </button>
          <a
            href="/event/${eventId}/department/${department._id}/dashboard"
            ><p>${department.name}</p></a
          >
        </div>
        `;

        departmentsList.appendChild(item);

        const deleteButton = item.querySelector('.delete-department-btn');
        deleteButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const targetEndpoint = `/api/events/${eventId}/departments/${department._id}`;
            const result = await fetch(targetEndpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization' : `Bearer ${accessToken}`,
                },
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

    
    
})