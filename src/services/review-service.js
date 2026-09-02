import axiosInstance from "./axiosInstance"

const submitContractReview = async (contractId, reviewData) => {
    const res = await axiosInstance.post(`/contracts/${contractId}/reviews`, reviewData)
    return res.data
}

const getUserReviews = async (userId, page = 1, limit = 10) => {
    const res = await axiosInstance.get(`/contracts/${userId}/reviews?page=${page}&limit=${limit}`)
    return res.data
}

export {
    submitContractReview,
    getUserReviews
}