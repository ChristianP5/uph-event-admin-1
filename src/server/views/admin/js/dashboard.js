/*
DASHBOARD PAGE
    1) Get UserInfo from Token
    2) Determine if Role = "admin/admin/admin"
        - [false] redirect to '/authorization'
    3) Load Page Contents
*/

document.addEventListener('DOMContentLoaded', async () => {
    // 1)
    const accessToken = localStorage.getItem('accessToken');
    const userInfo = await getAuthUserInfo();

    // 2)
    const userRole = userInfo.role;

    if(userRole !== "admin/admin/admin"){
        location.href = '/authorization';
        throw new Error("Unauthorized!");
    }

    // 3)
    /*
        a) Load Events
        b) Load Admin User Credentials
    */

    // a) Query
    const queryEventsTargetEndpoint = "/api/events";

    const queryEventsResult = await fetch(queryEventsTargetEndpoint, {
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${accessToken}`,
        },
    });

    const queryEventsData = await queryEventsResult.json();

    if(!queryEventsResult.ok){
        alert(queryEventsData.message);
        throw new Error(queryEventsData.error);
    };

    const events = queryEventsData.data.events;

    // a) Load
    const eventsList = document.getElementById('event-list');
    events.forEach(event => {
        const item = document.createElement('div');
        item.classList = "row mt-2";
        item.innerHTML = `
        <div class="col d-flex">
          <a href="/event/${event._id}/edit" class="btn btn-primary me-2"
            >Edit Event</a
          >
          <button id="delete-event-btn" class="btn btn-danger me-2">
            Delete Event
          </button>
          <a href="/event/${event._id}/dashboard">
            <p>${event.name}</p>
          </a>
        </div>
        `;
        eventsList.appendChild(item);

        const deleteButton = item.querySelector('#delete-event-btn');
        deleteButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const targetEndpoint = `/api/events/${event._id}`;
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

            location.href = '/admin/dashboard';
            return;

        })

    })

    // b)
    const targetEndpoint = "/api/admin/user";

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
    };

    const adminUsers = data.data.users;

    const adminCredentialsSect = document.getElementById('admin-credentials-sect');
    adminUsers.forEach(adminUser => {
        const item = document.createElement('tr');
        item.innerHTML = `
            <td>${adminUser.username}</td>
            <td>${adminUser.password}</td>
            <td><a href="/admin/user/${adminUser._id}/edit" class="btn btn-primary">Edit User Credentials</a></td>
        `;

        adminCredentialsSect.appendChild(item);
    })
    
})