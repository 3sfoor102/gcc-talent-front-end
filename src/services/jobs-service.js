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

export {
    indexJob,
    showJob,
    getClientJobs,
}