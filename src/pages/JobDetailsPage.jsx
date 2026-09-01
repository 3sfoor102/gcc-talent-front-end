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

    const [isModalOpen, setIsModalOpen] = useState(false)
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
                setError(err.response?.data?.error?.message || err.message || "Failed to load job details.")
            } finally {
                setLoading(false)
            }
        }

        if (jobId) fetchJob()
    }, [jobId])

    if (loading) return <p>Loading job...</p>
    if (error) return <p>{error}</p>
    if (!job) return <p>No job found.</p>

    const currentUserId = user?._id || user?.id || user?.userId;
    const jobClientId = job.client?._id || job.client;
    const isOwner = Boolean(currentUserId && jobClientId && currentUserId.toString() === jobClientId.toString());
    const isFreelancer = user?.role === "freelancer";

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
            milestones: [...prev.milestones, { ...milestone, amount: Number(milestone.amount) }]
        }))
        setMilestone({ title: "", amount: "", dueDate: "" })
    }
    const removeMilestone = (index) => {
        setProposalData((prev) => ({
            ...prev,
            milestones: prev.milestones.filter((_, idx) => idx !== index)
        }))
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0]
        if (!file) { return }

        setUploadingFile(true)
        setProposalError(null)
        try {
            const uploadedAttachment = await uploadToCloudinary(file)
            setProposalData((prev) => ({
                ...prev,
                attachments: [...prev.attachments, uploadedAttachment]
            }))
        } catch (err) {
            setProposalError(err.response?.data?.error?.message || err.message || "Failed to upload file.")
        } finally {
            setUploadingFile(false)
            event.target.value = ""
        }
    }

    const removeAttachment = (publicId) => {
        setProposalData((prev) => ({
            ...prev,
            attachments: prev.attachments.filter((item) => item.public_id !== publicId)
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
                attachments: proposalData.attachments
            })

            setProposalSuccess(true)
            setTimeout(() => {
                setIsModalOpen(false)
                setProposalSuccess(false)
                setProposalData(initialProposalForm)
            }, 1500)
        } catch (err) {
            setProposalError(err.response?.data?.error?.message || err.message || "Failed to submit proposal.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>

            {isOwner && (
                <div>
                    <Link to={`/client/jobs/${job._id}/edit`}>Edit Job</Link>
                    <Link to="/client/jobs">View All Your Jobs</Link>
                    <Link to={`/client/jobs/${job._id}/proposals`}>View Proposals ({job.proposalsCount || 0})</Link>
                </div>
            )}

            <h2>{job.title}</h2>
            <p>{job.description}</p>

            <ul>

                <li><strong>Status:</strong> {job.status}</li>
                <li><strong>Category:</strong> {job.category?.name || "General"}</li>
                <li><strong>Type:</strong> {job.budgetType}</li>
                <li><strong>Budget:</strong> ${job.budgetMin || 0} - ${job.budgetMax || 0}</li>
                <li><strong>Experience Level:</strong> {job.experienceLevel || "Not specified"}</li>
                <li><strong>Duration:</strong> {job.duration || "Not specified"}</li>
                <li><strong>Client:</strong> {job.client.name}</li>

                {job.client?.country && <li><strong>Location:</strong> {job.client.country}</li>}

                {job.deadline && (
                    <li><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</li>
                )}

            </ul>

            {job.skills && job.skills.length > 0 && (
                <p>
                    <strong>Skills:</strong>{" "}
                    {job.skills.map((skill) => (typeof skill === "object" ? skill.name : skill)).join(", ")}
                </p>
            )}

            {job.attachments && job.attachments.length > 0 && (
                <div>
                    <h4>Attachments</h4>
                    <ul>
                        {job.attachments.map((file, idx) => (
                            <li key={file._id || idx}>
                                <a href={file.url} target="_blank" rel="noreferrer">
                                    {file.name || `Attachment ${idx + 1}`}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <hr />

            <div>
                {isOwner ? (
                    <Link to={`/client/jobs/${job._id}/proposals`}>
                        <button type="button">Review Proposals ({job.proposalsCount || 0})</button>
                    </Link>
                ) : isFreelancer ? (
                    job.status === "open" ? (
                        <button type="button" onClick={() => setIsModalOpen(true)}>
                            Submit a Proposal
                        </button>
                    ) : (
                        <p>This job is not open for proposals.</p>
                    )
                ) : !user ? (
                    <p>Please <Link to="/sign-in">Sign In</Link> as a freelancer to submit a proposal.</p>
                ) : null}
            </div>

            {isModalOpen && (
                <div>
                    <div>
                        <h3>Submit Proposal for {job.title}</h3>

                        {proposalError && <p>{proposalError}</p>}
                        {proposalSuccess && <p>Proposal submitted successfully!</p>}

                        <form onSubmit={handleProposalSubmit}>
                            <div>
                                <label>Cover Letter: </label>
                                <textarea
                                    name="coverLetter"
                                    rows="4"
                                    value={proposalData.coverLetter}
                                    onChange={handleProposalChange}
                                    required
                                />
                            </div>

                            <div>
                                <label>Bid Amount ($): </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={proposalData.amount}
                                    onChange={handleProposalChange}
                                    required
                                />
                            </div>

                            <div>
                                <label>Delivery (Days): </label>
                                <input
                                    type="number"
                                    name="deliveryDays"
                                    value={proposalData.deliveryDays}
                                    onChange={handleProposalChange}
                                    required
                                />
                            </div>

                            <fieldset>
                                <legend>Optional Milestones</legend>
                                <div>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Milestone Title"
                                        value={milestone.title}
                                        onChange={handleMilestoneChange}
                                    />
                                    <input
                                        type="number"
                                        name="amount"
                                        placeholder="Amount ($)"
                                        value={milestone.amount}
                                        onChange={handleMilestoneChange}
                                    />
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={milestone.dueDate}
                                        onChange={handleMilestoneChange}
                                    />
                                    <button type="button" onClick={addMilestone}>Add</button>
                                </div>

                                {proposalData.milestones.length > 0 && (
                                    <ul>
                                        {proposalData.milestones.map((m, idx) => (
                                            <li key={idx}>
                                                {m.title} - ${m.amount} ({m.dueDate || "No due date"})
                                                <button type="button" onClick={() => removeMilestone(idx)}>x</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </fieldset>

                            <div>
                                <label>Attachments: </label>
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    disabled={uploadingFile}
                                />
                                {uploadingFile && <span> Uploading...</span>}

                                {proposalData.attachments.length > 0 && (
                                    <ul>
                                        {proposalData.attachments.map((att) => (
                                            <li key={att.public_id}>
                                                {att.name}
                                                <button type="button" onClick={() => removeAttachment(att.public_id)}>x</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <button type="submit" disabled={submitting || uploadingFile}>
                                    {submitting ? "Submitting..." : "Send Proposal"}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

export default JobDetailsPage