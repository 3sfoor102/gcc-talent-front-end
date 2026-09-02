import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getPublicClientProfile } from '../services/profile-service';

const PublicClientProfilePage = () => {
    const { userId } = useParams()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await getPublicClientProfile(userId)
                setProfile(data)
            } catch (err) {
                setError(err.response?.data?.error?.message || err.message || 'Client not found')
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [userId])

    if (loading) return <div className="p-8 text-center text-brand-teal">Loading profile...</div>
    if (error || !profile) return <div className="p-8 text-center text-rose-600">{error || 'Profile not found'}</div>

    const user = profile.user || {}

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white border border-cream-200 rounded-lg p-6 shadow-sm mb-6 flex gap-5 items-center">
                <div className="w-16 h-16 rounded-full bg-cream-200 overflow-hidden shrink-0 flex items-center justify-center text-xl font-bold text-brand-teal">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        user.name?.charAt(0) || 'C'
                    )}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
                        {profile.companyName || user.name}
                        {profile.isCompany && (
                            <span className="text-xs bg-teal-100 text-brand-teal px-2 py-0.5 rounded font-semibold">
                                Company
                            </span>
                        )}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {[user.city, user.country].filter(Boolean).join(', ') || 'GCC Region'} • Joined{' '}
                        {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                    </p>
                    {profile.website && (
                        <a
                            href={profile.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-brand-teal hover:underline mt-1 inline-block"
                        >
                            {profile.website} ↗
                        </a>
                    )}
                </div>
            </div>

            <div className="bg-white border border-cream-200 rounded-lg p-6 shadow-sm mb-6">
                <h2 className="text-base font-bold text-ink mb-2">About Client</h2>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {profile.description || 'No description provided.'}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-cream-200 rounded-lg p-5 shadow-sm text-center">
                    <span className="text-xs text-gray-500 block uppercase font-semibold">Jobs Posted</span>
                    <span className="text-2xl font-bold text-brand-teal mt-1 block">{profile.jobsPosted || 0}</span>
                </div>
                <div className="bg-white border border-cream-200 rounded-lg p-5 shadow-sm text-center">
                    <span className="text-xs text-gray-500 block uppercase font-semibold">Total Spent</span>
                    <span className="text-2xl font-bold text-brand-teal mt-1 block">${profile.totalSpent || 0}</span>
                </div>
            </div>
        </div>
    )
}

export default PublicClientProfilePage