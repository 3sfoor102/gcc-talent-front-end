import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { showJob } from "../services/jobs-service";
import { createProposal } from "../services/proposals-service";
import { uploadToCloudinary } from "../services/upload-service";
import { getMyFreelancerProfile } from "../services/profile-service";
import ReportModal from "../components/ReportModal";

const JobDetailsPage = ({ user }) => {
    const { jobId } = useParams()
    const navigate = useNavigate()

    const todayStr = new Date().toISOString().split("T")[0]

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
    const [milestoneError, setMilestoneError] = useState(null)

    const [isProfileComplete, setIsProfileComplete] = useState(false)
    const [checkingProfile, setCheckingProfile] = useState(true)
    const [showIncompleteModal, setShowIncompleteModal] = useState(false)

    const [isReportModalOpen, setIsReportModalOpen] = useState(false)

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

    useEffect(() => {
        const verifyFreelancerProfile = async () => {
            if (user?.role !== "freelancer") {
                setCheckingProfile(false)
                return
            }

            try {
                setCheckingProfile(true)
                const profile = await getMyFreelancerProfile()

                const complete = Boolean(
                    profile?.headline?.trim() &&
                    profile?.bio?.trim() &&
                    Array.isArray(profile?.skills) &&
                    profile.skills.length > 0 &&
                    profile?.hourlyRate !== undefined &&
                    Number(profile.hourlyRate) > 0
                )
                setIsProfileComplete(complete)
            } catch (err) {
                setIsProfileComplete(false)
            } finally {
                setCheckingProfile(false)
            }
        }

        verifyFreelancerProfile()
    }, [user])

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

    // Check if job deadline is already passed
    const isPastDeadline = job.deadline && new Date(job.deadline) < new Date().setHours(0, 0, 0, 0)

    const handleProposalChange = (event) => {
        const { name, value } = event.target
        setProposalData((prev) => ({ ...prev, [name]: value }))
    }

    const handleMilestoneChange = (event) => {
        const { name, value } = event.target
        setMilestoneError(null)
        setMilestone((prev) => ({ ...prev, [name]: value }))
    }

    const addMilestone = () => {
        setMilestoneError(null)

        if (!milestone.title.trim()) {
            setMilestoneError("Milestone title is required.")
            return
        }

        const amt = Number(milestone.amount)
        if (!amt || amt <= 0) {
            setMilestoneError("Milestone amount must be greater than $0.")
            return
        }

        // Logical Restriction: Due Date cannot be in the past
        if (milestone.dueDate && milestone.dueDate < todayStr) {
            setMilestoneError("Milestone due date cannot be set before today.")
            return
        }

        // Logical Restriction: Milestones should not exceed total proposal bid
        const currentMilestonesSum = proposalData.milestones.reduce((acc, m) => acc + m.amount, 0)
        const totalProposalAmount = Number(proposalData.amount) || 0

        if (totalProposalAmount > 0 && currentMilestonesSum + amt > totalProposalAmount) {
            setMilestoneError(`Total milestone amounts ($${currentMilestonesSum + amt}) cannot exceed your proposal bid ($${totalProposalAmount}).`)
            return
        }

        setProposalData((prev) => ({
            ...prev,
            milestones: [
                ...prev.milestones,
                { ...milestone, amount: amt },
            ],
        }))
        setMilestone(initialMilestoneState)
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

        // Logical Restriction: File size limit check (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setProposalError("Attachment size cannot exceed 10MB.")
            event.target.value = ""
            return
        }

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

        if (!isProfileComplete) {
            setShowIncompleteModal(true)
            return
        }

        const bidAmount = Number(proposalData.amount)
        const delivery = Number(proposalData.deliveryDays)

        if (!bidAmount || bidAmount <= 0) {
            setProposalError("Please enter a valid bid amount greater than 0.")
            return
        }

        if (!delivery || delivery <= 0) {
            setProposalError("Delivery time must be at least 1 day.")
            return
        }

        // Validate milestone sum matches bid amount if milestones are present
        if (proposalData.milestones.length > 0) {
            const milestoneSum = proposalData.milestones.reduce((acc, m) => acc + m.amount, 0)
            if (milestoneSum !== bidAmount) {
                setProposalError(`Milestones sum ($${milestoneSum}) must match the total bid amount ($${bidAmount}).`)
                return
            }
        }

        setSubmitting(true)
        setProposalError(null)
        try {
            await createProposal(job._id, {
                coverLetter: proposalData.coverLetter.trim(),
                amount: bidAmount,
                deliveryDays: delivery,
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
        <div className="w-full max-w-[1280px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 items-start relative">
            <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col gap-8">
                {isOwner && (
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-[8px] border border-cream-200 shadow-sm">
                        <span className="text-[14px] font-medium text-ink">
                            You are managing this posting
                        </span>
                        <div className="flex gap-2">
                            <Link
                                to={`/client/jobs/${job._id}/edit`}
                                className="px-4 py-2 bg-brand-teal text-white rounded-[8px] text-[14px] font-medium hover:opacity-90 transition-opacity no-underline"
                            >
                                Edit Job
                            </Link>
                            <Link
                                to="/client/jobs"
                                className="px-4 py-2 bg-brand-cream border border-cream-200 text-ink rounded-[8px] text-[14px] font-medium hover:bg-cream-200 transition-colors no-underline"
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
                        <Link
                            to={`/clients/${job.client?._id || job.client}`}
                            className="text-[14px] font-medium text-brand-teal hover:underline"
                        >
                            {job.client?.name || "Client Profile"}
                        </Link>
                    </div>
                    {job.deadline && (
                        <div>
                            <span className="block text-[12px] font-medium text-teal-600 mb-0.5">Deadline</span>
                            <span className={`text-[14px] font-medium ${isPastDeadline ? "text-brand-danger font-bold" : "text-ink"}`}>
                                {new Date(job.deadline).toLocaleDateString()} {isPastDeadline && "(Expired)"}
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
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-cream-200 rounded-[8px] text-[14px] font-medium text-teal-600 hover:border-teal-600 transition-colors shadow-xs no-underline"
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
                <div className="sticky top-24">
                    <div className="bg-white rounded-[8px] border border-cream-200 shadow-sm p-6 flex flex-col gap-5">
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
                                    className="w-full py-3 bg-accent-sand hover:bg-[#B8956B] text-brand-teal rounded-[8px] text-[14px] font-semibold text-center shadow-xs transition-colors block no-underline"
                                >
                                    Review Proposals ({job.proposalsCount || 0})
                                </Link>
                            </div>
                        ) : isFreelancer ? (
                            isPastDeadline ? (
                                <div className="p-4 bg-amber-50 rounded-[8px] text-center border border-amber-200">
                                    <p className="text-[14px] font-medium text-amber-800 m-0">
                                        This job deadline has expired. New proposals are no longer accepted.
                                    </p>
                                </div>
                            ) : job.status === "open" ? (
                                checkingProfile ? (
                                    <div className="p-6 text-center text-teal-600 animate-pulse text-[14px]">
                                        Checking profile readiness...
                                    </div>
                                ) : !isProfileComplete ? (
                                    <div className="flex flex-col gap-3 p-4 bg-amber-50/60 border border-amber-200 rounded-[8px] text-center">
                                        <span className="text-2xl">⚠️</span>
                                        <h4 className="text-[16px] font-bold text-ink">Profile Setup Required</h4>
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                            You must add your headline, bio, hourly rate, and skills before submitting proposals on jobs.
                                        </p>
                                        <Link
                                            to="/freelancer/profile"
                                            className="mt-2 w-full py-2.5 bg-brand-teal hover:bg-teal-900 text-white rounded-[8px] text-[13px] font-semibold transition-colors no-underline block"
                                        >
                                            Complete Profile
                                        </Link>
                                    </div>
                                ) : (
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
                                                        min="1"
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
                                                        min="1"
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
                                                        className="flex items-center gap-1 px-2.5 py-1 bg-brand-teal text-white rounded-[6px] text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer border-0"
                                                    >
                                                        <span className="material-symbols-outlined text-[15px]">add</span>
                                                        Add
                                                    </button>
                                                </div>

                                                {milestoneError && (
                                                    <p className="text-xs text-brand-danger m-0 font-medium">{milestoneError}</p>
                                                )}

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
                                                            min="1"
                                                            name="amount"
                                                            placeholder="Amount ($)"
                                                            value={milestone.amount}
                                                            onChange={handleMilestoneChange}
                                                            className="w-full px-3 py-1.5 rounded-[8px] border border-cream-200 bg-white text-[13px] text-ink focus:border-teal-600 outline-none"
                                                        />
                                                        <input
                                                            type="date"
                                                            min={todayStr}
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
                                                                    className="text-brand-danger font-bold px-1.5 hover:opacity-80 cursor-pointer border-0 bg-transparent"
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
                                                                    className="text-brand-danger font-bold ml-1 cursor-pointer border-0 bg-transparent"
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
                                                className="w-full py-3 mt-1 bg-brand-teal hover:bg-teal-900 text-white rounded-[8px] font-semibold text-[14px] disabled:opacity-50 transition-colors shadow-xs cursor-pointer border-0"
                                            >
                                                {submitting ? "Submitting..." : "Submit Proposal"}
                                            </button>
                                        </form>
                                    </div>
                                )
                            ) : (
                                <div className="p-4 bg-brand-cream rounded-[8px] text-center border border-cream-200">
                                    <p className="text-[14px] font-medium text-teal-600 m-0">
                                        This job is not open for proposals.
                                    </p>
                                </div>
                            )
                        ) : !user ? (
                            <div className="p-4 bg-brand-cream rounded-[8px] text-center space-y-4 border border-cream-200">
                                <p className="text-[15px] text-ink font-normal m-0">
                                    Want to apply for this project?
                                </p>
                                <Link
                                    to="/sign-in"
                                    className="inline-block w-full py-2.5 bg-brand-teal hover:bg-teal-900 text-white rounded-[8px] text-[14px] font-semibold transition-colors no-underline"
                                >
                                    Sign In as a Freelancer
                                </Link>
                            </div>
                        ) : (
                            /* Rendered when logged in as a non-owner Client or Admin */
                            <div className="flex flex-col gap-3 p-4 bg-brand-cream/40 rounded-[8px] border border-cream-200 text-center">
                                <div className="w-10 h-10 rounded-full bg-cream-200 text-brand-teal flex items-center justify-center mx-auto">
                                    <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
                                </div>
                                <h4 className="text-sm font-bold text-ink m-0">Client Overview</h4>
                                <p className="text-xs text-gray-500 m-0 leading-relaxed">
                                    You are viewing this posting with a client account. Proposals can only be submitted by registered freelancers.
                                </p>
                                <div className="flex flex-col gap-2 pt-2 border-t border-cream-200">
                                    <Link
                                        to="/freelancers"
                                        className="w-full py-2 bg-brand-teal hover:bg-teal-900 text-white rounded-[6px] text-xs font-semibold no-underline transition-colors block text-center"
                                    >
                                        Find Talent Instead
                                    </Link>
                                    <Link
                                        to="/client/jobs/new"
                                        className="w-full py-2 bg-white hover:bg-cream-100 text-ink border border-cream-200 rounded-[6px] text-xs font-semibold no-underline transition-colors block text-center"
                                    >
                                        Post Your Own Job
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isOwner && user && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="text-gray-400 hover:text-brand-danger text-[13px] flex items-center justify-center gap-1.5 mx-auto bg-transparent border-0 cursor-pointer transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">flag</span>
                                Report this job
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Incomplete Profile Prompt Modal */}
            {showIncompleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-cream-200 text-center">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-amber-200">
                            ⚠️
                        </div>

                        <h3 className="text-lg font-bold text-ink mb-2">Complete Your Profile First</h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Clients evaluate your skills and experience before hiring. Please specify your{" "}
                            <span className="font-semibold text-ink">headline, bio, hourly rate, and skills</span> before submitting bids.
                        </p>

                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowIncompleteModal(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <Link
                                to="/freelancer/profile"
                                className="px-4 py-2 text-xs font-semibold bg-brand-teal text-white rounded-lg hover:bg-teal-900 transition no-underline flex items-center gap-1 cursor-pointer"
                            >
                                Edit Profile Now →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {job && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    targetType="Job"
                    targetId={job._id}
                />
            )}
        </div>
    )
}

export default JobDetailsPage