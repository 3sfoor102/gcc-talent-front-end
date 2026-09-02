import axiosInstance from './axiosInstance';

const startConversation = async (recipientId, context = {}) => {
    const res = await axiosInstance.post('/conversations', { recipientId, context })
    return res.data?.data || res.data
}

const getConversations = async () => {
  const res = await axiosInstance.get('/conversations')
  return res.data?.data || res.data
}

export {
    startConversation,
    getConversations,
}