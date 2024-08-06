localStorage.setItem('nav-option-active', "home");

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
        c) Get Event Admin
        d) Display Admin of Event
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

    // b)
    const departmentsList = document.getElementById('main-list');
    departmentsList.innerHTML = "";
    departments.forEach(department => {
        const item = document.createElement('tr');
        item.classList = "border-t border-[#AAC1D7] hover:bg-[#E5EDF4] hover:shadow-lg";

        // Old
        /*
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
        */

        item.innerHTML = `
        <td class="py-3 px-4">
            <div class="event-name-wrapper">
                     <a href="/event/${eventId}/department/${department._id}/dashboard" class="text-blue-600 underline event-name">${department.name}</a>
            </div>
            <div class="event-buttons mt-2 flex space-x-2">
                <button id="edit-department-btn" class="bg-blue-500 text-white px-2 py-1 rounded flex items-center space-x-1" onclick="location.href='ea-department-forms.html'">
                    <i class="fas fa-edit"></i>
                    <span class="text-sm">Edit Department</span>
                </button>   
                <button id="delete-department-btn" class="bg-red-500 text-white px-2 py-1 rounded flex items-center space-x-1"">
                    <i class="fas fa-trash"></i>
                    <span class="text-sm">Delete Department</span>
                </button>
            </div>
        </td>
        `;

        departmentsList.appendChild(item);

        // Edit Functionality
        const editButton = item.querySelector('#edit-department-btn');
        editButton.addEventListener('click', async (e) => {
            e.preventDefault();
            editButton.disabled = true;

            location.href = `/event/${eventId}/department/${department._id}/edit`;
            return;

        })

        // Delete Functionaility (with Confirmation)
            function confirmDeleteDepartment(departmentId) {
                document.getElementById('deletePopupOverlay').style.display = 'block';
                document.getElementById('deletePopup').style.display = 'block';
                document.getElementById('confirmDeleteButton').onclick = async () => {
                    
                    const targetEndpoint = `/api/events/${eventId}/departments/${departmentId}`;
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
                };
            }
            
            const deleteButton = item.querySelector('#delete-department-btn');
            deleteButton.addEventListener('click', async (e) => {
                e.preventDefault();

                confirmDeleteDepartment(department._id);

            })
        
    })

    // c)
    const getAdminCredentials_targetEndpoint = `/event/${eventId}/admin/users`;
    const getAdminCredentials_result = await fetch(getAdminCredentials_targetEndpoint, {
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${accessToken}`,
        }
    });

    const getAdminCredentials_data = await getAdminCredentials_result.json();

    if(!getAdminCredentials_result.ok){
        alert(getAdminCredentials_data.message);
        throw new Error(getAdminCredentials_data.error);
    }

    const adminUser = getAdminCredentials_data.data.users;


    // d)
    const adminCredsList = document.getElementById('admin-credentials-list');
    adminCredsList.innerHTML = "";

    const item = document.createElement('tr');
    item.classList = "border-t border-[#AAC1D7] hover:bg-[#E5EDF4] hover:shadow-lg";
    
    // Old
    /*
    item.innerHTML = `
        <td>${adminUser.username}</td>
        <td>${adminUser.password}</td>
    `;
    */

    item.innerHTML = `
    <td class="py-3 px-4">${adminUser.username}</td>
    <td class="py-3 px-4">${adminUser.password}</td>
    <td class="py-3 px-4">
        <button id="edit-event-admin-creds-btn" class="bg-blue-500 text-white px-2 py-1 rounded">Edit User Credentials</button>
    </td>
    `;

    adminCredsList.appendChild(item);

    // Edit Event Admin Credentials Functionality

    function toggleEditCredentials(user, button) {
        const container = document.getElementById('editCredentialsContainer');
        const row = button.closest('tr');
        if (container.parentNode !== row) {
            container.remove();
            row.insertAdjacentElement('afterend', container);
        }
        container.classList.toggle('hidden');
        document.getElementById('newUsername').value = user.username;
        container.querySelector('#userId-input').value = user._id;

        const submitButton = container.querySelector('#submit-btn');
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();

            // Edit Event Admin Logic
            const form = container.querySelector('#edit-event-admin-creds-form');
            const formData = new FormData(form);

            const targetEndpoint = `/api/event/${eventId}/admin`
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

            

            if(userInfo._id === user._id){
                console.log('Token Remake');
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
            };

            location.href = `/event/${eventId}/dashboard`;
            return;

        })
    }

    const editEventAdminCredsButton = item.querySelector('#edit-event-admin-creds-btn');
    editEventAdminCredsButton.addEventListener('click', async (e) => {
        e.preventDefault();
        toggleEditCredentials(adminUser, e.target);
    })

    
    
})