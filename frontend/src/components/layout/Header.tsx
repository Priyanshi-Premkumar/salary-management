import React from 'react';
import { ShieldCheck, Database, Globe2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left side info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Multi-Region Organization (5 Countries)</span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">10,000 Employees Synced</span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">PostgreSQL 16 (Temporal btree_gist)</span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            {user?.role?.replace('ROLE_', '') || 'GUEST'}
          </span>
        </div>
      </div>
    </header>
  );
};
