import { useState, useEffect } from "react"
import { Link } from "react-router"
import { getFreelancerProfile, getClientProfile } from "../services/profile"

const Profile = function (props) {
    const [profileData, setProfileData] = useState(null)
    const [loading, setLoading] = useState(true)

    const userRole = props.user?.role || 'freelancer'

    useEffect(() => {
        const fetchProfile = async function () {
            if (props.user) {
                let data = null

                if (userRole === 'client') {
                    data = await getClientProfile()
                } else {
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

                            <Link
                                to="/settings"
                                title="Change Profile Picture"
                                className="-mt-12 h-24 w-24 rounded-full border-4 border-white bg-cream-200 flex items-center justify-center text-brand-teal text-3xl font-bold shadow-sm shrink-0 overflow-hidden group relative cursor-pointer"
                            >
                                {props.user?.avatarUrl ? (
                                    <img src={props.user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{props.user?.name ? props.user.name.charAt(0).toUpperCase() : 'U'}</span>
                                )}

                                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                                    </svg>
                                </div>
                            </Link>

                            <div className="pt-3">
                                <h1 className="text-2xl font-bold text-ink m-0 leading-none mb-1.5">{props.user?.name || props.user?.username || 'User Name'}</h1>
                                <p className="text-sm text-teal-600 m-0 capitalize">{userRole}</p>
                            </div>
                        </div>

                        <Link to="/profile/edit" className="mt-2 px-5 py-2.5 bg-accent-sand text-brand-teal font-semibold rounded-lg border-0 cursor-pointer hover:opacity-90 transition-opacity no-underline text-sm">
                            Edit Profile Details
                        </Link>
                    </div>

                    <hr className="border-cream-200 my-6" />

                    {userRole === 'freelancer' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-lg font-semibold text-ink mb-3">About Me</h2>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {profileData?.bio || 'No bio added yet. Click Edit Profile Details to add one.'}
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
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
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