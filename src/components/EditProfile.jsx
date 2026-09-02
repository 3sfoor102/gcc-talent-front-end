import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { getFreelancerProfile, createFreelancerProfile, updateFreelancerProfile } from "../services/profile"

const EditProfile = function (props) {
    const navigate = useNavigate()
    const userRole = props.user?.role || 'freelancer'

    const [formData, setFormData] = useState({
        bio: '',
        skills: ''
    })

    const [isNewProfile, setIsNewProfile] = useState(true)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const loadProfile = async function () {
            if (userRole === 'freelancer') {
                const data = await getFreelancerProfile()
                if (data) {
                    setFormData({
                        bio: data.bio || '',
                        skills: data.skills && data.skills.length > 0 ? data.skills.join(', ') : ''
                    })
                    setIsNewProfile(false)
                }
            }
            setLoading(false)
        }
        loadProfile()
    }, [userRole])

    const handleChange = function (event) {
        setFormData({ ...formData, [event.target.name]: event.target.value })
    }

    const handleSubmit = async function (event) {
        event.preventDefault()
        setSaving(true)

        if (userRole === 'freelancer') {
            const dataToSend = {
                ...formData,
                skills: typeof formData.skills === 'string'
                    ? formData.skills.split(',').map(skill => skill.trim()).filter(s => s !== "")
                    : formData.skills
            }
            if (isNewProfile) {
                await createFreelancerProfile(dataToSend)
            } else {
                await updateFreelancerProfile(dataToSend)
            }
        }

        setSaving(false)
        navigate('/profile')
    }

    if (!props.user) return null

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-brand-cream">
                <p className="text-brand-teal font-semibold text-lg animate-pulse">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
            <main className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-cream-200 p-6 md:p-10">

                <header className="mb-8 border-b border-cream-200 pb-5">
                    <h1 className="text-2xl font-bold text-ink mb-1">{isNewProfile ? 'Create Profile' : 'Edit Profile'}</h1>
                    <p className="text-sm text-teal-600 m-0">{isNewProfile ? 'Set up your' : 'Update your'} {userRole} details.</p>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {userRole === 'freelancer' ? (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-ink" htmlFor="bio">About Me (Bio)</label>
                                <textarea name="bio" id="bio" rows="4" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink resize-none" value={formData.bio} onChange={handleChange} placeholder="Tell clients about yourself..."></textarea>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-ink" htmlFor="skills">Skills (comma separated)</label>
                                <input type="text" name="skills" id="skills" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Node.js, UI/UX" />
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">Client form coming soon...</p>
                    )}

                    <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-cream-200">
                        <button type="button" onClick={() => navigate('/profile')} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-ink bg-transparent border border-cream-200 hover:bg-cream-200 transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-teal hover:bg-teal-900 transition-colors cursor-pointer border-0" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    )
}

export default EditProfile