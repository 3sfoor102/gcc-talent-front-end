import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { createJob, updateJob, showJob, getCategories, getSkills } from '../services/jobs-service'
import { uploadToCloudinary } from '../services/upload-service'

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
        attachments: [],
        status: 'open'
    }

    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState(initialFormData)
    const [categories, setCategories] = useState([])
    const [availableSkills, setAvailableSkills] = useState([])
    const [skillSearch, setSkillSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [optionsLoading, setOptionsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [uploadingFile, setUploadingFile] = useState(false)

    // Only treat as edit mode if jobId exists AND is not the literal string "new"
    const isEditMode = Boolean(jobId && jobId !== 'new')

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
                setError(err.response?.data?.error?.message || err.message || 'Failed to load options.')
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
                        attachments: job.attachments || [],
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

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploadingFile(true)
        setError(null)
        try {
            const uploadedAttachment = await uploadToCloudinary(file)
            setFormData((prev) => ({
                ...prev,
                attachments: [...prev.attachments, uploadedAttachment]
            }))
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to upload attachment.')
        } finally {
            setUploadingFile(false)
            event.target.value = ''
        }
    }

    const handleRemoveAttachment = (publicId) => {
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.filter((att) => att.public_id !== publicId)
        }))
    }

    const validateStep = (step) => {
        setError(null)
        if (step === 1) {
            if (!formData.title.trim()) {
                setError('Job title is required.')
                return false
            }
            if (!formData.category) {
                setError('Please select a category.')
                return false
            }
            if (!formData.description.trim()) {
                setError('Job description is required.')
                return false
            }
        }
        return true
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(3, prev + 1))
        }
    }

    const handlePrev = () => {
        setError(null)
        setCurrentStep((prev) => Math.max(1, prev - 1))
    }

    // Pure manual save trigger
    const handleSave = async (overrideStatus = null) => {
        if (!validateStep(1)) {
            setCurrentStep(1)
            return
        }

        setLoading(true)
        setError(null)

        const finalStatus = overrideStatus || formData.status

        const payload = {
            ...formData,
            status: finalStatus,
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
            navigate('/client/jobs')
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to save job.')
        } finally {
            setLoading(false)
        }
    }

    const filteredSkills = availableSkills.filter((s) =>
        s.name.toLowerCase().includes(skillSearch.toLowerCase())
    )

    const steps = [
        { num: 1, label: 'Details' },
        { num: 2, label: 'Skills' },
        { num: 3, label: 'Budget' }
    ]

    return (
        <div className="w-full max-w-[800px] mx-auto px-6 py-10">
            {/* Back Link & Title */}
            <div className="mb-6">
                <Link
                    to="/client/jobs"
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-teal-600 hover:text-ink transition-colors mb-2"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to My Jobs
                </Link>
                <h1 className="text-[30px] sm:text-[34px] font-semibold text-ink leading-tight">
                    {isEditMode ? 'Edit Job Posting' : 'Post a Job'}
                </h1>
            </div>

            {/* Progress Bar Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative max-w-md mx-auto">
                    <div className="absolute left-0 top-4 w-full h-0.5 bg-cream-200 -z-10" />

                    <div
                        className="absolute left-0 top-4 h-0.5 bg-brand-teal -z-10 transition-all duration-300"
                        style={{
                            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
                        }}
                    />

                    {steps.map((step) => {
                        const isActive = currentStep === step.num
                        const isCompleted = currentStep > step.num

                        return (
                            <button
                                key={step.num}
                                type="button"
                                onClick={() => {
                                    if (isCompleted || validateStep(currentStep)) {
                                        setCurrentStep(step.num)
                                    }
                                }}
                                className="flex flex-col items-center group cursor-pointer focus:outline-none"
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold ring-4 ring-brand-cream transition-all duration-200 ${isActive
                                        ? 'bg-brand-teal text-white'
                                        : isCompleted
                                            ? 'bg-brand-success text-white'
                                            : 'bg-white border border-cream-200 text-teal-600'
                                        }`}
                                >
                                    {isCompleted ? '✓' : step.num}
                                </div>
                                <span
                                    className={`text-[12px] font-medium mt-1 transition-colors ${isActive ? 'text-brand-teal font-semibold' : 'text-teal-600'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 p-4 bg-[#FDECEB] text-brand-danger border border-brand-danger/20 rounded-[8px] text-[14px] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Main Container - div instead of form to avoid native form submit triggers */}
            <div className="bg-white rounded-[8px] border border-cream-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6">

                {/* STEP 1: Job Details */}
                {currentStep === 1 && (
                    <div className="flex flex-col gap-5">
                        <div>
                            <h2 className="text-[20px] font-semibold text-ink">Job Details</h2>
                            <p className="text-[13px] text-teal-600 mt-0.5">
                                Start with a concise title and descriptive overview of the role.
                            </p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="title" className="text-[14px] font-medium text-ink">
                                Job Title <span className="text-brand-danger">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Senior React & Node.js Developer"
                                className="w-full px-4 py-2.5 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[15px] text-ink transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="category" className="text-[14px] font-medium text-ink">
                                Category <span className="text-brand-danger">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    disabled={optionsLoading}
                                    className="w-full appearance-none px-4 py-2.5 pr-10 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all cursor-pointer"
                                >
                                    <option value="">-- Select a Category --</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none text-[20px]">
                                    expand_more
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="description" className="text-[14px] font-medium text-ink">
                                Job Description <span className="text-brand-danger">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="6"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe deliverables, responsibilities, project scope, and prerequisites..."
                                className="w-full px-4 py-3 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[15px] text-ink resize-y transition-all leading-relaxed"
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: Skills & Expertise */}
                {currentStep === 2 && (
                    <div className="flex flex-col gap-5">
                        <div>
                            <h2 className="text-[20px] font-semibold text-ink">Skills & Expertise</h2>
                            <p className="text-[13px] text-teal-600 mt-0.5">
                                Define the technical abilities and experience necessary for this project.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="experienceLevel" className="text-[14px] font-medium text-ink">
                                    Experience Level
                                </label>
                                <div className="relative">
                                    <select
                                        id="experienceLevel"
                                        name="experienceLevel"
                                        value={formData.experienceLevel}
                                        onChange={handleChange}
                                        className="w-full appearance-none px-4 py-2.5 pr-10 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all cursor-pointer"
                                    >
                                        <option value="entry">Entry Level</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none text-[20px]">
                                        expand_more
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="duration" className="text-[14px] font-medium text-ink">
                                    Project Duration
                                </label>
                                <input
                                    id="duration"
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g. 1 to 3 months"
                                    className="w-full px-4 py-2.5 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
                                />
                            </div>
                        </div>

                        {/* Skill Selector */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[14px] font-medium text-ink">Required Skills</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-600 text-[18px]">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search available skills..."
                                    value={skillSearch}
                                    onChange={(e) => setSkillSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
                                />
                            </div>

                            {formData.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-teal text-white rounded-full text-[12px] font-medium shadow-xs"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => handleSkillToggle(skill)}
                                                className="hover:opacity-75 font-bold"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="p-3 bg-brand-cream rounded-[8px] border border-cream-200 max-h-40 overflow-y-auto flex flex-wrap gap-2 mt-1">
                                {optionsLoading ? (
                                    <p className="text-[13px] text-teal-600">Loading skills...</p>
                                ) : filteredSkills.length === 0 ? (
                                    <p className="text-[13px] text-teal-600">No matching skills found.</p>
                                ) : (
                                    filteredSkills.map((skill) => {
                                        const isChecked = formData.skills.includes(skill.name)
                                        return (
                                            <button
                                                key={skill._id}
                                                type="button"
                                                onClick={() => handleSkillToggle(skill.name)}
                                                className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${isChecked
                                                    ? 'bg-brand-teal text-white border-brand-teal'
                                                    : 'bg-white text-ink border-cream-200 hover:border-teal-600'
                                                    }`}
                                            >
                                                {isChecked ? '✓ ' : '+ '}
                                                {skill.name}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Budget, Attachments & Publication */}
                {currentStep === 3 && (
                    <div className="flex flex-col gap-5">
                        <div>
                            <h2 className="text-[20px] font-semibold text-ink">Budget & Schedule</h2>
                            <p className="text-[13px] text-teal-600 mt-0.5">
                                Set your budget expectations, deadline, and reference files.
                            </p>
                        </div>

                        {/* Pricing Model Cards */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[14px] font-medium text-ink">Pricing Model</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, budgetType: 'fixed' }))}
                                    className={`p-4 rounded-[8px] border cursor-pointer text-center flex flex-col items-center gap-2 transition-colors ${formData.budgetType === 'fixed'
                                        ? 'border-brand-teal bg-brand-cream/60'
                                        : 'border-cream-200 bg-white hover:bg-brand-cream/30'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[24px] text-teal-600">
                                        payments
                                    </span>
                                    <span className="text-[14px] font-medium text-ink">Fixed Price</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, budgetType: 'hourly' }))}
                                    className={`p-4 rounded-[8px] border cursor-pointer text-center flex flex-col items-center gap-2 transition-colors ${formData.budgetType === 'hourly'
                                        ? 'border-brand-teal bg-brand-cream/60'
                                        : 'border-cream-200 bg-white hover:bg-brand-cream/30'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[24px] text-teal-600">
                                        schedule
                                    </span>
                                    <span className="text-[14px] font-medium text-ink">Hourly Rate</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="budgetMin" className="text-[14px] font-medium text-ink">
                                    Min Budget ($)
                                </label>
                                <input
                                    id="budgetMin"
                                    type="number"
                                    name="budgetMin"
                                    value={formData.budgetMin}
                                    onChange={handleChange}
                                    placeholder="e.g. 500"
                                    className="w-full px-4 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="budgetMax" className="text-[14px] font-medium text-ink">
                                    Max Budget ($)
                                </label>
                                <input
                                    id="budgetMax"
                                    type="number"
                                    name="budgetMax"
                                    value={formData.budgetMax}
                                    onChange={handleChange}
                                    placeholder="e.g. 1500"
                                    className="w-full px-4 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="deadline" className="text-[14px] font-medium text-ink">
                                    Deadline
                                </label>
                                <input
                                    id="deadline"
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
                                />
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="flex flex-col gap-3 pt-2">
                            <label className="text-[14px] font-medium text-ink">Reference Attachments</label>
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer px-4 py-2 border border-cream-200 rounded-[8px] bg-brand-cream hover:bg-cream-200 text-[14px] font-medium text-ink flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-[18px] text-teal-600">
                                        upload_file
                                    </span>
                                    Upload File
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        disabled={uploadingFile}
                                        className="hidden"
                                    />
                                </label>
                                {uploadingFile && (
                                    <span className="text-[13px] text-teal-600 animate-pulse font-medium">
                                        Uploading...
                                    </span>
                                )}
                            </div>

                            {formData.attachments.length > 0 && (
                                <div className="flex flex-col gap-2 mt-1">
                                    {formData.attachments.map((file) => (
                                        <div
                                            key={file.public_id}
                                            className="flex items-center justify-between p-3 bg-brand-cream rounded-[8px] border border-cream-200 text-[13px]"
                                        >
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 font-medium text-teal-600 hover:text-ink transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">attach_file</span>
                                                {file.name || 'Attachment'}
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAttachment(file.public_id)}
                                                className="text-brand-danger font-semibold px-2 hover:opacity-80 text-[16px]"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status Select for Edit Mode */}
                        {isEditMode && (
                            <div className="flex flex-col gap-1.5 pt-2">
                                <label htmlFor="status" className="text-[14px] font-medium text-ink">
                                    Job Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full sm:w-60 px-4 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
                                >
                                    <option value="open">Open</option>
                                    <option value="draft">Draft</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Navigation Actions */}
                <div className="pt-6 border-t border-cream-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="px-5 py-2.5 rounded-[8px] border border-cream-200 text-[14px] font-medium text-teal-600 hover:bg-brand-cream transition-colors"
                            >
                                Previous Step
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditMode && currentStep === 3 && (
                            <button
                                type="button"
                                onClick={() => handleSave('draft')}
                                disabled={loading || uploadingFile || optionsLoading}
                                className="px-5 py-2.5 rounded-[8px] border border-cream-200 bg-white hover:bg-brand-cream text-[14px] font-medium text-ink transition-colors disabled:opacity-50"
                            >
                                Save as Draft
                            </button>
                        )}

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-6 py-2.5 bg-brand-teal text-white rounded-[8px] text-[14px] font-medium hover:opacity-90 transition-opacity"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleSave()}
                                disabled={loading || uploadingFile || optionsLoading}
                                className="px-6 py-2.5 bg-accent-sand hover:bg-accent-sand-hover text-white rounded-[8px] text-[14px] font-medium transition-colors disabled:opacity-50 shadow-xs"
                            >
                                {loading ? 'Saving...' : isEditMode ? 'Update Job' : 'Publish Job'}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default JobFormPage