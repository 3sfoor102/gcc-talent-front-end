import { useState } from "react"

import { useNavigate } from "react-router"

import { updateFreelancerProfile } from "../services/profile"

const EditProfile = function (props) 
{
    const navigate = useNavigate()
    const userRole = props.user?.role || 'freelancer'

    const [formData, setFormData] = useState(
    {
        bio: '',

        skills: '',

        companyDescription: '',
        
        location: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = function (event) 
    {
        setFormData({ ...formData, [event.target.name]: event.target.value })
    }

    const handleSubmit = async function (event) 
    {
        event.preventDefault()
        setLoading(true)
        
        if (userRole === 'freelancer') 
        {
            const dataToUpdate = {
                ...formData,
                skills: typeof formData.skills === 'string' 
                    ? formData.skills.split(',').map(skill => skill.trim()) 
                    : formData.skills
            }

            await updateFreelancerProfile(dataToUpdate)
        } 

        setLoading(false)
        navigate('/profile')
    }

    if (!props.user) return null

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
            <main className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-cream-200 p-6 md:p-10">
                
                <header className="mb-8 border-b border-cream-200 pb-5">
                    <h1 className="text-2xl font-bold text-ink mb-1">Edit Profile</h1>
                    <p className="text-sm text-teal-600 m-0">Update your {userRole} details.</p>
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
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-ink" htmlFor="companyDescription">Company Description</label>
                                <textarea name="companyDescription" id="companyDescription" rows="4" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink resize-none" value={formData.companyDescription} onChange={handleChange} placeholder="What does your company do?"></textarea>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-ink" htmlFor="location">Location</label>
                                <input type="text" name="location" id="location" className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink" value={formData.location} onChange={handleChange} placeholder="e.g. Riyadh, Saudi Arabia" />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-cream-200">
                        <button type="button" onClick={() => navigate('/profile')} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-ink bg-transparent border border-cream-200 hover:bg-cream-200 transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-teal hover:bg-teal-900 transition-colors cursor-pointer border-0" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    )
}

export default EditProfile