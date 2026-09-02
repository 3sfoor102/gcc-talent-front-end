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
    const [actionLoading, setActionLoading] = useState(false)

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

    const handleAccept = async (proposalId) => {
        if (!window.confirm("Accept this proposal and create a contract?")) return
        try {
            setActionLoading(true)
            const res = await acceptProposal(proposalId)
            const contractId = res.contract?._id || res.data?.contract?._id
            if (contractId) {
                navigate(`/contracts/${contractId}`)
            } else {
                fetchProposalsData()
            }
        } catch (err) {
            alert(err.response?.data?.error?.message || err.message || "Failed to accept proposal")
        } finally {
            setActionLoading(false)
        }
    }

    const handleShortlist = async (proposalId) => {
        try {
            setActionLoading(true)
            await shortlistProposal(proposalId)
            fetchProposalsData()
        } catch (err) {
            alert(err.response?.data?.error?.message || err.message || "Failed to shortlist proposal")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDecline = async (proposalId) => {
        if (!window.confirm("Decline this proposal?")) return
        try {
            setActionLoading(true)
            await declineProposal(proposalId)
            fetchProposalsData()
        } catch (err) {
            alert(err.response?.data?.error?.message || err.message || "Failed to decline proposal")
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-teal-600 font-medium">Loading proposals...</div>
    if (error) return <div className="max-w-[1280px] mx-auto p-6 text-red-600 bg-red-50 rounded-lg">{error}</div>

    return (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link to={`/jobs/${jobId}`} className="text-xs font-semibold text-brand-teal hover:underline mb-1 inline-block">
                        ← Back to Job Details
                    </Link>
                    <h1 className="text-2xl font-bold text-ink">{job?.title}</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Review received bids and interview candidates.</p>
                </div>
                <div className="text-sm font-semibold bg-white border border-cream-200 px-4 py-2 rounded-lg text-ink shadow-xs">
                    {proposals.length} Total Proposal{proposals.length === 1 ? "" : "s"}
                </div>
            </div>

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
                                                    <Link to={`/freelancers/${freelancerId}`} className="font-bold text-sm text-ink hover:underline">
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
                                                    onClick={() => handleAccept(prop._id)}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 bg-brand-teal hover:bg-teal-900 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                                                >
                                                    Accept & Hire
                                                </button>
                                                {prop.status !== "shortlisted" && (
                                                    <button
                                                        onClick={() => handleShortlist(prop._id)}
                                                        disabled={actionLoading}
                                                        className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-ink text-xs font-semibold rounded-md cursor-pointer"
                                                    >
                                                        Shortlist
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDecline(prop._id)}
                                                    disabled={actionLoading}
                                                    className="px-4 py-1 text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
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
        </div>
    )
}

export default JobProposalsPage