import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Clock,
  DollarSign,
  Star,
  Bookmark,
  ArrowLeft,
  Filter,
  RotateCcw,
  CheckCircle2,
  Tag,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { MemberDetail } from '../types';
import { api } from '../services/api';

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [memberDetail, setMemberDetail] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'history' | 'ratings' | 'reservations'>('history');

  // Filter States for Borrowing History
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filtering, setFiltering] = useState(false);

  const fetchDetail = async (applyFilters = true) => {
    if (!id) return;
    try {
      if (applyFilters) setFiltering(true);
      else setLoading(true);

      const f = fromDate ? new Date(fromDate).toISOString() : undefined;
      const t = toDate ? new Date(toDate + 'T23:59:59').toISOString() : undefined;
      const s = statusFilter !== 'ALL' ? statusFilter : undefined;

      const res = await api.getMemberDetail(parseInt(id), f, t, s);
      if (res.success && res.data) {
        setMemberDetail(res.data);
        setError(null);
      } else {
        setError(res.message || 'Failed to load member dossier');
      }
    } catch (err: any) {
      console.error('Error fetching member detail:', err);
      setError(err?.response?.data?.message || 'Failed to load member details');
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  };

  useEffect(() => {
    fetchDetail(false);
  }, [id]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDetail(true);
  };

  const handleResetFilter = () => {
    setFromDate('');
    setToDate('');
    setStatusFilter('ALL');
    setTimeout(() => {
      if (id) {
        api.getMemberDetail(parseInt(id)).then((res) => {
          if (res.success && res.data) setMemberDetail(res.data);
        });
      }
    }, 50);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <h2 className="text-lg font-bold text-white">Loading Member Dossier...</h2>
        <p className="text-slate-400 text-sm">Aggregating circulation telemetry, loan history, and risk heuristics.</p>
      </div>
    );
  }

  if (error || !memberDetail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Member Dossier Unavailable</h2>
        <p className="text-slate-400 text-sm">{error || 'Could not find member profile'}</p>
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Member Management
        </button>
      </div>
    );
  }

  const { profile, overdueRisk, lifetimeStats, activeLoans, borrowingHistory, ratings, reservations } = memberDetail;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          label: 'HIGH OVERDUE RISK',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <Shield className="w-4 h-4 text-amber-400" />,
          label: 'MEDIUM OVERDUE RISK',
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
          label: 'LOW OVERDUE RISK',
        };
    }
  };

  const riskBadge = getRiskBadge(overdueRisk.riskLevel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/circulation"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Circulation Desk
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            User Directory
          </Link>
          <Link
            to="/analytics"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            Risk Analytics
          </Link>
        </div>
      </div>

      {/* Profile Header & Risk Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Patron Avatar & Info */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-extrabold text-2xl shadow-inner">
              {profile.fullName ? profile.fullName.substring(0, 2).toUpperCase() : profile.username.substring(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {profile.fullName || profile.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  @{profile.username}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    profile.membershipStatus === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {profile.membershipStatus}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                <span>Email: {profile.email}</span>
                <span>•</span>
                <span>Member Since: {new Date(profile.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>Account Age: {profile.membershipAgeDays} days</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.roles.map((r) => (
                  <span
                    key={r}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Prominent Heuristic Overdue Risk Card */}
          <div className="w-full lg:w-auto min-w-[280px] sm:min-w-[340px] bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Heuristic Overdue Profile
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border ${riskBadge.bg}`}>
                {riskBadge.icon}
                {riskBadge.label}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Risk Score Index:</span>
                <span className="font-mono font-bold text-white">{overdueRisk.riskScore} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overdueRisk.riskLevel === 'HIGH'
                      ? 'bg-rose-500'
                      : overdueRisk.riskLevel === 'MEDIUM'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, overdueRisk.riskScore))}%` }}
                ></div>
              </div>
            </div>

            {/* Risk Factor Chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {overdueRisk.riskFactors && overdueRisk.riskFactors.length > 0 ? (
                overdueRisk.riskFactors.map((factor, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {factor}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-emerald-400 font-mono">Clean record in good standing</span>
              )}
            </div>

            <p className="text-[10px] text-slate-500 italic leading-tight">
              {overdueRisk.heuristicDisclaimer}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Lifetime Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Books Borrowed</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {lifetimeStats.totalLoans}
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span className="text-emerald-400 font-bold">{lifetimeStats.activeLoans} active</span>
            <span>•</span>
            <span>{lifetimeStats.returnedLoans} returned</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Fines Telemetry</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ₹{Number(lifetimeStats.outstandingFines || 0).toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span className={Number(lifetimeStats.outstandingFines) > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {Number(lifetimeStats.outstandingFines) > 0 ? 'Unpaid balance' : 'Zero balance'}
            </span>
            <span>•</span>
            <span>₹{Number(lifetimeStats.totalFinesPaid || 0).toFixed(2)} paid</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Return Delay</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {lifetimeStats.avgReturnDelayDays} <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {lifetimeStats.overdueLoans > 0 ? (
              <span className="text-amber-400 font-bold">{lifetimeStats.overdueLoans} overdue loans on record</span>
            ) : (
              <span className="text-emerald-400 font-bold">100% on-time return velocity</span>
            )}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Top Categories</span>
            <Tag className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {lifetimeStats.topCategories && lifetimeStats.topCategories.length > 0 ? (
              lifetimeStats.topCategories.slice(0, 3).map((cat) => (
                <span
                  key={cat.categoryName}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20"
                >
                  {cat.categoryName} ({cat.count})
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No loan history yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Currently Active Loans Section */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Currently Active Loans ({activeLoans.length})</h2>
          </div>
          <Link
            to="/circulation"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
          >
            Circulation Desk <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeLoans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLoans.map((loan) => {
              const now = new Date();
              const due = new Date(loan.dueDate);
              const isOverdue = now > due;
              const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={loan.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOverdue
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      Copy: {loan.barcode || 'N/A'}
                    </span>
                    {isOverdue ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                        {Math.abs(daysDiff)} DAYS OVERDUE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Due in {daysDiff} day{daysDiff !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 font-bold text-white text-sm line-clamp-1">
                    {loan.bookTitle}
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-1">
                    by {Array.isArray(loan.bookAuthors) ? loan.bookAuthors.join(', ') : loan.bookAuthors || 'Unknown'}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div>Issued: {new Date(loan.issueDate).toLocaleDateString()}</div>
                    <div>Due: {new Date(loan.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800/60">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm text-slate-300 font-medium">No books currently on loan</p>
            <p className="text-xs text-slate-500">Patron has 0 active checkouts</p>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-800 gap-4 sm:gap-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Borrowing History ({borrowingHistory.length})
          </button>

          <button
            onClick={() => setActiveTab('ratings')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ratings'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4" />
            Reviews &amp; Ratings ({ratings.length})
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'reservations'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Reservations ({reservations.length})
          </button>
        </div>

        {/* Tab 1: Borrowing History with Date Range & Status Filter */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <form
              onSubmit={handleApplyFilter}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3 text-xs"
            >
              <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                Filter History:
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-400">From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-400">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-400">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="RETURNED">RETURNED</option>
                  <option value="OVERDUE">OVERDUE</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={filtering}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {filtering ? 'Filtering...' : 'Apply Filters'}
              </button>

              {(fromDate || toDate || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* History Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Book Details</th>
                      <th className="px-4 py-3.5">Barcode / Lang</th>
                      <th className="px-4 py-3.5">Issue Date</th>
                      <th className="px-4 py-3.5">Due Date</th>
                      <th className="px-4 py-3.5">Return Date</th>
                      <th className="px-4 py-3.5">Late Days</th>
                      <th className="px-4 py-3.5">Fine</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {borrowingHistory.length > 0 ? (
                      borrowingHistory.map((loan) => (
                        <tr key={loan.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white">{loan.bookTitle}</div>
                            <div className="text-[11px] text-slate-400">
                              {Array.isArray(loan.bookAuthors) ? loan.bookAuthors.join(', ') : loan.bookAuthors || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-300">
                            <div>{loan.barcode || 'N/A'}</div>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {(loan.bookLanguage || 'en').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-300">
                            {new Date(loan.issueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-300">
                            {new Date(loan.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-300">
                            {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-4 py-3.5 font-mono">
                            {(loan.lateDays || 0) > 0 ? (
                              <span className="text-rose-400 font-bold">{loan.lateDays} days</span>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-mono">
                            {Number(loan.fineAmount) > 0 ? (
                              <span className="text-amber-400 font-bold">₹{Number(loan.fineAmount).toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-500">₹0.00</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                loan.status === 'ACTIVE'
                                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                  : loan.status === 'RETURNED'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {loan.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                          No borrowing records matching the selected criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reviews & Ratings */}
        {activeTab === 'ratings' && (
          <div className="space-y-4">
            {ratings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ratings.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-white text-sm">{r.bookTitle}</div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {r.review && (
                      <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                        "{r.review}"
                      </p>
                    )}

                    <div className="text-[10px] font-mono text-slate-500">
                      Reviewed on {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <Star className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">No Ratings on Record</p>
                <p className="text-xs text-slate-500">This member has not yet reviewed any catalog titles.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reservations */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            {reservations.length > 0 ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Book Title</th>
                      <th className="px-4 py-3.5">ISBN</th>
                      <th className="px-4 py-3.5">Reservation Date</th>
                      <th className="px-4 py-3.5">Expiry Date</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-white">{res.bookTitle}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">{res.bookIsbn}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          {new Date(res.reservationDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          {res.expiryDate ? new Date(res.expiryDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              res.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : res.status === 'FULFILLED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">No Reservations on Record</p>
                <p className="text-xs text-slate-500">Patron has no active or past reservation hold requests.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
