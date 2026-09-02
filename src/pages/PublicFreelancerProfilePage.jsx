import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getPublicFreelancerProfile } from '../services/profile-service';
import { getUserReviews } from '../services/review-service';
import ReportModal from '../components/ReportModal';

const PublicFreelancerProfilePage = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    // Retrieve current logged in user safely
    let currentUserId = null;
    let currentUserRole = null;
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const u = decoded.payload || decoded.user || decoded;
            currentUserId = u?._id || u?.id || u?.userId;
            currentUserRole = u?.role;
        }
    } catch {
        currentUserId = null;
        currentUserRole = null;
    }

    useEffect(() => {
        const loadProfileAndReviews = async () => {
            try {
                setLoading(true);
                setError(null);
                const [profileData, reviewsRes] = await Promise.all([
                    getPublicFreelancerProfile(userId),
                    getUserReviews(userId, 1, 5).catch(() => ({ data: [] }))
                ]);
                setProfile(profileData);
                setReviews(reviewsRes?.data || []);
            } catch (err) {
                setError(err.response?.data?.error?.message || err.message || 'Freelancer not found');
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
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-red-50 text-brand-danger rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <span className="material-symbols-outlined text-3xl">person_off</span>
                </div>
                <h2 className="text-xl font-bold text-ink mb-2">Profile Unavailable</h2>
                <p className="text-sm text-gray-500 mb-6">{error || 'Freelancer profile does not exist.'}</p>
                <Link
                    to="/freelancers"
                    className="px-5 py-2.5 bg-brand-teal text-white text-xs font-semibold rounded-lg no-underline hover:bg-teal-900 transition-colors inline-block"
                >
                    Back to Talent Directory
                </Link>
            </div>
        );
    }

    const user = profile.user || {};
    const isSelf = currentUserId && currentUserId.toString() === userId.toString();

    // Logical Restriction: Normalize project link
    const getSafeUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 relative">
            {/* Header Profile Banner */}
            <div className="bg-white border border-cream-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative">
                <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-full bg-cream-200 overflow-hidden shrink-0 flex items-center justify-center text-2xl font-bold text-brand-teal border border-cream-200 shadow-2xs">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user.name?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink m-0">{user.name}</h1>
                        <p className="text-sm font-medium text-brand-teal mt-0.5 m-0">
                            {profile.headline || 'Freelance Specialist'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 m-0">
                            {[user.city, user.country].filter(Boolean).join(', ') || 'Remote'} • Member since{' '}
                            {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                    <div className="flex items-center justify-between md:justify-end gap-3 w-full">
                        <span className="text-2xl font-bold text-ink">${profile.hourlyRate || 0}<span className="text-xs font-normal text-gray-500">/hr</span></span>
                        <span className="text-xs px-2.5 py-1 rounded-full capitalize bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/50">
                            {profile.availability?.replace('_', ' ') || 'Available'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                        ★ {user.ratingAvg ? user.ratingAvg.toFixed(1) : '0.0'}{' '}
                        <span className="font-normal text-gray-400">({user.ratingCount || 0} reviews)</span>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-2 mt-2 w-full md:w-auto">
                        {!isSelf && currentUserId && (
                            <>
                                <Link
                                    to={`/messages?userId=${userId}`}
                                    className="px-4 py-2 bg-brand-teal hover:bg-teal-900 text-white rounded-lg text-xs font-bold no-underline transition-colors flex items-center justify-center gap-1.5 flex-1 md:flex-initial"
                                >
                                    <span className="material-symbols-outlined text-[16px]">chat</span>
                                    Message
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setIsReportOpen(true)}
                                    className="p-2 text-gray-400 hover:text-brand-danger bg-transparent border border-cream-200 hover:border-red-200 rounded-lg cursor-pointer transition-colors flex items-center justify-center"
                                    title="Report Freelancer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">flag</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Details (Bio, Portfolio, Reviews) */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border border-cream-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-ink mb-3 m-0">About</h2>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed m-0 mt-2">
                            {profile.bio || 'No bio provided.'}
                        </p>
                    </div>

                    <div className="bg-white border border-cream-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-ink mb-3 m-0">
                            Portfolio ({profile.portfolio?.length || 0})
                        </h2>
                        {!profile.portfolio || profile.portfolio.length === 0 ? (
                            <p className="text-xs text-gray-400 italic m-0 mt-2">No projects showcased yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                {profile.portfolio.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border border-cream-200 rounded-xl overflow-hidden flex flex-col justify-between bg-white"
                                    >
                                        {item.imageUrl && (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                                        )}
                                        <div className="p-3.5 flex flex-col flex-grow justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold text-sm text-ink m-0">{item.title}</h3>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2 m-0 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                            {item.link && (
                                                <a
                                                    href={getSafeUrl(item.link)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-brand-teal hover:underline font-semibold inline-flex items-center gap-1 no-underline mt-1"
                                                >
                                                    <span>View Project</span>
                                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reviews Breakdown */}
                    <div className="bg-white border border-cream-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-bold text-ink mb-4 m-0">Client Reviews</h2>
                        {reviews.length === 0 ? (
                            <p className="text-xs text-gray-400 italic m-0">No client reviews submitted yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((rev) => (
                                    <div key={rev._id} className="border-b border-cream-100 pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-ink">
                                                {rev.reviewer?.name || 'Client'}
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
                </div>

                {/* Sidebar (Skills & Statistics) */}
                <div className="space-y-6">
                    <div className="bg-white border border-cream-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-ink mb-3 m-0">Skills & Expertise</h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {profile.skills?.length > 0 ? (
                                profile.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="bg-brand-cream/60 text-ink text-xs px-2.5 py-1 rounded-md font-medium border border-cream-200/50"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-gray-400">No skills listed.</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-cream-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-ink mb-3 m-0">Performance Overview</h3>
                        <div className="space-y-3 text-sm mt-3">
                            <div className="flex justify-between items-center pb-2 border-b border-cream-100">
                                <span className="text-gray-500 text-xs">Completed Contracts</span>
                                <span className="font-semibold text-ink">{profile.completedContracts || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-xs">Total Earnings</span>
                                <span className="font-semibold text-teal-900">${profile.totalEarned || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Report Modal */}
            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                targetType="User"
                targetId={userId}
            />
        </div>
    );
};

export default PublicFreelancerProfilePage;