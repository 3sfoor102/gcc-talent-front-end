import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router"
import { getJobProposals, acceptProposal, shortlistProposal, declineProposal } from "../services/proposals-service"
import { showJob } from "../services/jobs-service"

const JobProposalsPage = ({ user }) => {
    const { jobId } = useParams()
    const navigate = useNavigate()

    const [job, setJob] = useState(null)
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoadingId, setActionLoadingId] = useState(null)

    // Modal State Management
    const [acceptModalData, setAcceptModalData] = useState(null) // { proposalId, freelancerName, amount }
    const [declineModalData, setDeclineModalData] = useState(null) // { proposalId, freelancerName }
    const [declineReason, setDeclineReason] = useState("")

    const fetchProposalsData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [jobData, proposalsRes] = await Promise.all([
                showJob(jobId),
                getJobProposals(jobId)
            ])

            setJob(jobData)
            setProposals(proposalsRes.proposals || proposalsRes.data || proposalsRes || [])
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || "Failed to load proposals.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (jobId) fetchProposalsData()
    }, [jobId])

    const isJobOpen = job?.status === "open"
    const hasAcceptedProposal = proposals.some((p) => p.status === "accepted")

    const confirmAccept = async () => {
        if (!acceptModalData) return
        const { proposalId } = acceptModalData

        try {
            setActionLoadingId(proposalId)
            setError(null)
            const res = await acceptProposal(proposalId)

            const contractId = res?._id || res?.id || res?.contract?._id || res?.data?._id
            setAcceptModalData(null)

            if (contractId) {
                navigate(`/contracts/${contractId}`)
            } else {
                fetchProposalsData()
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || "Failed to accept proposal")
            setAcceptModalData(null)
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleShortlist = async (proposalId) => {
        try {
            setActionLoadingId(proposalId)
            setError(null)
            await shortlistProposal(proposalId)
            setProposals((prev) =>
                prev.map((p) => (p._id === proposalId ? { ...p, status: "shortlisted" } : p))
            )
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || "Failed to shortlist proposal")
        } finally {
            setActionLoadingId(null)
        }
    }

    const confirmDecline = async () => {
        if (!declineModalData) return
        const { proposalId } = declineModalData

        try {
            setActionLoadingId(proposalId)
            setError(null)
            await declineProposal(proposalId, { reason: declineReason.trim() })
            setProposals((prev) =>
                prev.map((p) => (p._id === proposalId ? { ...p, status: "declined", declineReason } : p))
            )
            setDeclineModalData(null)
            setDeclineReason("")
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || "Failed to decline proposal")
            setDeclineModalData(null)
        } finally {
            setActionLoadingId(null)
        }
    }

    if (loading || !job) {
        return (
            <div className="p-12 text-center text-teal-600 font-medium animate-pulse">
                Loading proposals and job details...
            </div>
        )
    }

    return (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 relative">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-ink m-0">{job?.title}</h1>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${job.status === "open" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                            }`}>
                            {job.status}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 m-0">Review received bids and interview candidates.</p>
                </div>

                <div className="text-sm font-semibold bg-white border border-cream-200 px-4 py-2 rounded-lg text-ink shadow-xs shrink-0">
                    {proposals.length} Total Proposal{proposals.length === 1 ? "" : "s"}
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="text-red-700 font-bold border-0 bg-transparent cursor-pointer text-xs"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {!isJobOpen && (
                <div className="mb-6 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
                    This job is currently <strong>{job.status}</strong>. New hires or state changes cannot be executed until it is reopened.
                </div>
            )}

            {proposals.length === 0 ? (
                <div className="bg-white border border-cream-200 rounded-lg p-10 text-center text-gray-500 text-sm shadow-xs">
                    No proposals have been submitted for this job yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {proposals.map((prop) => {
                        const rawFreelancer = prop.freelancer
                        const freelancerObj = typeof rawFreelancer === "object" && rawFreelancer !== null ? rawFreelancer : {}

                        const freelancerId =
                            freelancerObj._id ||
                            freelancerObj.id ||
                            freelancerObj.user?._id ||
                            freelancerObj.user ||
                            (typeof rawFreelancer === "string" ? rawFreelancer : null)

                        const freelancerName = freelancerObj.name || freelancerObj.user?.name || "Freelancer"
                        const avatarUrl = freelancerObj.avatarUrl || freelancerObj.user?.avatarUrl
                        const isPendingAction = actionLoadingId === prop._id

                        return (
                            <div key={prop._id} className="bg-white border border-cream-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center font-bold text-brand-teal shrink-0 overflow-hidden text-sm border border-cream-200">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt={freelancerName} className="w-full h-full object-cover" />
                                            ) : (
                                                freelancerName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {freelancerId ? (
                                                    <Link to={`/freelancers/${freelancerId}`} className="font-bold text-sm text-ink hover:underline no-underline">
                                                        {freelancerName}
                                                    </Link>
                                                ) : (
                                                    <span className="font-bold text-sm text-ink">{freelancerName}</span>
                                                )}

                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${prop.status === "accepted"
                                                    ? "bg-green-100 text-green-700"
                                                    : prop.status === "shortlisted"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : prop.status === "declined"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-slate-100 text-gray-600"
                                                    }`}>
                                                    {prop.status}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                Submitted {new Date(prop.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed mt-3">
                                        {prop.coverLetter}
                                    </p>

                                    {prop.milestones?.length > 0 && (
                                        <div className="mt-3 p-3 bg-brand-cream/30 border border-cream-200 rounded text-xs space-y-1">
                                            <span className="font-semibold text-ink block mb-1">Proposed Milestones:</span>
                                            {prop.milestones.map((m, idx) => (
                                                <div key={idx} className="flex justify-between text-gray-600">
                                                    <span>{m.title}</span>
                                                    <span className="font-medium text-ink">${m.amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {prop.status === "declined" && prop.declineReason && (
                                        <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100">
                                            <strong>Declined Note:</strong> {prop.declineReason}
                                        </div>
                                    )}
                                </div>

                                <div className="flex md:flex-col justify-between md:justify-start items-end gap-3 shrink-0 border-t md:border-t-0 md:border-l border-cream-200 pt-3 md:pt-0 md:pl-6">
                                    <div className="text-right">
                                        <span className="block text-xl font-bold text-teal-900">${prop.amount}</span>
                                        <span className="block text-[11px] text-gray-400">in {prop.deliveryDays} days</span>
                                    </div>

                                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                                        {freelancerId ? (
                                            <Link
                                                to={`/messages?userId=${freelancerId}&jobId=${jobId}`}
                                                className="px-4 py-2 bg-brand-cream border border-cream-200 hover:bg-cream-200 text-ink text-xs font-semibold rounded-md text-center no-underline transition-colors flex items-center justify-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">chat</span>
                                                Message
                                            </Link>
                                        ) : (
                                            <button
                                                disabled
                                                className="px-4 py-2 bg-gray-100 text-gray-400 text-xs font-semibold rounded-md text-center cursor-not-allowed border border-gray-200"
                                            >
                                                Message Unavailable
                                            </button>
                                        )}

                                        {prop.status !== "accepted" && prop.status !== "declined" && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setAcceptModalData({
                                                        proposalId: prop._id,
                                                        freelancerName,
                                                        amount: prop.amount
                                                    })}
                                                    disabled={isPendingAction || !isJobOpen || hasAcceptedProposal}
                                                    className="px-4 py-2 bg-brand-teal hover:bg-teal-900 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title={!isJobOpen ? "Job must be open to accept proposals" : hasAcceptedProposal ? "A proposal has already been accepted" : ""}
                                                >
                                                    {isPendingAction ? "Processing..." : "Accept & Hire"}
                                                </button>

                                                {prop.status !== "shortlisted" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleShortlist(prop._id)}
                                                        disabled={isPendingAction}
                                                        className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-ink text-xs font-semibold rounded-md cursor-pointer transition-colors disabled:opacity-50"
                                                    >
                                                        Shortlist
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => setDeclineModalData({
                                                        proposalId: prop._id,
                                                        freelancerName
                                                    })}
                                                    disabled={isPendingAction}
                                                    className="px-4 py-1 text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer border-0 bg-transparent transition-colors disabled:opacity-50"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Custom Accept & Hire Confirmation Modal */}
            {acceptModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-cream-200 animate-fadeIn">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-brand-success flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-2xl">handshake</span>
                        </div>
                        <h3 className="text-lg font-bold text-ink mb-1 m-0">Accept & Hire?</h3>
                        <p className="text-xs text-gray-500 mb-6 leading-relaxed m-0">
                            Accepting <strong className="text-ink">{acceptModalData.freelancerName}</strong>'s proposal for <strong className="text-teal-900">${acceptModalData.amount}</strong> will establish an active contract and lock the job terms.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setAcceptModalData(null)}
                                disabled={Boolean(actionLoadingId)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmAccept}
                                disabled={Boolean(actionLoadingId)}
                                className="px-4 py-2 text-xs font-bold bg-brand-teal text-white rounded-lg hover:bg-teal-900 transition-colors border-0 cursor-pointer disabled:opacity-50 min-w-[90px]"
                            >
                                {actionLoadingId ? "Hiring..." : "Confirm & Hire"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Decline Confirmation Modal */}
            {declineModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-cream-200 animate-fadeIn">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-brand-danger flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </div>
                        <h3 className="text-lg font-bold text-ink mb-1 m-0">Decline Proposal?</h3>
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed m-0">
                            Are you sure you want to decline the proposal submitted by <strong className="text-ink">{declineModalData.freelancerName}</strong>?
                        </p>
                        <div className="mb-5">
                            <label className="block text-[11px] font-semibold text-ink mb-1">Feedback Note (Optional)</label>
                            <textarea
                                rows={2}
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                placeholder="Why wasn't this proposal a fit?"
                                className="w-full text-xs p-2.5 bg-brand-cream/30 border border-cream-200 rounded-lg outline-none focus:border-brand-teal resize-none text-ink"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setDeclineModalData(null)
                                    setDeclineReason("")
                                }}
                                disabled={Boolean(actionLoadingId)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDecline}
                                disabled={Boolean(actionLoadingId)}
                                className="px-4 py-2 text-xs font-bold bg-brand-danger text-white rounded-lg hover:bg-red-700 transition-colors border-0 cursor-pointer disabled:opacity-50 min-w-[80px]"
                            >
                                {actionLoadingId ? "Declining..." : "Decline"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default JobProposalsPage