import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getMyProposals, withdrawProposal } from '../services/proposals-service';

const MyProposalsPage = ({ user }) => {
    const [proposals, setProposals] = useState([])
    const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0 })
    const [loading, setLoading] = useState(true)
    const [actionLoadingId, setActionLoadingId] = useState(null)
    const [error, setError] = useState(null)

    const fetchProposals = async (page = 1) => {
        try {
            setLoading(true)
            setError(null)
            const res = await getMyProposals(page)
            setProposals(res.data || [])
            setMeta(res.meta || { page, limit: 12, total: res.data?.length || 0 })
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to load your proposals.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProposals(1)
    }, [])

    const handleWithdraw = async (proposalId) => {
        if (!window.confirm('Are you sure you want to withdraw this proposal? This action cannot be undone.')) {
            return
        }

        try {
            setActionLoadingId(proposalId)
            const updated = await withdrawProposal(proposalId)
            setProposals((prev) =>
                prev.map((p) => (p._id === proposalId ? { ...p, status: updated.status } : p))
            )
        } catch (err) {
            alert(err.response?.data?.error?.message || err.message || 'Failed to withdraw proposal.')
        } finally {
            setActionLoadingId(null)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-teal-600">Loading your proposals...</div>
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink">My Submitted Proposals</h1>
                    <p className="text-sm text-gray-500">
                        Track your bids, client responses, and proposal statuses.
                    </p>
                </div>
                <Link
                    to="/jobs"
                    className="bg-brand-teal text-white hover:bg-teal-900 px-4 py-2 rounded-lg text-sm font-semibold no-underline"
                >
                    Find More Jobs
                </Link>
            </div>

            {proposals.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-cream-200 shadow-sm">
                    <p className="text-gray-500 mb-4">You have not submitted any proposals yet.</p>
                    <Link
                        to="/jobs"
                        className="inline-block bg-accent-sand text-brand-teal px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#B8956B]"
                    >
                        Browse Open Jobs
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {proposals.map((proposal) => {
                        const job = proposal.job || {}
                        const isPending = proposal.status === 'pending'

                        return (
                            <div
                                key={proposal._id}
                                className="bg-white rounded-lg border border-cream-200 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6"
                            >
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <Link
                                            to={`/jobs/${job._id || proposal.job}`}
                                            className="text-lg font-bold text-brand-teal hover:underline"
                                        >
                                            {job.title || 'Untitled Job'}
                                        </Link>
                                        <span
                                            className={`px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${proposal.status === 'accepted'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : proposal.status === 'declined'
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : proposal.status === 'shortlisted'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : proposal.status === 'withdrawn'
                                                            ? 'bg-gray-100 text-gray-600'
                                                            : 'bg-teal-50 text-brand-teal'
                                                }`}
                                        >
                                            {proposal.status}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-500 mb-3">
                                        Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                                    </p>

                                    <p className="text-sm text-ink line-clamp-2 mb-4 bg-brand-cream/30 p-3 rounded">
                                        {proposal.coverLetter}
                                    </p>

                                    <div className="flex flex-wrap gap-6 text-sm">
                                        <div>
                                            <span className="text-xs text-gray-500 block">Bid Amount</span>
                                            <strong className="text-brand-teal">${proposal.amount}</strong>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Delivery</span>
                                            <strong>{proposal.deliveryDays} Days</strong>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Milestones</span>
                                            <strong>{proposal.milestones?.length || 0}</strong>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Attachments</span>
                                            <strong>{proposal.attachments?.length || 0}</strong>
                                        </div>
                                    </div>

                                    {proposal.status === 'declined' && proposal.declineReason && (
                                        <div className="mt-3 text-xs bg-rose-50 text-rose-700 p-2 rounded border border-rose-200">
                                            <strong>Client Feedback:</strong> {proposal.declineReason}
                                        </div>
                                    )}
                                </div>

                                <div className="md:w-40 flex flex-col justify-center border-t md:border-t-0 md:border-l border-cream-200 pt-4 md:pt-0 md:pl-6">
                                    {isPending ? (
                                        <button
                                            type="button"
                                            onClick={() => handleWithdraw(proposal._id)}
                                            disabled={actionLoadingId === proposal._id}
                                            className="w-full text-xs font-semibold text-rose-600 border border-rose-300 hover:bg-rose-50 py-2 px-3 rounded transition disabled:opacity-50"
                                        >
                                            {actionLoadingId === proposal._id ? 'Processing...' : 'Withdraw Proposal'}
                                        </button>
                                    ) : proposal.status === 'accepted' ? (
                                        <Link
                                            to="/contracts"
                                            className="w-full text-center bg-brand-teal text-white text-xs font-semibold py-2 px-3 rounded hover:bg-teal-900 transition no-underline"
                                        >
                                            View Contract
                                        </Link>
                                    ) : (
                                        <span className="text-center text-xs text-gray-400">No actions</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default MyProposalsPage