import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-slate-200 rounded-md w-24"></div>
            <div className="w-9 h-9 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded-md w-16 mb-2"></div>
          <div className="h-3 bg-slate-100 rounded-md w-36"></div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="h-12 bg-slate-100/80 border-b border-slate-200 flex items-center px-6">
        <div className="h-4 bg-slate-200 rounded-md w-48 animate-pulse"></div>
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="py-4 px-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              <div>
                <div className="h-4 bg-slate-200 rounded-md w-32 mb-1.5"></div>
                <div className="h-3 bg-slate-100 rounded-md w-24"></div>
              </div>
            </div>
            <div className="h-4 bg-slate-200 rounded-md w-24"></div>
            <div className="h-6 bg-slate-100 rounded-full w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
