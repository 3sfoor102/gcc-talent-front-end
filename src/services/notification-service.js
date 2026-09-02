import axiosInstance from './axiosInstance';

const getNotifications = async () => {
    try {
        const response = await axiosInstance.get('/notifications');
        return response.data.data.notifications || [];
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to fetch notifications');
    }
};

const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
        return response.data.data.notification;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to update notification');
    }
};

export { getNotifications, markNotificationAsRead };