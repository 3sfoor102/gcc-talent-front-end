import { useState, useEffect } from "react";
import { getAdminReports, updateReportStatus } from "../services/admin-service";

const ManageReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [modalError, setModalError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getAdminReports();
                setReports(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const openStatusModal = (report) => {
        setSelectedReport(report);
        setNewStatus(report.status);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setModalError(null);

        try {
            const updated = await updateReportStatus(selectedReport._id, newStatus);
            setReports(reports.map(r => r._id === updated._id ? updated : r));
            setIsModalOpen(false);
        } catch (err) {
            setModalError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'resolved': return 'bg-[#EEF7F5] text-brand-success';
            case 'reviewed': return 'bg-blue-50 text-blue-600';
            default: return 'bg-[#FFF8EE] text-brand-warning';
        }
    };

    if (loading) return <div className="min-h-screen bg-brand-cream py-20 flex justify-center text-teal-600 font-bold animate-pulse">Loading Reports...</div>;

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6 relative">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-ink m-0">Reports & Disputes</h1>
                    <p className="text-teal-600 mt-2 m-0">Review user reports and platform disputes.</p>
                </header>

                {error && <div className="mb-6 p-4 bg-[#FDECEB] text-brand-danger border border-brand-danger/20 rounded-lg">{error}</div>}

                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-cream border-b border-cream-200">
                                    <th className="p-4 font-bold text-teal-900">Reporter</th>
                                    <th className="p-4 font-bold text-teal-900">Target Type</th>
                                    <th className="p-4 font-bold text-teal-900">Reason</th>
                                    <th className="p-4 font-bold text-teal-900">Status</th>
                                    <th className="p-4 font-bold text-teal-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500">No reports found. The platform is peaceful!</td>
                                    </tr>
                                ) : (
                                    reports.map(report => (
                                        <tr key={report._id} className="border-b border-cream-200/50 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-ink flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-cream-200 text-brand-teal flex items-center justify-center font-bold overflow-hidden shrink-0">
                                                    {report.reporter?.avatarUrl ? <img src={report.reporter.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : report.reporter?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{report.reporter?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                                    {report.targetType}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600 text-sm max-w-xs truncate" title={report.reason}>
                                                {report.reason}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => openStatusModal(report)}
                                                    className="px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border-0 bg-brand-cream text-brand-teal hover:bg-cream-200"
                                                >
                                                    Update Status
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fadeIn">
                        <h3 className="text-xl font-bold text-ink mb-2 m-0">Update Report Status</h3>
                        <p className="text-gray-500 mb-4 text-sm m-0 leading-relaxed">
                            Change the current status of this report.
                        </p>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700">
                            <strong>Reason:</strong> <br/>
                            {selectedReport.reason}
                        </div>

                        {modalError && (
                            <div className="mb-4 p-3 bg-[#FDECEB] text-brand-danger rounded-lg text-xs font-medium border border-brand-danger/20">
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleUpdateStatus} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-ink">New Status</label>
                                <select 
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-cream-200 focus:outline-none focus:border-brand-teal focus:ring-1 bg-white cursor-pointer"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="banned">Resolved & Ban User 🔨</option>
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end mt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)} 
                                    disabled={isProcessing}
                                    className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isProcessing}
                                    className="px-5 py-2.5 rounded-lg bg-brand-teal text-white font-bold hover:bg-teal-900 transition-colors border-0 cursor-pointer disabled:opacity-50 min-w-[100px]"
                                >
                                    {isProcessing ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReports;