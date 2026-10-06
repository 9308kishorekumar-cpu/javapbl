import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, RefreshCw, Wrench, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { ToolExecution } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  groundedInCatalog?: boolean;
  isDegraded?: boolean;
  toolExecutions?: ToolExecution[];
  suggestedFollowUps?: string[];
  referencedBookIds?: number[];
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [sessionId, setSessionId] = useState<string>(() => 'sess_' + Math.random().toString(36).substring(2, 10));
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am **LibraAI Conversational Assistant** 🤖\n\nI use structured tool-calling to verify real catalog holdings across 20 languages, inspect book availability, explore author works, and answer literary questions. How can I assist you today?",
      groundedInCatalog: false,
      suggestedFollowUps: [
        'Do you have any Tamil mystery novels?',
        'Why is Gatsby\'s green light significant in American literature?',
        'Show me books by Leo Tolstoy',
        'What are the library borrowing & overdue policies?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.chat({ message: query, sessionId });
      if (res.success && res.data) {
        if (res.data.sessionId) {
          setSessionId(res.data.sessionId);
        }
        const aiMsg: Message = {
          role: 'assistant',
          content: res.data.reply,
          groundedInCatalog: res.data.groundedInCatalog,
          isDegraded: res.data.isDegraded,
          toolExecutions: res.data.toolExecutions,
          suggestedFollowUps: res.data.suggestedFollowUps,
          referencedBookIds: res.data.referencedBookIds,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'The assistant service is temporarily experiencing an issue. You can search our library catalog directly in the catalog page.',
          isDegraded: true,
          groundedInCatalog: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const newSession = 'sess_' + Math.random().toString(36).substring(2, 10);
    setSessionId(newSession);
    setMessages([
      {
        role: 'assistant',
        content:
          "Conversation reset! How can I assist you with the library catalog and services?",
        groundedInCatalog: false,
        suggestedFollowUps: [
          'Do you have any Tamil mystery novels?',
          'Why is Gatsby\'s green light significant?',
          'What are the library borrowing policies?',
        ],
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg h-[640px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">LibraAI Assistant</h3>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                  Tool-Calling Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Conversational catalog &amp; literature assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset conversation session"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-3.5 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                    : 'bg-slate-950 border border-slate-800/80 text-slate-200 rounded-bl-none shadow-sm space-y-2'
                }`}
              >
                {/* Assistant Grounding Badge */}
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-2 flex-wrap pb-1 border-b border-slate-800/60 text-[10px] font-mono">
                    {m.isDegraded ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        <AlertTriangle className="w-3 h-3" /> Degraded Fallback
                      </span>
                    ) : m.groundedInCatalog ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        <CheckCircle className="w-3 h-3" /> Catalog Grounded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                        <BookOpen className="w-3 h-3" /> General Literary Knowledge
                      </span>
                    )}

                    {/* Tool executions summary */}
                    {m.toolExecutions && m.toolExecutions.length > 0 && (
                      <div className="flex items-center gap-1">
                        {m.toolExecutions.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                            title={`Executed tool: ${t.toolName} (${t.status})`}
                          >
                            <Wrench className="w-2.5 h-2.5 text-blue-400" />
                            {t.toolName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-line text-slate-200">{m.content}</div>

                {/* Follow-up suggestion pills */}
                {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {m.suggestedFollowUps.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(fu)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-left transition-colors"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Executing tool calls &amp; composing response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Tamil novels, Gatsby's green light, author works..."
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
