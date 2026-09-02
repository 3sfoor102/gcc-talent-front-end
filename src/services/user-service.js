const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/api/v1/profile`

const getFreelancerProfile = async function () {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BASE_URL}/freelancer`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error?.message || 'Failed to fetch freelancer')
        return data.data.profile
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
        if (!data.success) throw new Error(data.error?.message || 'Failed to update freelancer')
        return data.data.profile
    } catch (err) {
        console.error(err)
        return null
    }
}

const getClientProfile = async function () {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BASE_URL}/client`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error?.message || 'Failed to fetch client')
        return data.data.profile
    } catch (err) {
        console.error(err)
        return null
    }
}

export {
    getFreelancerProfile,
    updateFreelancerProfile,
    getClientProfile
}