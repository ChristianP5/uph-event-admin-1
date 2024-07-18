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

        const actionButtonsSection = document.getElementById('action-buttons-sect');
        actionButtonsSection.style.display = "block";

        // 'Add Form' Action Button
        const addFormButton = document.createElement('a');
        addFormButton.href = `/event/${eventId}/department/${departmentId}/form/new`;
        addFormButton.id = "add-form-btn";
        addFormButton.classList = "btn btn-success";
        addFormButton.textContent = "Add Form";

        actionButtonsSection.appendChild(addFormButton);

        // 'Add Department Members' Action Button
        const addMembersButton = document.createElement('a');
        addMembersButton.href = `/event/${eventId}/department/${departmentId}/users/new`;
        addMembersButton.id = "add-member-btn";
        addMembersButton.classList = "btn btn-secondary ms-2";
        addMembersButton.textContent = "Add Department Members";

        actionButtonsSection.appendChild(addMembersButton);
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
        const item = document.createElement('div');
        item.classList = "row mt-2";
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

        if(access_level === "user" && userInfo.username !== user.username){
            const editButton = item.querySelector('.btn.btn-primary.ms-2');
            editButton.classList.add('disabled');
        }

        const deleteButton = item.querySelector('.btn.btn-danger.ms-2.remove-department-user-btn');

        // Do not Show Delete Buttons to Users
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
        membersList.append(item);
    });


    // Do not Show Admin Credentials to Users
    if(access_level !== "user"){
        
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
        
        const adminCredentialsSect = document.getElementById('admin-credentials-sect');
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
        const item = document.createElement('div');
        item.classList = 'row mt-2';
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

        const deleteButton = item.querySelector('.delete-form-btn');

        if(access_level !== "admin"){
            item.querySelector('.col').removeChild(deleteButton);
        }

        formsList.appendChild(item);

        
        deleteButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const deleteFormTargetEndpoint = `/api/event/${eventId}/department/${departmentId}/forms/${form._id}`;
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
        })


    })

    
    
})