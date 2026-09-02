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

// Public Profile Lookups
const getPublicFreelancerProfile = async (userId) => {
    const res = await axiosInstance.get(`/profile/freelancer/${userId}`)
    return res.data?.data?.profile || res.data?.profile || res.data
}

const getPublicClientProfile = async (userId) => {
    const res = await axiosInstance.get(`/profile/client/${userId}`)
    return res.data?.data?.profile || res.data?.profile || res.data
}

const searchFreelancers = async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await axiosInstance.get(`/profile/freelancers?${query}`)
    return res.data
}

export {
    getMyFreelancerProfile,
    updateFreelancerProfile,
    updateClientProfile,
    getMyClientProfile,
    getPublicClientProfile,
    getPublicFreelancerProfile,
    searchFreelancers
}