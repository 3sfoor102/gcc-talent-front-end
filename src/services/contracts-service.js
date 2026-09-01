const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/contracts` 

const getContracts = async (filters)=> {
    const res = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`},
    })
    if (!res.ok){
        const errorData = await res.json()
        throw new Error(errorData.error?.messeage || 'Failed to fetch wallet data')
    }
        return res.json()
  
}   



export {
    getContracts,
}