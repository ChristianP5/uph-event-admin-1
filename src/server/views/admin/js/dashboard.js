localStorage.setItem('nav-option-active', "home");

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
    eventsList.innerHTML = '';
    events.forEach(event => {
        const item = document.createElement('tr');
        item.classList = "border-t border-[#AAC1D7] hover:bg-[#E5EDF4] hover:shadow-lg";
        
        // Old
        /*
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
        */
        item.innerHTML = `
        <td class="py-3 px-4">
            <div class="event-name-wrapper">
                <a href="/event/${event._id}/dashboard" class="text-blue-600 underline event-name">${event.name}</a>
            </div>
            <div  class="event-buttons mt-2 flex space-x-2">
                <button id="edit-event-btn" class="bg-blue-500 text-white px-2 py-1 rounded flex items-center space-x-1">
                    <i class="fas fa-edit"></i>
                    <span class="text-sm">Edit Event</span>
                </button>   
                <button id="delete-event-btn" class="bg-red-500 text-white px-2 py-1 rounded flex items-center space-x-1">
                    <i class="fas fa-trash"></i>
                    <span class="text-sm">Delete Event</span>
                </button>
            </div>
        </td>
        `;
        eventsList.appendChild(item);

        // Edit Event Functionality
        const editButton = item.querySelector('#edit-event-btn');
        editButton.addEventListener('click', async (e) => {
            e.preventDefault();
            editButton.disabled = true;

            location.href = `/event/${event._id}/edit`
            return;
        })

        // Delete Event Functionality (with Confirmation)
            function confirmDeleteEvent(eventId) {
                
                document.getElementById('deletePopupOverlay').style.display = 'block';
                document.getElementById('deletePopup').style.display = 'block';
                document.getElementById('confirmDeleteButton').onclick = async () => {
                    
                    const targetEndpoint = `/api/events/${eventId}`;
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
                    };

            }
            
            const deleteButton = item.querySelector('#delete-event-btn');
            deleteButton.addEventListener('click', async (e) => {
                e.preventDefault();

                confirmDeleteEvent(event._id);
                
                
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
    adminCredentialsSect.innerHTML = '';
    adminUsers.forEach(adminUser => {
        const item = document.createElement('tr');
        item.classList = "border-t border-[#AAC1D7] hover:bg-[#E5EDF4] hover:shadow-lg"
        
        // Old
        /*
        item.innerHTML = `
            <td>${adminUser.username}</td>
            <td>${adminUser.password}</td>
            <td><a href="/admin/user/${adminUser._id}/edit" class="btn btn-primary">Edit User Credentials</a></td>
        `;
        */

        item.innerHTML = `
        <td class="py-3 px-4">${adminUser.username}</td>
        <td class="py-3 px-4">${adminUser.password}</td>
        <td class="py-3 px-4">
            <button id="edit-admin-creds-btn" class="bg-blue-500 text-white px-2 py-1 rounded">Edit User Credentials</button>
        </td>
        `;

        adminCredentialsSect.appendChild(item);

        // Edit Admin Credentials Functionality
        function toggleEditCredentials(user, button) {
            const container = document.getElementById('editCredentialsContainer');
            const row = button.closest('tr');
            if (container.parentNode !== row) {
                container.remove();
                row.insertAdjacentElement('afterend', container);
            }
            container.classList.toggle('hidden');
            document.getElementById('newUsername').value = user.username;

            const submitButton = container.querySelector('#submit-btn');
            submitButton.addEventListener('click', async (e) => {
                e.preventDefault();

                const form = container.querySelector('#edit-admin-creds-form');
                const formData = new FormData(form);

                // Edit Admin Credentials Logic
                const targetEndpoint = `/api/admin/user/${user._id}`;
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
                }


                // IF EDITTED using ADMIN, Refresh the Token
                if(userInfo._id === user._id){
                    console.log('Token Remake');
                    localStorage.setItem('accessToken', data.data.accessToken);
                    localStorage.setItem('refreshToken', data.data.refreshToken);   
                }

                location.href = '/admin/dashboard';
                return;

            })
        }

        const editAdminCredentialsButton = item.querySelector('#edit-admin-creds-btn');
        editAdminCredentialsButton.addEventListener('click', async (e) => {
            e.preventDefault();
            toggleEditCredentials(adminUser, e.target)
        })

    })

    // Actions

    
    
})

