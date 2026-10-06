import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Tag,
  Clock,
  Activity,
  Sparkles,
  ShoppingBag,
  Star,
  Info,
  Download
} from 'lucide-react';
import { DashboardStats, AuditLog, BookDemandPrediction, MemberOverdueRisk } from '../types';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [predictions, setPredictions] = useState<BookDemandPrediction[]>([]);
  const [overdueRisks, setOverdueRisks] = useState<MemberOverdueRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, logsRes, predsRes, risksRes] = await Promise.all([
        api.getDashboardStats(),
        api.getAuditLogs(),
        api.getPopularityPredictions(6).catch(() => ({ success: false, data: [] })),
        api.getOverdueRisks().catch(() => ({ success: false, data: [] })),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (logsRes.success && logsRes.data) setAuditLogs(logsRes.data);
      if (predsRes.success && predsRes.data) setPredictions(predsRes.data);
      if (risksRes.success && risksRes.data) setOverdueRisks(risksRes.data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err?.response?.data?.message || err?.message || 'Error loading analytics telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportPredictionsCsv = () => {
    if (!predictions || predictions.length === 0) return;
    const headers = ['Demand Rank', 'Book Title', 'ISBN', 'Category', 'Language', 'Borrow Count', 'Average Rating', 'Stock (Available/Total)', 'Demand Score', 'Recommended Copies to Buy', 'Confidence'];
    const rows = predictions.map((p, idx) => [
      idx + 1,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.isbn || ''}"`,
      `"${p.categoryName || ''}"`,
      `"${(p.language || 'en').toUpperCase()}"`,
      p.borrowCount || 0,
      p.averageRating ? p.averageRating.toFixed(1) : 'N/A',
      `"${p.availableCopies}/${p.totalCopies}"`,
      p.demandScore ? p.demandScore.toFixed(1) : '0.0',
      p.recommendedCopiesToAcquire || 0,
      `"${p.confidenceLevel || 'MEDIUM'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'LibraAI_Acquisition_Demand_Predictions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('LOAN_ISSUED')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (action.includes('LOAN_RETURNED')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (action.includes('FINE')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (action.includes('BOOK')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Shield className="w-3 h-3 text-amber-400" />
            MEDIUM RISK
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            LOW RISK
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <BarChart3 className="w-4 h-4" /> Operational Intelligence &amp; Heuristics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Analytics &amp; Demand Forecasting
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time circulation metrics, heuristic popularity &amp; demand predictions, patron overdue risk profiling, and audit trail
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Titles / Copies</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.totalBooks ?? 0} <span className="text-sm font-normal text-slate-500">/ {stats?.totalCopies ?? 0} copies</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{stats?.availableCopies ?? 0} copies available</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active Circulations</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.activeLoans ?? 0}
          </div>
          <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{stats?.overdueLoans ?? 0} overdue loans</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Registered Patrons</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.totalMembers ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Active patrons &amp; staff
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Fines Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            ${stats?.totalFinesCollected?.toFixed(2) ?? '0.00'}
          </div>
          <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
            <span>Outstanding: ${stats?.outstandingFines?.toFixed(2) ?? '0.00'}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Heuristic Popularity & Demand Predictions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Popularity &amp; Trailing Demand Predictions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Heuristic acquisition advisor computing borrow velocity, 5-star ratings, category share, and stock pressure
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPredictionsCsv}
              disabled={!predictions || predictions.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all disabled:opacity-50"
              title="Export Demand Forecast to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <span className="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Heuristic Prediction • Non-ML
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions && predictions.length > 0 ? (
            predictions.map((p, idx) => (
              <div
                key={p.bookId}
                className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-2">
                  {/* Top Bar: Rank & Category */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      #{idx + 1} Demand Rank
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {p.categoryName}
                    </span>
                  </div>

                  {/* Title & ISBN */}
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{p.title}</h3>
                    <p className="text-[11px] font-mono text-slate-500">ISBN: {p.isbn}</p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Demand Score</div>
                      <div className="text-sm font-bold font-mono text-amber-400">{p.demandScore.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Borrows</div>
                      <div className="text-sm font-bold font-mono text-blue-400">{p.borrowCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Rating</div>
                      <div className="text-sm font-bold font-mono text-emerald-400 flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                        {p.averageRating ? p.averageRating.toFixed(1) : '—'}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    "{p.heuristicRationale}"
                  </p>
                </div>

                {/* Bottom Bar: Acquisition Recommendation */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Stock: <strong className="text-white">{p.availableCopies}/{p.totalCopies}</strong>
                  </div>

                  {p.recommendedCopiesToAcquire > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Acquire +{p.recommendedCopiesToAcquire} Copies
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500">
                      Adequate Stock
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-xs text-slate-500 glass-panel rounded-2xl">
              No demand prediction data available.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Patron Overdue Risk Predictions Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Patron Overdue Risk Heuristic Profiles
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies member checkout risk profiles evaluated against late return velocity and fine amounts
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            {overdueRisks.length} Evaluated Patrons
          </span>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3.5">Patron / Member</th>
                  <th className="p-3.5">Heuristic Risk Level</th>
                  <th className="p-3.5">Late Returns</th>
                  <th className="p-3.5">Avg Delay</th>
                  <th className="p-3.5">Active / History</th>
                  <th className="p-3.5">Unpaid Fines</th>
                  <th className="p-3.5">Primary Risk Factors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {overdueRisks && overdueRisks.length > 0 ? (
                  overdueRisks.map((m) => (
                    <tr key={m.userId} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{m.fullName || m.username}</div>
                        <div className="text-[11px] text-slate-400 font-mono">@{m.username} • {m.email}</div>
                      </td>

                      <td className="p-3.5">
                        {getRiskBadge(m.riskLevel)}
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Score: {m.riskScore}/100</div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <span className={m.lateReturnsCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {m.lateReturnsCount} late
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">
                        {m.avgLateDays > 0 ? `${m.avgLateDays} days` : '0 days'}
                      </td>

                      <td className="p-3.5 font-mono text-slate-400">
                        <strong className="text-white">{m.activeLoansCount}</strong> active / {m.totalHistoricalLoans} total
                      </td>

                      <td className="p-3.5 font-mono">
                        {m.unpaidFines > 0 ? (
                          <span className="text-rose-400 font-bold">₹{Number(m.unpaidFines).toFixed(2)}</span>
                        ) : (
                          <span className="text-emerald-400">₹0.00</span>
                        )}
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-0.5">
                          {m.riskFactors && m.riskFactors.map((f, i) => (
                            <div key={i} className="text-[11px] text-slate-300 line-clamp-1 flex items-center gap-1">
                              <span className="text-slate-600">•</span> {f}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-slate-500">
                      No patrons registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Disclaimer: Patron Overdue Risk scores are heuristic approximations derived from borrow histories and return velocity. They are intended solely for librarian guidance, not as factual determinism.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Distribution & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Distribution */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              Catalog Category Distribution
            </h2>
            <span className="text-xs text-slate-500">{stats?.categoryDistribution?.length ?? 0} categories</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
            {stats?.categoryDistribution && stats.categoryDistribution.length > 0 ? (
              stats.categoryDistribution.map((cat) => {
                const pct = stats.totalBooks > 0 ? (cat.bookCount / stats.totalBooks) * 100 : 0;
                return (
                  <div key={cat.categoryName} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-slate-300">{cat.categoryName}</span>
                      <span className="text-slate-500 font-mono">{cat.bookCount} books ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No categories configured.
              </div>
            )}
          </div>
        </div>

        {/* Live System Audit Stream */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live System Audit Stream
            </h2>
            <span className="text-xs text-slate-500 font-mono">Recent {auditLogs.length} events</span>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
            <div className="divide-y divide-slate-800/80 max-h-[380px] overflow-y-auto">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-slate-300 font-medium">{log.details}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px] shrink-0">
                      <span>by {log.username || 'System'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No audit events recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
