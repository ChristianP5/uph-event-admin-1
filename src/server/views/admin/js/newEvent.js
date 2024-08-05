localStorage.setItem('nav-option-active', "home");

/*
NEW EVENT PAGE
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
    console.log(userRole);

    if(userRole !== "admin/admin/admin"){
        location.href = '/authorization';
        throw new Error("Unauthorized!");
    }

    // Create New Event
    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', async (e) => {
        submitButton.disabled = true;
        e.preventDefault();

        const form = document.getElementById('main-form');

        const formData = new FormData(form);

        const targetEndpoint = "/api/events";
        const result = await fetch(targetEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
        })

        const data = await result.json();

        if(!result.ok){
            alert(data.message);
            throw new Error(data.error);
        }

        location.href = '/admin/dashboard';
        return;
    })
    
})