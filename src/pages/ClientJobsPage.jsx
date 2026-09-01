import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getClientJobs, deleteJob, closeJob, reopenJob } from '../services/jobs-service';

const ClientJobsPage = () => {
    const [jobs, setJobs] = useState([])
    const [status, setStatus] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0 })
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState(null)

    const [confirmDeleteId, setConfirmDeleteId] = useState(null)

    const fetchMyJobs = async () => {
        setLoading(true)
        setError(null)
        try {
            const filters = { page: currentPage, limit: 12 }
            if (status) filters.status = status

            const response = await getClientJobs(filters)
            setJobs(response.data)
            setMeta(response.meta)
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to load client jobs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMyJobs()
    }, [currentPage, status])

    const handleStatusChange = (event) => {
        setStatus(event.target.value)
        setCurrentPage(1)
    }

    const executeDelete = async (jobId) => {

        setActionLoading(true)
        setError(null)
        try {
            await deleteJob(jobId)
            setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId))
            setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
            setConfirmDeleteId(null)
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to delete job')
        } finally {
            setActionLoading(false)
        }
    }

    const handleToggleClose = async (job) => {
        setActionLoading(true)
        setError(null)
        try {
            let updated
            if (job.status === 'open') {
                updated = await closeJob(job._id)
            } else if (job.status === 'closed') {
                updated = await reopenJob(job._id)
            }

            setJobs((prevJobs) =>
                prevJobs.map((item) => (item._id === job._id ? { ...item, status: updated.status } : item))
            )
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to change job status')
        } finally {
            setActionLoading(false)
        }
    }

    const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 12)))

    return (
        <div>
            <div>
                <h2>My Posted Jobs</h2>
                <Link to="/jobs/new">Post a New Job</Link>
            </div>

            <div>
                <label htmlFor="status-select">Filter by Status: </label>
                <select id="status-select" value={status} onChange={handleStatusChange}>
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            <hr />

            {loading && <p>Loading your jobs...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && jobs.length === 0 && <p>No jobs found.</p>}

            {!loading && !error && jobs.length > 0 && (
                <>
                    <div>
                        {jobs.map((job) => (
                            <article key={job._id}>
                                <h3>
                                    <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                                </h3>
                                <p><strong>Status:</strong> {job.status}</p>
                                <p><strong>Proposals:</strong> {job.proposalsCount || 0}</p>
                                <p><strong>Budget:</strong> ${job.budgetMin || 0} - ${job.budgetMax || 0} ({job.budgetType})</p>

                                <div>
                                    {(job.status === 'open' || job.status === 'draft') && (
                                        <>
                                            <Link to={`/jobs/${job._id}/edit`}>Edit</Link>
                                            <span> | </span>
                                        </>
                                    )}

                                    {job.status === 'open' && (
                                        <>
                                            <button onClick={() => handleToggleClose(job)} disabled={actionLoading}>
                                                Close Job
                                            </button>
                                            <span> | </span>
                                        </>
                                    )}

                                    {job.status === 'closed' && (
                                        <>
                                            <button onClick={() => handleToggleClose(job)} disabled={actionLoading}>
                                                Reopen Job
                                            </button>
                                            <span> | </span>
                                        </>
                                    )}

                                    {job.status === 'draft' && (
                                        <>
                                            {confirmDeleteId === job._id ? (
                                                <span>
                                                    <span>Are you sure? </span>
                                                    <button
                                                        onClick={() => executeDelete(job._id)}
                                                        disabled={actionLoading}
                                                    >
                                                        Yes, Delete
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        disabled={actionLoading}
                                                    >
                                                        Cancel
                                                    </button>
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmDeleteId(job._id)}
                                                    disabled={actionLoading}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                                <hr />
                            </article>
                        ))}
                    </div>

                    <div>
                        <button
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            disabled={currentPage <= 1 || loading}
                        >
                            Previous
                        </button>
                        <span> Page {currentPage} of {totalPages} </span>
                        <button
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            disabled={currentPage >= totalPages || loading}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default ClientJobsPage