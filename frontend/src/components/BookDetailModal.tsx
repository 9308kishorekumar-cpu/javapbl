import React, { useEffect, useState } from 'react';
import {
  X,
  Book,
  Hash,
  Calendar,
  Layers,
  CheckCircle2,
  Plus,
  QrCode,
  Tag,
  Globe,
  ArrowRight,
  Star,
  Send,
  UserCheck,
  Bookmark,
  AlertCircle,
  Receipt,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { BookDetail, BookRatingsSummary, BookRating, Loan } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookRentalModal } from './BookRentalModal';

interface BookDetailModalProps {
  bookId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onBookUpdated?: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ bookId, isOpen, onClose, onRefresh, onBookUpdated }) => {
  const { isLibrarian, isAuthenticated } = useAuth();
  const [detail, setDetail] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingCopy, setAddingCopy] = useState<boolean>(false);

  // Rating & Review State
  const [ratingsSummary, setRatingsSummary] = useState<BookRatingsSummary | null>(null);
  const [ratingsLoading, setRatingsLoading] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);
  const [ratingErrorMsg, setRatingErrorMsg] = useState<string | null>(null);

  // Reservation Hold State
  const [reserving, setReserving] = useState<boolean>(false);
  const [reserveSuccessMsg, setReserveSuccessMsg] = useState<string | null>(null);
  const [reserveErrorMsg, setReserveErrorMsg] = useState<string | null>(null);

  // Rental Booking State
  const [rentalModalOpen, setRentalModalOpen] = useState<boolean>(false);

  // Librarian Book Audit State
  const [bookBookings, setBookBookings] = useState<Loan[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);

  const handleReserveBook = async () => {
    if (!bookId || !isAuthenticated) return;
    try {
      setReserving(true);
      setReserveSuccessMsg(null);
      setReserveErrorMsg(null);
      const res = await api.createReservation(bookId);
      if (res.success) {
        setReserveSuccessMsg('Hold request confirmed! You are now in the reservation queue.');
      } else {
        setReserveErrorMsg(res.message || 'Failed to place reservation hold');
      }
    } catch (err: any) {
      setReserveErrorMsg(err?.response?.data?.message || err?.message || 'Failed to place reservation hold');
    } finally {
      setReserving(false);
    }
  };

  const fetchDetailAndRatings = async (id: number) => {
    try {
      setLoading(true);
      setRatingsLoading(true);
      setRatingSuccessMsg(null);
      setRatingErrorMsg(null);

      const [bookRes, ratingsRes] = await Promise.all([
        api.getBookById(id),
        api.getBookRatings(id),
      ]);

      if (bookRes.success && bookRes.data) {
        setDetail(bookRes.data);
      }

      if (ratingsRes.success && ratingsRes.data) {
        setRatingsSummary(ratingsRes.data);
        if (ratingsRes.data.userRating) {
          setSelectedRating(ratingsRes.data.userRating.rating);
          setReviewText(ratingsRes.data.userRating.review || '');
        } else {
          setSelectedRating(5);
          setReviewText('');
        }
      }

      // If librarian or admin, fetch book booking history
      if (isLibrarian) {
        try {
          setLoadingBookings(true);
          const bookingsRes = await api.getBookBookings(id);
          if (bookingsRes.success && bookingsRes.data) {
            setBookBookings(bookingsRes.data);
          }
        } catch (bErr) {
          console.error('Failed to load book bookings:', bErr);
        } finally {
          setLoadingBookings(false);
        }
      }
    } catch (err) {
      console.error('Failed to load book details and ratings:', err);
    } finally {
      setLoading(false);
      setRatingsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && bookId) {
      fetchDetailAndRatings(bookId);
    } else {
      setDetail(null);
      setRatingsSummary(null);
    }
  }, [isOpen, bookId]);

  if (!isOpen) return null;

  const triggerUpdate = () => {
    if (onRefresh) onRefresh();
    if (onBookUpdated) onBookUpdated();
  };

  const handleAddCopy = async () => {
    if (!bookId) return;
    try {
      setAddingCopy(true);
      await api.addCopy(bookId, { conditionNote: 'Good condition' });
      await fetchDetailAndRatings(bookId);
      triggerUpdate();
    } catch (err) {
      console.error('Failed to add book copy:', err);
    } finally {
      setAddingCopy(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId || !isAuthenticated) return;

    try {
      setSubmittingRating(true);
      setRatingErrorMsg(null);
      setRatingSuccessMsg(null);

      const res = await api.rateBook(bookId, {
        rating: selectedRating,
        review: reviewText.trim() ? reviewText.trim() : undefined,
      });

      if (res.success) {
        setRatingSuccessMsg(ratingsSummary?.userRating ? 'Your rating and review were updated!' : 'Thank you! Your rating has been recorded.');
        // Refresh ratings summary to update average score and review list
        const updatedSummaryRes = await api.getBookRatings(bookId);
        if (updatedSummaryRes.success && updatedSummaryRes.data) {
          setRatingsSummary(updatedSummaryRes.data);
        }
        triggerUpdate();
      }
    } catch (err: any) {
      setRatingErrorMsg(err?.response?.data?.message || err?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const getCopyStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'BORROWED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'RESERVED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'MAINTENANCE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  const getLanguageName = (code: string) => {
    const map: Record<string, string> = {
      en: 'English',
      ta: 'Tamil',
      hi: 'Hindi',
      ja: 'Japanese',
      fr: 'French',
      es: 'Spanish',
      de: 'German',
      zh: 'Chinese',
      ar: 'Arabic',
      ru: 'Russian',
      bn: 'Bengali',
      te: 'Telugu',
      ko: 'Korean',
      it: 'Italian',
      pt: 'Portuguese',
      tr: 'Turkish',
      nl: 'Dutch',
      el: 'Greek',
      la: 'Latin',
      sa: 'Sanskrit',
    };
    return map[code?.toLowerCase()] || code?.toUpperCase() || 'English';
  };

  const renderStarRatingDisplay = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              rating >= star
                ? 'fill-amber-400 text-amber-400'
                : rating >= star - 0.5
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 shrink-0">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {detail?.category?.name || 'General'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Globe className="w-3 h-3" />
                  Language: {detail?.language ? `${getLanguageName(detail.language)} (${detail.language})` : 'English (en)'}
                </span>

                {/* Rating Badge in Header */}
                {ratingsSummary && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {ratingsSummary.averageRating > 0 ? ratingsSummary.averageRating.toFixed(1) : 'New'}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({ratingsSummary.totalRatings})
                    </span>
                  </span>
                )}

                <span className="text-xs font-mono text-slate-500">ID #{detail?.id}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{detail?.title || 'Loading book...'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                by {detail?.authors?.map((a) => a.name).join(', ') || 'Unknown'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
            Loading book metadata, translations, and reviews...
          </div>
        ) : detail ? (
          <div className="space-y-6">
            {/* Translated Work Link Banner */}
            {detail.translatedFromId && (
              <div
                onClick={() => {
                  if (detail.translatedFromId) {
                    fetchDetailAndRatings(detail.translatedFromId);
                  }
                }}
                className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between cursor-pointer hover:bg-amber-500/20 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-semibold">Translated Edition</span>
                    <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                      (Original Language: {detail.originalLanguage ? getLanguageName(detail.originalLanguage) : 'English'})
                    </span>
                    <div className="text-slate-300 font-bold mt-0.5">
                      Original Work: {detail.translatedFromTitle || `Book #${detail.translatedFromId}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-semibold text-[11px] text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <span>View Original Edition</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Also Available in Other Languages */}
            {detail.translations && detail.translations.length > 0 && (
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>Also available in: {detail.translations.map((t) => getLanguageName(t.language)).join(', ')}</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                    {detail.translations.length} edition{detail.translations.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {detail.translations.map((tr) => (
                    <div
                      key={tr.id}
                      onClick={() => fetchDetailAndRatings(tr.id)}
                      className="p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between text-xs group"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                          {tr.title}
                        </div>
                        <div className="text-[11px] text-indigo-400 font-mono">
                          {getLanguageName(tr.language)} ({tr.language})
                        </div>
                      </div>
                      <span className="text-indigo-400 font-semibold flex items-center gap-0.5 text-[11px] group-hover:translate-x-0.5 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Hash className="w-3.5 h-3.5 text-blue-400" /> ISBN
                </div>
                <div className="text-xs font-mono font-semibold text-slate-200 truncate">{detail.isbn}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> Year
                </div>
                <div className="text-xs font-semibold text-slate-200">{detail.publicationYear || 'N/A'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Total Stock
                </div>
                <div className="text-xs font-semibold text-slate-200">{detail.totalCopies} Copies</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Available
                </div>
                <div className="text-xs font-semibold text-emerald-400">{detail.availableCopies} Copies</div>
              </div>
            </div>

            {/* Summary */}
            {detail.summary && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description &amp; Summary</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                  {detail.summary}
                </p>
              </div>
            )}

            {/* PATRON ACTIONS: BOOK & RENT (TIME-PERIOD) + PLACE HOLD */}
            {isAuthenticated && !isLibrarian && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. BOOK & RENT (WITH CUSTOM DURATION & UPFRONT PAYMENT) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-slate-950/60 border border-blue-500/30 flex flex-col justify-between gap-3 shadow-lg shadow-blue-500/5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Receipt className="w-4 h-4 text-blue-400" />
                        <span>Book &amp; Rent Title</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                        ₹0.50 / day
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Choose your rental period (3–60 days), pay upfront, and start reading immediately.
                    </p>
                  </div>

                  <button
                    onClick={() => setRentalModalOpen(true)}
                    disabled={detail.availableCopies <= 0}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{detail.availableCopies > 0 ? 'Book & Rent (Choose Period)' : 'Out of Stock (Place Hold)'}</span>
                  </button>
                </div>

                {/* 2. PLACE A HOLD / RESERVATION */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Bookmark className="w-4 h-4 text-indigo-400" />
                      <span>Place a Hold / Reservation</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Reserve this title. When a copy is returned or available, you will be notified in-app.
                    </p>
                  </div>

                  <button
                    onClick={handleReserveBook}
                    disabled={reserving}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${reserving ? 'animate-spin' : ''}`} />
                    <span>{reserving ? 'Reserving...' : 'Reserve Title'}</span>
                  </button>
                </div>
              </div>
            )}

            {reserveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{reserveSuccessMsg}</span>
              </div>
            )}

            {reserveErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{reserveErrorMsg}</span>
              </div>
            )}

            {/* COMMUNITY RATINGS & REVIEWS SECTION */}
            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <h4 className="text-sm font-bold text-white">Community Ratings &amp; Reviews</h4>
                </div>
                {ratingsSummary && (
                  <span className="text-xs text-slate-400 font-mono">
                    {ratingsSummary.totalRatings} member review{ratingsSummary.totalRatings === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              {/* Score Box & Rating Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Average Score Box */}
                <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-1.5">
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {ratingsSummary && ratingsSummary.averageRating > 0 ? ratingsSummary.averageRating.toFixed(1) : '—'}
                  </div>
                  {ratingsSummary && renderStarRatingDisplay(ratingsSummary.averageRating)}
                  <span className="text-[11px] text-slate-400">
                    {ratingsSummary && ratingsSummary.totalRatings > 0
                      ? `Based on ${ratingsSummary.totalRatings} rating${ratingsSummary.totalRatings > 1 ? 's' : ''}`
                      : 'No ratings yet'}
                  </span>
                </div>

                {/* Rating Input Form */}
                <div className="md:col-span-2 glass-panel p-4 rounded-xl border border-slate-800/80 space-y-3">
                  {isAuthenticated ? (
                    <form onSubmit={handleSubmitRating} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">
                          {ratingsSummary?.userRating ? 'Update Your Rating & Review:' : 'Rate This Book:'}
                        </span>

                        {/* Interactive Stars */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSelectedRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="p-1 text-slate-600 hover:scale-110 transition-transform focus:outline-none"
                              title={`${star} Star${star > 1 ? 's' : ''}`}
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  (hoverRating !== null ? hoverRating >= star : selectedRating >= star)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-mono font-bold text-amber-300 ml-1.5">
                            {hoverRating !== null ? hoverRating : selectedRating} / 5
                          </span>
                        </div>
                      </div>

                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write your review, takeaways, or recommendation notes for other members (optional)..."
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                      />

                      {ratingErrorMsg && (
                        <div className="text-[11px] text-rose-400">{ratingErrorMsg}</div>
                      )}
                      {ratingSuccessMsg && (
                        <div className="text-[11px] text-emerald-400 font-semibold">{ratingSuccessMsg}</div>
                      )}

                      <div className="flex items-center justify-end">
                        <button
                          type="submit"
                          disabled={submittingRating}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {submittingRating ? 'Saving...' : ratingsSummary?.userRating ? 'Update Review' : 'Post Review'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="py-3 text-center text-xs text-slate-400 space-y-1">
                      <UserCheck className="w-5 h-5 text-slate-500 mx-auto" />
                      <p>Sign in to rate this title and share your review with the community.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Reviews List */}
              <div className="space-y-2.5 pt-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Member Reviews</h5>

                {ratingsLoading ? (
                  <div className="text-xs text-slate-500 py-3 text-center animate-pulse">
                    Loading member reviews...
                  </div>
                ) : ratingsSummary && ratingsSummary.reviews && ratingsSummary.reviews.content.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {ratingsSummary.reviews.content.map((r: BookRating) => (
                      <div key={r.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{r.memberFullName || r.username}</span>
                            <span className="text-[11px] text-slate-500 font-mono">@{r.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStarRatingDisplay(r.rating)}
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {r.review ? (
                          <p className="text-slate-300 text-xs leading-relaxed pt-0.5">{r.review}</p>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">No written comment provided.</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/40 text-center text-xs text-slate-500">
                    No reviews yet. Be the first to share your thoughts on this book!
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Copies with QR Codes */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">Physical Barcode &amp; QR Inventory</h4>
                </div>

                {isLibrarian && (
                  <button
                    onClick={handleAddCopy}
                    disabled={addingCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {addingCopy ? 'Generating QR...' : 'Add New Copy'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detail.copies && detail.copies.length > 0 ? (
                  detail.copies.map((copy) => (
                    <div
                      key={copy.id}
                      className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start justify-between gap-3 text-xs group"
                    >
                      {/* Left: QR Thumbnail + Details */}
                      <div className="flex items-start gap-3">
                        {/* QR Image Thumbnail */}
                        <div className="p-1 bg-white rounded-lg shadow shrink-0 cursor-pointer hover:scale-105 transition-transform" title="Scan or Print QR Code">
                          {copy.qrCodeImage ? (
                            <img
                              src={copy.qrCodeImage}
                              alt={`QR Code for ${copy.barcode}`}
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <img
                              src={`/api/v1/books/copies/${copy.id}/qr`}
                              alt={`QR Code for ${copy.barcode}`}
                              className="w-12 h-12 object-contain"
                            />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="font-mono font-bold text-slate-200 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-slate-500" />
                            {copy.barcode}
                          </div>
                          <div className="text-[11px] text-slate-400">{copy.conditionNote}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Copy ID #{copy.id}</div>
                        </div>
                      </div>

                      {/* Right: Status Badge & Scan/Issue Action */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${getCopyStatusBadge(copy.status)}`}>
                          {copy.status}
                        </span>

                        {isLibrarian && copy.status === 'AVAILABLE' && (
                          <a
                            href={`/circulation?barcode=${encodeURIComponent(copy.barcode)}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-[11px] font-semibold transition-all hover:scale-105"
                            title="Scan / Pre-fill Issue Form"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>Issue Copy</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-4 text-xs text-slate-500">
                    No physical copies registered yet.
                  </div>
                )}
              </div>
            </div>

            {/* LIBRARIAN & ADMIN VIEW: PATRON BOOKINGS & PAYMENT AUDIT */}
            {isLibrarian && (
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Patron Bookings &amp; Payment Audit</h4>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {bookBookings.length} total circulation record{bookBookings.length === 1 ? '' : 's'}
                  </span>
                </div>

                {loadingBookings ? (
                  <div className="p-4 text-center text-xs text-slate-500">Loading booking records...</div>
                ) : bookBookings.length > 0 ? (
                  <div className="space-y-2.5">
                    {bookBookings.map((bk) => (
                      <div
                        key={bk.id}
                        className={`p-4 rounded-2xl border text-xs space-y-3 ${
                          bk.overdue
                            ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-500/5'
                            : 'bg-slate-950/80 border-slate-800/80'
                        }`}
                      >
                        {/* Row 1: Patron Details + Copy + Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold font-mono text-xs">
                              {bk.memberFullName ? bk.memberFullName.slice(0, 2).toUpperCase() : 'PT'}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{bk.memberFullName || bk.username}</span>
                                <span className="font-mono text-[11px] text-slate-400 font-normal">(@{bk.username})</span>
                              </div>
                              <div className="text-[10px] text-slate-500">{bk.userEmail || 'Member in Good Standing'}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                              Copy: {bk.barcode}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                                bk.status === 'ACTIVE'
                                  ? bk.overdue
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {bk.status}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Booking Period & Financial / Fine Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          {/* Time Period */}
                          <div className="space-y-1">
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-400" />
                              <span>Booked Time Period</span>
                            </div>
                            <div className="font-semibold text-slate-200">
                              {bk.bookingPeriodDays || 14} Days Duration
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              Due: {new Date(bk.dueDate).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Upfront Rental Fee Paid */}
                          <div className="space-y-1">
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-emerald-400" />
                              <span>Rental Fee Paid</span>
                            </div>
                            <div className="font-bold text-emerald-400 font-mono">
                              ₹{(bk.rentalFee !== undefined ? bk.rentalFee : 0).toFixed(2)} Paid ({bk.paymentMethod || 'CARD'})
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">
                              Ref: {bk.paymentReference || 'N/A'}
                            </div>
                          </div>

                          {/* Overdue Fine Status */}
                          <div className="space-y-1">
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-amber-400" />
                              <span>Overdue Fine Status</span>
                            </div>
                            {bk.overdue ? (
                              <div className="font-bold text-rose-400 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{bk.currentOverdueDays || 1}d Late (₹{(bk.accruedFine || 0).toFixed(2)})</span>
                              </div>
                            ) : bk.status === 'RETURNED' && (bk.lateDays || 0) > 0 ? (
                              <div className="text-amber-400 font-medium">
                                Returned late ({bk.lateDays}d - ₹{(bk.fineAmount || 0).toFixed(2)})
                              </div>
                            ) : (
                              <div className="text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>No Late Fines (₹0.00)</span>
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500">Rate: ₹1.00 / day penalty</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/40 text-center text-xs text-slate-500">
                    No active or historical booking records found for this title.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* BOOK RENTAL MODAL */}
        <BookRentalModal
          bookId={detail?.id || null}
          bookTitle={detail?.title || ''}
          isOpen={rentalModalOpen}
          onClose={() => setRentalModalOpen(false)}
          onSuccess={() => {
            if (bookId) fetchDetailAndRatings(bookId);
            if (onRefresh) onRefresh();
          }}
        />
      </div>
    </div>
  );
};
