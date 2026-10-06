import React, { useState, useEffect } from 'react';
import { X, Quote, Copy, Check, Sparkles } from 'lucide-react';
import { Citation } from '../types';
import { api } from '../services/api';

interface CitationModalProps {
  bookId: number | null;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ bookId, bookTitle, isOpen, onClose }) => {
  const [format, setFormat] = useState<'APA' | 'MLA' | 'CHICAGO' | 'HARVARD' | 'BIBTEX'>('APA');
  const [citation, setCitation] = useState<Citation | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCitation = async (id: number, fmt: string) => {
    try {
      setLoading(true);
      const res = await api.getCitation(id, fmt);
      if (res.success && res.data) {
        setCitation(res.data);
      }
    } catch (err) {
      console.error('Failed to generate citation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && bookId) {
      fetchCitation(bookId, format);
      setCopied(false);
    }
  }, [isOpen, bookId, format]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (citation?.citationText) {
      navigator.clipboard.writeText(citation.citationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formats: Array<'APA' | 'MLA' | 'CHICAGO' | 'HARVARD' | 'BIBTEX'> = [
    'APA',
    'MLA',
    'CHICAGO',
    'HARVARD',
    'BIBTEX',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/20">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-purple-400">
                <Sparkles className="w-3 h-3" /> Academic Citation Generator
              </div>
              <h2 className="text-base font-bold text-white line-clamp-1">{bookTitle}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80 overflow-x-auto">
          {formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                format === fmt
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Citation Output Box */}
        <div className="relative">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed min-h-[100px] flex items-center justify-center">
            {loading ? (
              <span className="text-slate-500 animate-pulse font-sans">Generating {format} citation...</span>
            ) : citation?.citationText ? (
              <p className="whitespace-pre-wrap select-all">{citation.citationText}</p>
            ) : (
              <span className="text-slate-500 font-sans">Unable to format citation</span>
            )}
          </div>

          <button
            onClick={handleCopy}
            disabled={!citation?.citationText || loading}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy {format} Citation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
