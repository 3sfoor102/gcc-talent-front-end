import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getNotifications, markNotificationAsRead } from "../services/notification-service";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-brand-cream py-20 flex justify-center text-teal-600 font-bold animate-pulse">Loading notifications...</div>;
    }

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-ink m-0">Your Notifications</h1>
                    <p className="text-teal-600 mt-2 m-0">Stay updated with your proposals, messages, and reports.</p>
                </header>

                {error && <div className="mb-6 p-4 bg-[#FDECEB] text-brand-danger rounded-lg text-sm">{error}</div>}

                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden divide-y divide-cream-100">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2">notifications_off</span>
                            <p className="text-sm m-0">You have no notifications right now.</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div 
                                key={notif._id} 
                                className={`p-5 flex items-start justify-between gap-4 transition-colors ${notif.isRead ? 'bg-white' : 'bg-[#EEF7F5]/40'}`}
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-gray-100 text-gray-500' : 'bg-brand-teal text-white'}`}>
                                        <span className="material-symbols-outlined text-[20px]">
                                            {notif.type === 'new_message' ? 'chat' : notif.type === 'proposal_accepted' ? 'check_circle' : 'notifications'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-ink m-0 mb-1">{notif.title}</h3>
                                        <p className="text-xs text-gray-600 m-0 leading-relaxed mb-2">{notif.body}</p>
                                        <span className="text-[11px] text-gray-400">{new Date(notif.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {notif.link && (
                                        <Link 
                                            to={notif.link}
                                            onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                                            className="px-3.5 py-1.5 bg-brand-cream text-brand-teal text-xs font-bold rounded-lg hover:bg-cream-200 no-underline transition-colors"
                                        >
                                            View
                                        </Link>
                                    )}
                                    {!notif.isRead && (
                                        <button 
                                            onClick={() => handleMarkAsRead(notif._id)}
                                            className="w-8 h-8 rounded-lg bg-transparent hover:bg-gray-100 text-gray-400 hover:text-ink border-0 cursor-pointer flex items-center justify-center transition-colors"
                                            title="Mark as read"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">done</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;