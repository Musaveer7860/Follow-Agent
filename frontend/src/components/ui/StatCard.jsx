import React from 'react';

export const StatCard = ({ title, value, icon: Icon, trend, trendLabel }) => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</h3>
        {trendLabel && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 mr-1">{trend}</span>
            {trendLabel}
          </p>
        )}
      </div>
    </div>
  );
};
