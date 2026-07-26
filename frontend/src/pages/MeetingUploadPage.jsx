import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingAPI } from '../api/services';
import { MeetingUploadForm } from '../components/meeting/MeetingUploadForm';
import { AlertCircle } from 'lucide-react';

export const MeetingUploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const res = await meetingAPI.analyze(payload);
      const newMeeting = res.data;
      navigate(`/meetings/${newMeeting.id}`);
    } catch (err) {
      console.error("Meeting analysis error:", err);
      setError(err.response?.data?.detail || 'Failed to process transcript with Gemini AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const res = await meetingAPI.analyzeAudio(formData);
      const newMeeting = res.data;
      navigate(`/meetings/${newMeeting.id}`);
    } catch (err) {
      console.error("Audio analysis error:", err);
      setError(err.response?.data?.detail || 'Failed to process audio / meeting link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Create New Meeting Analysis</h1>
        <p className="text-xs text-slate-500 mt-1">
          Record live microphone speech, upload audio recordings / meeting links, or paste raw transcripts.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3 font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Upload Form */}
      <MeetingUploadForm
        onSubmit={handleAnalyze}
        onAudioSubmit={handleAudioSubmit}
        loading={loading}
      />
    </div>
  );
};
