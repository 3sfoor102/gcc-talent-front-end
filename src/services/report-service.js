import axiosInstance from './axiosInstance';

const submitReport = async (targetType, targetId, reason) => {
    try {
        const response = await axiosInstance.post('/reports', {
            targetType,
            targetId,
            reason
        });
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to submit report');
    }
};

export { submitReport };