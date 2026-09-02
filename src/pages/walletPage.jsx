import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserWallet, depositFundsApi, withdrawFundsApi } from '../services/wallet-service';

export const WalletPage = () => {
  const queryClient = useQueryClient();

  const [activeModal, setActiveModal] = useState(null);
  const [amount, setAmount] = useState('');
  const [card, setCard] = useState('4242424242424242');
  const [filterType, setFilterType] = useState('All');
  const [actionError, setActionError] = useState(null);

  const {
    data: walletResponse,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchUserWallet,
  });

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
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-4xl text-brand-teal">progress_activity</span>
          <p className="font-medium text-brand-teal">Loading secure wallet...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-brand-cream p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-brand-danger">
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
    <main className="mx-auto min-h-screen max-w-[1280px] bg-brand-cream px-6 py-10 text-ink">
      <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-teal md:text-3xl m-0">Wallet &amp; Transactions</h1>
          <p className="mt-1 text-sm text-teal-600 m-0">Manage your earnings, pending escrow funds, and ledger history.</p>
        </div>
        <button
          onClick={() => setActiveModal('deposit')}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-teal px-5 py-2.5 font-medium text-white transition hover:bg-teal-900 cursor-pointer border-0"
        >
          <span className="material-symbols-outlined text-sm">add_card</span>
          Add Funds
        </button>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex h-48 flex-col justify-between rounded-xl border border-cream-200 bg-white p-6 shadow-2xs">
          <div>
            <h2 className="text-sm font-medium text-teal-600 m-0">Available Balance</h2>
            <div className="mt-2 text-4xl font-bold text-teal-900">
              ${wallet.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setActiveModal('withdraw')}
              className="flex items-center gap-2 rounded-lg bg-accent-sand px-5 py-2 text-sm font-medium text-brand-teal transition hover:opacity-90 cursor-pointer border-0"
            >
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              Withdraw Funds
            </button>
          </div>
        </div>

        <div className="relative flex h-48 flex-col justify-between overflow-hidden rounded-xl border border-cream-200 bg-white p-6 shadow-2xs">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-teal-600 opacity-10 blur-3xl"></div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-teal-600 m-0">Pending Escrow</h2>
              <span className="material-symbols-outlined cursor-help text-[16px] text-gray-400" title="Funds held in escrow until milestones are approved.">
                info
              </span>
            </div>
            <div className="mt-2 text-4xl font-bold text-teal-900">
              ${wallet.pending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-teal-600">Protected by GCC Escrow System</span>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-cream-200 bg-white shadow-2xs">
        <div className="flex flex-col justify-between gap-4 border-b border-cream-200 bg-brand-cream/40 p-6 sm:flex-row sm:items-center">
          <h3 className="text-lg font-semibold text-ink m-0">Transaction History</h3>
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-cream-200 bg-white px-3 py-1.5 text-sm text-ink focus:border-brand-teal focus:outline-none"
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
            <thead className="border-b border-cream-200 bg-brand-cream/20">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-teal-900">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-teal-900">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-teal-900">Reference / Contract</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-teal-900">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-teal-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-sm text-ink">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No recorded transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="transition-colors hover:bg-brand-cream/20">
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-xs">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          tx.type === 'deposit'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : tx.type === 'escrow_release'
                            ? 'bg-[#EEF7F5] text-brand-success border border-brand-success/20'
                            : tx.type === 'platform_fee'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-ink">
                      {tx.contract?.title || tx.reference || 'Wallet Operation'}
                    </td>
                    <td
                      className={`whitespace-nowrap px-6 py-4 text-right font-bold ${
                        tx.direction === 'credit' ? 'text-brand-success' : 'text-ink'
                      }`}
                    >
                      {tx.direction === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="inline-flex rounded-full bg-brand-cream px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-teal-900 border border-cream-200">
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

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-cream-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-cream-100">
              <h3 className="text-lg font-bold text-ink m-0">
                {activeModal === 'deposit' ? 'Add Funds (Mock Gateway)' : 'Withdraw Funds'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-ink cursor-pointer border-0 bg-transparent">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {actionError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-brand-danger border border-red-200 font-medium">
                {actionError}
              </div>
            )}

            {activeModal === 'deposit' ? (
              <form onSubmit={onDepositSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 500"
                    required
                    className="w-full rounded-lg border border-cream-200 bg-brand-cream p-2.5 text-xs focus:bg-white focus:border-brand-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Mock Card Preset</label>
                  <select
                    value={card}
                    onChange={(e) => setCard(e.target.value)}
                    className="w-full rounded-lg border border-cream-200 bg-brand-cream p-2.5 text-xs focus:bg-white focus:border-brand-teal outline-none"
                  >
                    <option value="4242424242424242">4242 4242 4242 4242 (Always Succeeds)</option>
                    <option value="4000000000000002">4000 0000 0000 0002 (Declined - 402)</option>
                    <option value="4000000000009995">4000 0000 0000 9995 (Insufficient Funds - 402)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="w-full rounded-lg bg-brand-teal py-3 text-xs font-bold text-white transition hover:bg-teal-900 disabled:opacity-50 cursor-pointer border-0 shadow-xs"
                >
                  {isDepositing ? 'Processing Deposit...' : 'Confirm Deposit'}
                </button>
              </form>
            ) : (
              <form onSubmit={onWithdrawSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Withdraw Amount (USD)</label>
                  <input
                    type="number"
                    min="1"
                    max={wallet.available}
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 250"
                    required
                    className="w-full rounded-lg border border-cream-200 bg-brand-cream p-2.5 text-xs focus:bg-white focus:border-brand-teal outline-none"
                  />
                  <span className="mt-1 block text-[11px] text-teal-600">
                    Maximum available: ${wallet.available.toFixed(2)}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isWithdrawing}
                  className="w-full rounded-lg bg-accent-sand py-3 text-xs font-bold text-brand-teal transition hover:bg-accent-sand-hover disabled:opacity-50 cursor-pointer border-0 shadow-xs"
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

export default WalletPage;