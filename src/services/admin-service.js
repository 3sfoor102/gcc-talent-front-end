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

const getAdminCategories = async () => {
    try {
        const response = await axiosInstance.get('/admin/categories');
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to fetch categories');
    }
};

const createCategory = async (categoryData) => {
    try {
        const response = await axiosInstance.post('/admin/categories', categoryData);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to create category');
    }
};

const updateCategory = async (categoryId, categoryData) => {
    try {
        const response = await axiosInstance.patch(`/admin/categories/${categoryId}`, categoryData);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to update category');
    }
};

const deleteCategory = async (categoryId) => {
    try {
        const response = await axiosInstance.delete(`/admin/categories/${categoryId}`);
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to delete category');
    }
};

const getAdminReports = async () => {
    try {
        const response = await axiosInstance.get('/admin/reports');
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to fetch reports');
    }
};

const updateReportStatus = async (reportId, status) => {
    try {
        const response = await axiosInstance.patch(`/admin/reports/${reportId}/status`, { status });
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.error?.message || 'Failed to update report status');
    }
};

export { 
    getAllUsers, 
    toggleUserStatus, 
    getAdminCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    getAdminReports,
    updateReportStatus,
};