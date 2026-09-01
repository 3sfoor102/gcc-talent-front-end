import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { createJob, updateJob, showJob, getCategories, getSkills } from '../services/jobs-service'

const JobFormPage = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()

    const initialFormData = {
        title: '',
        description: '',
        category: '',
        skills: [],
        budgetType: 'fixed',
        budgetMin: '',
        budgetMax: '',
        experienceLevel: 'intermediate',
        duration: '',
        deadline: '',
        status: 'open'
    }

    const [formData, setFormData] = useState(initialFormData)
    const [categories, setCategories] = useState([])
    const [availableSkills, setAvailableSkills] = useState([])
    const [loading, setLoading] = useState(false)
    const [optionsLoading, setOptionsLoading] = useState(true)
    const [error, setError] = useState(null)

    const isEditMode = jobId ? true : false

    useEffect(() => {
        const fetchOptions = async () => {
            setOptionsLoading(true)
            try {

                const [categoriesData, skillsData] = await Promise.all([
                    getCategories(),
                    getSkills()
                ])

                setCategories(categoriesData)
                setAvailableSkills(skillsData)
            } catch (err) {
                setError(err.response?.data?.error?.message || err.message || 'Failed to load categories/skills.')
            } finally {
                setOptionsLoading(false)
            }
        }

        fetchOptions()
    }, [])

    useEffect(() => {
        if (isEditMode) {
            const fetchJobDetails = async () => {
                setLoading(true)
                try {
                    const job = await showJob(jobId)

                    setFormData({
                        title: job.title || '',
                        description: job.description || '',
                        category: job.category?.name || job.category || '',
                        skills: Array.isArray(job.skills)
                            ? job.skills
                                .map((s) => (typeof s === 'object' && s !== null ? s.name : s))
                                .filter(Boolean)
                            : [],
                        budgetType: job.budgetType || 'fixed',
                        budgetMin: job.budgetMin ?? '',
                        budgetMax: job.budgetMax ?? '',
                        experienceLevel: job.experienceLevel || 'intermediate',
                        duration: job.duration || '',
                        deadline: job.deadline ? job.deadline.split('T')[0] : '',
                        status: job.status || 'open'
                    })
                } catch (err) {
                    setError(err.response?.data?.error?.message || err.message || 'Failed to fetch job data.')
                } finally {
                    setLoading(false)
                }
            }

            fetchJobDetails()
        }
    }, [jobId, isEditMode])

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSkillToggle = (skillName) => {
        setFormData((prev) => {
            const isSelected = prev.skills.includes(skillName)
            return {
                ...prev,
                skills: isSelected
                    ? prev.skills.filter((name) => name !== skillName)
                    : [...prev.skills, skillName]
            }
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const payload = {
            ...formData,
            budgetMin: formData.budgetMin !== '' ? Number(formData.budgetMin) : undefined,
            budgetMax: formData.budgetMax !== '' ? Number(formData.budgetMax) : undefined,
            deadline: formData.deadline || undefined
        }

        try {
            if (isEditMode) {
                await updateJob(jobId, payload)
            } else {
                await createJob(payload)
            }
            navigate('/jobs')
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to save job.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>{isEditMode ? 'Edit Job' : 'Post a New Job'}</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading && isEditMode && <p>Loading job data...</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title: </label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description">Description: </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="category">Category: </label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        disabled={optionsLoading}
                    >
                        <option value="">-- Select a Category --</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <fieldset>
                    <legend>Skills (Select Multiple):</legend>
                    {optionsLoading && <p>Loading skills list...</p>}
                    {!optionsLoading && availableSkills.length === 0 && <p>No skills found.</p>}

                    <div>
                        {availableSkills.map((skill) => {
                            const isChecked = formData.skills.includes(skill.name)
                            return (
                                <label key={skill._id}>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleSkillToggle(skill.name)}
                                    />
                                    {skill.name}
                                </label>
                            )
                        })}
                    </div>
                </fieldset>

                <div>
                    <label htmlFor="budgetType">Budget Type: </label>
                    <select
                        id="budgetType"
                        name="budgetType"
                        value={formData.budgetType}
                        onChange={handleChange}
                        required
                    >
                        <option value="fixed">Fixed</option>
                        <option value="hourly">Hourly</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="budgetMin">Min Budget: </label>
                    <input
                        id="budgetMin"
                        type="number"
                        name="budgetMin"
                        value={formData.budgetMin}
                        onChange={handleChange}
                    />

                    <label htmlFor="budgetMax">Max Budget: </label>
                    <input
                        id="budgetMax"
                        type="number"
                        name="budgetMax"
                        value={formData.budgetMax}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="experienceLevel">Experience Level: </label>
                    <select
                        id="experienceLevel"
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleChange}
                    >
                        <option value="entry">Entry</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="duration">Duration: </label>
                    <input
                        id="duration"
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g. 1 to 3 months"
                    />
                </div>

                <div>
                    <label htmlFor="deadline">Deadline: </label>
                    <input
                        id="deadline"
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="status">Status: </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="open">Open</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                <br />

                <button type="submit" disabled={loading || optionsLoading}>
                    {loading ? 'Saving...' : isEditMode ? 'Update Job' : 'Create Job'}
                </button>
            </form>
        </div>
    )
}

export default JobFormPage