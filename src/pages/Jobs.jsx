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
            <h1>Here we list jobs</h1>
        </>
    )
};

export default JobsPage;
