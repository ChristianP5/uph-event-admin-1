document.addEventListener('DOMContentLoaded', async () => {

    const accessToken = localStorage.getItem('accessToken');

    // Check Validity of RefreshToken
    if(!await isValidRefreshToken()){
        window.location.href = '/login';
        throw new Error('Invalid Refresh Token!');
     }

    // Get the Role of the Authenticated User
    const userInfo = await getAuthUserInfo();
    
    const role = userInfo.role;

    // Destructure Role
    const [department_id, event_id, access_level] = role.split('/');
    console.log(department_id);
    console.log(event_id);
    console.log(access_level);

    /*
        Authorization Process
        1) Is Admin?
            - [true] Go to Admin Dashboard Page 

        2) Is Event Admin?
            - [true] Go to Event (by ID) Dashboard Page 

        3) Is Department Admin?
            - [true] Go to Department (by ID) Dashboard Page 

        4) Is Department User?
            - [true] Go to Department (by ID) Dashboard Page
            - [false] Go to '/login'
    */

    // 1)
    if(department_id === "admin" && event_id === "admin" && access_level === "admin"){
        location.href = '/admin/dashboard';
        return;
    }
    
    // 2)
    if(department_id === "admin" && event_id !== "admin" && access_level === "admin"){
        const eventId = event_id;
        location.href = `/event/${eventId}/dashboard`;
        return;
    }

    // 3)
    if(department_id !== "admin" && event_id !== "admin" && (access_level === "admin" || access_level === "user")){
        const eventId = event_id;
        const departmentId = department_id;
        location.href = `/event/${eventId}/department/${departmentId}/dashboard`;
        return;
    }

    location.href = '/';

    
})