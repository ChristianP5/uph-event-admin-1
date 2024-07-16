/*
    DYNAMIC BREADCRUMBS
    1) Get User Role
    2) Display Breadcrumbs based on User Role
*/
document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    // 1)
    const userInfo = await getAuthUserInfo();
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    let eventId, departmentId, formId;
    let nullableEventId, nullableDepartmentId, nullableFormId;
    try{
        nullableEventId = document.getElementById('event-id').textContent;
        nullableDepartmentId = document.getElementById('department-id').textContent;
        nullableFormId = document.getElementById('form-id').textContent;
    }catch(error){
        
    }

    eventId = nullableEventId === null ? null : nullableEventId;
    departmentId = nullableDepartmentId === null ? null : nullableDepartmentId;
    formId = nullableFormId === null ? null : nullableFormId;

    // 2)
    // Admin
    const breadcrumb = document.getElementById('breadcrumb');
    if(department_id === "admin" && event_id === "admin" && access_level === "admin"){
        const breadcrumbItem = document.createElement('li');
        breadcrumbItem.classList = "breadcrumb-item";
        breadcrumbItem.innerHTML = 
        `
        <a href="/admin/dashboard">Admin</a>
        `;

        breadcrumb.appendChild(breadcrumbItem);
    }

    // Event Name
    if((department_id === "admin" && (event_id === "admin" || event_id === eventId) && access_level === "admin") && eventId){
        
        // Get Event Name
        const targetEndpoint = `/api/events/${eventId}`;
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

        const eventName = data.data.event.name;

        // Display Event Name on Breadcrumbs
        const breadcrumbItem = document.createElement('li');
        breadcrumbItem.classList = "breadcrumb-item";
        breadcrumbItem.innerHTML = 
        `
        <a href="/event/${eventId}/dashboard">${eventName}</a>
        `;

        breadcrumb.appendChild(breadcrumbItem);
    }

    // Department Name
    if(((department_id === "admin" || department_id === departmentId) && (event_id === "admin" || event_id === eventId) && (access_level === "admin" || access_level === "user")) && departmentId ){

        // Get Department Name
        const targetEndpoint = `/api/events/${eventId}/departments/${departmentId}`;
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

        const departmentName = data.data.department.name;


        // Display Department Name on Breadcrumbs

        const breadcrumbItem = document.createElement('li');
        breadcrumbItem.classList = "breadcrumb-item";
        breadcrumbItem.innerHTML = 
        `
        <a href="/event/${eventId}/department/${departmentId}/dashboard">${departmentName}</a>
        `;

        breadcrumb.appendChild(breadcrumbItem);
    }

    // Form Name
    if(((department_id === "admin" || department_id === departmentId) && (event_id === "admin" || event_id === eventId) && (access_level === "admin" || access_level === "user") ) && formId ){
        
        // Get Form Name
        const targetEndpoint = `/api/event/${eventId}/department/${departmentId}/forms/${formId}`;
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

        const formName = data.data.form.name;

        // Display Form Name on Breadcrumbs
        const breadcrumbItem = document.createElement('li');
        breadcrumbItem.classList = "breadcrumb-item";
        breadcrumbItem.innerHTML = 
        `
        <a href="/event/${eventId}/department/${departmentId}/form/${formId}/dashboard">${formName}</a>
        `;

        breadcrumb.appendChild(breadcrumbItem);
    }
    

})