import { CheckCircle2, XCircle, ChevronRight, Hash, Receipt, BookOpen, User, ClipboardList, Clock } from 'lucide-react';
import { Book, Loan } from '../types';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onRent?: (book: Book) => void;
  isStaff?: boolean;
  activeBookings?: Loan[];
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelect,
  onRent,
  isStaff = false,
  activeBookings = [],
}) => {
  const isAvailable = book.availableCopies > 0;
  const hasActiveBorrower = activeBookings.length > 0;

  return (
    <div className="glass-panel hover:border-slate-700 p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-blue-950/20 group">
      <div className="space-y-3">
        {/* Header: Category, Language & Availability Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {book.categoryName || 'General'}
            </span>
            {book.language && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                🌐 {book.language}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              isAvailable
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {isAvailable ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{book.availableCopies}/{book.totalCopies} Stock Available</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 text-rose-400" />
                <span>0/{book.totalCopies} Rented Out</span>
              </>
            )}
          </span>
        </div>

        {/* Title & Authors */}
        <div className="space-y-1">
          <h3
            onClick={() => onSelect(book)}
            className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer"
          >
            {book.title}
          </h3>
          <p className="text-xs text-slate-400 font-medium line-clamp-1">
            by {book.authors && book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
          </p>
        </div>

        {/* Summary Snippet */}
        {book.summary && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {book.summary}
          </p>
        )}

        {/* Librarian / Admin View: Direct Active Borrower & Booking Details on Card */}
        {isStaff && (
          <div className="pt-2">
            {hasActiveBorrower ? (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-purple-300 font-bold text-[11px]">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    {activeBookings[0].memberFullName || activeBookings[0].username}
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono">@{activeBookings[0].username}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Period: <b>{activeBookings[0].bookingPeriodDays || 14} Days</b>
                  </span>
                  <span className="text-[11px] text-amber-300 font-medium">
                    Due: {new Date(activeBookings[0].dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-emerald-400 pt-1 border-t border-purple-500/20 font-mono">
                  <span>Fee Paid: ₹{activeBookings[0].rentalFee ? Number(activeBookings[0].rentalFee).toFixed(2) : '7.00'}</span>
                  <span>{activeBookings[0].paymentReference || 'VERIFIED'}</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  All physical copies in stock
                </span>
                <span className="text-emerald-400 font-semibold">{book.availableCopies} Available</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Role-Specific Action Buttons */}
      <div className="pt-4 mt-3 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3 text-slate-500" /> {book.isbn}
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            ₹0.50 / day
          </span>
        </div>

        <div className="pt-1">
          {/* If Staff (Admin/Librarian): DO NOT show rent button, show Book Audit */}
          {isStaff ? (
            <button
              onClick={() => onSelect(book)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs border border-slate-700/80 shadow-md transition-all flex items-center justify-center gap-2 group-hover:border-emerald-500/40"
            >
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <span>Patron Bookings &amp; Stock Audit ({activeBookings.length})</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            /* If Member/Patron: Show Rent Book button and Details */
            <div className="flex items-center gap-2">
              {onRent && isAvailable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRent(book);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Rent Book</span>
                </button>
              )}

              <button
                onClick={() => onSelect(book)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1 ${
                  onRent && isAvailable
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'w-full bg-blue-600 hover:bg-blue-500 text-white font-bold border-blue-500/20 shadow-md shadow-blue-600/20'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Details &amp; Audit</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

