// const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/jobs`
// const indexJob = async () => {
//     try {
//         const res = await fetch(`${BASE_URL}`, {
//             method: 'GET',
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         })
//         const data = await res.json()
//         if (data.err) {
//             console.log(data.err)
//             throw new Error(data.err)
//         }
//         return data
//     } catch (err) {
//         throw new Error(err)
//     }
// }
// export {
//     indexJob,
// }



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


export {
    indexJob,
    
}