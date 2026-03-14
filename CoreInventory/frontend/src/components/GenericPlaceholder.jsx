import React from 'react';

const GenericPlaceholder = ({ title }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textNavy">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view your {title.toLowerCase()} data here.</p>
        </div>
        <button className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm shadow-primary/30 transition-colors flex items-center gap-2">
          <span>Add New</span>
        </button>
      </div>
      
      <div className="bg-card rounded-2xl border border-slate-200 p-8 text-center sm:p-12 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-textNavy mb-1">No data available</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
          You haven't added any {title.toLowerCase()} yet. Click the button above to get started.
        </p>
      </div>
    </div>
  );
};

export default GenericPlaceholder;
