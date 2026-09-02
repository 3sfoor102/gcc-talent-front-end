const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/wallet`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

const fetchUserWallet = async () => {
    const res = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error?.message || data.err || 'Failed to fetch wallet data');
    }
    return data;
};

const depositFundsApi = async ({ amount, card }) => {
    const res = await fetch(`${BASE_URL}/deposit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: Number(amount), card })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error?.message || data.err || 'Card deposit failed');
    }
    return data;
};

const withdrawFundsApi = async ({ amount }) => {
    const res = await fetch(`${BASE_URL}/withdraw`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: Number(amount) })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error?.message || data.err || 'Withdrawal failed');
    }
    return data;
};

export {
    fetchUserWallet,
    depositFundsApi,
    withdrawFundsApi,
};