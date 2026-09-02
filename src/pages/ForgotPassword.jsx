import { useState } from "react"
import { useNavigate, Link } from "react-router"
import { forgotPassword } from "../services/auth-service"

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setMessage('')
        setIsError(false)

        try {
            const resMessage = await forgotPassword(email)
            setMessage(resMessage)
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
                    <h1 className="text-2xl font-bold text-ink mb-1">Forgot Password</h1>
                    <p className="text-sm text-gray-500 m-0">Enter your email to receive a reset link.</p>
                </header>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium text-center border ${isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-[#2F7D6D]/10 text-[#2F7D6D] border-[#2F7D6D]/20'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-ink" htmlFor="email">Email Address</label>
                        <input type="email" name="email" id="email" className="w-full px-4 py-3 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors" value={email} required onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <button type="submit" className="w-full bg-brand-teal text-white py-3 mt-2 rounded-lg font-semibold flex justify-center items-center cursor-pointer hover:bg-teal-900 transition-colors" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/sign-in" className="text-sm font-medium text-teal-600 hover:underline">Back to Login</Link>
                </div>
            </main>
        </div>
    )
}

export default ForgotPassword