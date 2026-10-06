import React from 'react';
import { Database, Shield, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/50 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">LibraAI</span>
            <span>—</span>
            <span>Deterministic Java 21 Spring Boot System of Record with Pluggable AI Augmentations</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3.5 h-3.5 text-blue-400" /> Flyway V1 Active
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Spring Security JWT
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-purple-400" /> OpenAPI 3.0 Live
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
