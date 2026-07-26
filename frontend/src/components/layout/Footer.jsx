import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6 px-6 text-slate-500 text-xs mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-900">Follow Agent</span>
          <span className="text-slate-500">— Executive Meeting Intelligence & Follow-Up Agent</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <span>React 19</span>
          <span>•</span>
          <span>FastAPI</span>
          <span>•</span>
          <span>Google Gemini API</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600 font-semibold">
          <span>Follow Agent Platform</span>
        </div>
      </div>
    </footer>
  );
};
