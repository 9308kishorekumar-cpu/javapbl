import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  Wrench,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { api } from '../services/api';
import { ToolExecution } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  groundedInCatalog?: boolean;
  isDegraded?: boolean;
  toolExecutions?: ToolExecution[];
  suggestedFollowUps?: string[];
  referencedBookIds?: number[];
  timestamp?: string;
  isStreaming?: boolean;
}

interface ChatPanelProps {
  onSelectBookId?: (bookId: number) => void;
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onSelectBookId, className = '' }) => {
  // Session persistence across messages in the same visit
  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = sessionStorage.getItem('libraai_chat_session');
    if (saved) return saved;
    const newId = 'sess_' + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem('libraai_chat_session', newId);
    return newId;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMsgs = sessionStorage.getItem('libraai_chat_messages');
    if (savedMsgs) {
      try {
        return JSON.parse(savedMsgs);
      } catch (e) {}
    }
    return [];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('libraai_chat_messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const starterPrompts = [
    { label: 'Recommend a mystery novel in Hindi', prompt: 'Recommend a mystery novel in Hindi' },
    { label: 'What else did Haruki Murakami write?', prompt: 'What else did Haruki Murakami write?' },
    { label: 'Do you have any poetry in Japanese?', prompt: 'Do you have any poetry in Japanese?' },
    { label: 'Why is Gatsby\'s green light significant?', prompt: 'Why is Gatsby\'s green light significant in American literature?' },
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsgId = 'msg_' + Date.now();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.chat({
        message: query.trim(),
        sessionId,
      });

      if (res.success && res.data) {
        if (res.data.sessionId && res.data.sessionId !== sessionId) {
          setSessionId(res.data.sessionId);
          sessionStorage.setItem('libraai_chat_session', res.data.sessionId);
        }

        const replyContent = res.data.reply;
        const assistantMsgId = 'msg_' + Date.now() + 1;

        const aiMsg: Message = {
          id: assistantMsgId,
          role: 'assistant',
          content: replyContent,
          groundedInCatalog: res.data.groundedInCatalog,
          isDegraded: res.data.isDegraded,
          toolExecutions: res.data.toolExecutions,
          suggestedFollowUps: res.data.suggestedFollowUps,
          referencedBookIds: res.data.referencedBookIds,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content:
          'The AI assistant is temporarily operating in degraded mode. You can search our library catalog directly by typing keywords into the catalog search bar.',
        isDegraded: true,
        groundedInCatalog: false,
        suggestedFollowUps: ['Search catalog by keyword', 'Browse books by language'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    const newSession = 'sess_' + Math.random().toString(36).substring(2, 10);
    setSessionId(newSession);
    sessionStorage.setItem('libraai_chat_session', newSession);
    setMessages([]);
    sessionStorage.removeItem('libraai_chat_messages');
  };

  return (
    <div
      className={`glass-panel rounded-2xl border border-indigo-500/20 bg-slate-900/90 shadow-xl flex flex-col overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">AI Library Assistant</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                <Wrench className="w-2.5 h-2.5" /> Conversational Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tool-calling catalog search across 20 languages &amp; literary analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSession}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Start new conversation session"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse Chat' : 'Expand Chat'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Messages Viewport */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[420px] min-h-[260px] scrollbar-thin">
            {/* Empty State / Starter Prompts */}
            {messages.length === 0 && (
              <div className="py-6 text-center space-y-4 animate-fadeIn">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Ask the LibraAI Catalog Assistant</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Ask natural questions in any language, search real holdings, check availability, or explore literary themes.
                  </p>
                </div>

                {/* Clickable Starter Prompts */}
                <div className="pt-2 space-y-1.5 max-w-lg mx-auto">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block text-left px-1">
                    Try these sample prompts:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {starterPrompts.map((sp, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sp.prompt)}
                        className="starter-prompt-btn p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                      >
                        <span className="line-clamp-1">{sp.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-1 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation History */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs leading-relaxed animate-fadeIn ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2.5 ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                      : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {/* Assistant Grounding Badge */}
                  {m.role === 'assistant' && (
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {m.isDegraded ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                            <AlertTriangle className="w-3 h-3" /> Degraded / Fallback Mode
                          </span>
                        ) : m.groundedInCatalog ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> From our catalog
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                            <BookOpen className="w-3 h-3" /> General knowledge
                          </span>
                        )}

                        {/* Executed Tools Indicators */}
                        {m.toolExecutions && m.toolExecutions.length > 0 && (
                          <span className="text-slate-400 text-[10px]">
                            via {m.toolExecutions.map((t) => t.toolName).join(', ')}
                          </span>
                        )}
                      </div>

                      {m.timestamp && <span className="text-slate-500 text-[10px]">{m.timestamp}</span>}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-line text-slate-200 text-xs sm:text-[13px] leading-relaxed">
                    {m.content}
                  </div>

                  {/* Follow-up Suggestion Chips */}
                  {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 block">Suggested follow-ups:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.suggestedFollowUps.map((fu, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleSend(fu)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-left transition-colors font-medium"
                          >
                            {fu}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Referenced Book Chips */}
                  {m.referencedBookIds && m.referencedBookIds.length > 0 && onSelectBookId && (
                    <div className="pt-1.5 flex items-center gap-1.5 flex-wrap text-[11px]">
                      <span className="text-slate-400">View Books:</span>
                      {m.referencedBookIds.map((bid) => (
                        <button
                          key={bid}
                          onClick={() => onSelectBookId(bid)}
                          className="px-2 py-0.5 rounded bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 font-mono font-bold transition-colors"
                        >
                          Book #{bid}
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

            {/* Typing / Loading Indicator */}
            {loading && (
              <div className="flex gap-3 text-xs justify-start items-center animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2.5 shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  </span>
                  <span className="text-xs text-indigo-300">Searching catalog &amp; composing response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-3.5 bg-slate-950/90 border-t border-slate-800/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="chat-input-field"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about books in any language, authors, topics, or literary themes..."
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
              <button
                id="chat-submit-btn"
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-40"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
