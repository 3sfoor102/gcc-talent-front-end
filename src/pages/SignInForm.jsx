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
        <section className="card">
            <header>

                <h1>Sign In</h1>
                <p className="error">{message}</p>

            </header>

            <form onSubmit={handleSubmit}>

                Email Address:
                <input type="email" name="email" value={formData.email} required onChange={handleChange} />
                
                Password:
                <input type="password" name="password" value={formData.password} required onChange={handleChange} />
                
                <div className="actions">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                    <button type="button" onClick={() => navigate('/sign-up')}>Go to Sign Up</button>
                </div>
            </form>
            
            <hr />
            <div className="actions">
                <button type="button">Continue with Google</button>
                <button type="button">Continue with LinkedIn</button>
            </div>
        </section>
    )
}

export default SignInForm