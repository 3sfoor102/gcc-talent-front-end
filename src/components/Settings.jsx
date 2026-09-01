import { useState } from "react"

const Settings = function (props) 
{
    const initialState = 
    {
        name: props.user?.name || '',

        email: props.user?.email || '',

        currentPassword: '',

        newPassword: ''
    }

    const [formData, setFormData] = useState(initialState)

    const [message, setMessage] = useState('')

    const [loading, setLoading] = useState(false)

    const handleChange = function (event) 
    {
        setMessage('')

        setFormData({ ...formData, [event.target.name]: event.target.value })
    }

    const handleSubmit = async function (event)
    {
        event.preventDefault()

        setLoading(true)
        

        setTimeout(function ()
        {
            setMessage('Settings updated successfully!')

            setLoading(false)

            setFormData({ ...formData, currentPassword: '', newPassword: '' })
            
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
            <main className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-cream-200 p-6 md:p-10">
                
                <header className="mb-8 border-b border-cream-200 pb-5">
                    <h1 className="text-2xl font-bold text-ink mb-1">Account Settings</h1>
                    <p className="text-sm text-teal-600 m-0">Update your personal information and security preferences.</p>
                </header>

                {message && (
                    <div className="mb-6 p-4 rounded-lg bg-[#2F7D6D]/10 text-[#2F7D6D] border border-[#2F7D6D]/20 text-sm font-medium text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    
                    <section>
                        <h2 className="text-lg font-semibold text-ink mb-4">Profile Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-ink" htmlFor="name">Full Name</label>
                                <input type="text" name="name" id="name" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink" value={formData.name} onChange={handleChange} required />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-ink" htmlFor="email">Email Address</label>
                                <input type="email" name="email" id="email" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>
                    </section>

                    <hr className="border-cream-200 m-0" />

                    <section>
                        <h2 className="text-lg font-semibold text-ink mb-4">Security</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-ink" htmlFor="currentPassword">Current Password</label>
                                <input type="password" name="currentPassword" id="currentPassword" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink" value={formData.currentPassword} onChange={handleChange} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-ink" htmlFor="newPassword">New Password</label>
                                <input type="password" name="newPassword" id="newPassword" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink" value={formData.newPassword} onChange={handleChange}  minLength="8" />
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 mt-2 pt-6 border-t border-cream-200">
                        <button type="button" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-ink bg-transparent border border-cream-200 hover:bg-cream-200 transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-teal hover:bg-teal-900 transition-colors cursor-pointer border-0" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    )
}

export default Settings