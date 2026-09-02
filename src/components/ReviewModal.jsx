import { useState } from 'react';
import { submitContractReview } from '../services/review-service';

const ReviewModal = ({ contract, targetUser, isOpen, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [scores, setScores] = useState({ communication: 5, quality: 5, timeliness: 5, })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!rating) {
            setError('Please select an overall star rating.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            await submitContractReview(contract._id, {
                rating,
                comment: comment.trim(),
                scores,
            })
            if (onSuccess) onSuccess()
            onClose()
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to submit review')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-cream-200 animate-fadeIn">
                <div className="flex justify-between items-center mb-4 border-b border-cream-100 pb-3">
                    <div>
                        <h3 className="text-lg font-bold text-ink m-0">Leave a Review</h3>
                        <p className="text-xs text-gray-500 m-0 mt-0.5">
                            Reviewing <span className="font-semibold text-ink">{targetUser?.name || 'Partner'}</span> for contract: <span className="italic">{contract?.title}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-ink border-0 bg-transparent cursor-pointer p-1"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-ink mb-1.5">
                            Overall Rating
                        </label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="bg-transparent border-0 cursor-pointer p-1 text-amber-400 hover:scale-110 transition-transform"
                                >
                                    <span
                                        className="material-symbols-outlined text-3xl"
                                        style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        star
                                    </span>
                                </button>
                            ))}
                            <span className="text-sm font-bold text-ink ml-2">{rating} / 5</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-brand-cream/30 p-3 rounded-xl border border-cream-200">
                        {['communication', 'quality', 'timeliness'].map((criterion) => (
                            <div key={criterion} className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-gray-600 capitalize">
                                    {criterion}
                                </label>
                                <select
                                    value={scores[criterion]}
                                    onChange={(e) =>
                                        setScores({ ...scores, [criterion]: Number(e.target.value) })
                                    }
                                    className="bg-white border border-cream-200 rounded-lg py-1 px-2 text-xs text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                                >
                                    {[5, 4, 3, 2, 1].map((val) => (
                                        <option key={val} value={val}>
                                            {val} ★
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-ink mb-1">
                            Your Feedback
                        </label>
                        <textarea
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="How was your experience working on this contract?"
                            className="w-full bg-[#f8faf9] border border-cream-200 rounded-xl p-3 text-xs text-ink placeholder:text-gray-400 focus:outline-none focus:border-brand-teal resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-cream-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg border-0 bg-transparent cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 text-xs font-bold bg-brand-teal text-white rounded-lg hover:bg-teal-900 transition-colors border-0 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReviewModal