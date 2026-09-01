import axiosInstance from "./axiosInstance";

const indexJob = async (filters = {}) => {
    const params = { ...filters };
    if (Array.isArray(params.skills)) {
        params.skills = params.skills.join(',');
    }
    const response = await axiosInstance.get('/jobs', { params });

    return {
        data: response.data.data,
        meta: response.data.meta
    };
};

const showJob = async (jobId) => {
    const response = await axiosInstance.get(`/jobs/${jobId}`);
    return response.data.data;
};

const getClientJobs = async (filters = {}) => {
    const response = await axiosInstance.get('/jobs/mine', {
        params: filters
    })

    return {
        data: response.data.data,
        meta: response.data.meta
    };
};

const createJob = async (jobData) => {
    const response = await axiosInstance.post('/jobs', jobData);
    return response.data.data;
};

const updateJob = async (jobId, jobData) => {
    const response = await axiosInstance.patch(`/jobs/${jobId}`, jobData);
    return response.data.data;
};

const deleteJob = async (jobId) => {
    const response = await axiosInstance.delete(`/jobs/${jobId}`);
    return response.data.data;
};

const closeJob = async (jobId) => {
    const response = await axiosInstance.post(`/jobs/${jobId}/close`, { status: 'closed' });
    return response.data.data;
};

const reopenJob = async (jobId) => {
    const response = await axiosInstance.post(`/jobs/${jobId}/reopen`, { status: 'open' });
    return response.data.data;
};

const getCategories = async () => {
    const response = await axiosInstance.get('/jobs/categories');
    return response.data.data;
};

const getSkills = async (categoryId = '') => {
    const url = categoryId ? `/jobs/skills?category=${categoryId}` : '/jobs/skills';
    const response = await axiosInstance.get(url);
    return response.data.data;
};

export {
    indexJob,
    showJob,
    getClientJobs,
    createJob,
    updateJob,
    deleteJob,
    closeJob,
    reopenJob,
    getCategories,
    getSkills,
}