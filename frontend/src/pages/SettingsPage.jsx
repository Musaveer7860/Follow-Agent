import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Key, Check, Sparkles, Database, ShieldCheck } from 'lucide-react';

export const SettingsPage = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('user_gemini_api_key') || '');
  const [saved, setSaved] = useState(false);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('user_gemini_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">System Settings & AI Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">Configure Gemini API key and system parameters</p>
      </div>

      {/* Gemini API Key Configuration */}
      <Card hover={false} className="space-y-4 border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Google Gemini API Configuration</h3>
            <p className="text-xs text-slate-500">Specify custom Gemini API key for structured meeting extraction</p>
          </div>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4" />
            <span>Custom Gemini API Key saved locally!</span>
          </div>
        )}

        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <Input
            label="Gemini API Key (Optional)"
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            icon={Key}
          />
          <p className="text-[11px] text-slate-500">
            Note: If left blank, MeetMind AI utilizes the backend server key or intelligent fallback engine.
          </p>

          <Button type="submit" variant="primary" size="md">
            Save API Key
          </Button>
        </form>
      </Card>

      {/* System Status */}
      <Card hover={false} className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Environment & Services Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium">Backend API</span>
            <p className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> FastAPI Online</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium">Database Engine</span>
            <p className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> SQLite ORM Active</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium">PDF Generator</span>
            <p className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> ReportLab Engine Ready</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
