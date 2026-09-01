import axiosInstance from './axiosInstance';

const getMyProposals = async (page = 1, limit = 12) => {
    const res = await axiosInstance.get(`/proposals/mine?page=${page}&limit=${limit}`)
    return res.data
}
const createProposal = async (jobId, proposalData) => {
    const res = await axiosInstance.post(`/jobs/${jobId}/proposals`, proposalData)
    return res.data.data
}

const updateProposal = async (proposalId, proposalData) => {
    const res = await axiosInstance.patch(`/proposals/${proposalId}`, proposalData)
    return res.data.data
}

const withdrawProposal = async (proposalId) => {
  const res = await axiosInstance.post(`/proposals/${proposalId}/withdraw`)
  return res.data.data
}

const getJobProposals = async (jobId, page = 1, limit = 12) => {
  const res = await axiosInstance.get(`/jobs/${jobId}/proposals?page=${page}&limit=${limit}`)
  return res.data
}
export {
    getMyProposals,
    createProposal,
    updateProposal,
    withdrawProposal,
    getJobProposals
}