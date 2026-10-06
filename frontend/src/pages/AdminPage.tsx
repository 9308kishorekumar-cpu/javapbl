import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Edit,
  Save,
  Check,
  X,
  Globe,
  Play,
  BookOpen,
  FileText,
} from 'lucide-react';
import { UserManagement, SystemConfig, UpdateSystemConfigRequest, SeedingReport, MemberOverdueRisk } from '../types';
import { api } from '../services/api';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'config' | 'seeder'>('users');
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [overdueRisksMap, setOverdueRisksMap] = useState<Record<string, MemberOverdueRisk>>({});
  const [_config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Role Modal State
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);

  // Config Form State
  const [maxLoans, setMaxLoans] = useState(5);
  const [maxRenewals, setMaxRenewals] = useState(2);
  const [loanDays, setLoanDays] = useState(14);
  const [fineRate, setFineRate] = useState(1.0);
  const [savingConfig, setSavingConfig] = useState(false);

  // Seeder State
  const [targetPerQuery, setTargetPerQuery] = useState(20);
  const [runningSeeder, setRunningSeeder] = useState(false);
  const [seedingReport, setSeedingReport] = useState<SeedingReport | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, configRes, seederRes, risksRes] = await Promise.all([
        api.getAllUsers(0, 50),
        api.getSystemConfig(),
        api.getImportStatus().catch(() => ({ success: false, data: null })),
        api.getOverdueRisks().catch(() => ({ success: false, data: [] })),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data.content);
      }

      if (risksRes.success && risksRes.data) {
        const map: Record<string, MemberOverdueRisk> = {};
        risksRes.data.forEach((r) => {
          map[r.username] = r;
        });
        setOverdueRisksMap(map);
      }

      if (configRes.success && configRes.data) {
        setConfig(configRes.data);
        setMaxLoans(configRes.data.maxBooksPerMember);
        setMaxRenewals(configRes.data.maxRenewalCount);
        setLoanDays(configRes.data.defaultLoanPeriodDays);
        setFineRate(configRes.data.dailyFineRate);
      }

      if (seederRes.success && seederRes.data) {
        setSeedingReport(seederRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setError(err?.response?.data?.message || err?.message || 'Error loading admin console');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (user: UserManagement) => {
    const nextStatus = user.membershipStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setError(null);
      setSuccess(null);
      const res = await api.updateUserStatus(user.id, nextStatus);
      if (res.success) {
        setSuccess(`User '${user.username}' status changed to ${nextStatus}`);
        fetchData();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update user status');
    }
  };

  const handleOpenRoleModal = (user: UserManagement) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
  };

  const handleToggleRoleSelection = (role: string) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((r) => r !== role));
      }
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    try {
      setSavingRoles(true);
      setError(null);
      setSuccess(null);
      const res = await api.updateUserRoles(selectedUser.id, selectedRoles);
      if (res.success) {
        setSuccess(`Updated roles for '${selectedUser.username}'`);
        setSelectedUser(null);
        fetchData();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save roles');
    } finally {
      setSavingRoles(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      setError(null);
      setSuccess(null);

      const payload: UpdateSystemConfigRequest = {
        maxBooksPerMember: Number(maxLoans),
        maxRenewalCount: Number(maxRenewals),
        defaultLoanPeriodDays: Number(loanDays),
        dailyFineRate: Number(fineRate),
      };

      const res = await api.updateSystemConfig(payload);
      if (res.success && res.data) {
        setConfig(res.data);
        setSuccess('System parameters updated and persisted successfully');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTriggerSeeder = async () => {
    try {
      setRunningSeeder(true);
      setError(null);
      setSuccess(null);
      const res = await api.triggerImportBooks(targetPerQuery, true);
      if (res.success && res.data) {
        setSeedingReport(res.data);
        setSuccess(`Seeding completed! Imported ${res.data.totalImported} books across ${res.data.languagesCoveredCount} languages.`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to execute catalog seeder');
    } finally {
      setRunningSeeder(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
            <Shield className="w-4 h-4" /> System Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Admin Governance Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage patron and staff accounts, assign RBAC security roles, tune library rules, and seed multilingual catalog
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          User &amp; Staff Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'config'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Operational Rules Configuration
        </button>

        <button
          onClick={() => setActiveTab('seeder')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'seeder'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-indigo-300" />
          Multilingual Catalog Seeder
        </button>
      </div>

      {/* Tab 1: User & Staff Management */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Registered System Accounts
            </h2>
            <span className="text-xs font-mono text-slate-400">Total Accounts: {users.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Assigned Roles</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Heuristic Overdue Risk</th>
                  <th className="p-3">Member Since</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const risk = overdueRisksMap[u.username];
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-semibold text-white">
                        <div>{u.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-400">@{u.username}</div>
                      </td>
                      <td className="p-3 text-slate-400 font-mono">{u.email}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {u.roles?.map((role) => (
                            <span
                              key={role}
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                                role === 'ROLE_ADMIN'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : role === 'ROLE_LIBRARIAN'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {role.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            u.membershipStatus === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {u.membershipStatus === 'ACTIVE' ? (
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <UserX className="w-3 h-3 text-rose-400" />
                          )}
                          {u.membershipStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {risk ? (
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                risk.riskLevel === 'HIGH'
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                  : risk.riskLevel === 'MEDIUM'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                              title={`Late returns: ${risk.lateReturnsCount}, Avg delay: ${risk.avgLateDays}d, Unpaid fines: $${risk.unpaidFines}`}
                            >
                              {risk.riskLevel === 'HIGH' ? (
                                <ShieldAlert className="w-3 h-3 text-rose-400" />
                              ) : risk.riskLevel === 'MEDIUM' ? (
                                <Shield className="w-3 h-3 text-amber-400" />
                              ) : (
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              )}
                              {risk.riskLevel}
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {risk.lateReturnsCount > 0 ? `${risk.lateReturnsCount} late returns` : 'Clean history'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/librarian/members/${u.id}`}
                          className="p-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors flex items-center gap-1"
                          title="View Member Dossier / Circulation History"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleOpenRoleModal(u)}
                          className="p-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-colors"
                          title="Edit Roles"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            u.membershipStatus === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                          title={u.membershipStatus === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                        >
                          {u.membershipStatus === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Operational Rules Configuration */}
      {activeTab === 'config' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" /> Dynamic Operational Policies
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Adjust loan period limits, fine calculation rates, and borrowing quotas without restarting the server.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" /> Max Books Per Member
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={maxLoans}
                  onChange={(e) => setMaxLoans(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-500">Maximum active checkouts allowed per account simultaneously</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-purple-400" /> Max Renewals Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxRenewals}
                  onChange={(e) => setMaxRenewals(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-500">Number of renewal extensions permitted before required return</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Default Loan Period (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={loanDays}
                  onChange={(e) => setLoanDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-500">Standard duration granted for borrowed book circulation</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" /> Daily Overdue Fine Rate (₹)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="50"
                  value={fineRate}
                  onChange={(e) => setFineRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-500">Overdue assessment levied per item per day after due date</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingConfig ? 'Persisting Changes...' : 'Save System Parameters'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Multilingual Catalog Seeder */}
      {activeTab === 'seeder' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" /> Automated Multilingual Catalog Seeder
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Fetches real books across 20 languages and 6 subject domains using Open Library API with rate-limiting, deduplication, and resumability.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <label>Limit/Query:</label>
                <select
                  value={targetPerQuery}
                  onChange={(e) => setTargetPerQuery(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100"
                >
                  <option value={10}>10 records</option>
                  <option value={20}>20 records</option>
                  <option value={50}>50 records</option>
                  <option value={100}>100 records</option>
                </select>
              </div>

              <button
                onClick={handleTriggerSeeder}
                disabled={runningSeeder}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${runningSeeder ? 'animate-spin' : ''}`} />
                {runningSeeder ? 'Ingesting Books...' : 'Run Catalog Seeder'}
              </button>
            </div>
          </div>

          {/* Seeding Report Display */}
          {seedingReport && (
            <div className="space-y-6 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Total Imported
                  </div>
                  <div className="text-xl font-bold text-white">{seedingReport.totalImported}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" /> Languages Covered
                  </div>
                  <div className="text-xl font-bold text-indigo-300">{seedingReport.languagesCoveredCount} / 20</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" /> Total Copies Seeded
                  </div>
                  <div className="text-xl font-bold text-emerald-400">{seedingReport.totalCopiesSeeded}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" /> Ingestion Time
                  </div>
                  <div className="text-xl font-bold text-purple-300">{seedingReport.durationSeconds.toFixed(1)}s</div>
                </div>
              </div>

              {/* Per-Language Breakdown */}
              {seedingReport.languageBreakdown && Object.keys(seedingReport.languageBreakdown).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Language Distribution Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {Object.entries(seedingReport.languageBreakdown).map(([lang, count]) => (
                      <div
                        key={lang}
                        className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-mono font-bold text-indigo-300 uppercase">{lang}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                          {count} books
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {seedingReport.categoryBreakdown && Object.keys(seedingReport.categoryBreakdown).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Category Distribution Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {Object.entries(seedingReport.categoryBreakdown).map(([cat, count]) => (
                      <div
                        key={cat}
                        className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-200">{cat}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Role Editor Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Edit User Roles</h3>
                <p className="text-xs text-slate-400">@{selectedUser.username} ({selectedUser.fullName})</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">RBAC Security Roles:</label>

              {['ROLE_MEMBER', 'ROLE_LIBRARIAN', 'ROLE_ADMIN'].map((role) => {
                const isChecked = selectedRoles.includes(role);
                return (
                  <div
                    key={role}
                    onClick={() => handleToggleRoleSelection(role)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{role.replace('ROLE_', '')}</div>
                      <div className="text-[11px] text-slate-500">
                        {role === 'ROLE_ADMIN'
                          ? 'Full administrative control and user governance'
                          : role === 'ROLE_LIBRARIAN'
                          ? 'Circulation transactions, cataloging and physical copies management'
                          : 'Standard patron borrowing, reservations, and reading recommendations'}
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                disabled={savingRoles}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
              >
                {savingRoles ? 'Updating...' : 'Save Role Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
