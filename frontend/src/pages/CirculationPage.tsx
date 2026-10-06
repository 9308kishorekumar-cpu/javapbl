import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Scan,
  Camera
} from 'lucide-react';
import { Loan, PatronRisk, BookCopy } from '../types';
import { api } from '../services/api';

export const CirculationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue');
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  // Issue Form State
  const [issueBarcode, setIssueBarcode] = useState('');
  const [issueUsername, setIssueUsername] = useState('member');
  const [issueDays, setIssueDays] = useState(14);
  const [issuing, setIssuing] = useState(false);
  const [patronRisk, setPatronRisk] = useState<PatronRisk | null>(null);

  // Scanned Copy Lookup Details
  const [scannedCopy, setScannedCopy] = useState<BookCopy | null>(null);
  const [lookingUpCopy, setLookingUpCopy] = useState(false);

  // QR Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Return Form State
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returning, setReturning] = useState(false);

  // Status/Feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchActiveLoans = async () => {
    try {
      setLoadingLoans(true);
      const res = await api.getActiveLoans();
      if (res.success && res.data) {
        setActiveLoans(res.data);
      }
    } catch (err) {
      console.error('Failed to load active loans:', err);
    } finally {
      setLoadingLoans(false);
    }
  };

  const fetchPatronRisk = async (username: string) => {
    if (!username.trim()) {
      setPatronRisk(null);
      return;
    }
    try {
      const res = await api.getPatronRisk(username.trim());
      if (res.success && res.data) {
        setPatronRisk(res.data);
      }
    } catch {
      setPatronRisk(null);
    }
  };

  const lookupCopyByBarcode = useCallback(async (barcode: string) => {
    if (!barcode || !barcode.trim()) {
      setScannedCopy(null);
      return;
    }
    try {
      setLookingUpCopy(true);
      const res = await api.getCopyByBarcode(barcode.trim());
      if (res.success && res.data) {
        setScannedCopy(res.data);
      } else {
        setScannedCopy(null);
      }
    } catch {
      setScannedCopy(null);
    } finally {
      setLookingUpCopy(false);
    }
  }, []);

  // Check URL parameters for pre-fill (e.g. from Book Detail Modal "Issue Copy")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const barcodeParam = params.get('barcode');
    if (barcodeParam) {
      setIssueBarcode(barcodeParam);
      setActiveTab('issue');
      lookupCopyByBarcode(barcodeParam);
    }
    fetchActiveLoans();
    fetchPatronRisk('member');
  }, [lookupCopyByBarcode]);

  const handleBarcodeChange = (val: string) => {
    setIssueBarcode(val);
    if (val.trim().length >= 3) {
      lookupCopyByBarcode(val.trim());
    } else {
      setScannedCopy(null);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueBarcode || !issueUsername) {
      setError('Barcode and Member Username are required');
      return;
    }

    try {
      setIssuing(true);
      setError(null);
      setSuccess(null);

      const res = await api.issueLoan({
        barcode: issueBarcode.trim(),
        username: issueUsername.trim(),
        loanPeriodDays: Number(issueDays) || 14,
      });

      if (res.success && res.data) {
        setSuccess(`Successfully issued "${res.data.bookTitle}" (Barcode: ${res.data.barcode}) to ${res.data.memberFullName || res.data.username}`);
        setIssueBarcode('');
        setScannedCopy(null);
        fetchActiveLoans();
        fetchPatronRisk(issueUsername);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to issue book');
    } finally {
      setIssuing(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnBarcode) {
      setError('Barcode is required');
      return;
    }

    try {
      setReturning(true);
      setError(null);
      setSuccess(null);

      const res = await api.returnLoan({ barcode: returnBarcode.trim() });
      if (res.success && res.data) {
        setSuccess(`Successfully returned "${res.data.bookTitle}" (Barcode: ${res.data.barcode}). Copy is now AVAILABLE.`);
        setReturnBarcode('');
        fetchActiveLoans();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to return book');
    } finally {
      setReturning(false);
    }
  };

  const selectScannedBarcode = (barcode: string) => {
    setIssueBarcode(barcode);
    lookupCopyByBarcode(barcode);
    setIsScannerOpen(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <Layers className="w-4 h-4" /> Circulation &amp; Front Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Librarian Circulation Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ZXing QR code scanning, instant barcode lookup, loan issuance, returns processing, and AI risk analysis
          </p>
        </div>

        <button
          onClick={fetchActiveLoans}
          disabled={loadingLoans}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingLoans ? 'animate-spin' : ''}`} />
          Refresh Active Loans
        </button>
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

      {/* Main Circulation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Issue/Return Action Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('issue');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'issue'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" /> Issue Book
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('return');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'return'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" /> Return Book
              </button>
            </div>

            {/* Issue Form */}
            {activeTab === 'issue' ? (
              <form onSubmit={handleIssue} className="space-y-4">
                {/* Barcode & Scan Trigger */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">Book Copy Barcode *</label>
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      Scan QR / Camera
                    </button>
                  </div>

                  <div className="relative">
                    <QrCode className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={issueBarcode}
                      onChange={(e) => handleBarcodeChange(e.target.value)}
                      placeholder="e.g. BC-AI-001 or scan QR code"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      required
                    />
                    {lookingUpCopy && (
                      <RefreshCw className="w-4 h-4 absolute right-3 top-3 text-blue-400 animate-spin" />
                    )}
                  </div>
                </div>

                {/* Scanned Copy Live Preview Box */}
                {scannedCopy && (
                  <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2 text-xs animate-fadeIn">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {scannedCopy.qrCodeImage && (
                          <img
                            src={scannedCopy.qrCodeImage}
                            alt="QR"
                            className="w-10 h-10 bg-white p-0.5 rounded shadow shrink-0"
                          />
                        )}
                        <div>
                          <span className="font-bold text-white line-clamp-1">{scannedCopy.bookTitle}</span>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ISBN: {scannedCopy.bookIsbn} • Barcode: {scannedCopy.barcode}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border shrink-0 ${
                          scannedCopy.status === 'AVAILABLE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {scannedCopy.status}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Member Username / Email *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={issueUsername}
                      onChange={(e) => {
                        setIssueUsername(e.target.value);
                        fetchPatronRisk(e.target.value);
                      }}
                      placeholder="e.g. member"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Loan Period (Days)</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="number"
                      value={issueDays}
                      onChange={(e) => setIssueDays(Number(e.target.value))}
                      min={1}
                      max={60}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* AI Patron Risk Assessment Snippet */}
                {patronRisk && (
                  <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    patronRisk.riskLevel === 'HIGH'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : patronRisk.riskLevel === 'MEDIUM'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        {patronRisk.riskLevel === 'HIGH' ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : patronRisk.riskLevel === 'MEDIUM' ? <Shield className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                        <span>AI Patron Risk: {patronRisk.riskLevel} (Score: {patronRisk.riskScore}/100)</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase">{patronRisk.totalHistoricalLoans} Lifetime Loans</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{patronRisk.recommendation}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={issuing}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
                >
                  {issuing ? 'Issuing Book Copy...' : 'Issue Book to Member'}
                </button>
              </form>
            ) : (
              /* Return Form */
              <form onSubmit={handleReturn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Scanned Copy Barcode *</label>
                  <div className="relative">
                    <QrCode className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={returnBarcode}
                      onChange={(e) => setReturnBarcode(e.target.value)}
                      placeholder="e.g. BC-AI-001 or scan returned copy"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Returning a copy automatically verifies due date, assesses late fines if overdue, clears borrow locks, and checks the title reservation queue.
                </p>

                <button
                  type="submit"
                  disabled={returning}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
                >
                  {returning ? 'Processing Return...' : 'Return Book Copy'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Active Library Holdings Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Active Loans Across Library
            </h2>
            <span className="text-xs text-slate-500 font-mono">{activeLoans.length} active holdings</span>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
            {activeLoans.length > 0 ? (
              <div className="divide-y divide-slate-800/80 max-h-[520px] overflow-y-auto">
                {activeLoans.map((loan) => (
                  <div key={loan.id} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-slate-900/40 transition-colors">
                    <div className="space-y-1">
                      <div className="font-semibold text-white">{loan.bookTitle}</div>
                      <div className="text-slate-400 flex items-center gap-2 text-[11px]">
                        <span>
                          Patron:{' '}
                          <Link
                            to={`/librarian/members/${loan.userId}`}
                            className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                            title="Open Member Dossier"
                          >
                            {loan.memberFullName || loan.username}
                          </Link>
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{loan.barcode}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right text-[11px]">
                        <div className="text-slate-500">Due: {new Date(loan.dueDate).toLocaleDateString()}</div>
                        {loan.overdue && (
                          <div className="text-rose-400 font-bold font-mono">Overdue (${loan.accruedFine})</div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setReturnBarcode(loan.barcode);
                          setActiveTab('return');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 text-xs font-semibold transition-all"
                        title="Click to process return"
                      >
                        Return
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No active loans. All copies are currently available in library inventory.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Scanner / Quick Barcode Picker Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Scan className="w-4 h-4 text-blue-400" />
                <span>Scan / Select QR Code</span>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="w-20 h-20 mx-auto border-2 border-dashed border-blue-500/40 rounded-xl flex items-center justify-center bg-blue-500/5">
                <Camera className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <div className="text-xs text-slate-300">
                Point camera at physical book QR label, or select an available barcode below for instant simulated scanning:
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quick Sample Barcodes:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { barcode: 'BC-AI-001', title: 'Artificial Intelligence: A Modern Approach' },
                  { barcode: 'BC-TAOCP-001', title: 'The Art of Computer Programming, Vol 1' },
                  { barcode: 'BC-2001-001', title: '2001: A Space Odyssey' },
                  { barcode: 'BC-THINK-001', title: 'Thinking, Fast and Slow' }
                ].map((item) => (
                  <button
                    key={item.barcode}
                    onClick={() => selectScannedBarcode(item.barcode)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 flex items-center justify-between text-xs text-left transition-all group"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-blue-300">{item.title}</div>
                      <div className="font-mono text-[10px] text-slate-400">{item.barcode}</div>
                    </div>
                    <span className="text-blue-400 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform">
                      Scan ➔
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
