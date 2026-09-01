import axiosInstance from './axiosInstance';

const getMyProposals = async (page = 1, limit = 12) => {
    const res = await axiosInstance.get(`/proposals/mine?page=${page}&limit=${limit}`)
    return res.data
}
const createProposal = async (jobId, proposalData) => {
    const res = await axiosInstance.post(`/proposals/jobs/${jobId}`, proposalData)
    return res.data.data
}


export {
    getMyProposals,
    createProposal
}