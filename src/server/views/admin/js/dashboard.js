/*
DASHBOARD PAGE
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

    if(userRole !== "admin/admin/admin"){
        location.href = '/authorization';
        throw new Error("Unauthorized!");
    }
    
})