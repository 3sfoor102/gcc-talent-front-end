const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/profile`

const getFreelancerProfile = async function () {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BASE_URL}/freelancer`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.status === 404) return null

        const data = await res.json()
        if (!data.success) throw new Error('Failed to fetch')
        return data.data.profile
    } catch (err) {
        return null
    }
}

const createFreelancerProfile = async function (profileData) {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BASE_URL}/freelancer`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        })

        const data = await res.json()

        if (!res.ok) {
            console.error("Backend Error Details:", data)
            return null
        }

        return data.data?.profile
    } catch (err) {
        console.error(err)
        return null
    }
}

const updateFreelancerProfile = async function (profileData) {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BASE_URL}/freelancer`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        })
        const data = await res.json()
        return data.data?.profile
    } catch (err) {
        console.error(err)
        return null
    }
}


const getClientProfile = async function () {
    return null
}

export {
    getFreelancerProfile,
    createFreelancerProfile,
    updateFreelancerProfile,
    getClientProfile
}