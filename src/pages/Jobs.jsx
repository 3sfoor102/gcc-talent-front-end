import { useState, useEffect } from "react";
import { indexJob } from "../services/jobs-service";

const JobsPage = () => {

    const initialState = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    }

    const [jobs, setJobs] = useState([])
    const [meta, setMeta] = useState(initialState)
    const [currentPage, setCurrentPage] = useState(1)



    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await indexJob({
                    page: currentPage,
                    limit: 10,
                    // Need to add filters too
                })
                setJobs(response.data)
                setMeta(response.meta)
            } catch (err) {
                setError(err.message)
            }
        }
        fetchJobs()
    }, [currentPage])

    return (
        <>
            <h1>Available Jobs</h1>
            <h3>
                No. of posts: {meta.total}
            </h3>
            <div>

                {

                    jobs.map((job) => (
                        <div key={job._id}>
                            <h3>{job.title}</h3>
                            <p>{job.description}</p>
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
        </>
    )
};

export default JobsPage;
