const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`

const signUp = async function (formData) 
{
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        const data = await res.json()

        if (!data.success) 
        {
            console.log(data.error.message)
            throw new Error(data.error.message)
        }

        if (data.data.accessToken) 
        {
            localStorage.setItem('token', data.data.accessToken)
            return data.data.user
        }

    } catch (err) 
    {
        throw new Error(err.message)
    }
}

const signIn = async function (formData)  
{
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })

        const data = await res.json()

        if (!data.success) 
        {
            console.log(data.error.message)
            throw new Error(data.error.message)
        }

        if (data.data.accessToken) 
        {
            localStorage.setItem('token', data.data.accessToken)
            return data.data.user
        }

    } catch (err) 
    {
        throw new Error(err.message)
    }
}

export {
    signUp,
    signIn,
}