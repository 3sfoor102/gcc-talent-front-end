import { useState, useEffect } from "react";
import { getAllUsers } from "../services/admin-service";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div className="min-h-screen bg-brand-cream py-20 flex justify-center text-teal-600 font-bold animate-pulse">Loading Users...</div>;

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-ink m-0">Manage Users</h1>
                    <p className="text-teal-600 mt-2">View and manage all platform members.</p>
                </header>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-cream border-b border-cream-200">
                                    <th className="p-4 font-bold text-teal-900">Name</th>
                                    <th className="p-4 font-bold text-teal-900">Email</th>
                                    <th className="p-4 font-bold text-teal-900">Role</th>
                                    <th className="p-4 font-bold text-teal-900">Status</th>
                                    <th className="p-4 font-bold text-teal-900">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} className="border-b border-cream-200/50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-ink flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-cream-200 text-brand-teal flex items-center justify-center font-bold overflow-hidden shrink-0">
                                                {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${user.status === 'active' ? 'bg-[#EEF7F5] text-brand-success' : 'bg-red-100 text-red-600'}`}>
                                                {user.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;