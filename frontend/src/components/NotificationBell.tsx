import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Clock,
  Info,
  Play,
  RotateCw,
  Sparkles,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [triggeringJob, setTriggeringJob] = useState(false);
  const [jobResultMsg, setJobResultMsg] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [notifsRes, countRes] = await Promise.all([
        api.getNotifications(20),
        api.getUnreadNotificationCount(),
      ]);

      if (notifsRes.success && notifsRes.data) {
        setNotifications(notifsRes.data);
      }
      if (countRes.success && countRes.data) {
        setUnreadCount(countRes.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleTriggerJob = async () => {
    try {
      setTriggeringJob(true);
      setJobResultMsg(null);
      const res = await api.triggerNotificationJob();
      if (res.success && res.data) {
        setJobResultMsg(res.data.statusMessage);
        await fetchNotifications();
      }
    } catch (err: any) {
      console.error('Failed to trigger reminder job:', err);
      setJobResultMsg(err?.response?.data?.message || 'Error executing scheduled reminders scan');
    } finally {
      setTriggeringJob(false);
      setTimeout(() => setJobResultMsg(null), 5000);
    }
  };

  if (!isAuthenticated) return null;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
            OVERDUE ALERT
          </span>
        );
      case 'DUE_SOON':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-2.5 h-2.5 text-amber-400" />
            DUE SOON
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Info className="w-2.5 h-2.5 text-blue-400" />
            SYSTEM
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all group"
        title="Notifications & Due Reminders"
      >
        <Bell className="w-4 h-4 text-slate-300 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/40 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[90vw] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[550px]">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Refresh notifications"
              >
                <RotateCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Dev/Demo Manual Trigger Banner */}
          <div className="p-2.5 bg-indigo-950/30 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-300 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Daily Reminders Job</span>
            </div>

            <button
              onClick={handleTriggerJob}
              disabled={triggeringJob}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] shadow-sm transition-all disabled:opacity-50"
            >
              <Play className={`w-2.5 h-2.5 ${triggeringJob ? 'animate-spin' : ''}`} />
              {triggeringJob ? 'Running...' : 'Run Scan Now'}
            </button>
          </div>

          {jobResultMsg && (
            <div className="p-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-1.5 px-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{jobResultMsg}</span>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto divide-y divide-slate-800/60 flex-1">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`p-3.5 space-y-1.5 transition-colors cursor-pointer ${
                    n.isRead ? 'bg-slate-900/40 hover:bg-slate-800/40' : 'bg-slate-800/30 hover:bg-slate-800/60 border-l-2 border-l-indigo-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {getTypeBadge(n.type)}
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(n.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white leading-snug">
                    {n.title}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {n.message}
                  </p>

                  {n.bookBarcode && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 pt-0.5">
                      <BookOpen className="w-3 h-3 text-slate-500" />
                      <span>Barcode: {n.bookBarcode}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-300">No notifications yet</div>
                <p className="text-[11px] text-slate-500">
                  You'll receive courtesy alerts when your borrowed books are due soon or overdue.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              LibraAI Automated Reminder Service • Email &amp; In-App
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
