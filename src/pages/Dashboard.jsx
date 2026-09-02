import { useState, useEffect } from "react"
import { Link } from "react-router"
import { getDashboardStats } from "../services/dashboard-service"

const Dashboard = (props) => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const firstName = props.user?.name ? props.user.name.split(' ')[0] : 'User'
    const role = props.user?.role || 'freelancer'

    const isClient = role === 'client'
    const isAdmin = role === 'admin'

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats()
                setStats(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-cream py-20 px-4 flex justify-center">
                <p className="text-teal-600 font-semibold animate-pulse">Loading dashboard data...</p>
            </div>
        )
    }

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">

                    <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-ink m-0">Welcome Admin, {firstName}! 👑</h1>
                            <p className="text-teal-600 m-0 mt-2 text-lg">Platform Management & Overview.</p>
                        </div>
                        <Link to="/settings" className="px-6 py-3 bg-brand-teal text-white font-semibold rounded-lg no-underline hover:bg-teal-900 transition-colors shadow-sm inline-block text-center">
                            System Settings
                        </Link>
                    </header>

                    {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Users</span>
                            <span className="text-4xl font-bold text-brand-teal mt-2">{stats?.totalUsers || 0}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Jobs</span>
                            <span className="text-4xl font-bold text-brand-teal mt-2">{stats?.activeJobs || 0}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Contracts</span>
                            <span className="text-4xl font-bold text-brand-teal mt-2">{stats?.totalContracts || 0}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Platform Revenue</span>
                            <span className="text-4xl font-bold text-brand-teal mt-2">${stats?.revenue?.toLocaleString() || '0.00'}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-10 text-center">
                        <div className="w-16 h-16 bg-cream-200 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-[32px]">tune</span>
                        </div>
                        <h2 className="text-xl font-bold text-ink mb-2">Admin Control Panel</h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            View reports, manage users, and update platform categories or settings.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/admin/users" className="px-6 py-2.5 bg-accent-sand text-brand-teal font-bold rounded-lg hover:bg-[#B8956B] transition-colors cursor-pointer border-0 no-underline inline-block">
                                Manage Users
                            </Link>
                            <Link to="/admin/categories" className="px-6 py-2.5 bg-transparent border-2 border-cream-200 text-brand-teal font-bold rounded-lg hover:bg-cream-200 transition-colors cursor-pointer no-underline inline-block">
                                Manage Categories
                            </Link>
                            <Link to="/admin/reports" className="px-6 py-2.5 bg-transparent border-2 border-cream-200 text-brand-teal font-bold rounded-lg hover:bg-cream-200 transition-colors cursor-pointer no-underline inline-block">
                                Reports & Disputes
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">

                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-ink m-0">Welcome back, {firstName}! 👋</h1>
                        <p className="text-teal-600 m-0 mt-2 text-lg">Here is an overview of your <span className="capitalize font-semibold">{role}</span> workspace.</p>
                    </div>
                    <Link to={isClient ? "/client/jobs/new" : "/jobs"} className="px-6 py-3 bg-brand-teal text-white font-semibold rounded-lg no-underline hover:bg-teal-900 transition-colors shadow-sm inline-block text-center">
                        {isClient ? "Post a New Job" : "Browse Jobs"}
                    </Link>
                </header>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Contracts</span>
                        <span className="text-4xl font-bold text-brand-teal mt-2">{stats?.activeContracts || 0}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">{isClient ? 'Total Spent' : 'Total Earned'}</span>
                        <span className="text-4xl font-bold text-brand-teal mt-2">${stats?.financialTotal?.toLocaleString() || '0.00'}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">{isClient ? 'Open Jobs' : 'Pending Proposals'}</span>
                        <span className="text-4xl font-bold text-brand-teal mt-2">{stats?.actionableItems || 0}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-10 text-center">
                    <div className="w-16 h-16 bg-cream-200 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[32px]">{isClient ? 'work' : 'description'}</span>
                    </div>
                    <h2 className="text-xl font-bold text-ink mb-2">Ready to get started?</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {isClient
                            ? "Post a new job to find the perfect talent for your next big project."
                            : "Browse through available jobs and send out your proposals."}
                    </p>
                    <Link to={isClient ? "/client/jobs/new" : "/jobs"} className="px-6 py-2.5 bg-accent-sand text-brand-teal font-bold rounded-lg no-underline hover:bg-accent-sand-hover hover:text-white transition-colors inline-block">
                        {isClient ? "Post a Job Now" : "Find Jobs Now"}
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default Dashboard