/*

LOGIN PAGE

1) Check if already Logged In
    - [true] Check if Valid refreshToken
        - [true] Redirect to '/'
        - [false] Clear Local Storage and Redirect to '/login' (refresh)

2) Attempt Log In
    - [true] Redirect to '/'
    - [false] Redirect to '/login' (refresh)

*/

document.addEventListener('DOMContentLoaded', async () => {
    
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // 1) a
    if( accessToken || refreshToken ){
        
        // 1) b
        if( !await isValidRefreshToken() ){
            localStorage.clear();
            window.location.href = '/login';
        }else{
            window.location.href = '/authorization';
        }
        

    }

    // 2)
    /*
        - Get Forms Data On Submit Button Clicked
        - Send Forms Data to API Endoint
    */

    // Get Forms Data On Submit Button Clicked

    const form = document.getElementById('main-form');
    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();

        // reCaptcha
        if(grecaptcha.getResponse() === ""){
            alert("Please fill in the captcha!");
            throw new Error('reCaptcha not entered!');
        }

        
        const formData = new FormData(form);

        // Send Forms Data to API Endoint
        const targetEndpoint = "/auth/login"
        const result = await fetch(targetEndpoint, {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
            },
            body: formData,
        })

        const data = await result.json();

        if(!result.ok){
            alert(data.message);
            localStorage.clear();
            location.href = '/login';
            throw new Error(data.error);
        }

        

        const newRefreshToken = data.data.refreshToken;
        const newAccessToken = data.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        window.location.href = '/authorization';
        

    })

    

})