import axiosInstance from './axiosInstance';

const getDashboardStats = async () => {
    try {
        const response = await axiosInstance.get('/dashboard/stats');
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to fetch dashboard stats');
    }
};

export {
    getDashboardStats
}