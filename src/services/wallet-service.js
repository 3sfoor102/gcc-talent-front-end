const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/wallet` 


const fetchUserWallet = async ()=>{
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
const depositFundsApi = async ({amount, card})=> {
    const res = await fetch (`${BASE_URL}/deposit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`},
        body: JSON.stringify({amount: Number(amount), card})
    })
    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || '402 declined card')
    }
    return res.json()
}


export {
fetchUserWallet, depositFundsApi,
 
}

