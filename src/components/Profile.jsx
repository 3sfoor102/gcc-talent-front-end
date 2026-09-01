import { useState, useEffect } from "react"
import { Link } from "react-router"
import { getFreelancerProfile, getClientProfile } from "../services/profile"

const Profile = function (props)
{
    const [profileData, setProfileData] = useState(null)
    const [loading, setLoading] = useState(true)

    const userRole = props.user?.role || 'freelancer'

    useEffect(() => {
        const fetchProfile = async function ()
        {
            if (props.user)
            {
                let data = null

                if (userRole === 'client')
                {
                    data = await getClientProfile()
                } else
                {
                    data = await getFreelancerProfile()
                }

                setProfileData(data)
                setLoading(false)
            }
        }

        fetchProfile()
    }, [props.user, userRole])

    if (!props.user) return null

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-brand-cream">
                <p className="text-brand-teal font-semibold text-lg animate-pulse">Loading Profile...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
            <main className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">

                <div className="bg-brand-teal h-32 w-full"></div>

                <div className="px-8 pb-8">

                    <div className="relative flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">

                            <div className="-mt-12 h-24 w-24 rounded-full border-4 border-white bg-cream-200 flex items-center justify-center text-brand-teal text-3xl font-bold shadow-sm shrink-0">
                                {props.user.username ? props.user.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="pt-3">
                                <h1 className="text-2xl font-bold text-ink m-0 leading-none mb-1.5">{props.user.username || props.user.name || 'User Name'}</h1>
                                <p className="text-sm text-teal-600 m-0 capitalize">{userRole}</p>
                            </div>
                        </div>
                        <Link to="/profile/edit" className="mt-2 px-5 py-2.5 bg-accent-sand text-brand-teal font-semibold rounded-lg border-0 cursor-pointer hover:opacity-90 transition-opacity no-underline text-sm">
                            Edit Profile
                        </Link>
                    </div>

                    <hr className="border-cream-200 my-6" />

                    {userRole === 'freelancer' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-lg font-semibold text-ink mb-3">About Me</h2>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {profileData?.bio || 'No bio added yet. Click Edit Profile to add one.'}
                                </p>
                            </section>
                            <section>
                                <h2 className="text-lg font-semibold text-ink mb-3">Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profileData?.skills?.length > 0 ? (
                                        profileData.skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-medium">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No skills added.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-lg font-semibold text-ink mb-3">Company Overview</h2>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {profileData?.companyDescription || 'No company description added yet.'}
                                </p>
                            </section>
                            <section>
                                <h2 className="text-lg font-semibold text-ink mb-3">Location</h2>
                                <p className="text-sm text-gray-600">
                                    {profileData?.location || 'Location not specified.'}
                                </p>
                            </section>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Profile