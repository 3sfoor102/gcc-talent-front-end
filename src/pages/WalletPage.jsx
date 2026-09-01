import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserWallet, depositFundsApi, withdrawFundsApi } from '../services/wallet-service';

export const WalletPage = () => {
  const queryClient = useQueryClient();

  // Modal & Form States
  const [activeModal, setActiveModal] = useState(null); // 'deposit' | 'withdraw' | null
  const [amount, setAmount] = useState('');
  const [card, setCard] = useState('4242424242424242');
  const [filterType, setFilterType] = useState('All');
  const [actionError, setActionError] = useState(null);

  // Fetch Wallet Data (Balances & Transactions)
  const {
    data: walletResponse,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchUserWallet,
  });

  // Deposit Mutation
  const { mutate: handleDeposit, isPending: isDepositing } = useMutation({
    mutationFn: depositFundsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      closeModal();
    },
    onError: (err) => {
      setActionError(err.message);
    },
  });

  // Withdraw Mutation
  const { mutate: handleWithdraw, isPending: isWithdrawing } = useMutation({
    mutationFn: withdrawFundsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      closeModal();
    },
    onError: (err) => {
      setActionError(err.message);
    },
  });

  const closeModal = () => {
    setActiveModal(null);
    setAmount('');
    setActionError(null);
  };

  const onDepositSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setActionError('Please enter a valid deposit amount.');
      return;
    }
    handleDeposit({ amount: Number(amount), card });
  };

  const onWithdrawSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setActionError('Please enter a valid withdrawal amount.');
      return;
    }
    handleWithdraw({ amount: Number(amount) });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F0E9]">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#224548]">progress_activity</span>
          <p className="font-medium text-[#224548]">Loading secure wallet...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F7F0E9] p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-[#9B3B3B]">
          <h2 className="text-lg font-bold">Failed to load wallet</h2>
          <p className="mt-1 text-sm">{fetchError?.message || 'An unexpected error occurred.'}</p>
        </div>
      </div>
    );
  }

  const wallet = walletResponse?.data?.wallet || { available: 0, pending: 0 };
  const transactions = walletResponse?.data?.transactions || [];

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'All') return true;
    if (filterType === 'Deposits') return t.type === 'deposit';
    if (filterType === 'Escrow Releases') return t.type === 'escrow_release';
    if (filterType === 'Fees') return t.type === 'platform_fee';
    return true;
  });

  return (
    <main className="mx-auto min-h-screen max-w-[1280px] bg-[#f0fcfd] px-6 py-10 font-['Poppins'] text-[#121d1e]">
      {/* Header */}
      <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#224548] md:text-3xl">Wallet &amp; Transactions</h1>
          <p className="mt-1 text-sm text-[#404849]">Manage your earnings, pending escrow funds, and ledger history.</p>
        </div>
        <button
          onClick={() => setActiveModal('deposit')}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#224548] px-5 py-2.5 font-medium text-white transition hover:bg-[#1A3638]"
        >
          <span className="material-symbols-outlined text-sm">add_card</span>
          Add Funds
        </button>
      </header>

      {/* Balance Cards */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Available Balance */}
        <div className="flex h-48 flex-col justify-between rounded-xl border border-[#c0c8c9] bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-sm font-medium text-[#404849]">Available Balance</h2>
            <div className="mt-2 text-4xl font-bold text-[#121d1e]">
              ${wallet.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setActiveModal('withdraw')}
              className="flex items-center gap-2 rounded-lg bg-[#3a6569] px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Pending Escrow */}
        <div className="relative flex h-48 flex-col justify-between overflow-hidden rounded-xl border border-[#c0c8c9] bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#bdebef] opacity-20 blur-3xl"></div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-[#404849]">Pending Escrow</h2>
              <span className="material-symbols-outlined cursor-help text-[16px] text-[#717979]" title="Funds held in escrow until milestones are approved.">
                info
              </span>
            </div>
            <div className="mt-2 text-4xl font-bold text-[#121d1e]">
              ${wallet.pending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-[#717979]">Protected by GCC Escrow System</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <section className="overflow-hidden rounded-xl border border-[#c0c8c9] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-[#c0c8c9] bg-[#eaf6f7] p-6 sm:flex-row sm:items-center">
          <h3 className="text-lg font-semibold text-[#121d1e]">Transaction History</h3>
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-[#c0c8c9] bg-[#f0fcfd] px-3 py-1.5 text-sm text-[#121d1e] focus:border-[#3a6569] focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Deposits">Deposits</option>
              <option value="Escrow Releases">Escrow Releases</option>
              <option value="Fees">Fees</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-[#c0c8c9] bg-[#d9e5e6]">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-[#404849]">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#404849]">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#404849]">Reference / Contract</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#404849]">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#404849]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c0c8c9] text-sm text-[#121d1e]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[#717979]">
                    No recorded transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="transition-colors hover:bg-[#eaf6f7]">
                    <td className="whitespace-nowrap px-6 py-4 text-[#404849]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          tx.type === 'deposit'
                            ? 'bg-[#d9e5e6] text-[#121d1e]'
                            : tx.type === 'escrow_release'
                            ? 'bg-[#bdebef] text-[#204d51]'
                            : tx.type === 'platform_fee'
                            ? 'bg-[#e5c194] text-[#291800]'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#404849]">
                      {tx.contract?.title || tx.reference || 'Wallet Operation'}
                    </td>
                    <td
                      className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${
                        tx.direction === 'credit' ? 'text-[#2F7D6D]' : 'text-[#121d1e]'
                      }`}
                    >
                      {tx.direction === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="inline-flex rounded-full bg-[#d9e5e6] px-2 py-0.5 text-xs font-medium text-[#121d1e]">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Backdrop & Container */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg border border-[#c0c8c9]">
            <div className="flex items-center justify-between pb-4 border-b border-[#c0c8c9]">
              <h3 className="text-lg font-bold text-[#224548]">
                {activeModal === 'deposit' ? 'Add Funds (Mock Gateway)' : 'Withdraw Funds'}
              </h3>
              <button onClick={closeModal} className="text-[#717979] hover:text-[#121d1e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {actionError && (
              <div className="mt-4 rounded bg-red-50 p-3 text-xs text-[#9B3B3B] border border-red-200">
                {actionError}
              </div>
            )}

            {activeModal === 'deposit' ? (
              <form onSubmit={onDepositSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#404849]">Amount (USD)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 500"
                    required
                    className="mt-1 w-full rounded-lg border border-[#c0c8c9] p-2 text-sm focus:border-[#224548] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#404849]">Mock Card Preset</label>
                  <select
                    value={card}
                    onChange={(e) => setCard(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#c0c8c9] p-2 text-sm focus:border-[#224548] focus:outline-none"
                  >
                    <option value="4242424242424242">4242 4242 4242 4242 (Always Succeeds)</option>
                    <option value="4000000000000002">4000 0000 0000 0002 (Declined - 402)</option>
                    <option value="4000000000009995">4000 0000 0000 9995 (Insufficient Funds - 402)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="w-full rounded-lg bg-[#224548] py-2.5 text-sm font-medium text-white transition hover:bg-[#1A3638] disabled:opacity-50"
                >
                  {isDepositing ? 'Processing Deposit...' : 'Confirm Deposit'}
                </button>
              </form>
            ) : (
              <form onSubmit={onWithdrawSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#404849]">Withdraw Amount (USD)</label>
                  <input
                    type="number"
                    min="1"
                    max={wallet.available}
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 250"
                    required
                    className="mt-1 w-full rounded-lg border border-[#c0c8c9] p-2 text-sm focus:border-[#224548] focus:outline-none"
                  />
                  <span className="mt-1 block text-xs text-[#717979]">
                    Maximum available: ${wallet.available.toFixed(2)}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isWithdrawing}
                  className="w-full rounded-lg bg-[#3a6569] py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {isWithdrawing ? 'Processing Payout...' : 'Confirm Withdrawal'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};