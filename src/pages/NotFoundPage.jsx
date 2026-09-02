import { Link } from "react-router";

const NotFoundPage = () => {
    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-cream-200 text-brand-teal flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl">search_off</span>
            </div>
            <h1 className="text-5xl font-extrabold text-ink mb-3 m-0">404</h1>
            <h2 className="text-xl font-bold text-ink mb-2 m-0">Page Not Found</h2>
            <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
                The page you are looking for does not exist, has been removed, or is temporarily unavailable.
            </p>
            <Link
                to="/"
                className="px-6 py-2.5 bg-brand-teal text-white font-semibold rounded-lg no-underline hover:bg-teal-900 transition-colors"
            >
                Back to Safety
            </Link>
        </div>
    );
};

export default NotFoundPage;