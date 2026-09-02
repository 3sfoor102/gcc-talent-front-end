import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getPublicClientProfile } from '../services/profile-service';
import { getUserReviews } from '../services/review-service';
import ReportModal from '../components/ReportModal';

const PublicClientProfilePage = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    // Retrieve current logged in user safely
    let currentUserId = null;
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            currentUserId = decoded.payload?._id || decoded.user?._id || decoded._id || decoded.id;
        }
    } catch {
        currentUserId = null;
    }

    useEffect(() => {
        const loadProfileAndReviews = async () => {
            try {
                setLoading(true);
                setError(null);
                const [profileData, reviewsRes] = await Promise.all([
                    getPublicClientProfile(userId),
                    getUserReviews(userId, 1, 5).catch(() => ({ data: [] }))
                ]);
                setProfile(profileData);
                setReviews(reviewsRes?.data || []);
            } catch (err) {
                setError(err.response?.data?.error?.message || err.message || 'Client not found');
            } finally {
                setLoading(false);
            }
        };
        if (userId) loadProfileAndReviews();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <p className="text-teal-600 font-medium animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-red-50 text-brand-danger rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <span className="material-symbols-outlined text-3xl">person_off</span>
                </div>
                <h2 className="text-xl font-bold text-ink mb-2">Profile Unavailable</h2>
                <p className="text-sm text-gray-500 mb-6">{error || 'Client profile does not exist.'}</p>
                <Link
                    to="/jobs"
                    className="px-5 py-2.5 bg-brand-teal text-white text-xs font-semibold rounded-lg no-underline hover:bg-teal-900 transition-colors inline-block"
                >
                    Back to Jobs
                </Link>
            </div>
        );
    }

    const user = profile.user || {};
    const isSelf = currentUserId && currentUserId.toString() === userId.toString();

    // Logical Restriction: Normalize website URL to prevent broken relative links
    const getSafeUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 relative">
            {/* Header Card */}
            <div className="bg-white border border-cream-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between relative">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-cream-200 overflow-hidden shrink-0 flex items-center justify-center text-xl font-bold text-brand-teal border border-cream-200 shadow-2xs">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user.name?.charAt(0).toUpperCase() || 'C'
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold text-ink m-0">
                                {profile.companyName || user.name}
                            </h1>
                            {profile.isCompany && (
                                <span className="text-[11px] bg-teal-50 text-brand-teal border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                                    Company
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 m-0">
                            {[user.city, user.country].filter(Boolean).join(', ') || 'GCC Region'} • Joined{' '}
                            {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                        </p>
                        {profile.website && (
                            <a
                                href={getSafeUrl(profile.website)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-brand-teal hover:underline mt-1 inline-flex items-center gap-1 font-medium no-underline"
                            >
                                <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Report Action for Other Users */}
                {!isSelf && currentUserId && (
                    <button
                        type="button"
                        onClick={() => setIsReportOpen(true)}
                        className="text-gray-400 hover:text-brand-danger flex items-center gap-1 text-xs border-0 bg-transparent cursor-pointer transition-colors p-1 self-end sm:self-start"
                        title="Report Client"
                    >
                        <span className="material-symbols-outlined text-[16px]">flag</span>
                        <span>Report</span>
                    </button>
                )}
            </div>

            {/* About Section */}
            <div className="bg-white border border-cream-200 rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="text-base font-bold text-ink mb-2 m-0">About Client</h2>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed m-0 mt-2">
                    {profile.description || 'No description provided.'}
                </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-cream-200 rounded-xl p-5 shadow-xs text-center">
                    <span className="text-[11px] text-gray-500 block uppercase font-semibold">Jobs Posted</span>
                    <span className="text-2xl font-bold text-brand-teal mt-1 block">{profile.jobsPosted || 0}</span>
                </div>
                <div className="bg-white border border-cream-200 rounded-xl p-5 shadow-xs text-center">
                    <span className="text-[11px] text-gray-500 block uppercase font-semibold">Total Spent</span>
                    <span className="text-2xl font-bold text-brand-teal mt-1 block">${profile.totalSpent || 0}</span>
                </div>
                <div className="bg-white border border-cream-200 rounded-xl p-5 shadow-xs text-center col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-gray-500 block uppercase font-semibold">Client Rating</span>
                    <div className="flex items-center justify-center gap-1 mt-1 text-amber-500">
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                        </span>
                        <span className="text-2xl font-bold text-ink">
                            {user.ratingAvg ? user.ratingAvg.toFixed(1) : 'New'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white border border-cream-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-ink mb-4 m-0">Reviews from Freelancers</h2>
                {reviews.length === 0 ? (
                    <p className="text-xs text-gray-500 italic m-0">No reviews received yet.</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((rev) => (
                            <div key={rev._id} className="border-b border-cream-100 pb-4 last:border-b-0 last:pb-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-ink">
                                        {rev.reviewer?.name || 'Verified Freelancer'}
                                    </span>
                                    <div className="flex items-center text-amber-400">
                                        {[...Array(5)].map((_, idx) => (
                                            <span
                                                key={idx}
                                                className="material-symbols-outlined text-[15px]"
                                                style={{ fontVariationSettings: idx < rev.rating ? "'FILL' 1" : "'FILL' 0" }}
                                            >
                                                star
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 m-0 leading-relaxed">{rev.comment}</p>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                    {new Date(rev.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom In-App Report Modal */}
            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                targetType="User"
                targetId={userId}
            />
        </div>
    );
};

export default PublicClientProfilePage;