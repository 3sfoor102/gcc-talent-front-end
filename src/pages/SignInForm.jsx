import { useState } from "react"
import { useNavigate } from "react-router"
import { signIn } from "../services/auth"

const SignInForm = function (props)
{

    const navigate = useNavigate()

    const initialState = {
        email: '',
        password: '',
    }

    const [formData, setFormData] = useState(initialState)

    const [message, setMessage] = useState('')

    const [loading, setLoading] = useState(false)

    const handleChange = function (event)
    {
        setMessage('')
        setFormData({...formData, [event.target.name]: event.target.value})
    }

    const handleSubmit = async function (event)
    {
        event.preventDefault()
        setLoading(true)
        try {
            const signedInUser = await signIn(formData)

            props.setUser(signedInUser)

            setFormData(initialState)

            navigate('/')

        } catch (err)
        {
            setMessage(err.message)
        } finally
        {
            setLoading(false)
        }
    }

    return (
        <main className="container d-flex justify-content-center align-items-center min-vh-100">
            <section className="card p-4 shadow-sm">
                <header className="text-center mb-4">

                    <h1 className="h3 mb-3 fw-bold text-dark">Sign In</h1>
                    <p className="error text-danger small">{message}</p>

                </header>

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Email Address:</label>
                        <input type="email" name="email" className="form-control" value={formData.email} required onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-semibold">Password:</label>
                        <input type="password" name="password" className="form-control" value={formData.password} required onChange={handleChange} />
                    </div>

                    <div className="actions d-grid gap-3">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/sign-up')}>Go to Sign Up</button>
                    </div>
                </form>

                <hr className="my-4" />
                
                <div className="actions d-grid gap-2">

                    <button type="button" className="btn btn-outline-dark">Continue with Google</button>

                    <button type="button" className="btn btn-outline-dark">Continue with LinkedIn</button>
                </div>
            </section>
        </main>
    )
}

export default SignInForm