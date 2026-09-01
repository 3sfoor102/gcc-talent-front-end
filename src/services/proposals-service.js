import axiosInstance from './axiosInstance';

const getMyProposals = async (page = 1, limit = 12) => {
    const res = await axiosInstance.get(`/proposals/mine?page=${page}&limit=${limit}`)
    return res.data
}


export {
    getMyProposals
}