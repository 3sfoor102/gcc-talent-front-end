import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { showJob } from "../services/jobs-service";

const JobDetailsPage = ({ user }) => {
    const { jobId } = useParams()
    const navigate = useNavigate();

    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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

    return (
        <div>

            {isOwner && (
                <div>
                    <Link to={`/jobs/${job._id}/edit`}>Edit Job</Link>
                    <Link to="/jobs/my-jobs">View All Your Jobs</Link>
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
                    <div>
                        <p><strong>Proposals Received:</strong> {job.proposalsCount || 0}</p>
                        <Link to={`/jobs/${job._id}/proposals`}>View Received Proposals</Link>
                    </div>
                ) : (
                    <div>
                        {job.status === "open" ? (
                            <button onClick={() => navigate(`/jobs/${job._id}/apply`)}>
                                Submit a Proposal
                            </button>
                        ) : (
                            <p>This job is no longer accepting proposals.</p>
                        )}
                    </div>
                )}
            </div>

        </div>
    )
}

export default JobDetailsPage;