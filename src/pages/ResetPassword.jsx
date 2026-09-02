import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router"
import { resetPassword } from "../services/auth-service"

const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' })
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (formData.newPassword !== formData.confirmPassword) {
            setIsError(true)
            setMessage('Passwords do not match.')
            return
        }

        setLoading(true)
        setMessage('')
        setIsError(false)

        try {
            const resMessage = await resetPassword(token, formData.newPassword)
            setMessage(resMessage)
            setIsSuccess(true)
        } catch (err) {
            setIsError(true)
            setMessage(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative text-gray-900 bg-brand-cream">
            <main className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-cream-200 z-10">
                <header className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-ink mb-1">Set New Password</h1>
                    <p className="text-sm text-gray-500 m-0">Please enter your new password below.</p>
                </header>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium text-center border ${isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-[#2F7D6D]/10 text-[#2F7D6D] border-[#2F7D6D]/20'}`}>
                        {message}
                    </div>
                )}

                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-ink">New Password</label>
                            <input type="password" name="newPassword" value={formData.newPassword} className="w-full px-4 py-3 rounded-lg border border-cream-200 focus:outline-none focus:border-brand-teal focus:ring-1" minLength="8" required onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-ink">Confirm Password</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} className="w-full px-4 py-3 rounded-lg border border-cream-200 focus:outline-none focus:border-brand-teal focus:ring-1" minLength="8" required onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                        </div>
                        <button type="submit" className="w-full bg-brand-teal text-white py-3 mt-2 rounded-lg font-semibold cursor-pointer hover:bg-teal-900 transition-colors" disabled={loading}>
                            {loading ? 'Saving...' : 'Update Password'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center mt-4">
                        <Link to="/sign-in" className="inline-block px-6 py-3 bg-brand-teal text-white rounded-lg font-semibold no-underline hover:bg-teal-900">Go to Login</Link>
                    </div>
                )}
            </main>
        </div>
    )
}

export default ResetPassword