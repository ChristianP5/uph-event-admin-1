
/*
NEW RESPONSE PAGE
    1) Get UserInfo from Token
    2) Determine if Role =
        - "admin/admin/admin"
        - "admin/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/admin"
        - "<this-department-id>/<this-event-id>/user"
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
    const formId = document.getElementById('form-id').textContent;

    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if( (department_id !== departmentId && department_id !== "admin") || ( event_id !== eventId && event_id !== "admin" ) || ( access_level !== "admin" && access_level !== "user" ) ){
        location.href = '/authorization';
        throw new Error('Unauthorized!');
    };

    // 3)
    /*
        ADD EVENT LISTENERS
        a) Submit Button Click Listener
        b) Change Number Input Values
    */

    // a)
    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const form = document.getElementById('main-form');
        
        const formData = new FormData(form);

        const targetEndpoint = `/api/event/${eventId}/department/${departmentId}/responses`;
        const result = await fetch(targetEndpoint, {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
            },
            body: formData,
        });

        const data = await result.json();

        if(!result.ok){
            alert(data.message);
            throw new Error(data.error);
        };

        location.href = `/event/${eventId}/department/${departmentId}/form/${formId}`;
        return;

    })

    // b)
    const ratingInputFields = document.querySelectorAll('.rating-input-field');
    ratingInputFields.forEach(ratingInputField => {
        ratingInputField.addEventListener('change', () => {
            if(ratingInputField.value > 5){
                ratingInputField.value = 5;
            }

            if(ratingInputField.value < 0){
                ratingInputField.value = 0;
            }
        })
    })


})