import { useState, useEffect } from "react";
import { getAllUsers, toggleUserStatus } from "../services/admin-service";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userToToggle, setUserToToggle] = useState(null);
    const [isToggling, setIsToggling] = useState(false);
    const [modalError, setModalError] = useState(null);

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

    const openToggleModal = (user) => {
        setUserToToggle(user);
        setModalError(null);
    };

    const confirmToggleStatus = async () => {
        if (!userToToggle) return;
        
        setIsToggling(true);
        setModalError(null);

        try {
            const updatedUser = await toggleUserStatus(userToToggle._id);
            setUsers(users.map(u => u._id === userToToggle._id ? { ...u, status: updatedUser.status } : u));
            setUserToToggle(null);
        } catch (err) {
            setModalError(err.message || "Failed to update user status");
        } finally {
            setIsToggling(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-brand-cream py-20 flex justify-center text-teal-600 font-bold animate-pulse">Loading Users...</div>;

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6 relative">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-ink m-0">Manage Users</h1>
                    <p className="text-teal-600 mt-2">View and manage all platform members.</p>
                </header>

                {error && <div className="mb-6 p-4 bg-[#FDECEB] text-brand-danger border border-brand-danger/20 rounded-lg">{error}</div>}

                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-cream border-b border-cream-200">
                                    <th className="p-4 font-bold text-teal-900">Name</th>
                                    <th className="p-4 font-bold text-teal-900">Email</th>
                                    <th className="p-4 font-bold text-teal-900">Role</th>
                                    <th className="p-4 font-bold text-teal-900">Status</th>
                                    <th className="p-4 font-bold text-teal-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} className={`border-b border-cream-200/50 hover:bg-gray-50 transition-colors ${user.status === 'suspended' ? 'bg-red-50/50' : ''}`}>
                                        <td className="p-4 font-medium text-ink flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0 ${user.status === 'suspended' ? 'bg-red-200 text-red-700' : 'bg-cream-200 text-brand-teal'}`}>
                                                {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover grayscale" /> : user.name.charAt(0).toUpperCase()}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.status === 'active' ? 'bg-[#EEF7F5] text-brand-success' : 'bg-[#FDECEB] text-brand-danger'}`}>
                                                {user.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.role !== 'admin' && (
                                                <button 
                                                    onClick={() => openToggleModal(user)}
                                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border-0 ${
                                                        user.status === 'active' 
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                                >
                                                    {user.status === 'active' ? 'Ban User' : 'Unban'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {userToToggle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fadeIn">
                        
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                            userToToggle.status === 'active' ? 'bg-red-50 text-brand-danger' : 'bg-[#EEF7F5] text-brand-success'
                        }`}>
                            <span className="material-symbols-outlined text-[24px]">
                                {userToToggle.status === 'active' ? 'block' : 'check_circle'}
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-ink mb-2 m-0">
                            {userToToggle.status === 'active' ? 'Suspend User?' : 'Activate User?'}
                        </h3>
                        
                        <p className="text-gray-500 mb-4 text-sm m-0 leading-relaxed">
                            {userToToggle.status === 'active' 
                                ? `Are you sure you want to ban ${userToToggle.name}? They will lose access to the platform.` 
                                : `Are you sure you want to unban ${userToToggle.name}? They will regain access.`}
                        </p>

                        {modalError && (
                            <div className="mb-4 p-3 bg-[#FDECEB] text-brand-danger rounded-lg text-xs font-medium border border-brand-danger/20">
                                {modalError}
                            </div>
                        )}

                        <div className="flex gap-3 justify-end mt-6">
                            <button 
                                onClick={() => setUserToToggle(null)} 
                                disabled={isToggling}
                                className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmToggleStatus} 
                                disabled={isToggling}
                                className={`px-5 py-2.5 rounded-lg text-white font-bold transition-colors border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[100px] ${
                                    userToToggle.status === 'active' ? 'bg-brand-danger hover:bg-red-700' : 'bg-brand-teal hover:bg-teal-900'
                                }`}
                            >
                                {isToggling ? 'Saving...' : (userToToggle.status === 'active' ? 'Ban User' : 'Unban User')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;