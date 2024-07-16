const isValidRefreshToken = async () => {

    const refreshToken = localStorage.getItem('refreshToken');
    const targetEndpoint = '/auth/validateRT';

    const body = JSON.stringify({
        refreshToken: refreshToken,
    })

    const result = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    })


    return result.ok? true : false;
}