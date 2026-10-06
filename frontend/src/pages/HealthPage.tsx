import React from 'react';
import { Activity, RefreshCw, XCircle, Clock, Server, Database, Sparkles } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { HealthData } from '../types';

interface HealthPageProps {
  health: HealthData | null;
  loading: boolean;
  onRefresh: () => void;
  error?: string | null;
}

export const HealthPage: React.FC<HealthPageProps> = ({ health, loading, onRefresh, error }) => {
  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <Activity className="w-4 h-4" /> System Telemetry &amp; Diagnostics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Backend Runtime Health
          </h1>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Error state if disconnected */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <div className="font-semibold">Backend Communication Error</div>
            <div className="text-xs text-rose-400">{error}</div>
          </div>
        </div>
      )}

      {/* Core Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Status */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Status</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">{health?.status || 'UNKNOWN'}</span>
            <StatusBadge status={loading ? 'LOADING' : health?.status === 'UP' ? 'UP' : 'DOWN'} />
          </div>
          <p className="text-xs text-slate-400">Spring Boot WebMvc + Security + JPA</p>
        </div>

        {/* Database Status */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Database Status</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">{health?.database?.status || 'UNKNOWN'}</span>
            <StatusBadge status={health?.database?.connectivity === 'HEALTHY' ? 'UP' : 'DOWN'} label={health?.database?.connectivity} />
          </div>
          <p className="text-xs text-slate-400">Flyway Migrations V1 Schema Active</p>
        </div>

        {/* Uptime */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Server Uptime</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {health?.uptimeMs ? formatUptime(health.uptimeMs) : '--'}
          </div>
          <p className="text-xs text-slate-400">Active Profiles: [{health?.activeProfiles?.join(', ') || 'dev'}]</p>
        </div>
      </div>

      {/* Feature Flags Status Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">AI Augmentation Feature Flags</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {health?.features &&
            Object.entries(health.features).map(([key, enabled]) => (
              <div key={key} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-200 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">libraai.features.{key}</div>
                </div>
                <StatusBadge status={enabled ? 'ENABLED' : 'DISABLED'} size="sm" />
              </div>
            ))}
        </div>
      </div>

      {/* Raw Diagnostic JSON */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span className="text-xs font-semibold text-slate-400 font-mono">Raw Health Endpoint Response (GET /api/v1/health)</span>
          <span className="text-[11px] text-slate-500 font-mono">{health?.timestamp}</span>
        </div>
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs font-mono text-blue-300 overflow-x-auto">
          {health ? JSON.stringify(health, null, 2) : 'Loading telemetry...'}
        </pre>
      </div>
    </div>
  );
};
