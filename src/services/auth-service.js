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
            localStorage.setItem('user', JSON.stringify(data.data.user))
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
            localStorage.setItem('user', JSON.stringify(data.data.user))
            return data.data.user
        }

    } catch (err) 
    {
        throw new Error(err.message)
    }
}

const signOut = function () 
{
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

const getUser = function () 
{
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
}

const forgotPassword = async function (email) {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error?.message || data.message)
    return data.message
}

const resetPassword = async function (token, newPassword) {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error?.message || data.message)
    return data.message
}

const socialLogin = async function (socialData) {
    const res = await fetch(`${BASE_URL}/auth/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialData)
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error?.message || 'Social login failed')
    
    localStorage.setItem('token', data.data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.data.user))
    return data.data.user
}

const linkedinLogin = async function (code) {
    const res = await fetch(`${BASE_URL}/auth/linkedin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error?.message || 'LinkedIn login failed')
    
    localStorage.setItem('token', data.data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.data.user))
    return data.data.user
}

export {
    signUp,
    signIn,
    signOut,
    getUser,
    forgotPassword,
    resetPassword,
    socialLogin,
    linkedinLogin
}