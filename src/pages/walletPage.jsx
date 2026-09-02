import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserWallet, depositFundsApi, withdrawFundsApi } from '../services/wallet-service';

export const WalletPage = () => {
  const queryClient = useQueryClient();

  const [activeModal, setActiveModal] = useState(null);
  const [amount, setAmount] = useState('500');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
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
    setAmount('500');
    setCardholderName('');
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvc('123');
    setActionError(null);
  };

  const onDepositSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setActionError('Please enter a valid deposit amount.');
      return;
    }
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.startsWith('4000')) {
      setActionError('Payment Declined: Insufficient funds or invalid card.');
      return;
    }
    handleDeposit({ amount: Number(amount), card: cleanCard });
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
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-teal px-5 py-2.5 font-medium text-white transition hover:bg-teal-900 cursor-pointer border-0 shadow-xs"
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
              className="flex items-center gap-2 rounded-lg bg-accent-sand px-5 py-2 text-sm font-medium text-brand-teal transition hover:opacity-90 cursor-pointer border-0 shadow-xs"
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

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          {activeModal === 'deposit' ? (
            /* Compact Checkout Modal */
            <div className="w-full max-w-md bg-white rounded-2xl border border-cream-200 shadow-2xl overflow-hidden animate-fadeIn my-4">
              
              {/* Header Title Bar */}
              <div className="px-5 py-4 border-b border-cream-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink leading-tight m-0">Fund Escrow</h2>
                  <p className="text-[11px] text-teal-600 m-0 mt-0.5">Securely deposit funds into your account wallet.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-[#ffddb4] text-[#291800] px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">shield</span>
                    Escrow Protected
                  </div>
                  <button 
                    onClick={closeModal} 
                    className="text-gray-400 hover:text-ink cursor-pointer border-0 bg-transparent flex items-center p-0.5 ml-1"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3.5">
                {actionError && (
                  <div className="rounded-lg bg-red-50 p-2.5 text-xs text-brand-danger border border-red-200 font-medium">
                    {actionError}
                  </div>
                )}

                {/* Amount / Deposit Summary */}
                <div className="bg-[#f0fcfd]/70 rounded-xl p-3 border border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold text-teal-700 uppercase tracking-wider">Deposit Summary</span>
                    <span className="text-[11px] text-gray-500">Account Wallet Balance Top-Up</span>
                  </div>
                  <span className="text-xl font-bold text-brand-teal">
                    ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Test Helper Box */}
                <div className="bg-[#bdebef]/50 text-[#204d51] rounded-lg px-3 py-2 border border-[#a1ced3] flex gap-2 items-center text-[11px]">
                  <span className="material-symbols-outlined text-sm shrink-0">info</span>
                  <span className="truncate">Test cards: <strong>4242…4242</strong> (success) or <strong>4000…0002</strong> (decline)</span>
                </div>

                {/* Payment Form */}
                <form onSubmit={onDepositSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-ink" htmlFor="depositAmount">Deposit Amount (USD)</label>
                    <input
                      id="depositAmount"
                      type="number"
                      min="1"
                      step="any"
                      placeholder="e.g. 500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full bg-[#f8fbfb] rounded-lg border border-cream-200 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-ink" htmlFor="cardholderName">Cardholder Name</label>
                    <input
                      id="cardholderName"
                      type="text"
                      placeholder="Name on card"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      required
                      className="w-full bg-[#f8fbfb] rounded-lg border border-cream-200 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-ink" htmlFor="cardNumber">Card Number</label>
                    <div className="relative">
                      <input
                        id="cardNumber"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        className="w-full bg-[#f8fbfb] rounded-lg border border-cream-200 pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink"
                      />
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                        credit_card
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-ink" htmlFor="expiry">Expiration</label>
                      <input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                        className="w-full bg-[#f8fbfb] rounded-lg border border-cream-200 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors text-ink"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-ink" htmlFor="cvc">CVC</label>
                      <input
                        id="cvc"
                        type="text"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        required
                        className="w-full bg-[#f8fbfb] rounded-lg border border-cream-200 px-3 py-2 text-xs focus:bg-white focus:border-brand-teal outline-none transition-colors text-ink"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isDepositing}
                    className="mt-2 w-full bg-brand-teal hover:bg-teal-900 text-white rounded-lg py-2.5 px-4 font-semibold text-xs transition-colors flex justify-center items-center gap-2 cursor-pointer border-0 shadow-xs disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    {isDepositing
                      ? 'Processing Deposit...'
                      : `Fund Escrow ($${Number(amount || 0).toFixed(2)})`}
                  </button>

                  <div className="text-center flex items-center justify-center gap-1 text-teal-600 text-[10px]">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Secure SSL Encryption
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Withdraw Modal */
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-cream-200 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-cream-100">
                <h3 className="text-lg font-bold text-ink m-0">Withdraw Funds</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-ink cursor-pointer border-0 bg-transparent">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {actionError && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-brand-danger border border-red-200 font-medium">
                  {actionError}
                </div>
              )}

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
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default WalletPage;