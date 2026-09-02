import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getMyProposals, withdrawProposal } from "../services/proposals-service";

const MyProposalsPage = ({ user }) => {
    const [proposals, setProposals] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [proposalToWithdraw, setProposalToWithdraw] = useState(null);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const fetchProposals = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMyProposals(page);
            const proposalList = res.data || res.proposals || [];
            setProposals(proposalList);
            setMeta(res.meta || { page, limit: 12, total: proposalList.length });
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || "Failed to load proposals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals(1);
    }, []);

    const handleWithdrawClick = (proposal) => {
        // Logical Restriction: Only pending or shortlisted proposals can be withdrawn
        if (proposal.status !== 'pending' && proposal.status !== 'shortlisted') {
            setError(`Cannot withdraw a proposal that is already ${proposal.status}.`);
            return;
        }
        setError(null);
        setProposalToWithdraw(proposal);
    };

    const confirmWithdrawal = async () => {
        if (!proposalToWithdraw) return;

        setIsWithdrawing(true);
        setError(null);

        try {
            const updated = await withdrawProposal(proposalToWithdraw._id);
            setProposals((prevProposals) =>
                prevProposals.map((p) =>
                    p._id === proposalToWithdraw._id
                        ? { ...p, status: updated?.status || 'withdrawn' }
                        : p
                )
            );
            setProposalToWithdraw(null);
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || "Failed to withdraw proposal");
            setProposalToWithdraw(null);
        } finally {
            setIsWithdrawing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-[#EEF7F5] text-brand-success border-brand-success/20';
            case 'pending':
                return 'bg-[#FFF8EE] text-brand-warning border-brand-warning/30';
            case 'shortlisted':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'declined':
                return 'bg-[#FDECEB] text-brand-danger border-brand-danger/20';
            case 'withdrawn':
                return 'bg-gray-100 text-gray-500 border-gray-200';
            default:
                return 'bg-brand-cream text-teal-600 border-cream-200';
        }
    };

    const filteredProposals = statusFilter
        ? proposals.filter((p) => p.status === statusFilter)
        : proposals;

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-cream py-20 px-4 flex justify-center items-center">
                <p className="text-teal-600 font-semibold animate-pulse text-base">
                    Loading your proposals...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6 relative">
            <div className="max-w-6xl mx-auto flex flex-col gap-6">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-ink m-0">My Proposals</h1>
                        <p className="text-teal-600 m-0 mt-1 text-sm">
                            Track the status of jobs you have applied to.
                        </p>
                    </div>
                    <Link
                        to="/jobs"
                        className="bg-brand-teal text-white hover:bg-teal-900 px-5 py-2.5 rounded-lg text-sm font-semibold no-underline transition-colors shadow-xs"
                    >
                        Browse Open Jobs
                    </Link>
                </header>

                {/* Filter Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-cream-200 shadow-xs">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-teal-600">filter_list</span>
                        <label htmlFor="status-filter" className="text-xs font-semibold text-ink">
                            Filter by Status:
                        </label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-brand-cream border border-cream-200 rounded-lg py-1 px-3 text-xs text-ink font-semibold focus:outline-none focus:border-brand-teal"
                        >
                            <option value="">All Statuses ({proposals.length})</option>
                            <option value="pending">Pending</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                            <option value="withdrawn">Withdrawn</option>
                        </select>
                    </div>

                    <span className="text-xs text-teal-600 font-medium">
                        Showing: <strong className="text-ink">{filteredProposals.length}</strong> proposals
                    </span>
                </div>

                {error && (
                    <div className="p-4 bg-[#FDECEB] text-brand-danger rounded-lg text-sm border border-brand-danger/20 flex justify-between items-center">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError(null)}
                            className="text-brand-danger font-bold text-xs bg-transparent border-0 cursor-pointer"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {!error && proposals.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-10 text-center">
                        <div className="w-16 h-16 bg-cream-200 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-[32px]">description</span>
                        </div>
                        <h2 className="text-xl font-bold text-ink mb-2">No Proposals Yet</h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                            You haven't submitted any proposals. Browse available jobs and start applying!
                        </p>
                        <Link
                            to="/jobs"
                            className="px-6 py-2.5 bg-brand-teal text-white font-bold rounded-lg no-underline hover:bg-teal-900 transition-colors inline-block"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                )}

                {!error && proposals.length > 0 && filteredProposals.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8 text-center text-gray-500 text-sm">
                        No proposals found under the "{statusFilter}" status.
                    </div>
                )}

                {!error && filteredProposals.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProposals.map((proposal) => {
                            const job = proposal.job || {};
                            const jobId = job._id || proposal.job;
                            const isPending = proposal.status === 'pending';
                            const isShortlisted = proposal.status === 'shortlisted';
                            const isAccepted = proposal.status === 'accepted';
                            const isWithdrawn = proposal.status === 'withdrawn';
                            const contractId = proposal.contract?._id || proposal.contract;

                            return (
                                <article
                                    key={proposal._id}
                                    className={`bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col justify-between gap-4 transition-all ${isWithdrawn ? 'opacity-70 grayscale-[25%]' : 'hover:shadow-md hover:border-brand-teal/50'
                                        }`}
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-start gap-3">
                                            <h3 className="text-lg font-bold text-ink line-clamp-2 m-0 leading-snug">
                                                {job.title || 'Untitled Job'}
                                            </h3>
                                            <span
                                                className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider shrink-0 ${getStatusBadge(
                                                    proposal.status
                                                )}`}
                                            >
                                                {proposal.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-xs text-teal-600 font-medium">
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">payments</span>
                                                <span className="text-ink font-bold">${proposal.amount}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                <span>{proposal.deliveryDays} Days</span>
                                            </div>
                                            {proposal.milestones?.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">flag</span>
                                                    <span>{proposal.milestones.length} Milestones</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-brand-cream/40 p-3 rounded-lg border border-cream-200 text-xs">
                                            <span className="font-bold text-teal-900 mb-1 block">Cover Letter:</span>
                                            <p className="text-gray-600 line-clamp-3 m-0 leading-relaxed">
                                                {proposal.coverLetter}
                                            </p>
                                        </div>

                                        {proposal.status === 'declined' && proposal.declineReason && (
                                            <div className="text-xs bg-rose-50 text-rose-700 p-2.5 rounded-lg border border-rose-200">
                                                <strong className="block mb-0.5">Client Feedback:</strong>
                                                {proposal.declineReason}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-cream-200 flex justify-between items-center mt-2">
                                        <span className="text-xs text-gray-400">
                                            {new Date(proposal.createdAt).toLocaleDateString()}
                                        </span>

                                        <div className="flex items-center gap-3">
                                            {(isPending || isShortlisted) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleWithdrawClick(proposal)}
                                                    className="text-xs font-bold text-brand-danger hover:text-red-700 bg-transparent border-0 cursor-pointer p-0 transition-colors"
                                                >
                                                    Withdraw
                                                </button>
                                            )}

                                            {isAccepted ? (
                                                <Link
                                                    to={contractId ? `/contracts/${contractId}` : "/contracts"}
                                                    className="text-xs font-bold bg-brand-teal text-white px-3 py-1.5 rounded-md hover:bg-teal-900 no-underline transition-colors"
                                                >
                                                    View Contract
                                                </Link>
                                            ) : (
                                                jobId && (
                                                    <Link
                                                        to={`/jobs/${jobId}`}
                                                        className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-0.5 no-underline"
                                                    >
                                                        View Job <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {meta.total > meta.limit && (
                    <div className="flex justify-between items-center mt-8 pt-4 border-t border-cream-200">
                        <button
                            type="button"
                            disabled={meta.page <= 1}
                            onClick={() => fetchProposals(meta.page - 1)}
                            className="px-4 py-2 text-xs font-semibold bg-white border border-cream-200 rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-gray-500 font-medium">
                            Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
                        </span>
                        <button
                            type="button"
                            disabled={meta.page * meta.limit >= meta.total}
                            onClick={() => fetchProposals(meta.page + 1)}
                            className="px-4 py-2 text-xs font-semibold bg-white border border-cream-200 rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Confirmation Modal */}
            {proposalToWithdraw && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fadeIn border border-cream-200">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-brand-danger flex items-center justify-center mb-4 border border-red-100">
                            <span className="material-symbols-outlined text-[24px]">warning</span>
                        </div>
                        <h3 className="text-lg font-bold text-ink mb-1 m-0">Withdraw Proposal?</h3>
                        <p className="text-gray-500 mb-6 text-xs m-0 leading-relaxed">
                            Are you sure you want to withdraw your <strong className="text-ink">${proposalToWithdraw.amount}</strong> bid for <strong className="text-ink">"{proposalToWithdraw.job?.title || 'this job'}"</strong>? The client will no longer be able to accept your proposal.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setProposalToWithdraw(null)}
                                disabled={isWithdrawing}
                                className="px-4 py-2 rounded-lg text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-200 bg-white cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmWithdrawal}
                                disabled={isWithdrawing}
                                className="px-4 py-2 rounded-lg bg-brand-danger text-white text-xs font-bold hover:bg-red-700 transition-colors border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[85px]"
                            >
                                {isWithdrawing ? 'Processing...' : 'Withdraw'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProposalsPage;