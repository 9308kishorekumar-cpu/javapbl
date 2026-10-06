import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, RefreshCw, AlertCircle, Filter, CheckCircle2 } from 'lucide-react';
import { Book, Category, Loan } from '../types';
import { api } from '../services/api';
import { BookCard } from '../components/BookCard';
import { BookDetailModal } from '../components/BookDetailModal';
import { BookRentalModal } from '../components/BookRentalModal';
import { AddBookModal } from '../components/AddBookModal';
import { useAuth } from '../context/AuthContext';

export const CatalogPage: React.FC = () => {
  const { isLibrarian, isAdmin } = useAuth();
  const isStaff = isLibrarian || isAdmin;

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLoansByBookId, setActiveLoansByBookId] = useState<Record<number, Loan[]>>({});

  // Modals
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rentalBook, setRentalBook] = useState<Book | null>(null);
  const [isRentalOpen, setIsRentalOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);

  const LANGUAGES = [
    { code: 'all', label: 'All Languages', flag: '🌍' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'sa', label: 'संस्कृतम्', flag: '🕉️' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ar', label: 'العربية', flag: '🇦🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'la', label: 'Latina', flag: '🏛️' },
    { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
  ];

  const fetchActiveLoans = async () => {
    if (!isStaff) return;
    try {
      const res = await api.getActiveLoans();
      if (res.success && res.data) {
        const map: Record<number, Loan[]> = {};
        res.data.forEach((loan) => {
          if (loan.bookId) {
            if (!map[loan.bookId]) map[loan.bookId] = [];
            map[loan.bookId].push(loan);
          }
        });
        setActiveLoansByBookId(map);
      }
    } catch (err) {
      console.error('Failed to load active loans for staff catalog:', err);
    }
  };

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.getBooks({
        query: searchQuery.trim() || undefined,
        categoryId: selectedCategory || undefined,
        page: 0,
        size: 200,
      });

      if (res.success && res.data) {
        let content = res.data.content;
        if (onlyAvailable) {
          content = content.filter((b) => b.availableCopies > 0);
        }
        if (selectedLanguage && selectedLanguage !== 'all') {
          content = content.filter((b) => b.language?.toLowerCase() === selectedLanguage.toLowerCase());
        }
        setBooks(content);
        setTotalElements(res.data.totalElements);
      }

      if (isStaff) {
        await fetchActiveLoans();
      }
    } catch (err: any) {
      console.error('Failed to load books:', err);
      setError(err?.message || 'Error loading library catalog');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedLanguage, onlyAvailable, isStaff]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setIsDetailOpen(true);
  };

  const handleRentBook = (book: Book) => {
    setRentalBook(book);
    setIsRentalOpen(true);
  };

  const handleRentalSuccess = (_loan: Loan) => {
    fetchCatalog();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero & Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            {isAdmin ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                👑 Administrator View (Inventory &amp; System Maintenance)
              </span>
            ) : isLibrarian ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                📚 Chief Librarian View (Stock &amp; Patron Bookings Audit)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <BookOpen className="w-3.5 h-3.5" /> Patron &amp; Reader Catalog
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1.5">
            {isStaff ? 'Library Catalog & Inventory Stock' : 'Library Catalog & Book Rentals'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isStaff
              ? 'Library Maintenance Mode: View all physical titles, available stock quantities, and who currently borrowed copies.'
              : 'Browse physical titles, reserve duration periods with upfront payments (₹0.50/day), and manage loans.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCatalog}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isLibrarian && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Book
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-4">
        {/* Search Input & Availability Switch */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books by title, author, category, or ISBN..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all shrink-0 ${
              onlyAvailable
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>In-Stock Only</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-slate-400" /> Category:
          </span>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Categories ({totalElements})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Multilingual Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/60">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            🌐 Language:
          </span>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code === 'all' ? null : lang.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                (selectedLanguage === null && lang.code === 'all') || selectedLanguage === lang.code
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Book Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading library collection...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Books Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords or clearing the category filter.
          </p>
          {(searchQuery || selectedCategory !== null || onlyAvailable) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setOnlyAvailable(false);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={handleSelectBook}
              onRent={handleRentBook}
              isStaff={isStaff}
              activeBookings={activeLoansByBookId[book.id] || []}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedBook && (
        <BookDetailModal
          bookId={selectedBook.id}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedBook(null);
          }}
          onBookUpdated={fetchCatalog}
        />
      )}

      {rentalBook && (
        <BookRentalModal
          bookId={rentalBook.id}
          bookTitle={rentalBook.title}
          isOpen={isRentalOpen}
          onClose={() => {
            setIsRentalOpen(false);
            setRentalBook(null);
          }}
          onSuccess={handleRentalSuccess}
        />
      )}

      <AddBookModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchCatalog}
      />
    </div>
  );
};
