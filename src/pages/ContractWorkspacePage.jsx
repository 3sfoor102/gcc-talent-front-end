import { useEffect, useState, useTransition } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  getContractById,
  fundMilestone,
  startMilestone,
  deliverMilestone,
  approveMilestone,
  requestMilestoneRevision,
  openDispute,
  addMilestone
} from "../services/contracts-service";

const ContractWorkspacePage = ({ user }) => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'deliver' | 'revise' | 'dispute' | 'addMilestone' | 'approve'
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);

  // Form states for modals
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryAttachmentUrl, setDeliveryAttachmentUrl] = useState("");
  const [deliveryAttachmentName, setDeliveryAttachmentName] = useState("");

  const [revisionNote, setRevisionNote] = useState("");
  const [disputeReason, setDisputeReason] = useState("");

  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [newMilestoneAmount, setNewMilestoneAmount] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");

  const currentUserId = user?.id || user?._id || user?.userId;

  const fetchWorkspace = async () => {
    try {
      setError(null);
      const data = await getContractById(contractId);
      setContract(data);
    } catch (err) {
      setError(err.message || "Failed to load contract details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      fetchWorkspace();
    }
  }, [contractId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <p className="text-teal-600 text-lg font-semibold animate-pulse">
          Loading Contract Workspace...
        </p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-[1280px] mx-auto p-8">
        <div className="p-4 bg-[#FDECEB] text-brand-danger border border-brand-danger/20 rounded-lg">
          {error || "Contract not found."}
        </div>
        <Link
          to="/contracts"
          className="mt-4 inline-block text-brand-teal font-semibold hover:underline"
        >
          ← Back to My Contracts
        </Link>
      </div>
    );
  }

  const clientId = contract.client?._id || contract.client;
  const freelancerId = contract.freelancer?._id || contract.freelancer;

  const isClient = currentUserId?.toString() === clientId?.toString();
  const isFreelancer = currentUserId?.toString() === freelancerId?.toString();

  // Milestone Actions
  const handleFund = async (mid) => {
    setActionError(null);
    try {
      await fundMilestone(contract._id, mid);
      await fetchWorkspace();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleStart = async (mid) => {
    setActionError(null);
    try {
      await startMilestone(contract._id, mid);
      await fetchWorkspace();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const submitApprove = async () => {
    setActionError(null);
    try {
      await approveMilestone(contract._id, selectedMilestoneId);
      closeModal();
      await fetchWorkspace();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const submitDeliver = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      const attachments = deliveryAttachmentUrl
        ? [{ url: deliveryAttachmentUrl, name: deliveryAttachmentName || "Deliverable" }]
        : [];
      await deliverMilestone(contract._id, selectedMilestoneId, {
        message: deliveryMessage,
        attachments
      });
      closeModal();
      await fetchWorkspace();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const submitRevision = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await requestMilestoneRevision(contract._id, selectedMilestoneId, revisionNote);
      closeModal();
      await fetchWorkspace();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const submitDispute = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await openDispute(contract._id, selectedMilestoneId, {
        reason: disputeReason,
        evidence: []
      });
      closeModal();
      await fetchWorkspace();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const submitAddMilestone = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await addMilestone(contract._id, {
        title: newMilestoneTitle,
        description: newMilestoneDesc,
        amount: Number(newMilestoneAmount),
        dueDate: newMilestoneDueDate || undefined
      });
      closeModal();
      await fetchWorkspace();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const openModal = (type, mid = null) => {
    setActionError(null);
    setSelectedMilestoneId(mid);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedMilestoneId(null);
    setDeliveryMessage("");
    setDeliveryAttachmentUrl("");
    setDeliveryAttachmentName("");
    setRevisionNote("");
    setDisputeReason("");
    setNewMilestoneTitle("");
    setNewMilestoneDesc("");
    setNewMilestoneAmount("");
    setNewMilestoneDueDate("");
  };

  const otherUser = isClient ? contract.freelancer : contract.client;
  const otherRole = isClient ? "Freelancer" : "Client";

  return (
    <div className="bg-brand-cream min-h-screen text-ink pb-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-8">
        
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/contracts"
            className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-brand-teal no-underline"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Contracts
          </Link>
          <span className="text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider bg-white border border-cream-200 text-teal-900 shadow-2xs">
            {contract.status}
          </span>
        </div>

        {/* Global Error Banner */}
        {actionError && (
          <div className="mb-6 p-4 bg-[#FDECEB] text-brand-danger border border-brand-danger/20 rounded-lg text-sm flex items-center justify-between">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-brand-danger font-bold text-base cursor-pointer border-0 bg-transparent"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Grid */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1">
                {contract.title}
              </h1>
              <p className="text-sm text-teal-600 font-medium">
                Milestone workspace and escrow ledger
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link
                to={`/messages?userId=${otherUser?._id || otherUser}&contractId=${contract._id}`}
                className="px-4 py-2 bg-white border border-cream-200 text-ink rounded-lg text-sm font-semibold hover:bg-cream-200 transition-colors flex items-center gap-1.5 shadow-2xs no-underline"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Message {otherRole}
              </Link>
            </div>
          </div>

          {/* Bento Cards Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-2xs flex flex-col justify-between">
              <div className="text-xs font-bold text-teal-600 uppercase tracking-wider flex justify-between items-center">
                <span>Contract Status</span>
                <span className="material-symbols-outlined text-[18px]">info</span>
              </div>
              <div className="my-3">
                <span className="text-2xl font-bold text-brand-teal capitalize">
                  {contract.status.replace("_", " ")}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Created on {new Date(contract.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-2xs flex flex-col justify-between">
              <div className="text-xs font-bold text-teal-600 uppercase tracking-wider flex justify-between items-center">
                <span>Total Contract Budget</span>
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold text-teal-900">
                  ${contract.totalAmount?.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1 font-medium">{contract.currency || 'USD'}</span>
              </div>
              <div className="text-xs text-teal-600 font-medium">
                Protected via Simulated Escrow
              </div>
            </div>

            <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-2xs">
              <div className="text-xs font-bold text-teal-600 uppercase tracking-wider flex justify-between items-center mb-4">
                <span>Participants</span>
                <span className="material-symbols-outlined text-[18px]">group</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center font-bold text-xs text-brand-teal overflow-hidden shrink-0">
                    {contract.client?.avatarUrl ? (
                      <img src={contract.client.avatarUrl} alt="Client" className="w-full h-full object-cover" />
                    ) : (
                      contract.client?.name?.charAt(0) || "C"
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-ink truncate m-0">{contract.client?.name || "Client"}</p>
                    <span className="text-[11px] text-gray-400">Client</span>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-cream-200/60" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center font-bold text-xs text-brand-teal overflow-hidden shrink-0">
                    {contract.freelancer?.avatarUrl ? (
                      <img src={contract.freelancer.avatarUrl} alt="Freelancer" className="w-full h-full object-cover" />
                    ) : (
                      contract.freelancer?.name?.charAt(0) || "F"
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-ink truncate m-0">{contract.freelancer?.name || "Freelancer"}</p>
                    <span className="text-[11px] text-gray-400">Freelancer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Milestones Section */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink m-0">Contract Milestones</h2>
            {isClient && contract.status === "active" && (
              <button
                type="button"
                onClick={() => openModal("addMilestone")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-teal-900 cursor-pointer transition-colors shadow-2xs border-0"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Milestone
              </button>
            )}
          </div>

          <div className="bg-white border border-cream-200 rounded-xl overflow-hidden shadow-2xs">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-cream-200 bg-brand-cream/40 text-xs font-bold text-teal-900 uppercase tracking-wider">
              <div className="col-span-5">Milestone Details</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Milestones List */}
            {(!contract.milestones || contract.milestones.length === 0) ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No milestones found on this contract.
              </div>
            ) : (
              contract.milestones.map((m, idx) => {
                return (
                  <div
                    key={m._id || idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-5 border-b border-cream-200/60 items-center hover:bg-brand-cream/20 transition-colors"
                  >
                    <div className="col-span-1 md:col-span-5 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink">{idx + 1}. {m.title}</span>
                      </div>
                      {m.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 m-0 leading-relaxed">
                          {m.description}
                        </p>
                      )}
                      {m.dueDate && (
                        <span className="text-[11px] text-teal-600">
                          Due: {new Date(m.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="col-span-1 md:col-span-2 md:text-right font-bold text-sm sm:text-base text-teal-900">
                      ${m.amount?.toLocaleString()}
                    </div>

                    <div className="col-span-1 md:col-span-2 flex md:justify-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        m.status === 'approved'
                          ? 'bg-[#EEF7F5] text-brand-success border-brand-success/20'
                          : m.status === 'funded'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : m.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : m.status === 'delivered'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : m.status === 'disputed'
                          ? 'bg-[#FDECEB] text-brand-danger border-brand-danger/20'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {m.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Action Controls per role and state machine */}
                    <div className="col-span-1 md:col-span-3 flex items-center justify-start md:justify-end gap-2 pt-2 md:pt-0">
                      {/* Client: Fund Pending Milestone */}
                      {isClient && m.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleFund(m._id)}
                          className="px-3.5 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors cursor-pointer border-0 shadow-2xs"
                        >
                          Fund Escrow
                        </button>
                      )}

                      {/* Freelancer: Start Funded Milestone */}
                      {isFreelancer && m.status === "funded" && (
                        <button
                          type="button"
                          onClick={() => handleStart(m._id)}
                          className="px-3.5 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors cursor-pointer border-0 shadow-2xs"
                        >
                          Start Work
                        </button>
                      )}

                      {/* Freelancer: Deliver In-Progress or Revision-Requested Milestone */}
                      {isFreelancer && (m.status === "in_progress" || m.status === "revision_requested") && (
                        <button
                          type="button"
                          onClick={() => openModal("deliver", m._id)}
                          className="px-3.5 py-1.5 bg-accent-sand hover:bg-accent-sand-hover text-brand-teal rounded-lg text-xs font-bold transition-colors cursor-pointer border-0 shadow-2xs"
                        >
                          Submit Delivery
                        </button>
                      )}

                      {/* Client: Review Delivery (Approve or Request Revision) */}
                      {isClient && m.status === "delivered" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openModal("revise", m._id)}
                            className="px-3 py-1.5 bg-white border border-cream-200 text-ink rounded-lg text-xs font-semibold hover:bg-cream-200 transition-colors cursor-pointer"
                          >
                            Revise
                          </button>
                          <button
                            type="button"
                            onClick={() => openModal("approve", m._id)}
                            className="px-3.5 py-1.5 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors cursor-pointer border-0 shadow-2xs"
                          >
                            Approve
                          </button>
                        </div>
                      )}

                      {/* Dispute Trigger (Any participant when funds are held in escrow) */}
                      {['funded', 'in_progress', 'delivered', 'revision_requested'].includes(m.status) && (
                        <button
                          type="button"
                          onClick={() => openModal("dispute", m._id)}
                          title="Open Dispute"
                          className="p-1.5 text-gray-400 hover:text-brand-danger transition-colors cursor-pointer bg-transparent border-0 flex items-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">gavel</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Activity Timeline Section */}
        {contract.activity && contract.activity.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-ink mb-4">Workspace Activity Log</h2>
            <div className="bg-white border border-cream-200 rounded-xl p-5 shadow-2xs divide-y divide-cream-100">
              {contract.activity.slice().reverse().map((act, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-600 text-[18px]">schedule</span>
                    <span className="text-ink font-medium">{act.message}</span>
                  </div>
                  <span className="text-gray-400">
                    {act.at ? new Date(act.at).toLocaleString() : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* MODAL: Approve Milestone Confirmation */}
      {activeModal === "approve" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-cream-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#EEF7F5] text-brand-success flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink m-0">Approve Milestone</h3>
                <p className="text-xs text-gray-500 m-0">Release escrow funds to freelancer</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to approve this milestone? This will immediately release the locked escrow funds to the freelancer's wallet (minus platform fees) and mark the milestone as approved.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-cream-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer border-0 bg-transparent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitApprove}
                className="px-5 py-2 text-xs font-bold bg-brand-teal text-white rounded-lg hover:bg-teal-900 cursor-pointer border-0 shadow-2xs"
              >
                Confirm & Release Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Submit Delivery */}
      {activeModal === "deliver" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-cream-200">
            <h3 className="text-lg font-bold text-ink mb-2">Submit Milestone Deliverables</h3>
            <p className="text-xs text-gray-500 mb-4">
              Add completion details and deliverable URLs for client verification.
            </p>
            <form onSubmit={submitDeliver} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Work Description / Notes</label>
                <textarea
                  rows="3"
                  required
                  value={deliveryMessage}
                  onChange={(e) => setDeliveryMessage(e.target.value)}
                  placeholder="Summarize the work done for this milestone..."
                  className="w-full text-xs p-2.5 border border-cream-200 rounded-lg bg-brand-cream focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Attachment / Work URL</label>
                <input
                  type="url"
                  value={deliveryAttachmentUrl}
                  onChange={(e) => setDeliveryAttachmentUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or GitHub PR"
                  className="w-full text-xs p-2.5 border border-cream-200 rounded-lg bg-brand-cream focus:bg-white outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer border-0 bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-brand-teal text-white rounded-lg hover:bg-teal-900 cursor-pointer border-0"
                >
                  Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Request Revision */}
      {activeModal === "revise" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-cream-200">
            <h3 className="text-lg font-bold text-ink mb-2">Request Revisions</h3>
            <p className="text-xs text-gray-500 mb-4">
              Specify what changes are required before this milestone can be approved.
            </p>
            <form onSubmit={submitRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Feedback Note</label>
                <textarea
                  rows="3"
                  required
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Describe the requested corrections..."
                  className="w-full text-xs p-2.5 border border-cream-200 rounded-lg bg-brand-cream focus:bg-white outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer border-0 bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-brand-danger text-white rounded-lg hover:bg-red-700 cursor-pointer border-0"
                >
                  Send Revision Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Open Dispute */}
      {activeModal === "dispute" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-cream-200">
            <h3 className="text-lg font-bold text-ink mb-2">Open Milestone Dispute</h3>
            <p className="text-xs text-gray-500 mb-4">
              This freezes the milestone escrow and submits the contract to the admin mediation board.
            </p>
            <form onSubmit={submitDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Reason for Dispute</label>
                <textarea
                  rows="3"
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain why agreement could not be reached..."
                  className="w-full text-xs p-2.5 border border-cream-200 rounded-lg bg-brand-cream focus:bg-white outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer border-0 bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-brand-danger text-white rounded-lg hover:bg-red-700 cursor-pointer border-0"
                >
                  Submit to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Milestone */}
      {activeModal === "addMilestone" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-cream-200">
            <h3 className="text-lg font-bold text-ink mb-2">Add New Milestone</h3>
            <form onSubmit={submitAddMilestone} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g. Backend API Integration"
                  className="w-full text-xs p-2.5 border border-cream-200 rounded-lg bg-brand-cream focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  placeholder="Deliverable specifications..."
                  className="w-full text-xs p-2.5 border border-cream-200 rounded-lg bg-brand-cream focus:bg-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={newMilestoneAmount}
                    onChange={(e) => setNewMilestoneAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full text-xs p-2.5 border border-cream-200 rounded-lg bg-brand-cream focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-cream-200 rounded-lg bg-brand-cream focus:bg-white outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer border-0 bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-brand-teal text-white rounded-lg hover:bg-teal-900 cursor-pointer border-0"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContractWorkspacePage;