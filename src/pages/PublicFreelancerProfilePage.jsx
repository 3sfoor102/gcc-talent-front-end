import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getPublicFreelancerProfile } from '../services/profile-service';

const PublicFreelancerProfilePage = () => {
    const { userId } = useParams()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await getPublicFreelancerProfile(userId)
                setProfile(data)
            } catch (err) {
                setError(err.response?.data?.error?.message || err.message || 'Freelancer not found')
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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white border border-cream-200 rounded-lg p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-full bg-cream-200 overflow-hidden shrink-0 flex items-center justify-center text-2xl font-bold text-brand-teal">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user.name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-ink">{user.name}</h1>
                        <p className="text-sm font-medium text-brand-teal">{profile.headline || 'Freelance Specialist'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {[user.city, user.country].filter(Boolean).join(', ') || 'Remote'} • Member since{' '}
                            {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                        </p>
                    </div>
                </div>

                <div className="flex md:flex-col items-end gap-2 text-right">
                    <div className="text-xl font-bold text-ink">
                        ${profile.hourlyRate || 0} <span className="text-xs font-normal text-gray-500">/hr</span>
                    </div>
                    <div className="text-xs px-2.5 py-1 rounded-full capitalize bg-emerald-50 text-emerald-700 font-semibold">
                        {profile.availability?.replace('_', ' ') || 'Available'}
                    </div>
                    <div className="text-xs text-amber-600 font-bold">
                        ★ {user.ratingAvg || '0.0'} <span className="font-normal text-gray-400">({user.ratingCount || 0} reviews)</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border border-cream-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-base font-bold text-ink mb-3">About</h2>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                            {profile.bio || 'No bio provided.'}
                        </p>
                    </div>

                    <div className="bg-white border border-cream-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-base font-bold text-ink mb-3">Portfolio ({profile.portfolio?.length || 0})</h2>
                        {!profile.portfolio || profile.portfolio.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No projects showcased yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {profile.portfolio.map((item, index) => (
                                    <div key={index} className="border border-cream-200 rounded-lg overflow-hidden flex flex-col justify-between">
                                        {item.imageUrl && (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                                        )}
                                        <div className="p-3">
                                            <h3 className="font-semibold text-sm text-ink">{item.title}</h3>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                            {item.link && (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-brand-teal hover:underline font-semibold mt-2 inline-block"
                                                >
                                                    View Project ↗
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-cream-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-ink mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.skills?.length > 0 ? (
                                profile.skills.map((skill) => (
                                    <span key={skill} className="bg-brand-cream/60 text-ink text-xs px-2.5 py-1 rounded">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-gray-400">No skills listed.</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-cream-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-ink mb-3">Performance</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Completed Contracts</span>
                                <span className="font-semibold text-ink">{profile.completedContracts || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Earned</span>
                                <span className="font-semibold text-ink">${profile.totalEarned || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicFreelancerProfilePage