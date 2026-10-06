import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen, User, ArrowRight, CheckCircle2, UserPlus, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { quickLogin, login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'personas' | 'custom_login' | 'register'>('personas');
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Custom Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // If already authenticated, redirect to catalog
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleQuickLogin = async (role: 'admin' | 'librarian' | 'member') => {
    try {
      setLoadingRole(role);
      setError(null);
      await quickLogin(role);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify the backend is running.');
    } finally {
      setLoadingRole(null);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingRole('custom');
      setError(null);
      await login({ username, password });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid username or password');
    } finally {
      setLoadingRole(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingRole('register');
      setError(null);
      await register({
        fullName: regFullName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
      });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" /> LibraAI Library System
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Select Your Portal to Enter
        </h1>
        <p className="text-sm text-slate-400">
          Choose your role below to access role-specific library management, book catalogs, active stock, and rentals.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 w-full max-w-md">
        <button
          onClick={() => {
            setActiveTab('personas');
            setError(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'personas'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Choose Role
        </button>
        <button
          onClick={() => {
            setActiveTab('custom_login');
            setError(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'custom_login'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setActiveTab('register');
            setError(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'register'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Register
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="w-full max-w-md mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {/* Tab 1: 3 Role Persona Cards */}
      {activeTab === 'personas' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* 1. Admin Portal */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between space-y-6 hover:shadow-2xl hover:shadow-purple-950/20 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Director / Admin</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Admin Portal</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                System administration, user access management, inventory auditing, catalog policies, and comprehensive demand analytics.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>View books, stock &amp; who booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Library maintenance (no booking clutter)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={loadingRole !== null}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingRole === 'admin' ? (
                <span>Entering Admin Portal...</span>
              ) : (
                <>
                  <span>Enter as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* 2. Chief Librarian Portal */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-6 hover:shadow-2xl hover:shadow-emerald-950/20 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Library Staff</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Chief Librarian</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Circulation desk operations, barcode tracking, available stock management, patron booking verification, and return audits.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time stock &amp; member booking info</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Circulation issue &amp; return by barcode</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleQuickLogin('librarian')}
              disabled={loadingRole !== null}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingRole === 'librarian' ? (
                <span>Entering Librarian Portal...</span>
              ) : (
                <>
                  <span>Enter as Chief Librarian</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* 3. Member / Patron Portal */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/80 hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between space-y-6 hover:shadow-2xl hover:shadow-blue-950/20 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Patron / Reader</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Member Portal</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse 100+ multilingual titles, rent books for custom duration periods (₹0.50/day), pay upfront, and return books online.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Book &amp; rent with custom time periods</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Self-return to automatically replenish stock</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleQuickLogin('member')}
                disabled={loadingRole !== null}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingRole === 'member' ? (
                  <span>Entering Member Portal...</span>
                ) : (
                  <>
                    <span>Enter as Member (Alice)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveTab('register')}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                <span>Register New Patron Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Custom Sign In Form */}
      {activeTab === 'custom_login' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 w-full max-w-md space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Sign In with Credentials</h3>
            <p className="text-xs text-slate-400 mt-1">Enter your username and password to log in.</p>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, librarian, member, or your username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingRole !== null}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingRole === 'custom' ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Member Self-Registration Form */}
      {activeTab === 'register' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 w-full max-w-md space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Create New Patron Account</h3>
            <p className="text-xs text-slate-400 mt-1">Register for library membership to borrow books.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. johndoe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingRole !== null}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingRole === 'register' ? 'Registering...' : 'Register as Member & Enter'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
