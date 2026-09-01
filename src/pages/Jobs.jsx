import { useState, useEffect } from "react";
import { indexJob } from "../services/jobs-service";
import { Link } from "react-router";

const JobsPage = () => {

    const initialFilters = {
        q: "",
        budgetType: "",
        experienceLevel: "",
        minBudget: "",
        maxBudget: "",
    }

    const initialState = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    }

    const [jobs, setJobs] = useState([])
    const [meta, setMeta] = useState(initialState)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [formFilters, setFormFilters] = useState(initialFilters)
    const [appliedFilters, setAppliedFilters] = useState(initialFilters)

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true)
            setError(null)
            try {

                const cleanFilters = Object.entries(appliedFilters).reduce(
                    (acc, [key, value]) => {
                        if (value !== "") {
                            acc[key] = value
                        }
                        return acc
                    },
                    {},
                )

                const response = await indexJob({
                    page: currentPage,
                    limit: 10,
                    ...cleanFilters
                })
                setJobs(response.data)
                setMeta(response.meta)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchJobs()
    }, [currentPage, appliedFilters])

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
        }
    }

    const handleNextPage = () => {
        const maxPage = Math.ceil(meta.total / (meta.limit || 10))
        if (currentPage < maxPage) {
            setCurrentPage((prev) => prev + 1)
        }
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormFilters((prev) => ({ ...prev, [name]: value }));
    }

    const handleSearch = (event) => {
        event.preventDefault();
        setCurrentPage(1);
        setAppliedFilters(formFilters);
    }
    const handleReset = () => {
        setFormFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setCurrentPage(1);
    }

    return (
        <div>

            <h1>Available Jobs</h1>

            <form onSubmit={handleSearch}>
                <div>
                    <input
                        type="text"
                        name="q"
                        placeholder="Search keywords..."
                        value={formFilters.q}
                        onChange={handleInputChange}
                    />
                    <button type="submit">Search</button>
                    <button type="button" onClick={handleReset}>
                        Reset
                    </button>
                </div>

                <div>
                    <select
                        name="budgetType"
                        value={formFilters.budgetType}
                        onChange={handleInputChange}
                    >
                        <option value="">All Budget Types</option>
                        <option value="fixed">Fixed</option>
                        <option value="hourly">Hourly</option>
                    </select>

                    <select
                        name="experienceLevel"
                        value={formFilters.experienceLevel}
                        onChange={handleInputChange}
                    >
                        <option value="">All Experience Levels</option>
                        <option value="entry">Entry</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                    </select>

                    <input
                        type="number"
                        name="minBudget"
                        placeholder="Min Budget"
                        value={formFilters.minBudget}
                        onChange={handleInputChange}
                    />

                    <input
                        type="number"
                        name="maxBudget"
                        placeholder="Max Budget"
                        value={formFilters.maxBudget}
                        onChange={handleInputChange}
                    />
                </div>
            </form>
            <hr />


            {loading && <p>Loading jobs...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && jobs.length === 0 && <p>No jobs found.</p>}
            {!loading && !error && jobs.length > 0 && (
                <>
                    <div>
                        {
                            jobs.map((job) => (
                                <div key={job._id}>
                                    <h3>
                                        <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                                    </h3>                                    <p>{job.description}</p>
                                    <ul>
                                        <li>
                                            <strong>Budget:</strong> ${job.budgetMin || 0} - $
                                            {job.budgetMax || 0}
                                        </li>
                                        <li>
                                            <strong>Type:</strong> {job.budgetType}
                                        </li>
                                        <li>
                                            <strong>Level:</strong> {job.experienceLevel}
                                        </li>
                                    </ul>
                                    <hr />
                                </div>
                            ))
                        }
                    </div>

                    <div>
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage <= 1}
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {Math.ceil(meta.total / (meta.limit)) || 1}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= (Math.ceil(meta.total / (meta.limit)))}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    )
};

export default JobsPage;
