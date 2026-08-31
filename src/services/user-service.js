const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`

const index = async (formData) => {
    try {
        const res = await fetch(`${BASE_URL}/users`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        const data = await res.json()
        

        if (data.err) {
            console.log(data.err)
            throw new Error(data.err)
        }

        return data
    } catch (err) {
        throw new Error(err)
    }
}

export {
    index,
}