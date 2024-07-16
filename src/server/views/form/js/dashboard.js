/*
FORM DASHBOARD PAGE
    1) Get UserInfo from Token
    2) Determine if Role = "admin/admin/admin" or "admin/<this-event-id>/admin" or "<this-dep-id>/<this-event-id>/<admin/user>"
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

    if((department_id !== departmentId && department_id !== "admin") || ( event_id !== eventId && event_id !== "admin" ) || (access_level !== "admin" && access_level !== "user") ){
        location.href = '/authorization';
        throw new Error('Unauthorized!');
    }

    // 3)
    /*
        ADD EVENT LISTENERS
        a) Export Button Click Listener
    */

        const exportResponseButton = document.getElementById('export-response-btn');
        exportResponseButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const targetEndpoint = `/api/event/${eventId}/department/${departmentId}/forms/${formId}/export`;
            const result = await fetch(targetEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization' : `Bearer ${accessToken}`,
                },
            });


            if(!result.ok){
                const data = await result.json();
                alert(data.message);
                throw new Error(data.error);
            }

            const blob  = await result.blob();
            
            // Temporary Anchor to download the Blob File
            const tempAnchor = document.createElement('a');
            tempAnchor.style.display = 'none';

            const url = window.URL.createObjectURL(blob);
            tempAnchor.href = url;

            tempAnchor.download = `${formId}-responses.xlsx`;

            document.body.appendChild(tempAnchor);
            tempAnchor.click();

            document.body.removeChild(tempAnchor);
            window.URL.revokeObjectURL(url);

        })
    
})