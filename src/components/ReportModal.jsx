import { useState } from "react";
import { submitReport } from "../services/report-service";

const ReportModal = ({ isOpen, onClose, targetType, targetId }) => {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError("Please provide a reason for this report.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await submitReport(targetType, targetId, reason);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setReason("");
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-fadeIn">
                
                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-[#EEF7F5] text-brand-success rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-[32px]">check_circle</span>
                        </div>
                        <h3 className="text-xl font-bold text-ink mb-2">Report Submitted</h3>
                        <p className="text-gray-500">Thank you. Our admins will review this shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-brand-danger flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">flag</span>
                            </div>
                            <h3 className="text-xl font-bold text-ink m-0">Report {targetType}</h3>
                        </div>
                        
                        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                            Please describe why you are reporting this {targetType.toLowerCase()}. This information will be sent to our admin team.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-[#FDECEB] text-brand-danger rounded-lg text-xs font-medium border border-brand-danger/20">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <textarea
                                rows="4"
                                placeholder="Describe the issue in detail..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:outline-none focus:border-brand-danger focus:ring-1 bg-gray-50 resize-none text-sm"
                                required
                            />

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-lg bg-brand-danger text-white font-bold hover:bg-red-700 transition-colors border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                                >
                                    {isSubmitting ? 'Sending...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportModal;