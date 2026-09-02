import axiosInstance from './axiosInstance';

const getAllUsers = async () => {
    try {
        const response = await axiosInstance.get('/admin/users');
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to fetch users');
    }
};

const toggleUserStatus = async (userId) => {
    try {
        const response = await axiosInstance.patch(`/admin/users/${userId}/status`);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to update user status');
    }
};

export { getAllUsers, toggleUserStatus };