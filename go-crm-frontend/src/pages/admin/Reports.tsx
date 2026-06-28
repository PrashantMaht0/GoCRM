import React from 'react';

export default function Reports() {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-crm-accent rounded-full flex items-center justify-center mb-6 shadow-sm">
        <svg className="w-8 h-8 text-crm-darkest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
      </div>
      <h1 className="text-2xl font-bold text-crm-darkest mb-2">Reports Page</h1>
      <p className="text-gray-500 max-w-md">
        All reports and their status can be viewed here.
      </p>
    </div>
  );
}