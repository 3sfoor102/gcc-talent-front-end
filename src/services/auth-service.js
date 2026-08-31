const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`

const signUp = async (formData) => {
    try {
        const res = await fetch(`${BASE_URL}/auth/sign-up`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        const data = await res.json()

        if (data.err) {
            console.log(data.err)
            throw new Error(data.err)
        }

        if (data.token) {
            localStorage.setItem('token', data.token)
            return JSON.parse(atob(data.token.split('.')[1])).payload
        }

    } catch (err) {
        throw new Error(err)
    }

}

const signIn = async (formData) => {
    try {
        const res = await fetch(`${BASE_URL}/auth/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        const data = await res.json()

        if (data.err) {
            console.log(data.err)
            throw new Error(data.err)
        }

        if (data.token) {
            localStorage.setItem('token', data.token)
            return JSON.parse(atob(data.token.split('.')[1])).payload
        }

    } catch (err) {
        throw new Error(err)
    }

}

export {
    signUp,
    signIn,
}