import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { showJob } from "../services/jobs-service";

const JobDetailsPage = () => {
    const { jobId } = useParams()

    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await showJob(jobId);
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

    return (
        <div>

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

        </div>
    )
}

export default JobDetailsPage;