import React, { useState, useEffect } from 'react';
import { X, BookPlus, User, Hash, Calendar, Layers, AlertCircle, ArrowRight, Globe } from 'lucide-react';
import { Category, CreateBookRequest } from '../types';
import { api } from '../services/api';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
  const [summary, setSummary] = useState('');
  const [language, setLanguage] = useState('en');
  const [originalLanguage, setOriginalLanguage] = useState('');
  const [translatedFromId, setTranslatedFromId] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [authorsString, setAuthorsString] = useState('');
  const [initialCopies, setInitialCopies] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getCategories().then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setCategoryId(res.data[0].id);
          }
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !isbn || !authorsString) {
      setError('Title, ISBN, and at least one Author are required');
      return;
    }

    const authorList = authorsString
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (authorList.length === 0) {
      setError('Please provide at least one author');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: CreateBookRequest = {
        title,
        isbn,
        publicationYear: Number(publicationYear) || undefined,
        summary,
        language: language || 'en',
        originalLanguage: originalLanguage.trim() || undefined,
        translatedFromId: translatedFromId ? Number(translatedFromId) : undefined,
        categoryId: categoryId || undefined,
        authors: authorList,
        initialCopies: Number(initialCopies) || 1,
      };

      const res = await api.createBook(payload);
      if (res.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create book');
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: 'en', label: 'English (en)' },
    { code: 'ta', label: 'Tamil (ta)' },
    { code: 'hi', label: 'Hindi (hi)' },
    { code: 'ja', label: 'Japanese (ja)' },
    { code: 'fr', label: 'French (fr)' },
    { code: 'es', label: 'Spanish (es)' },
    { code: 'de', label: 'German (de)' },
    { code: 'zh', label: 'Chinese (zh)' },
    { code: 'ar', label: 'Arabic (ar)' },
    { code: 'ru', label: 'Russian (ru)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Book to Catalog</h2>
              <p className="text-xs text-slate-400">Librarian catalog accession &amp; multilingual edition form</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Book Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Designing Data-Intensive Applications"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">ISBN *</label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="978-1449373320"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Publication Year</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="number"
                  value={publicationYear}
                  onChange={(e) => setPublicationYear(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Multilingual Support Controls */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Multilingual &amp; Translation Attributes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Edition Language *</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Original Language</label>
                <input
                  type="text"
                  value={originalLanguage}
                  onChange={(e) => setOriginalLanguage(e.target.value)}
                  placeholder="e.g. en, fr, ru"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Original Book ID</label>
                <input
                  type="number"
                  value={translatedFromId || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTranslatedFromId(val ? Number(val) : undefined);
                  }}
                  placeholder="e.g. 1"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Authors (comma-separated) *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={authorsString}
                onChange={(e) => setAuthorsString(e.target.value)}
                placeholder="e.g. Martin Kleppmann, Donald Knuth"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={categoryId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategoryId(val ? Number(val) : undefined);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Initial Physical Copies</label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={initialCopies}
                  onChange={(e) => setInitialCopies(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Summary / Abstract</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary or subject description of the book..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Save and Generate Barcodes'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
