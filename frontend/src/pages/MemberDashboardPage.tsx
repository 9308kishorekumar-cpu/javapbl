import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  AlertCircle,
  Clock,
  CheckCircle2,
  RotateCw,
  DollarSign,
  Calendar,
  Bookmark,
  RefreshCw,
  XCircle,
  Filter,
  Globe,
  TrendingUp,
  History,
  Check,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { Loan, Fine, Reservation, MemberLoanStats } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MemberDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Active Loans, Fines, Reservations (Quick Access)
  const [fines, setFines] = useState<Fine[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // History & Filter State
  const [historyLoans, setHistoryLoans] = useState<Loan[]>([]);
  const [historyStats, setHistoryStats] = useState<MemberLoanStats | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RETURNED' | 'OVERDUE'>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'history' | 'fines' | 'reservations'>('history');

  // Action Loading States
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Fetch Member History & Stats
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      setHistoryLoading(true);
      setError(null);

      const params: { from?: string; to?: string; status?: string; page: number; size: number } = {
        page,
        size: 8,
      };

      if (fromDate) params.from = new Date(fromDate + 'T00:00:00Z').toISOString();
      if (toDate) params.to = new Date(toDate + 'T23:59:59Z').toISOString();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const [historyRes, statsRes] = await Promise.all([
        api.getMemberHistory(user.id, params),
        api.getMemberLoanStats(user.id),
      ]);

      if (historyRes.success && historyRes.data) {
        setHistoryLoans(historyRes.data.content);
        setTotalPages(historyRes.data.totalPages || 1);
        setTotalElements(historyRes.data.totalElements || 0);
      }

      if (statsRes.success && statsRes.data) {
        setHistoryStats(statsRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load member history:', err);
      setError(err?.response?.data?.message || err?.message || 'Error loading borrowing history');
    } finally {
      setHistoryLoading(false);
    }
  }, [user, fromDate, toDate, statusFilter, page]);

  // 2. Fetch Supporting Member Activity (Fines, Reservations)
  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const [finesRes, resRes] = await Promise.all([
        api.getMyFines(),
        api.getMyReservations(),
      ]);

      if (finesRes.success && finesRes.data) setFines(finesRes.data);
      if (resRes.success && resRes.data) setReservations(resRes.data);
    } catch (err: any) {
      console.error('Failed to load member activity:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRenew = async (loanId: number) => {
    try {
      setRenewingId(loanId);
      setError(null);
      setSuccessMsg(null);
      const res = await api.renewLoan(loanId);
      if (res.success) {
        setSuccessMsg(res.message || 'Loan renewed successfully!');
        fetchHistory();
        fetchActivity();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to renew loan');
    } finally {
      setRenewingId(null);
    }
  };

  const handlePayFine = async (fineId: number, amount: number) => {
    try {
      setPayingId(fineId);
      setError(null);
      setSuccessMsg(null);
      const res = await api.payFine(fineId, { amount });
      if (res.success) {
        setSuccessMsg(res.message || 'Fine payment processed');
        fetchActivity();
        fetchHistory();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to process payment');
    } finally {
      setPayingId(null);
    }
  };

  const [returningId, setReturningId] = useState<number | null>(null);

  const handleReturnBook = async (loanId: number, bookTitle: string) => {
    try {
      setReturningId(loanId);
      setError(null);
      setSuccessMsg(null);
      const res = await api.returnLoanById(loanId);
      if (res.success && res.data) {
        const returnedLoan = res.data;
        if (returnedLoan.lateDays && returnedLoan.lateDays > 0) {
          setSuccessMsg(`"${bookTitle}" returned (${returnedLoan.lateDays}d late). Fine of $${(returnedLoan.fineAmount || 0).toFixed(2)} recorded. Copy is back in library available stock!`);
        } else {
          setSuccessMsg(`"${bookTitle}" returned successfully on-time! Physical copy is now back in available library stock (+1 available).`);
        }
        fetchActivity();
        fetchHistory();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

  const handleCancelReservation = async (resId: number) => {
    try {
      setError(null);
      await api.cancelReservation(resId);
      setSuccessMsg('Reservation cancelled');
      fetchActivity();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to cancel reservation');
    }
  };

  const handleExportCsv = () => {
    if (!historyLoans || historyLoans.length === 0) return;
    const headers = ['Book Title', 'Authors', 'ISBN', 'Barcode', 'Language', 'Category', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Late Days', 'Fine Amount'];
    const rows = historyLoans.map((l) => [
      `"${(l.bookTitle || '').replace(/"/g, '""')}"`,
      `"${(Array.isArray(l.bookAuthors) ? l.bookAuthors.join(', ') : l.bookAuthors || '').replace(/"/g, '""')}"`,
      `"${l.bookIsbn || ''}"`,
      `"${l.barcode || ''}"`,
      `"${(l.bookLanguage || 'en').toUpperCase()}"`,
      `"${l.bookCategory || 'General'}"`,
      `"${l.issueDate ? new Date(l.issueDate).toLocaleDateString() : ''}"`,
      `"${l.dueDate ? new Date(l.dueDate).toLocaleDateString() : ''}"`,
      `"${l.returnDate ? new Date(l.returnDate).toLocaleDateString() : ''}"`,
      `"${l.status || ''}"`,
      l.lateDays || 0,
      `"${l.fineAmount || 0}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LibraAI_Borrowing_History_${user?.username || 'member'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  const unpaidFinesTotal = fines
    .filter((f) => f.status === 'UNPAID' || f.status === 'PARTIALLY_PAID')
    .reduce((sum, f) => sum + (f.remainingAmount || f.amount), 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Bookmark className="w-4 h-4" /> Member Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            My Borrowing History &amp; Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Permanent lifetime borrowing history, multilingual holdings, automated return fines, and active loans
          </p>
        </div>

        <button
          onClick={() => {
            fetchActivity();
            fetchHistory();
          }}
          disabled={loading || historyLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || historyLoading ? 'animate-spin' : ''}`} />
          Refresh Activity
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Lifetime Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Loans */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Currently Active Loans</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {historyStats?.activeLoans ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 5 Max</span>
          </div>
          <p className="text-[11px] text-slate-500">Max 5 books active simultaneously</p>
        </div>

        {/* Lifetime Borrowed */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Lifetime Borrowed Titles</span>
            <History className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {historyStats?.totalLoans ?? 0}
          </div>
          <p className="text-[11px] text-slate-500">
            {historyStats?.returnedLoans ?? 0} successfully returned
          </p>
        </div>

        {/* Average Return Delay */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Average Late Delay</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {historyStats?.averageLateDays ?? 0.0} <span className="text-xs text-slate-400 font-normal">days</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {historyStats?.overdueLoans ?? 0} overdue returns in history
          </p>
        </div>

        {/* Unpaid Fines Balance */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Unpaid Fines Balance</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono">
            <span className={unpaidFinesTotal > 0 ? 'text-rose-400' : 'text-emerald-400'}>
              ₹{unpaidFinesTotal.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">₹1.00/day deterministic overdue rate</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Borrowing History &amp; Active Loans ({totalElements})
        </button>

        <button
          onClick={() => setActiveTab('fines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'fines'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Fines &amp; Payments ({fines.length})
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reservations'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Title Reservations ({reservations.length})
        </button>
      </div>

      {/* TAB 1: BORROWING HISTORY & ACTIVE LOANS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* History Filters: Status & Date Range */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Status:
                </span>
                {(['ALL', 'ACTIVE', 'RETURNED', 'OVERDUE'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setPage(0);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st === 'ALL' ? 'All Loans' : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Date Range Inputs */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date Range:
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(0);
                  }}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  title="Issued From"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(0);
                  }}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  title="Issued To"
                />
                {(statusFilter !== 'ALL' || fromDate || toDate) && (
                  <button
                    onClick={clearFilters}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    Clear
                  </button>
                )}

                <button
                  onClick={handleExportCsv}
                  disabled={historyLoans.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                  title="Export records to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* History List */}
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel p-5 rounded-2xl animate-pulse h-24" />
              ))}
            </div>
          ) : historyLoans.length > 0 ? (
            <div className="space-y-3">
              {historyLoans.map((loan) => {
                const langUpper = (loan.bookLanguage || 'en').toUpperCase();
                const isReturned = loan.status === 'RETURNED';
                const isOverdue = loan.status === 'OVERDUE' || loan.overdue;

                return (
                  <div
                    key={loan.id}
                    className={`glass-panel p-5 rounded-2xl border transition-all space-y-3 ${
                      isOverdue
                        ? 'border-rose-500/40 bg-rose-950/10'
                        : isReturned
                        ? 'border-slate-800/80 hover:border-slate-700'
                        : 'border-blue-500/30 bg-blue-950/10'
                    }`}
                  >
                    {/* Top Row: Title, Language, Category, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white">{loan.bookTitle}</h3>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Globe className="w-2.5 h-2.5" />
                            {langUpper}
                          </span>
                          {loan.bookCategory && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {loan.bookCategory}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          by {loan.bookAuthors && loan.bookAuthors.length > 0 ? loan.bookAuthors.join(', ') : 'Unknown'} • ISBN: {loan.bookIsbn} • Barcode: <span className="font-mono text-slate-300">{loan.barcode}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border shrink-0 ${
                          isReturned
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isOverdue
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {isReturned ? <Check className="w-3 h-3 text-emerald-400" /> : isOverdue ? <AlertCircle className="w-3 h-3 text-rose-400" /> : <Clock className="w-3 h-3 text-blue-400" />}
                        {loan.status}
                      </span>
                    </div>

                    {/* Timeline & Rental Payment Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2.5 bg-slate-950/80 rounded-xl p-3 border border-slate-800/60 font-mono">
                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans">Booked Period</span>
                        <span className="text-slate-200 text-xs font-semibold">
                          {loan.bookingPeriodDays || 14} Days Duration
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Since {new Date(loan.issueDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans">Return Due Date</span>
                        <span className={`text-xs font-bold ${isOverdue ? 'text-rose-400' : 'text-amber-300'}`}>
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {isOverdue ? `${loan.currentOverdueDays || 1}d past due` : 'Active'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans">Upfront Rental Paid</span>
                        <span className="text-emerald-400 font-bold text-xs">
                          ${(loan.rentalFee !== undefined ? loan.rentalFee : 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {loan.paymentMethod || 'CARD'} • {loan.paymentReference || 'PAID'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans">Overdue &amp; Fines</span>
                        <span className="text-xs">
                          {isOverdue ? (
                            <span className="text-rose-400 font-bold">
                              ₹{(loan.accruedFine || 0).toFixed(2)} Fine
                            </span>
                          ) : isReturned ? (
                            loan.lateDays && loan.lateDays > 0 ? (
                              <span className="text-rose-400 font-semibold">
                                {loan.lateDays}d late (₹{loan.fineAmount?.toFixed(2) || '0.00'})
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-semibold">Returned on-time</span>
                            )
                          ) : (
                            <span className="text-emerald-400 font-semibold">₹0.00 (On Time)</span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {loan.renewalCount}/2 Renewals
                        </span>
                      </div>
                    </div>

                    {/* OVERDUE PERIOD EXPIRED ALERT BANNER */}
                    {isOverdue && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>
                            <strong>Booking Period Expired!</strong> This book is <strong>{loan.currentOverdueDays || 1} day(s)</strong> overdue.
                            Auto-accumulated fine: <strong className="font-mono text-rose-300">₹{(loan.accruedFine || 0).toFixed(2)}</strong> (₹1.00/day).
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full self-start sm:self-auto shrink-0 font-bold">
                          FINE ACCRUING
                        </span>
                      </div>
                    )}

                    {/* Active Action Row */}
                    {!isReturned && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                        {isOverdue ? (
                          <div className="text-rose-300 text-[11px] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Return immediately to halt fine accumulation.</span>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[11px]">
                            Finished reading? Return online to add copy back to library stock.
                          </div>
                        )}

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleReturnBook(loan.id, loan.bookTitle)}
                            disabled={returningId === loan.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                            title="Return copy back to library inventory"
                          >
                            <Check className={`w-3.5 h-3.5 ${returningId === loan.id ? 'animate-spin' : ''}`} />
                            <span>{returningId === loan.id ? 'Returning...' : 'Return Book'}</span>
                          </button>

                          <button
                            onClick={() => handleRenew(loan.id)}
                            disabled={renewingId === loan.id || isOverdue || loan.renewalCount >= 2}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <RotateCw className={`w-3.5 h-3.5 ${renewingId === loan.id ? 'animate-spin' : ''}`} />
                            <span>{loan.renewalCount >= 2 ? 'Max Renewals' : isOverdue ? 'Overdue' : 'Renew (+14d)'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
                  <span>
                    Showing page <span className="text-white font-bold">{page + 1}</span> of{' '}
                    <span className="text-white font-bold">{totalPages}</span> ({totalElements} total loans)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-xs text-slate-400 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-300">No Borrowing Records Found</div>
                <p>No loan records match your current status or date range filter.</p>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
              >
                Reset History Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FINES & PAYMENTS */}
      {activeTab === 'fines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-400" />
              Overdue Fines &amp; Payments
            </h2>
            <span className="text-xs text-slate-500">{fines.length} records</span>
          </div>

          {fines.length > 0 ? (
            <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
              <div className="divide-y divide-slate-800/80">
                {fines.map((fine) => (
                  <div key={fine.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-semibold text-white">{fine.bookTitle}</div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        Copy Barcode: {fine.barcode} • Created: {new Date(fine.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-sm text-white font-mono">₹{Number(fine.amount).toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {fine.status === 'PAID' ? 'Fully Settled' : `Remaining: ₹${Number(fine.remainingAmount).toFixed(2)}`}
                        </div>
                      </div>

                      {fine.status !== 'PAID' && (
                        <button
                          onClick={() => handlePayFine(fine.id, fine.remainingAmount)}
                          disabled={payingId === fine.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
                        >
                          {payingId === fine.id ? 'Processing...' : 'Pay Balance'}
                        </button>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                          fine.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {fine.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center text-xs text-slate-400 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p>Good standing! No overdue fines or outstanding balance on your account.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESERVATIONS */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Active Title Reservations
            </h2>
            <span className="text-xs text-slate-500">{reservations.length} total</span>
          </div>

          {reservations.length > 0 ? (
            <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
              <div className="divide-y divide-slate-800/80">
                {reservations.map((res) => (
                  <div key={res.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-white">{res.bookTitle}</div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        ISBN: {res.bookIsbn} • Reserved on: {new Date(res.reservationDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                          res.status === 'PENDING'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : res.status === 'FULFILLED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {res.status}
                      </span>

                      {res.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelReservation(res.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Cancel reservation"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center text-xs text-slate-400">
              No active reservations in queue.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
