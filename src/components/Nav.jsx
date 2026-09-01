import { Link } from "react-router"

const Nav = function (props) 
{
    const handleSignOut = function ()  
    {
        localStorage.removeItem('token')
        props.setUser()
    }

    return (
        <nav className="bg-brand-teal text-white px-6 py-4 flex justify-between items-center shadow-md border-b border-cream-200/20">
            <div>
                <Link className="text-xl font-bold text-white no-underline" to="/">GCC Talent</Link>
            </div>

            <div>
                {props.user ? (
                    <ul className="flex items-center gap-4 m-0 list-none">
                        <li className="text-sm text-cream-200">
                            Welcome, {props.user.username || props.user.name || 'User'}
                        </li>
                        <li>
                            <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline" to="/">Dashboard</Link>
                        </li>
                        <li>
                            <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline" to="/settings">Settings</Link>
                        </li>
                        <li>
                            <button onClick={handleSignOut} className="text-sm font-medium text-red-300 hover:text-red-100 bg-transparent border-0 cursor-pointer">
                                Sign Out
                            </button>
                        </li>
                    </ul>
                ) : (
                    <ul className="flex items-center gap-4 m-0 list-none">
                        <li>
                            <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline" to="/">Home</Link>
                        </li>
                        <li>
                            <Link className="text-sm font-medium text-cream-200 hover:text-white no-underline" to="/sign-in">Sign In</Link>
                        </li>
                        <li>
                            <Link className="text-sm font-medium bg-accent-sand hover:bg-[#b8956b] text-brand-teal px-4 py-2 rounded-lg no-underline font-semibold" to="/sign-up">Sign Up</Link>
                        </li>
                    </ul>
                )}
            </div>
        </nav>
    )
}

export default Nav