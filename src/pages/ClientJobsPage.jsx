import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { getClientJobs, deleteJob, closeJob, reopenJob } from '../services/jobs-service';

const ClientJobsPage = () => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [status, setStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0 });
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    const [jobToDelete, setJobToDelete] = useState(null);

    const fetchMyJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = { page: currentPage, limit: 12 };
            if (status) filters.status = status;

            const response = await getClientJobs(filters);
            setJobs(response.data || []);
            setMeta(response.meta || { page: 1, limit: 12, total: response.data?.length || 0 });
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to load client jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyJobs();
    }, [currentPage, status]);

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setCurrentPage(1);
    };

    const executeDelete = async () => {
        if (!jobToDelete) return;

        // Restriction: Only drafts or zero-proposal jobs should be allowed to be deleted
        if (jobToDelete.status !== 'draft' && (jobToDelete.proposalsCount || 0) > 0) {
            setError('Cannot delete an active job with submitted proposals. Close it instead.');
            setJobToDelete(null);
            return;
        }

        setActionLoading(true);
        setError(null);
        try {
            await deleteJob(jobToDelete._id);
            setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobToDelete._id));
            setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            setJobToDelete(null);
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to delete job');
            setJobToDelete(null);
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleClose = async (job) => {
        // Restriction: in_progress or completed jobs cannot be manually toggled to closed/open here
        if (job.status === 'in_progress' || job.status === 'completed') {
            setError(`Cannot modify status directly. This job is currently ${job.status.replace('_', ' ')}.`);
            return;
        }

        setActionLoading(true);
        setError(null);
        try {
            let updated;
            if (job.status === 'open') {
                updated = await closeJob(job._id);
            } else if (job.status === 'closed') {
                updated = await reopenJob(job._id);
            }

            setJobs((prevJobs) =>
                prevJobs.map((item) => (item._id === job._id ? { ...item, status: updated?.status || item.status } : item))
            );
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to change job status');
        } finally {
            setActionLoading(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 12)));

    const getStatusBadge = (jobStatus) => {
        switch (jobStatus) {
            case 'open':
                return 'bg-[#EEF7F5] text-brand-success border-brand-success/20';
            case 'draft':
                return 'bg-brand-cream text-teal-600 border-cream-200';
            case 'in_progress':
                return 'bg-[#FFF8EE] text-brand-warning border-brand-warning/30';
            case 'completed':
                return 'bg-[#EEF7F5] text-brand-success border-brand-success/20';
            case 'closed':
                return 'bg-[#FDECEB] text-brand-danger border-brand-danger/20';
            default:
                return 'bg-brand-cream text-teal-600 border-cream-200';
        }
    };

    return (
        <div className="w-full max-w-[1280px] mx-auto px-6 py-10 flex flex-col gap-8 relative">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[30px] font-semibold text-ink leading-tight">My Posted Jobs</h1>
                    <p className="text-[14px] text-teal-600 mt-1">
                        Manage your listings, review incoming proposals, and monitor status.
                    </p>
                </div>
                <Link
                    to="/client/jobs/new"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-teal hover:bg-teal-900 text-white rounded-[8px] text-[14px] font-medium shadow-xs transition-colors no-underline"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Post a New Job
                </Link>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-[8px] border border-cream-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-teal-600">filter_list</span>
                    <label htmlFor="status-select" className="text-[14px] font-medium text-ink">
                        Status:
                    </label>
                    <select
                        id="status-select"
                        value={status}
                        onChange={handleStatusChange}
                        className="px-3 py-1.5 rounded-[8px] border border-cream-200 bg-brand-cream text-[14px] text-ink focus:bg-white focus:border-teal-600 outline-none transition-colors"
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <span className="text-[13px] text-teal-600 font-medium">
                    Total: <strong className="text-ink">{meta.total || 0}</strong> jobs
                </span>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="p-4 bg-[#FDECEB] text-brand-danger border border-brand-danger/20 rounded-[8px] text-[14px] flex justify-between items-center">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="text-brand-danger font-bold border-0 bg-transparent cursor-pointer text-sm"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="min-h-[30vh] flex items-center justify-center">
                    <p className="text-[16px] text-teal-600 animate-pulse font-medium">Loading your jobs...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && jobs.length === 0 && (
                <div className="p-12 text-center bg-white border border-cream-200 rounded-[8px] shadow-sm flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-[42px] text-teal-600/40">work_outline</span>
                    <p className="text-[16px] font-medium text-ink">No jobs found.</p>
                    <p className="text-[14px] text-teal-600 max-w-sm">
                        You haven't posted any jobs under this status yet.
                    </p>
                    <Link
                        to="/client/jobs/new"
                        className="mt-2 px-4 py-2 bg-brand-teal text-white rounded-[8px] text-[14px] font-medium no-underline hover:bg-teal-900 transition-colors"
                    >
                        Create Your First Job
                    </Link>
                </div>
            )}

            {/* Job Cards Grid */}
            {!loading && !error && jobs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <article
                            key={job._id}
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            className="p-6 bg-white border border-cream-200 rounded-[8px] shadow-sm flex flex-col justify-between gap-5 hover:border-teal-600 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium uppercase tracking-wider ${getStatusBadge(
                                            job.status
                                        )}`}
                                    >
                                        {job.status?.replace('_', ' ')}
                                    </span>
                                    <Link
                                        to={`/client/jobs/${job._id}/proposals`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-1 text-[13px] font-medium text-teal-600 hover:text-ink transition-colors no-underline"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">mail</span>
                                        {job.proposalsCount || 0} Proposals
                                    </Link>
                                </div>

                                <h3 className="text-[18px] font-semibold text-ink leading-snug line-clamp-2 group-hover:text-teal-600 transition-colors">
                                    {job.title}
                                </h3>

                                <div className="flex items-baseline gap-1 text-[14px] text-teal-600">
                                    <span className="font-semibold text-teal-900 text-[16px]">
                                        ${job.budgetMin || 0} - ${job.budgetMax || 0}
                                    </span>
                                    <span className="text-[12px] capitalize">({job.budgetType})</span>
                                </div>
                            </div>

                            {/* Action Toolbar */}
                            <div
                                className="pt-4 border-t border-cream-200 flex items-center justify-between gap-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-2">
                                    {(job.status === 'open' || job.status === 'draft') && (
                                        <Link
                                            to={`/client/jobs/${job._id}/edit`}
                                            className="px-3 py-1.5 bg-brand-cream border border-cream-200 hover:bg-cream-200 rounded-[6px] text-[12px] font-medium text-ink transition-colors no-underline"
                                        >
                                            Edit
                                        </Link>
                                    )}

                                    {job.status === 'open' && (
                                        <button
                                            type="button"
                                            onClick={() => handleToggleClose(job)}
                                            disabled={actionLoading}
                                            className="px-3 py-1.5 border border-cream-200 hover:border-teal-600 text-teal-600 rounded-[6px] text-[12px] font-medium transition-colors bg-white cursor-pointer disabled:opacity-50"
                                        >
                                            Close
                                        </button>
                                    )}

                                    {job.status === 'closed' && (
                                        <button
                                            type="button"
                                            onClick={() => handleToggleClose(job)}
                                            disabled={actionLoading}
                                            className="px-3 py-1.5 bg-brand-teal text-white rounded-[6px] text-[12px] font-medium hover:bg-teal-900 transition-colors border-0 cursor-pointer disabled:opacity-50"
                                        >
                                            Reopen
                                        </button>
                                    )}
                                </div>

                                {job.status === 'draft' && (
                                    <button
                                        type="button"
                                        onClick={() => setJobToDelete(job)}
                                        disabled={actionLoading}
                                        className="p-1.5 text-brand-danger/70 hover:text-brand-danger rounded-[6px] transition-colors border-0 bg-transparent cursor-pointer"
                                        title="Delete Draft"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-6">
                    <button
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage <= 1 || loading}
                        className="px-4 py-2 bg-white border border-cream-200 text-ink rounded-[8px] text-[13px] font-medium disabled:opacity-40 hover:bg-cream-100 transition-colors shadow-xs cursor-pointer"
                    >
                        Previous
                    </button>
                    <span className="text-[13px] font-medium text-teal-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage >= totalPages || loading}
                        className="px-4 py-2 bg-white border border-cream-200 text-ink rounded-[8px] text-[13px] font-medium disabled:opacity-40 hover:bg-cream-100 transition-colors shadow-xs cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Confirmation Modal for Job Deletion */}
            {jobToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-cream-200 animate-fadeIn">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-brand-danger flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-2xl">delete_forever</span>
                        </div>
                        <h3 className="text-lg font-bold text-ink mb-1 m-0">Delete Job Listing?</h3>
                        <p className="text-xs text-gray-500 mb-6 leading-relaxed m-0">
                            Are you sure you want to delete <strong className="text-ink">"{jobToDelete.title}"</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setJobToDelete(null)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                disabled={actionLoading}
                                className="px-4 py-2 text-xs font-bold bg-brand-danger text-white rounded-lg hover:bg-red-700 transition-colors border-0 cursor-pointer disabled:opacity-50 min-w-[80px]"
                            >
                                {actionLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientJobsPage;