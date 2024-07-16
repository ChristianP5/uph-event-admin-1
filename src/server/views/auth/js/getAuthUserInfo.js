const getAuthUserInfo = async () => {
    const token = localStorage.getItem('accessToken');
    
    const getUserInfo_targetEndpoint = "/auth/user";
    const getUserInfo_result = await fetch(getUserInfo_targetEndpoint, {
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${token}`,
        }
    });

    const getUserInfo_data = await getUserInfo_result.json();

    if(!getUserInfo_result.ok){
        // Invalid Token
        alert(getUserInfo_data.message);
        localStorage.clear();
        location.href = '/login';
        throw new Error(getUserInfo_data.error);
    }

    const userInfo = getUserInfo_data.data.userInfo;

    return userInfo;
}