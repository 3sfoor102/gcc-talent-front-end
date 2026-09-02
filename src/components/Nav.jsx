import { useState, useEffect, useRef } from "react"
import { Link } from "react-router"
import logo from "../assets/logo.png"
import { getConversations } from "../services/messages-service"
import { getNotifications } from "../services/notification-service"

const Nav = function (props) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [totalUnread, setTotalUnread] = useState(0)
    const [unreadNotifs, setUnreadNotifs] = useState(0)
    const profileDropdownRef = useRef(null)

    const handleSignOut = function () {
        localStorage.removeItem('token')
        props.setUser(null)
        setIsMobileMenuOpen(false)
        setIsProfileMenuOpen(false)
    }

    const isAdmin = props.user?.role === 'admin'
    const isClient = props.user?.role === 'client'
    const isFreelancer = props.user?.role === 'freelancer'
    const currentUserId = props.user?._id || props.user?.id || props.user?.userId

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
                setIsProfileMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (!props.user) {
            setTotalUnread(0)
            setUnreadNotifs(0)
            return
        }

        const checkUnread = async () => {
            try {
                const convList = await getConversations()
                if (Array.isArray(convList)) {
                    let count = 0
                    convList.forEach((c) => {
                        if (c.unread) {
                            const val =
                                c.unread instanceof Map
                                    ? c.unread.get(currentUserId?.toString())
                                    : c.unread[currentUserId?.toString()]
                            count += Number(val) || 0
                        }
                    })
                    setTotalUnread(count)
                }

                const notifList = await getNotifications()
                if (Array.isArray(notifList)) {
                    const unreadCount = notifList.filter(n => !n.isRead).length
                    setUnreadNotifs(unreadCount)
                }
            } catch (err) {
                // Ignore silent polling errors
            }
        }

        checkUnread()
        const interval = setInterval(checkUnread, 8000)
        return () => clearInterval(interval)
    }, [props.user, currentUserId])

    const profilePath = isFreelancer ? "/freelancer/profile" : "/client/profile"

    return (
        <nav className="bg-brand-teal text-white px-4 sm:px-6 py-3 shadow-md border-b border-cream-200/20 relative z-50">
            <div className="max-w-[1280px] mx-auto flex justify-between items-center">

                {/* Left: Brand & Primary Navigation Links */}
                <div className="flex items-center">
                    <Link
                        className="no-underline flex items-center shrink-0 w-36 sm:w-44 h-12 relative overflow-visible mr-6 lg:mr-10"
                        to="/"
                    >
                        <img
                            src={logo}
                            alt="GCC Talent"
                            className="h-14 sm:h-16 w-auto object-contain scale-[2.4] origin-left select-none pointer-events-none"
                        />
                    </Link>

                    <ul className="hidden xl:flex items-center gap-6 m-0 p-0 list-none">
                        <li>
                            <Link className="text-xs font-semibold text-cream-200 hover:text-white no-underline transition-colors tracking-wide" to="/jobs">
                                All Jobs
                            </Link>
                        </li>
                        <li>
                            <Link className="text-xs font-semibold text-cream-200 hover:text-white no-underline transition-colors tracking-wide" to="/freelancers">
                                Find Talent
                            </Link>
                        </li>

                        {isClient && (
                            <>
                                <li>
                                    <Link className="text-xs font-semibold text-cream-200 hover:text-white no-underline transition-colors tracking-wide" to="/client/jobs">
                                        My Jobs
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-xs font-semibold text-cream-200 hover:text-white no-underline transition-colors tracking-wide" to="/client/jobs/new">
                                        Post a Job
                                    </Link>
                                </li>
                            </>
                        )}

                        {isFreelancer && (
                            <li>
                                <Link className="text-xs font-semibold text-cream-200 hover:text-white no-underline transition-colors tracking-wide" to="/freelancer/proposals">
                                    My Proposals
                                </Link>
                            </li>
                        )}

                        {props.user && (
    
                        <>
                            <li>
                                <Link className="text-xs font-semibold text-cream-200 hover:text-white no-underline transition-colors tracking-wide" to="/contracts">
                                    Contracts
                                </Link>
                            </li>
                            <li>
                                <Link className="text-xs font-semibold text-cream-200 hover:text-white no-underline transition-colors tracking-wide" to="/wallet">                                
                                    Wallet
                                </Link>
                            </li>
                        </>
                        )}
                    </ul>
                </div>

                {/* Right: Actions, Messaging & Profile Dropdown */}
                <div className="hidden xl:flex items-center gap-4">
                    {props.user ? (
                        <div className="flex items-center gap-3">
                            {/* Messages Link with Counter Badge */}
                            <Link
                                to="/messages"
                                className="relative p-2 text-cream-200 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center no-underline"
                                title="Messages"
                            >
                                <span className="material-symbols-outlined text-[22px]">mail</span>
                                {totalUnread > 0 && (
                                    <span className="absolute top-1 right-1 bg-amber-400 text-brand-teal text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[15px] leading-none text-center shadow-xs">
                                        {totalUnread > 9 ? "9+" : totalUnread}
                                    </span>
                                )}
                            </Link>

                            <Link
                                to="/notifications"
                                className="relative p-2 text-cream-200 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center no-underline"
                                title="Notifications"
                            >
                                <span className="material-symbols-outlined text-[22px]">notifications</span>
                                {unreadNotifs > 0 && (
                                    <span className="absolute top-1 right-1 bg-amber-400 text-brand-teal text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[15px] leading-none text-center shadow-xs">
                                        {unreadNotifs > 9 ? "9+" : unreadNotifs}
                                    </span>
                                )}
                            </Link>

                            <div className="h-5 w-[1px] bg-cream-200/20 mx-1" />

                            {/* User Profile Dropdown */}
                            <div className="relative" ref={profileDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 text-left bg-white/5 hover:bg-white/10 p-1.5 pr-2.5 rounded-full border border-cream-200/20 cursor-pointer transition-colors"
                                >
                                    <div className="h-8 w-8 rounded-full bg-cream-200 flex items-center justify-center text-brand-teal text-sm font-bold overflow-hidden shrink-0">
                                        {props.user.avatarUrl ? (
                                            <img src={props.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{props.user.name ? props.user.name.charAt(0).toUpperCase() : 'U'}</span>
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold text-cream-200 max-w-[100px] truncate">
                                        {props.user.name || 'User'}
                                    </span>
                                    <span className="material-symbols-outlined text-[16px] text-cream-200">
                                        {isProfileMenuOpen ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>

                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white text-ink rounded-xl shadow-lg border border-cream-200 py-1.5 animate-fadeIn">
                                        <div className="px-3.5 py-2 border-b border-cream-100">
                                            <p className="text-xs font-bold text-ink truncate m-0">{props.user.name}</p>
                                            <p className="text-[11px] text-gray-500 capitalize m-0">{props.user.role}</p>
                                        </div>

                                        <Link
                                            to="/"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="block px-3.5 py-2 text-xs font-semibold text-ink hover:bg-brand-cream/40 no-underline transition-colors"
                                        >
                                            Dashboard
                                        </Link>

                                        {/* Only show View Profile if NOT admin */}
                                        {!isAdmin && (
                                            <Link
                                                to={profilePath}
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="block px-3.5 py-2 text-xs font-semibold text-ink hover:bg-brand-cream/40 no-underline transition-colors"
                                            >
                                                View Profile
                                            </Link>
                                        )}

                                        {/* Admin specific tools */}
                                        {isAdmin && (
                                            <>
                                                <Link
                                                    to="/admin/users"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="block px-3.5 py-2 text-xs font-semibold text-ink hover:bg-brand-cream/40 no-underline transition-colors"
                                                >
                                                    Manage Users
                                                </Link>
                                                <Link
                                                    to="/admin/categories"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="block px-3.5 py-2 text-xs font-semibold text-ink hover:bg-brand-cream/40 no-underline transition-colors"
                                                >
                                                    Manage Categories
                                                </Link>
                                                <Link
                                                    to="/admin/reports"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="block px-3.5 py-2 text-xs font-semibold text-ink hover:bg-brand-cream/40 no-underline transition-colors"
                                                >
                                                    Manage Reports
                                                </Link>
                                            </>
                                        )}

                                        <Link
                                            to="/settings"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="block px-3.5 py-2 text-xs font-semibold text-ink hover:bg-brand-cream/40 no-underline transition-colors"
                                        >
                                            Settings
                                        </Link>

                                        <div className="h-[1px] bg-cream-100 my-1" />

                                        <button
                                            type="button"
                                            onClick={handleSignOut}
                                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-brand-danger hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link className="text-xs font-semibold text-cream-200 hover:text-white no-underline transition-colors px-2 py-1" to="/sign-in">
                                Sign In
                            </Link>
                            <Link className="text-xs font-bold bg-accent-sand hover:bg-[#B8956B] text-brand-teal px-3.5 py-2 rounded-lg no-underline transition-colors shadow-2xs" to="/sign-up">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile / Tablet Toggle Header */}
                <div className="flex xl:hidden items-center gap-2">
                    {props.user && (
                        <Link to={isAdmin ? "/" : profilePath} className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-cream-200 flex items-center justify-center text-brand-teal text-xs font-bold overflow-hidden">
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
                        <span className="material-symbols-outlined text-[26px]">
                            {isMobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile / Tablet Responsive Drawer */}
            {isMobileMenuOpen && (
                <div className="xl:hidden absolute top-full left-0 w-full bg-brand-teal border-t border-cream-200/20 shadow-xl py-4 px-6 flex flex-col gap-3">
                    <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
                        <li>
                            <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                All Jobs
                            </Link>
                        </li>
                        <li>
                            <Link to="/freelancers" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                Find Talent
                            </Link>
                        </li>

                        {isClient && (
                            <>
                                <li>
                                    <Link to="/client/jobs" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                        My Jobs
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/client/jobs/new" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                        Post a Job
                                    </Link>
                                </li>
                            </>
                        )}

                        {isFreelancer && (
                            <li>
                                <Link to="/freelancer/proposals" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                    My Proposals
                                </Link>
                            </li>
                        )}

                        {props.user && (
                            <li>
                                <Link to="/contracts" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                    Contracts
                                </Link>
                            </li>
                        )}

                        <hr className="border-cream-200/20 my-1" />

                        {props.user ? (
                            <>
                                <li>
                                    <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                        <span>Messages</span>
                                        {totalUnread > 0 && (
                                            <span className="bg-amber-400 text-brand-teal text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                                {totalUnread > 9 ? "9+" : totalUnread}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                        <span>Notifications</span>
                                        {unreadNotifs > 0 && (
                                            <span className="bg-amber-400 text-brand-teal text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                                {unreadNotifs > 9 ? "9+" : unreadNotifs}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                        Dashboard
                                    </Link>
                                </li>

                                {/* Only show Profile if NOT admin */}
                                {!isAdmin && (
                                    <li>
                                        <Link to={profilePath} onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                            Profile
                                        </Link>
                                    </li>
                                )}

                                {/* Admin Management Links */}
                                {isAdmin && (
                                    <>
                                        <li>
                                            <Link to="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                                Manage Users
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/admin/categories" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                                Manage Categories
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/admin/reports" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                                Manage Reports
                                            </Link>
                                        </li>
                                    </>
                                )}

                                <li>
                                    <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                        Settings
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={handleSignOut} className="w-full text-left text-sm font-medium text-red-300 hover:text-red-100 bg-transparent border-0 cursor-pointer py-1">
                                        Sign Out
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/sign-in" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-medium text-cream-200 hover:text-white py-1 no-underline">
                                        Sign In
                                    </Link>
                                </li>
                                <li className="pt-2">
                                    <Link to="/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="block text-center text-sm font-medium bg-accent-sand hover:bg-[#B8956B] text-brand-teal px-4 py-2 rounded-lg no-underline font-semibold">
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