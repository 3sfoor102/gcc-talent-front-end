import { Link } from "react-router"

const Dashboard = (props) => {
    const firstName = props.user?.name ? props.user.name.split(' ')[0] : 'User'
    const role = props.user?.role || 'freelancer'

    const isClient = role === 'client'
    const isAdmin = role === 'admin'

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">

                    <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-ink m-0">Welcome Admin, {firstName}! 👑</h1>
                            <p className="text-teal-600 m-0 mt-2 text-lg">Platform Management & Overview.</p>
                        </div>
                        <Link
                            to="/settings"
                            className="px-6 py-3 bg-brand-teal text-white font-semibold rounded-lg no-underline hover:bg-teal-900 transition-colors shadow-sm inline-block text-center"
                        >
                            System Settings
                        </Link>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Users</span>
                            <span className="text-4xl font-bold text-brand-teal mt-2">31</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Jobs</span>
                            <span className="text-4xl font-bold text-brand-teal mt-2">35</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Contracts</span>
                            <span className="text-4xl font-bold text-brand-teal mt-2">10</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Platform Revenue</span>
                            <span className="text-4xl font-bold text-brand-teal mt-2">$0.00</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-10 text-center">
                        <div className="w-16 h-16 bg-cream-200 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                            </svg>
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
                    <Link
                        to={isClient ? "/jobs/new" : "/jobs"}
                        className="px-6 py-3 bg-brand-teal text-white font-semibold rounded-lg no-underline hover:bg-teal-900 transition-colors shadow-sm inline-block text-center"
                    >
                        {isClient ? "Post a New Job" : "Browse Jobs"}
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Contracts</span>
                        <span className="text-4xl font-bold text-brand-teal mt-2">0</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">{isClient ? 'Total Spent' : 'Total Earned'}</span>
                        <span className="text-4xl font-bold text-brand-teal mt-2">$0.00</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">{isClient ? 'Open Jobs' : 'Pending Proposals'}</span>
                        <span className="text-4xl font-bold text-brand-teal mt-2">0</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-10 text-center">
                    <div className="w-16 h-16 bg-cream-200 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-ink mb-2">No Recent Activity</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {isClient
                            ? "You haven't posted any jobs or started any contracts yet. Post a job to find the perfect talent."
                            : "You haven't applied to any jobs or started any contracts yet. Browse open jobs to send your first proposal."}
                    </p>
                    <Link
                        to={isClient ? "/jobs/new" : "/jobs"}
                        className="px-6 py-2.5 bg-accent-sand text-brand-teal font-bold rounded-lg no-underline hover:bg-[#B8956B] transition-colors inline-block"
                    >
                        {isClient ? "Post a Job Now" : "Find Jobs Now"}
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default Dashboard