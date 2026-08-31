import { useState } from "react"
import { useNavigate } from "react-router"
import { signUp } from "../services/auth"

const SignUpForm = function (props)
{

    const navigate = useNavigate()

    const initialState = {
        name: '',
        email: '',
        password: '',
        role: 'client'
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
            const newUser = await signUp(formData)

            props.setUser(newUser)

            setFormData(initialState)
            
            setLoading(false)

            navigate('/')

        } catch (err)
        {
            setMessage(err.message)
            
            setLoading(false)
        }
    }

    const isFormValid = function ()
    {
        if (formData.name && formData.email && formData.password && formData.role) {
            return true
        } else return false
    }

    return (
        <section className="card">
            <header>
                <h1>Sign Up</h1>
                <p className="error">{message}</p>
            </header>

            <form onSubmit={handleSubmit}>
                Role:
                <div>
                    <input type="radio" name="role" value="client" checked={formData.role === 'client'} onChange={handleChange} /> Client

                    <input type="radio" name="role" value="freelancer" checked={formData.role === 'freelancer'} onChange={handleChange} /> Freelancer
                </div>

                Full Name:
                <input type="text" name="name" value={formData.name} required onChange={handleChange} />

                Email Address:
                <input type="email" name="email" value={formData.email} required onChange={handleChange} />

                Password:
                <input type="password" name="password" value={formData.password} required onChange={handleChange} />

                <div className="actions">
                    <button type="submit" disabled={!isFormValid() || loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                    <button type="button" onClick={() => navigate('/sign-in')}>Go to Sign In</button>
                </div>
            </form>
        </section>
    )
}

export default SignUpForm