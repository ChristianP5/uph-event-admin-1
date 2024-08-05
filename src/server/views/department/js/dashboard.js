/*
Department DASHBOARD PAGE
    1) Get UserInfo from Token
    2) Determine if Role = "admin/admin/admin" or "admin/<this-event-id>/admin" or "<this-dep-id>/<this-event-id>/<admin/user>"
        - [false] redirect to '/authorization'
    3) Load Page Contents
*/

document.addEventListener('DOMContentLoaded', async () => {
    // 1)
    const accessToken = localStorage.getItem('accessToken');
    const userInfo = await getAuthUserInfo();

    // 2)
    const eventId = document.getElementById('event-id').textContent;
    const departmentId = document.getElementById('department-id').textContent;
    const userRole = userInfo.role;
    
    // Destructure Role
    const [department_id, event_id, access_level] = userRole.split('/');

    if((department_id !== "admin" && department_id !== departmentId) || (event_id !== "admin" && event_id !== eventId) || (access_level !== "admin" && access_level !== "user")){
        location.href = '/authorization';
        throw new Error("Unauthorized!");
    }

    // Display Action Buttons based on Access_Level Roles
    
    if(access_level === "admin"){

        const formActionButtonsSection = document.getElementById('form-action-buttons-sect');
        formActionButtonsSection.style.display = "block";

        // 'Add Form' Action Button
        const addFormButton = document.createElement('button');
        addFormButton.onclick = () => {
            location.href = `/event/${eventId}/department/${departmentId}/form/new`;
        } 
        addFormButton.id = "add-form-btn";
        addFormButton.classList = "bg-yellow-500 text-white px-2 py-1 rounded flex items-center space-x-1";
        addFormButton.innerHTML = `
        <i class="fas fa-plus"></i>
        <span class="text-sm"> Create Form</span>
        `;

        formActionButtonsSection.appendChild(addFormButton);

        
        // 'Add Department Members' Action Button
        const membersActionButtonsSection = document.getElementById('members-action-buttons-sect');
        const addMembersButton = document.createElement('button');
        addMembersButton.onclick = () => {
            location.href = `/event/${eventId}/department/${departmentId}/users/new`;
        } 
        addMembersButton.id = "add-member-btn";
        addMembersButton.classList = "bg-yellow-500 text-white px-2 py-1 rounded flex items-center space-x-1";
        addMembersButton.innerHTML = `
        <i class="fas fa-plus"></i>
        <span class="text-sm"> Add Department Member</span>
        `;

        membersActionButtonsSection.appendChild(addMembersButton);
        
    }
    


    // 3)
    /*
        a) Get All Department Users
    */
    const targetEndpoint = `/api/departments/${departmentId}/users`;
    const result = await fetch(targetEndpoint, {
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${accessToken}`,
        }
    });

    const data = await result.json();

    if(!result.ok){
        alert(data.message);
        throw new Error(data.error);
    }

    const users = data.data.users;

    const membersList = document.getElementById('members-list');
    users.forEach(user => {
        const item = document.createElement('tr');
        item.classList = "border-t border-[#AAC1D7] hover:bg-[#E5EDF4] hover:shadow-lg";
        
        // Old
        /*
        item.innerHTML = 
        `
        <div class="col d-flex">
            <a
              href="/event/${eventId}/department/${departmentId}/users/${user._id}"
              class="btn btn-primary ms-2"
              >Edit User</a
            >
            <button
              class="btn btn-danger ms-2 remove-department-user-btn"
              >Remove User
            </button>
            <p class="ms-2">${user.username}</p>
          </div>
        `;
        */

        item.innerHTML = `
        <td class="py-3 px-4">${user.username}</td>
        <td class="py-3 px-4">
            <button class="bg-blue-500 text-white px-2 py-1 rounded" onclick="toggleEditCredentials('Christian', this)">Edit User Credentials</button>
        </td>
        `;

        /*
        if(access_level === "user" && userInfo.username !== user.username){
            const editButton = item.querySelector('.btn.btn-primary.ms-2');
            editButton.classList.add('disabled');
        }

        const deleteButton = item.querySelector('.btn.btn-danger.ms-2.remove-department-user-btn');
        */

        // Do not Show Delete Buttons to Users
        /*
        if(access_level === "user"){
            deleteButton.classList.add('d-none');
        }

        deleteButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const targetEndpoint = `/api/event/${eventId}/department/${departmentId}/users/${user._id}`;
            const result = await fetch(targetEndpoint, {
                method : 'DELETE',
                headers: {
                    'Authorization' :  `Bearer ${accessToken}`,
                },
            });

            const data = await result.json();

            if(!result.ok){
                alert(data.message);
                throw new Error(data.error);
            };

            location.href = `/event/${eventId}/department/${departmentId}/dashboard`;
            return;
        })
        */

        membersList.append(item);
    });


    // Admin Credentials Section
    
    if(access_level === "admin"){
        
        const targetEndpoint = `/api/event/${eventId}/department/${departmentId}/admin`;
        const result = await fetch(targetEndpoint, {
            method: 'GET',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
            }
        });

        const data = await result.json();

        if(!result.ok){
            alert(data.message);
            throw new Error(data.error);
        }

        const adminUser = data.data.adminUser;

        const adminCredentialsSectSect = document.getElementById('admin-credentials-sect-sect');
        adminCredentialsSectSect.innerHTML = `
        <div class="mt-10 font-bold text-xl flex items-center">
                <i class="fas fa-user-friends mr-3"></i> Edit Department Admin Credentials
            </div>
            
            <div class="rounded-lg overflow-auto">
                <table class="min-w-full">
                    <thead>
                        <tr>
                            <th class="py-2 px-4 text-left">Username</th>
                            <th class="py-2 px-4 text-left">Password</th>
                            <th class="py-2 px-4 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody id="admin-credentials-sect">
                      
                    </tbody>
                </table>
            </div>
        `;
        
        const adminCredentialsSect = document.getElementById('admin-credentials-sect');
        
        // Old
        /*
        adminCredentialsSect.innerHTML = `
        <h2>Admin Credentials</h2>
        <a
            href="/event/${eventId}/department/${departmentId}/admin/edit"
            class="btn btn-primary"
            >Change Admin Credentials</a
        >
        <table class="table">
            <thead>
            <tr>
                <th>Username</th>
                <th>Password</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>${adminUser.username}</td>
                <td>${adminUser.password}</td>
            </tr>
            </tbody>
        </table>
        `;
        */

        adminCredentialsSect.innerHTML = `
        <tr class="border-t border-[#AAC1D7] hover:bg-[#E5EDF4] hover:shadow-lg">
            <td class="py-3 px-4">${adminUser.username}</td>
            <td class="py-3 px-4">${adminUser.password}</td>
            <td class="py-3 px-4">
                <button class="bg-blue-500 text-white px-2 py-1 rounded" onclick="toggleEditCredentials('Christian', this)">Edit User Credentials</button>
            </td>
        </tr>
        `;
    }
    

    // GET FORMS of Department
    const queryFormsTargetEndpoint = `/api/event/${eventId}/department/${departmentId}/forms`
    const queryFormsResult = await fetch(queryFormsTargetEndpoint, {
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${accessToken}`,
        },
    });

    const queryFormsData = await queryFormsResult.json();

    if(!queryFormsResult.ok){
        alert(queryFormsData.message);
        throw new Error(queryFormsData.error);
    };

    const forms = queryFormsData.data.forms

    const formsList = document.getElementById('forms-list');
    forms.forEach(form => {
        const item = document.createElement('tr');
        item.classList = 'border-t border-[#AAC1D7] hover:bg-[#E5EDF4] hover:shadow-lg';
        
        // Old
        /*
        item.innerHTML = `
        <div class="col d-flex">
            <button class="btn btn-danger delete-form-btn me-2">Delete Form</button>
            <a
              href="/event/${eventId}/department/${departmentId}/form/${form._id}";
            >
              <p>${form.name}</p>
            </a>
          </div>
        `;
        */

            item.innerHTML = `
            <td class="py-3 px-4">
                <div class="event-name-wrapper">
                    <a href="/event/${eventId}/department/${departmentId}/form/${form._id}/dashboard" class="text-blue-600 underline event-name">${form.name}</a>
                </div>
                <div id="form-action-buttons" class="event-buttons mt-2 flex space-x-2">
                    
                </div>
            </td>
            `;

            if(access_level === "admin"){
                item.querySelector('#form-action-buttons').innerHTML = `
                <button id="delete-form-btn" class="bg-red-500 text-white px-2 py-1 rounded flex items-center space-x-1">
                    <i class="fas fa-trash"></i>
                    <span class="text-sm">Delete Form</span>
                </button>
                `;
            }
      

        
        
        

        formsList.appendChild(item);

        // Delete Form Function (with Confirmation)

            // Confirmation Popup
 
            function confirmDeleteForm(formId) {
                document.getElementById('deletePopupOverlay').style.display = 'block';
                document.getElementById('deletePopup').style.display = 'block';
                document.getElementById('confirmDeleteButton').onclick = async () => {
                    
                    const deleteFormTargetEndpoint = `/api/event/${eventId}/department/${departmentId}/forms/${formId}`;
                    const deleteFormResult = await fetch(deleteFormTargetEndpoint, {
                        method: 'DELETE',
                        headers: {
                            'Authorization' : `Bearer ${accessToken}`,
                        },
                    });

                    const deleteFormData = await deleteFormResult.json();

                    if(!deleteFormResult.ok){
                        alert(deleteFormData.message);
                        throw new Error(deleteFormData.error);
                    };

                    location.href = `/event/${eventId}/department/${departmentId}/dashboard`;
                    return;
                    
                };
            }

            

            const deleteButton = item.querySelector('#delete-form-btn');
            deleteButton.addEventListener('click', async (e) => {
                e.preventDefault();

                confirmDeleteForm(form._id);
                
                
            })
        

    })

    
    
})