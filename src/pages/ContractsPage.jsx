import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { getContracts } from "../services/contracts-service";

const ContractsPage = ({ user }) => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getContracts(params);
      setContracts(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  const currentUserId = user?.id || user?._id || user?.userId;

  return (
    <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink m-0">Contracts & Workspaces</h1>
            <p className="text-teal-600 m-0 mt-1 text-sm">
              Manage your active contracts, escrow milestones, and work deliveries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="statusFilter" className="text-xs font-semibold text-ink">Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-cream-200 rounded-lg p-2 text-ink focus:outline-brand-teal"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-[#FDECEB] text-brand-danger rounded-lg text-sm border border-brand-danger/20">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-teal-600 font-semibold animate-pulse">
            Loading your contracts...
          </div>
        ) : contracts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-10 text-center">
            <div className="w-16 h-16 bg-cream-200 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">assignment</span>
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">No Contracts Found</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm leading-relaxed">
              Contracts are created once a client accepts a proposal or orders a service package.
            </p>
            <Link
              to="/jobs"
              className="px-6 py-2.5 bg-brand-teal text-white font-bold rounded-lg no-underline hover:bg-teal-900 transition-colors inline-block"
            >
              Explore Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((c) => {
              const isClient = (c.client?._id || c.client)?.toString() === currentUserId?.toString();
              const otherParty = isClient ? c.freelancer : c.client;

              return (
                <div
                  key={c._id}
                  onClick={() => navigate(`/contracts/${c._id}`)}
                  className="bg-white p-6 rounded-2xl shadow-2xs border border-cream-200 flex flex-col justify-between gap-4 hover:border-teal-600 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-base text-ink line-clamp-2 m-0 group-hover:text-teal-600 transition-colors">
                        {c.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        c.status === 'completed'
                          ? 'bg-[#EEF7F5] text-brand-success border-brand-success/20'
                          : c.status === 'cancelled'
                          ? 'bg-[#FDECEB] text-brand-danger border-brand-danger/20'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 m-0">
                      Partner: <strong className="text-ink">{otherParty?.name || "Participant"}</strong>
                    </p>

                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-lg font-bold text-teal-900">
                        ${c.totalAmount?.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {c.milestones?.length || 0} Milestones
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-cream-100 flex justify-between items-center text-xs font-semibold text-teal-600">
                    <span>Open Workspace</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;