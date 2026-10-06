import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Shield, Database, Cpu, ArrowRight, CheckCircle2, Layers, Terminal } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { HealthData } from '../types';

interface HomePageProps {
  health: HealthData | null;
  loading: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ health, loading }) => {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Library Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Augmented Library System with <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Deterministic Reliability</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Java 21 &amp; Spring Boot 3 system of record with PostgreSQL/pgvector. Robust schema enforcement, fine calculation, and business logic with zero LLM hallucination in core financial and borrowing transactions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/health"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all"
            >
              <Cpu className="w-4 h-4" /> View Diagnostics
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition-all"
            >
              <Terminal className="w-4 h-4 text-slate-400" /> Swagger API Portal
            </a>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Deterministic Core</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Borrowing limits, loan issuance, overdue fine rates, and reservations are strictly managed by Java business logic and PostgreSQL constraints.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Zero-Hallucination Operations
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Flyway Migration Engine</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Reproducible database schema versioning. Seeded with standard roles (ADMIN, LIBRARIAN, MEMBER), books, authors, and barcodes.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-blue-400">
            <CheckCircle2 className="w-4 h-4" /> V1 Migration Applied
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Pluggable AI Augmentation</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Pluggable NLU natural language search, vector semantic matching, OCR ingestion, and risk scoring with seamless offline fallbacks.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-purple-400">
            <CheckCircle2 className="w-4 h-4" /> Fallback Guaranteed
          </div>
        </div>
      </section>

      {/* System Quick Status & Seed Accounts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white">System Runtime Telemetry</h3>
            </div>
            <StatusBadge status={loading ? 'LOADING' : health?.status === 'UP' ? 'UP' : 'DOWN'} />
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-900 text-slate-400">
              <span>Spring Boot Version</span>
              <span className="text-slate-200 font-semibold">3.3.4 (Java 21/26)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900 text-slate-400">
              <span>Active Spring Profile</span>
              <span className="text-blue-400 font-semibold">{health?.activeProfiles?.join(', ') || 'dev'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900 text-slate-400">
              <span>Database Engine</span>
              <span className="text-emerald-400 font-semibold">
                {health?.database?.connectivity === 'HEALTHY' ? 'H2 / PostgreSQL Mode (Connected)' : 'Checking...'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400">
              <span>OpenAPI / Swagger UI</span>
              <span className="text-slate-200 font-semibold">Live at /swagger-ui.html</span>
            </div>
          </div>
        </div>

        {/* Seed Credentials Reference */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white">Pre-seeded Test Accounts (V1 Schema)</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Password: password123</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">System Admin</div>
                <div className="text-slate-500 font-mono text-[11px]">admin / admin@libraai.local</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-medium">
                ROLE_ADMIN
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Chief Librarian Eleanor Vance</div>
                <div className="text-slate-500 font-mono text-[11px]">librarian / librarian@libraai.local</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-medium">
                ROLE_LIBRARIAN
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Alice Reader (Member)</div>
                <div className="text-slate-500 font-mono text-[11px]">member / member@libraai.local</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                ROLE_MEMBER
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
