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

        console.log("Working!");

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
    const targetEndpoint = `/api/event/${eventId}/department/${departmentId}/forms`;
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

    const forms = data.data.forms;

    /* TODO: REPLACE WITH EJS
    const formsList = document.getElementById('forms-list');
    forms.forEach(form => {
        const item = document.createElement('div');
        item.classList = "row mt-2";
        item.innerHTML = 
        `
        <div class="col">
          <a href="">
            <h3>${form.name}</h3>
          </a>
        </div>
        `;

        formsList.append(item);
    })
        */
    
    
})