import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { searchFreelancers } from '../services/profile-service';
import ReportModal from '../components/ReportModal';

const FreelancerSearchPage = () => {
    const [freelancers, setFreelancers] = useState([])
    const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0 })
    const [loading, setLoading] = useState(true)
    const [filterError, setFilterError] = useState(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [skillFilter, setSkillFilter] = useState('')
    const [availability, setAvailability] = useState('')
    const [minRate, setMinRate] = useState('')
    const [maxRate, setMaxRate] = useState('')

    const [reportModalData, setReportModalData] = useState({ isOpen: false, targetId: null })

    // Safe retrieval of current user
    let currentUser = null
    try {
        const token = localStorage.getItem('token')
        if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]))
            currentUser = decoded.payload || decoded.user || decoded
        }
    } catch {
        currentUser = null
    }

    const isClient = currentUser?.role === 'client'
    const currentUserId = currentUser?._id || currentUser?.id

    const fetchTalent = async (page = 1) => {
        // Logical Restriction: Min rate cannot exceed Max rate
        if (minRate !== '' && maxRate !== '') {
            if (Number(minRate) > Number(maxRate)) {
                setFilterError('Minimum hourly rate cannot be greater than Maximum hourly rate.')
                return
            }
        }

        if (Number(minRate) < 0 || Number(maxRate) < 0) {
            setFilterError('Hourly rates cannot be negative values.')
            return
        }

        setFilterError(null)

        try {
            setLoading(true)
            const params = { page }
            if (searchTerm.trim()) params.q = searchTerm.trim()
            if (skillFilter.trim()) params.skills = skillFilter.trim()
            if (availability) params.availability = availability
            if (minRate !== '') params.minRate = Math.max(0, Number(minRate))
            if (maxRate !== '') params.maxRate = Math.max(0, Number(maxRate))

            const res = await searchFreelancers(params)
            setFreelancers(res.data || [])
            setMeta(res.meta || { page, limit: 12, total: 0 })
        } catch (err) {
            console.error('Failed to load freelancers:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTalent(1)
    }, [availability])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        fetchTalent(1)
    }

    const handleClearFilters = () => {
        setSearchTerm('')
        setSkillFilter('')
        setAvailability('')
        setMinRate('')
        setMaxRate('')
        setFilterError(null)
        setTimeout(() => {
            fetchTalent(1)
        }, 0)
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-ink">Find GCC Talent</h1>
                <p className="text-sm text-gray-500">Discover verified professionals across the region.</p>
            </div>

            {/* Validation Banner */}
            {filterError && (
                <div className="mb-4 p-3 bg-red-50 text-brand-danger text-xs font-medium rounded-lg border border-red-200 flex justify-between items-center">
                    <span>{filterError}</span>
                    <button
                        type="button"
                        onClick={() => setFilterError(null)}
                        className="text-brand-danger font-bold text-xs bg-transparent border-0 cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-lg border border-cream-200 shadow-sm mb-6 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">Keywords</label>
                        <input
                            type="text"
                            placeholder="Search by title, role, or bio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-brand-teal"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">Skill</label>
                        <input
                            type="text"
                            placeholder="e.g. React, Python, UI/UX"
                            value={skillFilter}
                            onChange={(e) => setSkillFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-brand-teal"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">Availability</label>
                        <select
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-brand-teal bg-white"
                        >
                            <option value="">All Availability</option>
                            <option value="full_time">Full Time</option>
                            <option value="part_time">Part Time</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-cream-100">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink">Rate ($/hr):</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="Min"
                            value={minRate}
                            onChange={(e) => setMinRate(e.target.value)}
                            className="w-20 border border-gray-300 rounded p-1.5 text-xs focus:outline-brand-teal"
                        />
                        <span className="text-xs text-gray-400">-</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="Max"
                            value={maxRate}
                            onChange={(e) => setMaxRate(e.target.value)}
                            className="w-20 border border-gray-300 rounded p-1.5 text-xs focus:outline-brand-teal"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border border-gray-300 cursor-pointer transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-1.5 text-xs font-semibold bg-brand-teal text-white rounded hover:bg-teal-900 cursor-pointer transition-colors border-0"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </form>

            {loading ? (
                <div className="text-center py-12 text-brand-teal font-medium animate-pulse">
                    Searching profiles...
                </div>
            ) : freelancers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-cream-200">
                    <p className="text-gray-500 text-sm">No freelancers matched your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {freelancers.map((item) => {
                        const u = item.user || {}
                        const userId = u._id || item.user

                        return (
                            <div
                                key={item._id}
                                className="bg-white border border-cream-200 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:border-brand-teal/50 transition relative"
                            >
                                {isClient && currentUserId?.toString() !== userId?.toString() && (
                                    <button
                                        type="button"
                                        onClick={() => setReportModalData({ isOpen: true, targetId: userId })}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-brand-danger transition-colors cursor-pointer border-0 bg-transparent"
                                        title="Report Freelancer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">flag</span>
                                    </button>
                                )}

                                <div>
                                    <div className="flex items-start gap-3 mb-3 pr-6">
                                        <div className="w-12 h-12 rounded-full bg-cream-200 flex items-center justify-center font-bold text-brand-teal shrink-0 overflow-hidden text-base">
                                            {u.avatarUrl ? (
                                                <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                                            ) : (
                                                u.name?.charAt(0) || 'F'
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-ink text-sm leading-tight m-0">{u.name || 'Freelancer'}</h3>
                                            <p className="text-xs text-brand-teal font-medium line-clamp-1 mt-0.5 mb-0">
                                                {item.headline || 'Independent Specialist'}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5 mb-0">
                                                {[u.city, u.country].filter(Boolean).join(', ') || 'Remote'}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-600 line-clamp-3 mb-3 leading-relaxed">
                                        {item.bio || 'No bio provided.'}
                                    </p>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {item.skills?.slice(0, 4).map((skill) => (
                                            <span key={skill} className="bg-brand-cream/60 text-ink text-[11px] px-2 py-0.5 rounded">
                                                {skill}
                                            </span>
                                        ))}
                                        {item.skills?.length > 4 && (
                                            <span className="text-[11px] text-gray-400 self-center">
                                                +{item.skills.length - 4}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-cream-200 pt-3 flex items-center justify-between mt-1">
                                    <div>
                                        <span className="text-sm font-bold text-ink">${item.hourlyRate || 0}</span>
                                        <span className="text-[11px] text-gray-400">/hr</span>
                                    </div>
                                    <Link
                                        to={`/freelancers/${userId}`}
                                        className="text-xs font-semibold bg-brand-teal text-white px-3 py-1.5 rounded hover:bg-teal-900 no-underline transition-colors"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {meta.total > meta.limit && (
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-cream-200">
                    <button
                        type="button"
                        disabled={meta.page <= 1}
                        onClick={() => fetchTalent(meta.page - 1)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-cream-200 rounded disabled:opacity-40 cursor-pointer"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-gray-500 font-medium">
                        Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
                    </span>
                    <button
                        type="button"
                        disabled={meta.page * meta.limit >= meta.total}
                        onClick={() => fetchTalent(meta.page + 1)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-cream-200 rounded disabled:opacity-40 cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            )}

            <ReportModal
                isOpen={reportModalData.isOpen}
                onClose={() => setReportModalData({ isOpen: false, targetId: null })}
                targetType="User"
                targetId={reportModalData.targetId}
            />
        </div>
    )
}

export default FreelancerSearchPage