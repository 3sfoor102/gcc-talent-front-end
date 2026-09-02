import axiosInstance from './axiosInstance';

const startConversation = async (recipientId, context = {}) => {
    const res = await axiosInstance.post('/conversations', { recipientId, context })
    return res.data?.data || res.data
}

const getConversations = async () => {
    const res = await axiosInstance.get('/conversations')
    return res.data?.data || res.data
}

const getMessages = async (conversationId, page = 1) => {
    const res = await axiosInstance.get(`/conversations/${conversationId}/messages?page=${page}`)
    return res.data?.data || res.data
}

const sendMessage = async (conversationId, messageData) => {
    const res = await axiosInstance.post(`/conversations/${conversationId}/messages`, messageData)
    return res.data?.data || res.data
}

const markAsRead = async (conversationId) => {
    const res = await axiosInstance.post(`/conversations/${conversationId}/read`)
    return res.data?.data || res.data
}

export {
    startConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead
}