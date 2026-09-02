import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router"

const Settings = function (props) {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const initialState =
    {
        name: props.user?.name || '',
        email: props.user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }

    const [formData, setFormData] = useState(initialState)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            name: props.user?.name || '',
            email: props.user?.email || ''
        }))
    }, [props.user])

    const handleChange = function (event) {
        setMessage('')
        setFormData({ ...formData, [event.target.name]: event.target.value })
    }

    const isNameChanged = formData.name.trim() !== (props.user?.name || '')
    const isPasswordEntered = formData.currentPassword.length > 0 && formData.newPassword.length >= 8 && formData.confirmPassword.length >= 8

    const hasChanges = isNameChanged || isPasswordEntered

    const handleSubmit = async function (event) {
        event.preventDefault()

        if (formData.newPassword || formData.confirmPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setMessage('New password and confirm password do not match!')
                return
            }
        }

        setLoading(true)
        setMessage('')

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${import.meta.env.VITE_BACK_END_SERVER_URL}/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage('Settings updated successfully!')
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
                if (data.data?.user && props.setUser) {
                    props.setUser(data.data.user)
                }
            } else {
                setMessage(data.error?.message || data.message || 'Failed to update settings.')
            }
        } catch (err) {
            console.error(err)
            setMessage('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarUpload = async function (event) {
        const file = event.target.files[0]
        if (!file) return

        setAvatarLoading(true)
        setMessage('')

        try {
            const uploadData = new FormData()
            uploadData.append('file', file)
            uploadData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: uploadData
            })

            const cloudData = await cloudRes.json()

            if (!cloudRes.ok) {
                throw new Error(cloudData.error?.message || 'Failed to upload image to Cloudinary')
            }

            const imageUrl = cloudData.secure_url

            const token = localStorage.getItem('token')
            const dbRes = await fetch(`${import.meta.env.VITE_BACK_END_SERVER_URL}/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ avatarUrl: imageUrl })
            })

            const dbData = await dbRes.json()

            if (dbRes.ok) {
                setMessage('Avatar updated successfully!')
                if (dbData.data?.user && props.setUser) {
                    props.setUser(dbData.data.user)
                }
            } else {
                setMessage(dbData.error?.message || dbData.message || 'Failed to save avatar URL.')
            }
        } catch (err) {
            console.error("Upload process error:", err)
            setMessage(err.message || 'An error occurred while uploading. Please try again.')
        } finally {
            setAvatarLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current.click()
    }

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
            <main className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-cream-200 p-6 md:p-10">

                <header className="mb-8 border-b border-cream-200 pb-5">
                    <h1 className="text-2xl font-bold text-ink mb-1">Account Settings</h1>
                    <p className="text-sm text-teal-600 m-0">View your account information and update your security preferences.</p>
                </header>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium text-center border ${message.includes('match') || message.includes('incorrect') ? 'bg-red-50 text-red-600 border-red-200' : 'bg-[#2F7D6D]/10 text-[#2F7D6D] border-[#2F7D6D]/20'}`}>
                        {message}
                    </div>
                )}

                <section className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-cream-200">
                    <div className="relative shrink-0">
                        <div className="h-24 w-24 rounded-full border-4 border-white bg-cream-200 flex items-center justify-center text-brand-teal text-3xl font-bold shadow-sm overflow-hidden">
                            {props.user?.avatarUrl ? (
                                <img src={props.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                props.user?.name ? props.user.name.charAt(0).toUpperCase() : 'U'
                            )}
                        </div>
                        {avatarLoading && (
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-2">
                        <h3 className="text-lg font-semibold text-ink m-0">Profile Picture</h3>
                        <p className="text-sm text-gray-500 m-0 text-center md:text-left">JPG, PNG or WebP, max 5MB.</p>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            accept="image/jpeg, image/png, image/webp"
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={avatarLoading}
                            className="mt-1 px-4 py-2 bg-white border border-cream-200 text-brand-teal text-sm font-semibold rounded-lg hover:bg-cream-200 transition-colors cursor-pointer"
                        >
                            {avatarLoading ? 'Uploading...' : 'Change Avatar'}
                        </button>
                    </div>
                </section>

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
                                <input type="email" name="email" id="email" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-gray-100 text-gray-500 cursor-not-allowed" value={formData.email} disabled />
                            </div>
                        </div>
                    </section>

                    <hr className="border-cream-200 m-0" />

                    <section>
                        <h2 className="text-lg font-semibold text-ink mb-4">Security</h2>
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-ink" htmlFor="currentPassword">Current Password</label>
                                <input type="password" name="currentPassword" id="currentPassword" className="w-full md:w-1/2 px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink" value={formData.currentPassword} onChange={handleChange} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-ink" htmlFor="newPassword">New Password</label>
                                    <input type="password" name="newPassword" id="newPassword" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink" value={formData.newPassword} onChange={handleChange} minLength="8" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-ink" htmlFor="confirmPassword">Confirm New Password</label>
                                    <input type="password" name="confirmPassword" id="confirmPassword" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink" value={formData.confirmPassword} onChange={handleChange} minLength="8" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 mt-2 pt-6 border-t border-cream-200">
                        <button type="button" onClick={() => navigate('/')} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-ink bg-transparent border border-cream-200 hover:bg-cream-200 transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white border-0 transition-colors ${!hasChanges || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-teal hover:bg-teal-900 cursor-pointer'}`}
                            disabled={loading || !hasChanges}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    )
}

export default Settings