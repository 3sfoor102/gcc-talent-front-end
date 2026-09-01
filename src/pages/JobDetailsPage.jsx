import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { showJob } from "../services/jobs-service";
import { createProposal } from "../services/proposals-service";
import { uploadToCloudinary } from "../services/upload-service";

const JobDetailsPage = ({ user }) => {
    const { jobId } = useParams()
    const navigate = useNavigate()

    const initialProposalForm = {
        coverLetter: "",
        amount: "",
        deliveryDays: "",
        milestones: [],
        attachments: []
    }

    const initialMilestoneState = { title: "", amount: "", dueDate: "" }

    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [proposalData, setProposalData] = useState(initialProposalForm)
    const [submitting, setSubmitting] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)
    const [proposalError, setProposalError] = useState(null)
    const [proposalSuccess, setProposalSuccess] = useState(false)

    const [milestone, setMilestone] = useState(initialMilestoneState)

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await showJob(jobId)
                setJob(data)
            } catch (err) {
                setError(
                    err.response?.data?.error?.message ||
                    err.message ||
                    "Failed to load job details."
                )
            } finally {
                setLoading(false)
            }
        }

        if (jobId) fetchJob()
    }, [jobId])

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <p className="text-[16px] text-teal-600 animate-pulse font-medium">
                    Loading job details...
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-12">
                <div className="p-4 bg-[#FDECEB] text-brand-danger border border-brand-danger/20 rounded-[8px] text-[14px]">
                    {error}
                </div>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-12">
                <p className="text-[16px] text-teal-600">No job found.</p>
            </div>
        )
    }

    const currentUserId = user?._id || user?.id || user?.userId
    const jobClientId = job.client?._id || job.client
    const isOwner = Boolean(
        currentUserId &&
        jobClientId &&
        currentUserId.toString() === jobClientId.toString()
    )
    const isFreelancer = user?.role === "freelancer"

    const handleProposalChange = (event) => {
        const { name, value } = event.target
        setProposalData((prev) => ({ ...prev, [name]: value }))
    }

    const handleMilestoneChange = (event) => {
        const { name, value } = event.target
        setMilestone((prev) => ({ ...prev, [name]: value }))
    }

    const addMilestone = () => {
        if (!milestone.title || !milestone.amount) return
        setProposalData((prev) => ({
            ...prev,
            milestones: [
                ...prev.milestones,
                { ...milestone, amount: Number(milestone.amount) },
            ],
        }))
        setMilestone({ title: "", amount: "", dueDate: "" })
    }

    const removeMilestone = (index) => {
        setProposalData((prev) => ({
            ...prev,
            milestones: prev.milestones.filter((_, idx) => idx !== index),
        }))
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploadingFile(true)
        setProposalError(null)
        try {
            const uploadedAttachment = await uploadToCloudinary(file)
            setProposalData((prev) => ({
                ...prev,
                attachments: [...prev.attachments, uploadedAttachment],
            }))
        } catch (err) {
            setProposalError(
                err.response?.data?.error?.message ||
                err.message ||
                "Failed to upload file."
            )
        } finally {
            setUploadingFile(false)
            event.target.value = ""
        }
    }

    const removeAttachment = (publicId) => {
        setProposalData((prev) => ({
            ...prev,
            attachments: prev.attachments.filter(
                (item) => item.public_id !== publicId
            ),
        }))
    }

    const handleProposalSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        setProposalError(null)
        try {
            await createProposal(job._id, {
                coverLetter: proposalData.coverLetter,
                amount: Number(proposalData.amount),
                deliveryDays: Number(proposalData.deliveryDays),
                milestones: proposalData.milestones,
                attachments: proposalData.attachments,
            })

            setProposalSuccess(true)
            setTimeout(() => {
                setProposalSuccess(false)
                setProposalData(initialProposalForm)
            }, 3000)
        } catch (err) {
            setProposalError(
                err.response?.data?.error?.message ||
                err.message ||
                "Failed to submit proposal."
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-[1280px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col gap-8">
                {isOwner && (
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-[8px] border border-cream-200 shadow-sm">
                        <span className="text-[14px] font-medium text-ink">
                            You are managing this posting
                        </span>
                        <div className="flex gap-2">
                            <Link
                                to={`/client/jobs/${job._id}/edit`}
                                className="px-4 py-2 bg-brand-teal text-white rounded-[8px] text-[14px] font-medium hover:opacity-90 transition-opacity"
                            >
                                Edit Job
                            </Link>
                            <Link
                                to="/client/jobs"
                                className="px-4 py-2 bg-brand-cream border border-cream-200 text-ink rounded-[8px] text-[14px] font-medium hover:bg-cream-200 transition-colors"
                            >
                                View All Your Jobs
                            </Link>
                        </div>
                    </div>
                )}
                <section className="flex flex-col gap-3">
                    <h1 className="text-[32px] md:text-[36px] font-semibold text-ink leading-tight">
                        {job.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-5 text-teal-600 text-[14px] font-medium">
                        {job.createdAt && (
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">schedule</span>
                                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            <span>{job.client?.country || "Remote"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">work</span>
                            <span>{job.budgetType || "Fixed-Price"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">info</span>
                            <span className="capitalize">Status: {job.status}</span>
                        </div>
                    </div>
                </section>

                <hr className="border-t border-cream-200" />

                <section className="flex flex-col gap-3">
                    <h2 className="text-[20px] font-semibold text-ink">Job Description</h2>
                    <div className="text-[16px] leading-[1.6] text-ink whitespace-pre-line font-normal">
                        {job.description}
                    </div>
                </section>

                <section className="grid grid-cols-2 sm:grid-cols-3 gap-6 p-6 bg-white rounded-[8px] border border-cream-200 shadow-sm">
                    <div>
                        <span className="block text-[12px] font-medium text-teal-600 mb-0.5">Category</span>
                        <span className="text-[14px] font-medium text-ink">{job.category?.name || "General"}</span>
                    </div>
                    <div>
                        <span className="block text-[12px] font-medium text-teal-600 mb-0.5">Experience Level</span>
                        <span className="text-[14px] font-medium text-ink capitalize">{job.experienceLevel || "Not specified"}</span>
                    </div>
                    <div>
                        <span className="block text-[12px] font-medium text-teal-600 mb-0.5">Duration</span>
                        <span className="text-[14px] font-medium text-ink">{job.duration || "Not specified"}</span>
                    </div>
                    <div>
                        <span className="block text-[12px] font-medium text-teal-600 mb-0.5">Client Name</span>
                        <span className="text-[14px] font-medium text-ink">{job.client?.name || "Client"}</span>
                    </div>
                    {job.deadline && (
                        <div>
                            <span className="block text-[12px] font-medium text-teal-600 mb-0.5">Deadline</span>
                            <span className="text-[14px] font-medium text-ink">
                                {new Date(job.deadline).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </section>

                {job.skills && job.skills.length > 0 && (
                    <section className="flex flex-col gap-3">
                        <h2 className="text-[20px] font-semibold text-ink">Required Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-3.5 py-1 bg-white border border-cream-200 rounded-full text-[13px] font-medium text-teal-600 shadow-xs"
                                >
                                    {typeof skill === "object" ? skill.name : skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}


                {job.attachments && job.attachments.length > 0 && (
                    <section className="flex flex-col gap-3">
                        <h2 className="text-[20px] font-semibold text-ink">Attachments</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.attachments.map((file, idx) => (
                                <a
                                    key={file._id || idx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-cream-200 rounded-[8px] text-[14px] font-medium text-teal-600 hover:border-teal-600 transition-colors shadow-xs"
                                >
                                    <span className="material-symbols-outlined text-[18px]">attach_file</span>
                                    {file.name || `Attachment ${idx + 1}`}
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                <section className="p-6 bg-white rounded-[8px] border border-cream-200 shadow-sm flex flex-col gap-1">
                    <h2 className="text-[20px] font-semibold text-ink mb-1">Project Budget</h2>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[28px] font-semibold text-teal-900">
                            ${job.budgetMin || 0} - ${job.budgetMax || 0}
                        </span>
                        <span className="text-[14px] font-medium text-teal-600 capitalize">
                            {job.budgetType || "Fixed"}
                        </span>
                    </div>
                    <p className="text-[14px] text-teal-600 mt-1 font-normal">
                        Budget is negotiable based on experience and proposed scope.
                    </p>
                </section>
            </div>

            <aside className="w-full md:w-5/12 lg:w-4/12 relative">
                <div className="sticky top-24 bg-white rounded-[8px] border border-cream-200 shadow-sm p-6 flex flex-col gap-5">
                    {isOwner ? (
                        <div className="flex flex-col gap-4">
                            <h3 className="text-[20px] font-semibold text-ink">Proposal Overview</h3>
                            <div className="p-4 bg-brand-cream rounded-[8px] border border-cream-200 text-center">
                                <span className="block text-[32px] font-semibold text-teal-900">
                                    {job.proposalsCount || 0}
                                </span>
                                <span className="text-[14px] font-medium text-teal-600">
                                    Proposals Received
                                </span>
                            </div>
                            <Link
                                to={`/client/jobs/${job._id}/proposals`}
                                className="w-full py-3 bg-accent-sand hover:bg-accent-sand-hover text-white rounded-[8px] text-[14px] font-medium text-center shadow-xs transition-colors block"
                            >
                                Review Proposals ({job.proposalsCount || 0})
                            </Link>
                        </div>
                    ) : isFreelancer ? (
                        job.status === "open" ? (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h3 className="text-[20px] font-semibold text-ink">
                                        Submit Proposal
                                    </h3>
                                    <p className="text-[13px] text-teal-600 mt-0.5">
                                        Send your offer directly to the client
                                    </p>
                                </div>

                                {proposalError && (
                                    <div className="p-3 bg-[#FDECEB] text-brand-danger border border-brand-danger/20 rounded-[8px] text-[13px]">
                                        {proposalError}
                                    </div>
                                )}
                                {proposalSuccess && (
                                    <div className="p-3 bg-[#EEF7F5] text-brand-success border border-brand-success/20 rounded-[8px] text-[13px]">
                                        Proposal submitted successfully!
                                    </div>
                                )}

                                <form onSubmit={handleProposalSubmit} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[13px] font-medium text-ink">
                                                Bid Amount ($) *
                                            </label>
                                            <input
                                                type="number"
                                                name="amount"
                                                value={proposalData.amount}
                                                onChange={handleProposalChange}
                                                required
                                                placeholder="e.g. 5000"
                                                className="w-full px-3 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[13px] font-medium text-ink">
                                                Delivery (Days) *
                                            </label>
                                            <input
                                                type="number"
                                                name="deliveryDays"
                                                value={proposalData.deliveryDays}
                                                onChange={handleProposalChange}
                                                required
                                                placeholder="e.g. 14"
                                                className="w-full px-3 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[13px] font-medium text-ink">
                                            Cover Letter *
                                        </label>
                                        <textarea
                                            name="coverLetter"
                                            rows="4"
                                            value={proposalData.coverLetter}
                                            onChange={handleProposalChange}
                                            required
                                            placeholder="Why are you a good fit for this project?"
                                            className="w-full px-3 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink resize-none transition-all"
                                        />
                                    </div>

                                    <div className="p-3.5 border border-cream-200 rounded-[8px] bg-brand-cream flex flex-col gap-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[13px] font-semibold text-ink">
                                                Optional Milestones
                                            </span>
                                            <button
                                                type="button"
                                                onClick={addMilestone}
                                                className="flex items-center gap-1 px-2.5 py-1 bg-brand-teal text-white rounded-[6px] text-[12px] font-medium hover:opacity-90 transition-opacity"
                                            >
                                                <span className="material-symbols-outlined text-[15px]">add</span>
                                                Add
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                name="title"
                                                placeholder="Milestone Title"
                                                value={milestone.title}
                                                onChange={handleMilestoneChange}
                                                className="w-full px-3 py-1.5 rounded-[8px] border border-cream-200 bg-white text-[13px] text-ink focus:border-teal-600 outline-none"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    placeholder="Amount ($)"
                                                    value={milestone.amount}
                                                    onChange={handleMilestoneChange}
                                                    className="w-full px-3 py-1.5 rounded-[8px] border border-cream-200 bg-white text-[13px] text-ink focus:border-teal-600 outline-none"
                                                />
                                                <input
                                                    type="date"
                                                    name="dueDate"
                                                    value={milestone.dueDate}
                                                    onChange={handleMilestoneChange}
                                                    className="w-full px-3 py-1.5 rounded-[8px] border border-cream-200 bg-white text-[13px] text-ink focus:border-teal-600 outline-none"
                                                />
                                            </div>
                                        </div>

                                        {proposalData.milestones.length > 0 && (
                                            <div className="flex flex-col gap-1.5 mt-1 border-t border-cream-200 pt-2">
                                                {proposalData.milestones.map((m, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between p-2 bg-white rounded-[6px] border border-cream-200 text-[12px]"
                                                    >
                                                        <span className="text-ink">
                                                            {m.title} - ${m.amount}{" "}
                                                            <span className="text-teal-600 text-[11px]">
                                                                ({m.dueDate || "No date"})
                                                            </span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMilestone(idx)}
                                                            className="text-brand-danger font-bold px-1.5 hover:opacity-80"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[13px] font-medium text-ink">
                                            Attachments (Optional)
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <label className="cursor-pointer px-3 py-1.5 border border-cream-200 rounded-[8px] bg-brand-cream hover:bg-cream-200 text-[13px] font-medium text-ink transition-colors">
                                                Choose File
                                                <input
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    disabled={uploadingFile}
                                                    className="hidden"
                                                />
                                            </label>
                                            {uploadingFile && (
                                                <span className="text-[12px] text-teal-600 animate-pulse">
                                                    Uploading...
                                                </span>
                                            )}
                                        </div>

                                        {proposalData.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {proposalData.attachments.map((att) => (
                                                    <span
                                                        key={att.public_id}
                                                        className="flex items-center gap-1 px-2.5 py-0.5 bg-brand-cream border border-cream-200 rounded-full text-[12px] text-teal-600"
                                                    >
                                                        {att.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAttachment(att.public_id)}
                                                            className="text-brand-danger font-bold ml-1"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || uploadingFile}
                                        className="w-full py-3 mt-1 bg-accent-sand hover:bg-accent-sand-hover text-white rounded-[8px] font-medium text-[14px] disabled:opacity-50 transition-colors shadow-xs"
                                    >
                                        {submitting ? "Submitting..." : "Submit Proposal"}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 bg-brand-cream rounded-[8px] text-center border border-cream-200">
                                <p className="text-[14px] font-medium text-teal-600">
                                    This job is not open for proposals.
                                </p>
                            </div>
                        )
                    ) : !user ? (
                        <div className="p-4 bg-brand-cream rounded-[8px] text-center space-y-4 border border-cream-200">
                            <p className="text-[15px] text-ink font-normal">
                                Want to apply for this project?
                            </p>
                            <Link
                                to="/sign-in"
                                className="inline-block w-full py-2.5 bg-accent-sand hover:bg-accent-sand-hover text-white rounded-[8px] text-[14px] font-medium transition-colors"
                            >
                                Sign In as a Freelancer
                            </Link>
                        </div>
                    ) : null}
                </div>
            </aside>
        </div>
    )
}

export default JobDetailsPage