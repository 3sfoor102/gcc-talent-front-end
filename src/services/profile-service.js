import axiosInstance from './axiosInstance';

// Freelancer Profile
const getMyFreelancerProfile = async () => {
    const res = await axiosInstance.get('/profile/freelancer')
    return res.data?.data?.profile || res.data?.profile || res.data
}

const updateFreelancerProfile = async (profileData) => {
    const res = await axiosInstance.put('/profile/freelancer', profileData)
    return res.data?.data?.profile || res.data?.profile || res.data
}

// Client Profile
const getMyClientProfile = async () => {
    const res = await axiosInstance.get('/profile/client')
    return res.data?.data?.profile || res.data?.profile || res.data
}

const updateClientProfile = async (profileData) => {
    const res = await axiosInstance.put('/profile/client', profileData)
    return res.data?.data?.profile || res.data?.profile || res.data
}

export {
    getMyFreelancerProfile,
    updateFreelancerProfile,
    updateClientProfile,
    getMyClientProfile
}