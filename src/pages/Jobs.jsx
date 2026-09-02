import { useState, useEffect } from "react";
import { indexJob } from "../services/jobs-service";
import { useNavigate } from "react-router";

const JobsPage = () => {
  const navigate = useNavigate();

  const initialFilters = {
    q: "",
    budgetType: "",
    experienceLevel: "",
    minBudget: "",
    maxBudget: "",
  };

  const initialState = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState(initialState);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [formFilters, setFormFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const cleanFilters = Object.entries(appliedFilters).reduce(
          (acc, [key, value]) => {
            if (value !== "" && value !== undefined && value !== null) {
              acc[key] = typeof value === "string" ? value.trim() : value;
            }
            return acc;
          },
          {}
        );

        const response = await indexJob({
          page: currentPage,
          limit: 10,
          ...cleanFilters,
        });
        setJobs(response.data || []);
        setMeta(response.meta || initialState);
      } catch (err) {
        setError(err.response?.data?.error?.message || err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [currentPage, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 10)));

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setValidationError(null);
    setFormFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    // Logical Restriction: Non-negative budgets
    if (
      (formFilters.minBudget !== "" && Number(formFilters.minBudget) < 0) ||
      (formFilters.maxBudget !== "" && Number(formFilters.maxBudget) < 0)
    ) {
      setValidationError("Budget amounts cannot be negative.");
      return;
    }

    // Logical Restriction: minBudget cannot exceed maxBudget
    if (
      formFilters.minBudget !== "" &&
      formFilters.maxBudget !== "" &&
      Number(formFilters.minBudget) > Number(formFilters.maxBudget)
    ) {
      setValidationError("Minimum budget cannot exceed maximum budget.");
      return;
    }

    setValidationError(null);
    setCurrentPage(1);
    setAppliedFilters(formFilters);
    setIsMobileFilterOpen(false);
  };

  const handleReset = () => {
    setValidationError(null);
    setFormFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setCurrentPage(1);
    setIsMobileFilterOpen(false);
  };

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const filterFormContent = (
    <form onSubmit={handleSearch} className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-cream-200">
        <span className="text-[16px] font-semibold text-ink">Filters</span>
        <button
          type="button"
          onClick={handleReset}
          className="text-[12px] font-medium text-teal-600 hover:text-ink transition-colors bg-transparent border-0 cursor-pointer p-0"
        >
          Reset All
        </button>
      </div>

      {validationError && (
        <div className="p-2.5 bg-red-50 text-brand-danger text-xs rounded border border-red-200 flex justify-between items-center">
          <span>{validationError}</span>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-brand-danger font-bold text-xs bg-transparent border-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-ink">Keywords</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-600 text-[18px]">
            search
          </span>
          <input
            type="text"
            name="q"
            placeholder="e.g. React, UX Design..."
            value={formFilters.q}
            onChange={handleInputChange}
            className="w-full pl-9 pr-3 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-ink">Budget Type</label>
        <select
          name="budgetType"
          value={formFilters.budgetType}
          onChange={handleInputChange}
          className="w-full px-3 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all cursor-pointer"
        >
          <option value="">All Budget Types</option>
          <option value="fixed">Fixed Price</option>
          <option value="hourly">Hourly Rate</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-ink">Experience Level</label>
        <select
          name="experienceLevel"
          value={formFilters.experienceLevel}
          onChange={handleInputChange}
          className="w-full px-3 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all cursor-pointer"
        >
          <option value="">All Experience Levels</option>
          <option value="entry">Entry Level</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-ink">Budget Range ($)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            name="minBudget"
            placeholder="Min"
            value={formFilters.minBudget}
            onChange={handleInputChange}
            className="w-full px-3 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
          />
          <input
            type="number"
            min="0"
            name="maxBudget"
            placeholder="Max"
            value={formFilters.maxBudget}
            onChange={handleInputChange}
            className="w-full px-3 py-2 rounded-[8px] border border-cream-200 bg-brand-cream focus:bg-white focus:border-teal-600 outline-none text-[14px] text-ink transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 mt-2 bg-brand-teal text-white rounded-[8px] text-[14px] font-medium hover:opacity-90 transition-opacity border-0 cursor-pointer"
      >
        Apply Filters
      </button>
    </form>
  );

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink leading-tight m-0">
            Explore Opportunities
          </h1>
          <p className="text-[14px] text-teal-600 mt-1 mb-0">
            Browse verified contracts and high-value projects across the GCC.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-cream-200 rounded-[8px] text-[14px] font-medium text-ink shadow-xs self-start cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-teal-600">tune</span>
          Filter Jobs
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-teal text-white text-[11px] flex items-center justify-center font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        <aside className="hidden lg:block lg:w-4/12 xl:w-3/12 lg:sticky lg:top-4 lg:self-start bg-white border border-cream-200 rounded-[8px] p-5 shadow-sm">
          {filterFormContent}
        </aside>

        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 lg:hidden">
            <div className="bg-white border border-cream-200 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[12px] p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[18px] font-semibold text-ink">Filter Jobs</span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-teal-600 hover:text-ink text-[20px] bg-transparent border-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {filterFormContent}
            </div>
          </div>
        )}

        <main className="w-full lg:w-8/12 xl:w-9/12 flex flex-col gap-6">
          {error && (
            <div className="p-4 bg-[#FDECEB] text-brand-danger border border-brand-danger/20 rounded-[8px] text-[14px]">
              {error}
            </div>
          )}

          {loading && (
            <div className="min-h-[40vh] flex items-center justify-center">
              <p className="text-[16px] text-teal-600 animate-pulse font-medium">
                Searching for available jobs...
              </p>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="p-12 text-center bg-white border border-cream-200 rounded-[8px] shadow-sm flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[42px] text-teal-600/40">
                search_off
              </span>
              <p className="text-[16px] font-medium text-ink m-0">No jobs match your criteria.</p>
              <p className="text-[14px] text-teal-600 m-0">
                Try adjusting your filters or resetting them to view all jobs.
              </p>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {jobs.map((job) => (
                <article
                  key={job._id}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="p-5 bg-white border border-cream-200 rounded-[8px] shadow-sm hover:border-teal-600 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[17px] font-semibold text-ink group-hover:text-teal-600 transition-colors line-clamp-1 m-0">
                        {job.title}
                      </h2>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[15px] font-semibold text-teal-900">
                          ${job.budgetMin || 0} - ${job.budgetMax || 0}
                        </span>
                        <span className="text-[11px] text-teal-600 capitalize">
                          {job.budgetType || "Fixed"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-teal-600 text-[12px] font-medium">
                      {job.createdAt && (
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      )}
                      <span>•</span>
                      <span>{job.client?.country || "Remote"}</span>
                    </div>

                    <p className="text-[14px] leading-relaxed text-ink line-clamp-2 font-normal m-0">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-cream-200">
                    <span className="px-2 py-0.5 bg-brand-cream border border-cream-200 rounded-full text-[11px] font-medium text-teal-600">
                      Level: {job.experienceLevel || "Not specified"}
                    </span>
                    {job.category?.name && (
                      <span className="px-2 py-0.5 bg-brand-cream border border-cream-200 rounded-full text-[11px] font-medium text-teal-600">
                        {job.category.name}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage <= 1 || loading}
                className="px-4 py-2 bg-white border border-cream-200 text-ink rounded-[8px] text-[13px] font-medium disabled:opacity-40 hover:bg-cream-100 transition-colors shadow-xs cursor-pointer"
              >
                Previous
              </button>
              <span className="text-[13px] font-medium text-teal-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= totalPages || loading}
                className="px-4 py-2 bg-white border border-cream-200 text-ink rounded-[8px] text-[13px] font-medium disabled:opacity-40 hover:bg-cream-100 transition-colors shadow-xs cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobsPage;