import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getMyProposals, withdrawProposal } from "../services/proposals-service";

const MyProposalsPage = ({ user }) => {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [proposalToWithdraw, setProposalToWithdraw] = useState(null);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    useEffect(() => {
        const fetchProposals = async () => {
            setLoading(true);
            try {
                const response = await getMyProposals();
                setProposals(response.data || []);
            } catch (err) {
                setError(err.response?.data?.error?.message || err.message || "Failed to load proposals");
            } finally {
                setLoading(false);
            }
        };
        fetchProposals();
    }, []);

    const confirmWithdrawal = async () => {
        if (!proposalToWithdraw) return;

        setIsWithdrawing(true);
        setError(null);

        try {
            await withdrawProposal(proposalToWithdraw);
            setProposals((prevProposals) =>
                prevProposals.map((p) =>
                    p._id === proposalToWithdraw ? { ...p, status: 'withdrawn' } : p
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
            case 'accepted': return 'bg-[#EEF7F5] text-brand-success border-brand-success/20';
            case 'pending': return 'bg-[#FFF8EE] text-brand-warning border-brand-warning/30';
            case 'shortlisted': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'declined': return 'bg-[#FDECEB] text-brand-danger border-brand-danger/20';
            case 'withdrawn': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-brand-cream text-teal-600 border-cream-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-cream py-20 px-4 flex justify-center">
                <p className="text-teal-600 font-semibold animate-pulse">Loading your proposals...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6 relative">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-ink m-0">My Proposals</h1>
                    <p className="text-teal-600 m-0 mt-2 text-lg">Track the status of jobs you have applied to.</p>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-[#FDECEB] text-brand-danger rounded-lg text-sm border border-brand-danger/20">
                        {error}
                    </div>
                )}

                {!loading && !error && proposals.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-10 text-center">
                        <div className="w-16 h-16 bg-cream-200 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-[32px]">description</span>
                        </div>
                        <h2 className="text-xl font-bold text-ink mb-2">No Proposals Yet</h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            You haven't submitted any proposals. Browse available jobs and start applying!
                        </p>
                        <Link to="/jobs" className="px-6 py-2.5 bg-brand-teal text-white font-bold rounded-lg no-underline hover:bg-teal-900 transition-colors inline-block">
                            Browse Jobs
                        </Link>
                    </div>
                )}

                {!loading && !error && proposals.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {proposals.map((proposal) => (
                            <article key={proposal._id} className={`bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col gap-4 transition-all ${proposal.status === 'withdrawn' ? 'opacity-70 grayscale-[30%]' : 'hover:shadow-md hover:border-brand-teal'}`}>
                                
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="text-lg font-bold text-ink line-clamp-2 m-0 leading-snug">
                                        {proposal.job?.title || 'Unknown Job'}
                                    </h3>
                                    <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider shrink-0 ${getStatusBadge(proposal.status)}`}>
                                        {proposal.status}
                                    </span>
                                </div>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-teal-600 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">payments</span>
                                        <span className="text-ink font-bold">${proposal.amount}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                                        <span>{proposal.deliveryDays} Days</span>
                                    </div>
                                </div>

                                <div className="bg-brand-cream p-3 rounded-lg border border-cream-200 mt-2">
                                    <span className="text-xs font-bold text-teal-900 mb-1 block">Cover Letter:</span>
                                    <p className="text-sm text-gray-600 line-clamp-3 m-0 leading-relaxed">
                                        {proposal.coverLetter}
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-cream-200 flex justify-between items-center">
                                    <span className="text-xs text-gray-400">
                                        {new Date(proposal.createdAt).toLocaleDateString()}
                                    </span>
                                    
                                    <div className="flex items-center gap-4">
                                        {proposal.status === 'pending' && (
                                            <button 
                                                onClick={() => setProposalToWithdraw(proposal._id)}
                                                className="text-xs font-bold text-brand-danger hover:text-red-700 bg-transparent border-0 cursor-pointer p-0 transition-colors"
                                            >
                                                Withdraw
                                            </button>
                                        )}

                                        <Link to={`/jobs/${proposal.job?._id}`} className="text-sm font-bold text-brand-teal hover:underline flex items-center gap-1">
                                            View Job <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {proposalToWithdraw && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fadeIn">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-brand-danger flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[24px]">warning</span>
                        </div>
                        <h3 className="text-xl font-bold text-ink mb-2 m-0">Withdraw Proposal?</h3>
                        <p className="text-gray-500 mb-6 text-sm m-0 leading-relaxed">
                            Are you sure you want to withdraw this proposal? You won't be able to undo this action.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setProposalToWithdraw(null)} 
                                disabled={isWithdrawing}
                                className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmWithdrawal} 
                                disabled={isWithdrawing}
                                className="px-5 py-2.5 rounded-lg bg-brand-danger text-white font-bold hover:bg-red-700 transition-colors border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[100px]"
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