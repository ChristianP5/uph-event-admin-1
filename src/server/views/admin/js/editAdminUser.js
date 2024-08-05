/*
EDIT ADMIN USER PAGE
    1) Get UserInfo from Token
    2) Determine if either
        a) Role = "admin/admin/admin"
    3) Load Page Contents
*/

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');

    // 1)
    const userInfo = await getAuthUserInfo();
    const currentUserId = userInfo._id;

    // 2)
    const userRole = userInfo.role;

    const [department_id, event_id, access_level] = userRole.split('/');

        // a)
        if(department_id !== "admin" || event_id !== "admin" || access_level !== "admin"){
            location.href = '/authorization';
            throw new Error('Unauthorized');
        }

        // b)
        const targetUserId = document.getElementById('user-id').textContent;
        if(currentUserId !== targetUserId){
            location.href = '/authorization';
            throw new Error('Unauthorized');
        };

    // 3)
    /*
        ADD EVENT LISTENERS
        a) Submit Button Click Listener
    */

    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', async (e) => {
        submitButton.disabled = true;
        e.preventDefault();

        const form = document.getElementById('main-form');

        const formData = new FormData(form);

        const targetEndpoint = `/api/admin/user/${targetUserId}`;
        
        const result = await fetch(targetEndpoint, {
            method: 'PUT',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
            },
            body: formData,
        })

        const data = await result.json();

        if(!result.ok){
            alert(data.message);
            throw new Error(data.error);
        }

        
        if(targetUserId === currentUserId){
            console.log('Token Remake');
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
        }

        location.href = `/admin/dashboard`;
        return;
        
    })

        

})