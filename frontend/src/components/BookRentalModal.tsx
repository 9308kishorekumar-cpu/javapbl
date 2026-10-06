import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CreditCard,
  QrCode,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { RentalQuote, Loan } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface BookRentalModalProps {
  bookId: number | null;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (loan: Loan) => void;
}

const PRESET_DURATIONS = [
  { days: 3, label: '3 Days', badge: 'Short Read' },
  { days: 7, label: '7 Days', badge: 'Standard' },
  { days: 14, label: '14 Days', badge: 'Recommended' },
  { days: 30, label: '30 Days', badge: 'Extended' },
  { days: 60, label: '60 Days', badge: 'Semester' },
];

export const BookRentalModal: React.FC<BookRentalModalProps> = ({
  bookId,
  bookTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isAuthenticated } = useAuth();

  const [selectedDays, setSelectedDays] = useState<number>(14);
  const [customDays, setCustomDays] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'UPI' | 'WALLET'>('CREDIT_CARD');

  // Quote State
  const [quote, setQuote] = useState<RentalQuote | null>(null);

  // Booking / Payment State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedLoan, setConfirmedLoan] = useState<Loan | null>(null);

  // Fetch Quote whenever duration changes
  useEffect(() => {
    if (!isOpen || !bookId) return;

    const days = isCustom && parseInt(customDays) > 0 ? parseInt(customDays) : selectedDays;

    const fetchQuote = async () => {
      try {
        setError(null);
        const res = await api.getRentalQuote(bookId, days);
        if (res.success && res.data) {
          setQuote(res.data);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch rental quote');
      }
    };

    fetchQuote();
  }, [isOpen, bookId, selectedDays, customDays, isCustom]);

  if (!isOpen || !bookId) return null;

  const currentDays = isCustom && parseInt(customDays) > 0 ? parseInt(customDays) : selectedDays;
  const currentTotalFee = quote ? quote.totalRentalFee.toFixed(2) : (currentDays * 0.50).toFixed(2);

  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId || !isAuthenticated) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await api.bookRental({
        bookId,
        rentalPeriodDays: currentDays,
        paymentMethod,
      });

      if (res.success && res.data) {
        setConfirmedLoan(res.data);
        if (onSuccess) onSuccess(res.data);
      } else {
        setError(res.message || 'Rental booking failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to complete booking and payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedLoan(null);
    setError(null);
    setSelectedDays(14);
    setIsCustom(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Book Rental &amp; Reservation
                </span>
                <span className="text-xs font-mono text-slate-500">₹0.50 / day rate</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Book &amp; Rent Title</h2>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{bookTitle}</p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIEW 1: SUCCESS RECEIPT SCREEN */}
        {confirmedLoan ? (
          <div className="space-y-6 py-2 animate-fade-in">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rental Booking Confirmed!</h3>
                <p className="text-xs text-emerald-300">
                  Payment processed and physical copy reserved in your name.
                </p>
              </div>
            </div>

            {/* Official Digital Receipt */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400 font-sans">Payment Reference:</span>
                <span className="font-bold text-indigo-300">{confirmedLoan.paymentReference || 'PAY-LBR-SUCCESS'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400 font-sans">Booked Duration:</span>
                <span className="font-bold text-white">{confirmedLoan.bookingPeriodDays || currentDays} Days</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400 font-sans">Rental Fee Paid:</span>
                <span className="font-bold text-emerald-400 font-sans text-sm">
                  ₹{(confirmedLoan.rentalFee || Number(currentTotalFee)).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400 font-sans">Copy Barcode:</span>
                <span className="text-slate-300">{confirmedLoan.barcode}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Return Due Date:</span>
                <span className="font-bold text-amber-300">
                  {new Date(confirmedLoan.dueDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Please return on or before your due date. Late returns automatically incur a deterministic fine of <strong>₹1.00/day</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <a
                href="/dashboard"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 text-center transition-all flex items-center justify-center gap-2"
              >
                <span>View in My Loans Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* VIEW 2: DURATION PICKER & PAYMENT FORM */
          <form onSubmit={handleCompleteBooking} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Duration Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  1. Select Booking &amp; Rental Duration
                </span>
                <span className="text-[11px] text-indigo-400 font-mono font-bold">
                  {currentDays} Days Selected
                </span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_DURATIONS.map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => {
                      setSelectedDays(preset.days);
                      setIsCustom(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      !isCustom && selectedDays === preset.days
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs">{preset.label}</span>
                    <span className="text-[9px] font-mono text-slate-500">{preset.badge}</span>
                  </button>
                ))}
              </div>

              {/* Custom Duration Input Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustom(!isCustom)}
                  className={`text-xs font-semibold transition-colors ${
                    isCustom ? 'text-blue-400' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {isCustom ? '✓ Custom Days:' : '+ Set Custom Number of Days'}
                </button>

                {isCustom && (
                  <input
                    type="number"
                    min="1"
                    max="90"
                    placeholder="Days (1-90)"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-24 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>
            </div>

            {/* Step 2: Live Price & Due Date Preview Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-950/60 border border-blue-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Daily Base Rate:</span>
                <span className="font-mono text-slate-300">₹0.50 / day</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimated Return Due Date:</span>
                <span className="font-mono font-bold text-amber-300">
                  {quote?.dueDatePreview
                    ? new Date(quote.dueDatePreview).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : `${currentDays} days from now`}
                </span>
              </div>

              <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Total Rental Amount:</span>
                <span className="text-xl font-extrabold font-mono text-emerald-400">
                  ₹{currentTotalFee}
                </span>
              </div>
            </div>

            {/* Step 3: Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                2. Select Digital Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 text-xs font-bold ${
                    paymentMethod === 'UPI'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <span>UPI / GPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 text-xs font-bold ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>Card / NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('WALLET')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 text-xs font-bold ${
                    paymentMethod === 'WALLET'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Library Wallet</span>
                </button>
              </div>
            </div>

            {/* Overdue Policy Note */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Overdue Rate after {currentDays} days:
              </span>
              <span className="font-mono font-bold text-rose-400">₹1.00 / day penalty</span>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || (quote ? !quote.availableForRental : false)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{currentTotalFee} &amp; Confirm Rental</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
