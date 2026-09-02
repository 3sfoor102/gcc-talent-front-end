import { Link } from "react-router"

const Landing = () => {
    return (
        <div className="min-h-screen bg-brand-cream">

            <div className="bg-brand-teal text-white py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-accent-sand blur-[100px] opacity-20 pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Where GCC's Top Talent Meets Great Opportunities
                    </h1>
                    <p className="text-lg md:text-xl text-cream-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join the most trusted professional freelance marketplace in the region. Connect, collaborate, and grow your business or career today.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link to="/sign-up" className="px-8 py-3.5 bg-accent-sand text-brand-teal font-bold rounded-lg no-underline hover:bg-[#B8956B] transition-colors text-lg shadow-lg">
                            Get Started
                        </Link>
                        <Link to="/jobs" className="px-8 py-3.5 bg-transparent border-2 border-cream-200 text-cream-200 font-bold rounded-lg no-underline hover:bg-cream-200 hover:text-brand-teal transition-colors text-lg">
                            Explore Jobs
                        </Link>
                    </div>

                    <div className="mt-8">
                        <span className="text-cream-200 text-sm">Already have an account? </span>
                        <Link to="/sign-in" className="text-white font-bold hover:underline text-sm no-underline">
                            Log In
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto py-20 px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-ink">How It Works</h2>
                    <p className="text-teal-600 mt-3">Simple steps to start your journey with us.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-cream-200 text-center hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 bg-[#2F7D6D]/10 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
                        <h3 className="text-xl font-bold text-ink mb-3">Create an Account</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Sign up as a freelancer to find exciting projects, or as a client to post jobs and hire top talent.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-cream-200 text-center hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 bg-[#2F7D6D]/10 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
                        <h3 className="text-xl font-bold text-ink mb-3">Connect & Collaborate</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Browse through categories, send proposals, negotiate terms, and start working on your next big thing.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-cream-200 text-center hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 bg-[#2F7D6D]/10 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
                        <h3 className="text-xl font-bold text-ink mb-3">Secure Payments</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Enjoy peace of mind with our secure milestone and escrow system ensuring everyone gets paid on time.</p>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Landing