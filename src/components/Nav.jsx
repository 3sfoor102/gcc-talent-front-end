import { useState } from "react"
import { Link } from "react-router"
import logo from "../assets/logo.png"

const Nav = function (props) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleSignOut = function () {
        localStorage.removeItem('token')
        props.setUser(null)
        setIsMobileMenuOpen(false)
    }

    const isClient = props.user?.role === 'client'
    const isFreelancer = props.user?.role === 'freelancer'

    return (
        <nav className="bg-brand-teal text-white px-4 sm:px-6 py-4 shadow-md border-b border-cream-200/20 relative">
            <div className="max-w-[1280px] mx-auto flex justify-between items-center">

                <div className="flex items-center gap-2 lg:gap-6">
                    <Link className="no-underline flex items-center shrink-0 mr-20 sm:mr-28 lg:mr-36" to="/">
                        <img
                            src={logo}
                            alt="GCC Talent"
                            className="h-12 sm:h-16 w-auto object-contain scale-[2.5] origin-left"
                        />
                    </Link>

                    <ul className="hidden lg:flex items-center gap-6 m-0 p-0 list-none">
                        <li>
                            <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline transition-colors" to="/jobs">
                                All Jobs
                            </Link>
                        </li>
                        <li>
                            <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline transition-colors" to="/freelancers">
                                Find Talent
                            </Link>
                        </li>

                        {isClient && (
                            <>
                                <li>
                                    <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline transition-colors" to="/client/jobs">
                                        My Jobs
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline transition-colors" to="/client/jobs/new">
                                        Post a Job
                                    </Link>
                                </li>
                            </>
                        )}

                        {isFreelancer && (
                            <li>
                                <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline transition-colors" to="/freelancer/proposals">
                                    My Proposals
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Desktop User / Auth Links */}
                <div className="hidden lg:flex items-center gap-6">
                    {props.user ? (
                        <ul className="flex items-center gap-6 m-0 p-0 list-none">
                            <li className="flex items-center">
                                <Link
                                    to={isFreelancer ? "/freelancer/profile" : "/client/profile"}
                                    className="flex items-center gap-3 no-underline group cursor-pointer"
                                >
                                    <div className="h-10 w-10 rounded-full border-2 border-cream-200/50 bg-cream-200 flex items-center justify-center text-brand-teal text-lg font-bold shadow-sm overflow-hidden group-hover:border-white transition-colors shrink-0">
                                        {props.user.avatarUrl ? (
                                            <img src={props.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{props.user.name ? props.user.name.charAt(0).toUpperCase() : 'U'}</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-cream-200 group-hover:text-white transition-colors">
                                        {props.user.name || 'User'}
                                    </span>
                                </Link>
                            </li>

                            <li className="flex items-center">
                                <button className="text-cream-200 hover:text-white bg-transparent border-0 cursor-pointer p-1 transition-colors">
                                    <span className="material-symbols-outlined text-[22px]">notifications</span>
                                </button>
                            </li>

                            <li>
                                <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline transition-colors" to="/">Dashboard</Link>
                            </li>

                            <li>
                                <Link
                                    className="text-sm font-medium text-cream-200 hover:text-white no-underline transition-colors"
                                    to={isFreelancer ? "/freelancer/profile" : "/client/profile"}
                                >
                                    Profile
                                </Link>
                            </li>

                            <li>
                                <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline transition-colors" to="/settings">Settings</Link>
                            </li>

                            <li>
                                <button onClick={handleSignOut} className="text-sm font-medium text-red-300 hover:text-red-100 bg-transparent border-0 cursor-pointer transition-colors">
                                    Sign Out
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <ul className="flex items-center gap-4 m-0 p-0 list-none">
                            <li>
                                <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline transition-colors" to="/">Home</Link>
                            </li>
                            <li>
                                <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline transition-colors" to="/sign-in">Sign In</Link>
                            </li>
                            <li>
                                <Link className="text-sm font-medium bg-accent-sand hover:bg-[#B8956B] text-brand-teal px-4 py-2 rounded-lg no-underline font-semibold transition-colors shadow-xs" to="/sign-up">Sign Up</Link>
                            </li>
                        </ul>
                    )}
                </div>

                {/* Mobile Hamburger & Avatar */}
                <div className="flex lg:hidden items-center gap-3">
                    {props.user && (
                        <Link to={isFreelancer ? "/freelancer/profile" : "/client/profile"} className="flex items-center">
                            <div className="h-9 w-9 rounded-full border-2 border-cream-200/50 bg-cream-200 flex items-center justify-center text-brand-teal text-sm font-bold overflow-hidden">
                                {props.user.avatarUrl ? (
                                    <img src={props.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{props.user.name ? props.user.name.charAt(0).toUpperCase() : 'U'}</span>
                                )}
                            </div>
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-cream-200 hover:text-white bg-transparent border-0 cursor-pointer p-1.5 focus:outline-none"
                        aria-label="Toggle Menu"
                    >
                        <span className="material-symbols-outlined text-[28px]">
                            {isMobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-brand-teal border-t border-cream-200/20 shadow-xl py-4 px-6 flex flex-col gap-4 z-50">
                    <ul className="flex flex-col gap-3 m-0 p-0 list-none">
                        <li>
                            <Link
                                to="/jobs"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                            >
                                All Jobs
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/freelancers"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                            >
                                Find Talent
                            </Link>
                        </li>

                        {isClient && (
                            <>
                                <li>
                                    <Link
                                        to="/client/jobs"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                                    >
                                        My Jobs
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/client/jobs/new"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                                    >
                                        Post a Job
                                    </Link>
                                </li>
                            </>
                        )}

                        {isFreelancer && (
                            <li>
                                <Link
                                    to="/freelancer/proposals"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                                >
                                    My Proposals
                                </Link>
                            </li>
                        )}

                        <hr className="border-cream-200/20 my-1" />

                        {props.user ? (
                            <>
                                <li>
                                    <Link
                                        to="/messages"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                                    >
                                        Messages
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to={isFreelancer ? "/freelancer/profile" : "/client/profile"}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                                    >
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/settings"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                                    >
                                        Settings
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left text-sm font-medium text-red-300 hover:text-red-100 bg-transparent border-0 cursor-pointer py-1.5"
                                    >
                                        Sign Out
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link
                                        to="/"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/sign-in"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-sm font-medium text-cream-200 hover:text-white py-1.5 no-underline"
                                    >
                                        Sign In
                                    </Link>
                                </li>
                                <li className="pt-2">
                                    <Link
                                        to="/sign-up"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-center text-sm font-medium bg-accent-sand hover:bg-[#B8956B] text-brand-teal px-4 py-2.5 rounded-lg no-underline font-semibold"
                                    >
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </nav>
    )
}

export default Nav