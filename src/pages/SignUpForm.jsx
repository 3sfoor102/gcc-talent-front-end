import { useState } from "react"
import { useNavigate } from "react-router"
import { signUp, socialLogin, linkedinLogin as backendLinkedinLogin } from "../services/auth-service"
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from "jwt-decode"
import { useLinkedIn } from 'react-linkedin-login-oauth2'

const SignUpForm = function (props) {
    const navigate = useNavigate()

    const initialState = {
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        role: 'freelancer'
    }

    const [formData, setFormData] = useState(initialState)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const { linkedInLogin } = useLinkedIn({
        clientId: '77nai0q9xz2fs3',
        redirectUri: `${window.location.origin}/linkedin`,
        scope: 'openid profile email',
        onSuccess: async (code) => {
            setMessage('')
            setLoading(true)
            try {
                const signedUpUser = await backendLinkedinLogin(code, formData.role)
                props.setUser(signedUpUser)
                setLoading(false)
                navigate('/')
            } catch (err) {
                setMessage(err.message)
                setLoading(false)
            }
        },
        onError: (error) => {
            setMessage('LinkedIn Login Failed')
        }
    })

    const handleChange = function (event) {
        setMessage('')
        setFormData({ ...formData, [event.target.name]: event.target.value })
    }

    const handleSubmit = async function (event) {
        event.preventDefault()
        setLoading(true)

        if (formData.password !== formData.passwordConfirm) {
            setMessage('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            const { passwordConfirm, ...submitData } = formData
            const signedUpUser = await signUp(submitData)
            props.setUser(signedUpUser)
            setFormData(initialState)
            setLoading(false)
            navigate('/')
        } catch (err) {
            setMessage(err.message)
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        setMessage('')
        setLoading(true)
        try {
            const decodedInfo = jwtDecode(credentialResponse.credential)
            
            const realSocialUser = {
                name: decodedInfo.name,
                email: decodedInfo.email,
                avatarUrl: decodedInfo.picture,
                provider: 'google',
                role: formData.role
            }

            const signedInUser = await socialLogin(realSocialUser)
            props.setUser(signedInUser)
            setLoading(false)
            navigate('/')
        } catch (err) {
            setMessage(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden text-gray-900">
            <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-gcc-teal blur-[100px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gcc-sand blur-[100px] opacity-30 pointer-events-none"></div>

            <main className="w-full max-w-md glass-card rounded-2xl p-6 md:p-8 relative z-10">
                <header className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">GCC Talent</h1>
                    <p className="text-sm text-gray-500 m-0">Create your account to get started</p>
                </header>

                <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
                    <button className="flex-1 py-2 text-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors" type="button" onClick={() => navigate('/sign-in')}>Login</button>
                    <button className="flex-1 py-2 text-center text-sm font-medium text-gcc-teal bg-white rounded-md shadow-sm" type="button">Sign Up</button>
                </div>

                {message && <p className="text-red-500 text-sm font-semibold text-center mb-4">{message}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex gap-4 mb-2">
                        <label className="flex-1 cursor-pointer border border-gray-200 rounded-lg p-3 flex items-center gap-2 hover:border-gcc-teal transition-colors bg-white">
                            <input type="radio" className="radio-custom w-4 h-4" name="role" value="client" checked={formData.role === 'client'} onChange={handleChange} />
                            <span className="text-sm font-medium">Join as Client</span>
                        </label>

                        <label className="flex-1 cursor-pointer border border-gray-200 rounded-lg p-3 flex items-center gap-2 hover:border-gcc-teal transition-colors bg-white">
                            <input type="radio" className="radio-custom w-4 h-4" name="role" value="freelancer" checked={formData.role === 'freelancer'} onChange={handleChange} />
                            <span className="text-sm font-medium">Join as Freelancer</span>
                        </label>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="signup-name">Full Name</label>
                        <input type="text" name="name" id="signup-name" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-gcc-teal focus:ring-1 focus:ring-gcc-teal transition-colors" value={formData.name} required onChange={handleChange} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="signup-email">Email Address</label>
                        <input type="email" name="email" id="signup-email" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-gcc-teal focus:ring-1 focus:ring-gcc-teal transition-colors" value={formData.email} required onChange={handleChange} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="signup-password">Password</label>
                        <input type="password" name="password" id="signup-password" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-gcc-teal focus:ring-1 focus:ring-gcc-teal transition-colors" value={formData.password} minLength="8" required onChange={handleChange} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="signup-passwordConfirm">Confirm Password</label>
                        <input type="password" name="passwordConfirm" id="signup-passwordConfirm" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-gcc-teal focus:ring-1 focus:ring-gcc-teal transition-colors" value={formData.passwordConfirm} minLength="8" required onChange={handleChange} />
                    </div>

                    <button type="submit" className="w-full bg-[#224548] text-white py-3 mt-2 rounded-lg font-semibold flex justify-center items-center gap-2" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-2 m-0">
                        By signing up, you agree to our <a className="text-gcc-teal hover:underline" href="#">Terms of Service</a> and <a className="text-gcc-teal hover:underline" href="#">Privacy Policy</a>.
                    </p>
                </form>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">or sign up with</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex justify-center w-full">
                        <GoogleLogin 
                            onSuccess={handleGoogleSuccess} 
                            onError={() => setMessage('Google Login Failed')}
                            useOneTap
                            shape="rectangular"
                            size="large"
                            text="signup_with"
                            width="100%"
                        />
                    </div>

                    <button type="button" onClick={linkedInLogin} className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-[#EFE4D8] bg-white hover:bg-[#EFE4D8] transition-colors cursor-pointer">
                        <img className="w-5 h-5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRf4vrfkm3vh5JMVBg9oUGZvdFfdyNMWForCIcu1C02sFEgeW7ISklEdUueT4_ydC9pOlFz6uZh1aJSLBWnUx-_k7UXIVLGfXtyugeg1RskkEoyylHW8INYc_VLryU4dkJUe-vsmXQGqCZC7n1_8LliBNR2hQZHhHQbq3wQLvMNQF-ZMkN1jDQ-tzs7-3vvkIzFTHFBopb8GsvTS2qwNeoMi6jsgrYuSHgEZd5Cz8tZdD1EJo9opB-" alt="LinkedIn" />
                        <span className="text-sm font-semibold text-[#1F2A2B]">LinkedIn</span>
                    </button>
                </div>
            </main>

            <footer className="mt-8 text-center relative z-10">
                <p className="text-xs text-gray-400 m-0">© 2026 GCC Talent All rights reserved.</p>
            </footer>
        </div>
    )
}

export default SignUpForm