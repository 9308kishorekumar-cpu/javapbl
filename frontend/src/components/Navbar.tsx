import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Sparkles, LogOut, LogIn, ChevronDown, Bookmark, Layers, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  backendStatus?: 'UP' | 'DOWN' | 'LOADING';
}

export const Navbar: React.FC<NavbarProps> = () => {
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, isLibrarian, logout, quickLogin } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const primaryRole = user?.roles?.includes('ROLE_ADMIN')
    ? 'ADMIN'
    : user?.roles?.includes('ROLE_LIBRARIAN')
    ? 'LIBRARIAN'
    : user?.roles?.includes('ROLE_MEMBER')
    ? 'MEMBER'
    : 'GUEST';

  const roleBadgeColor = primaryRole === 'ADMIN'
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    : primaryRole === 'LIBRARIAN'
    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-white tracking-tight">Libra<span className="text-blue-500">AI</span></span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                      <Sparkles className="w-2.5 h-2.5" /> v1.0
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Library Management System</span>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to={isAuthenticated ? '/catalog' : '/'}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/catalog') || (isActive('/') && isAuthenticated)
                    ? 'bg-slate-800/80 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                {isLibrarian ? 'Books & Stock' : 'Catalog'}
              </Link>

              {isAuthenticated && !isLibrarian && (
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/dashboard') || isActive('/my-loans')
                      ? 'bg-slate-800/80 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                  My Loans &amp; Returns
                </Link>
              )}

              {isLibrarian && (
                <>
                  <Link
                    to="/circulation"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/circulation')
                        ? 'bg-slate-800/80 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Circulation Desk
                  </Link>

                  <Link
                    to="/analytics"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/analytics')
                        ? 'bg-slate-800/80 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                    Analytics &amp; Demand
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/admin')
                      ? 'bg-slate-800/80 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Right side: Telemetry & Auth Section */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              {isAuthenticated && <NotificationBell />}

              {/* User Authentication Menu */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{user.fullName || user.username}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${roleBadgeColor}`}>
                        {primaryRole}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-3">
                      <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800/80">
                        <div className="text-xs font-bold text-white">{user.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {user.roles.map((r) => (
                            <span key={r} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Quick Switch Persona */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">Switch Role Portal:</span>
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          <button
                            onClick={() => {
                              quickLogin('admin');
                              setUserMenuOpen(false);
                            }}
                            className="px-2 py-1 text-[11px] font-medium rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20"
                          >
                            Admin
                          </button>
                          <button
                            onClick={() => {
                              quickLogin('librarian');
                              setUserMenuOpen(false);
                            }}
                            className="px-2 py-1 text-[11px] font-medium rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20"
                          >
                            Librarian
                          </button>
                          <button
                            onClick={() => {
                              quickLogin('member');
                              setUserMenuOpen(false);
                            }}
                            className="px-2 py-1 text-[11px] font-medium rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                          >
                            Member
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-2 space-y-1">
                        <Link
                          to="/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5 text-blue-400" /> Portal Selection Page
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Choose Portal (Admin / Librarian / Member)</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login & Register Modals */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onOpenRegister={() => setRegisterOpen(true)}
      />

      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onOpenLogin={() => setLoginOpen(true)}
      />
    </>
  );
};

