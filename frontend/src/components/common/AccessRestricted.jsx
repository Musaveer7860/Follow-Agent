import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Crown, ArrowLeft, Send } from 'lucide-react';
import { Button } from '../ui/Button';

export const AccessRestricted = ({ featureName = "This Feature" }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Leader / Admin Access Required</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {featureName} is restricted to Product Leaders, Admins, and Managers. As a Team Member, you have access to the Dashboard and direct Contact Access to your Product Leader.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link to="/contact-leader">
            <Button variant="primary" className="w-full font-bold" icon={Send}>
              Contact Product Leader
            </Button>
          </Link>

          <Link to="/dashboard">
            <Button variant="secondary" className="w-full font-bold" icon={ArrowLeft}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
