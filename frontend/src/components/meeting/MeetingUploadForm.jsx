import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  FileText, 
  Clock, 
  ArrowRight, 
  Mic, 
  MicOff, 
  UploadCloud, 
  Link2, 
  Radio,
  FileAudio,
  Sparkles,
  Volume2
} from 'lucide-react';

export const MeetingUploadForm = ({ onSubmit, onAudioSubmit, loading }) => {
  const [activeMode, setActiveMode] = useState('text'); // 'text' | 'live' | 'file'
  
  // Text state
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState('30 mins');

  // File & Link state
  const [selectedFile, setSelectedFile] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState('');

  // Live recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Web Speech API for live recording
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript);
      };

      rec.onerror = (err) => {
        console.warn("Speech recognition error:", err);
      };

      recognitionRef.current = rec;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleLiveRecording = () => {
    if (!recognitionRef.current && !isRecording) {
      alert("Browser Speech Recognition is not supported on this browser. You can speak and type into the transcript box!");
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current?.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
    } else {
      // Start recording
      setTranscript('');
      setRecordingTime(0);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn("Recognition already started or permission pending:", err);
      }
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeMode === 'file') {
      if (!selectedFile && !meetingUrl.trim()) {
        alert("Please upload an audio file or enter a meeting link!");
        return;
      }
      const formData = new FormData();
      if (selectedFile) formData.append('file', selectedFile);
      if (meetingUrl) formData.append('meeting_url', meetingUrl);
      formData.append('title', title || (selectedFile ? selectedFile.name : 'Meeting Audio Sync'));
      formData.append('duration', duration || '30 mins');
      onAudioSubmit(formData);
      return;
    }

    if (!transcript.trim()) return;

    onSubmit({
      title: title || (isRecording ? 'Live Recorded Meeting' : 'Executive Alignment Sync'),
      transcript,
      duration: isRecording ? `${Math.ceil(recordingTime / 60) || 1} mins` : duration,
    });
  };

  return (
    <div className="space-y-4">
      {/* Input Mode Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <button
          type="button"
          onClick={() => setActiveMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition-all ${
            activeMode === 'text'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Text Transcript
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('live')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition-all ${
            activeMode === 'live'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
          🎙️ Live Meeting Recorder
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('file')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition-all ${
            activeMode === 'file'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          📁 Upload Audio / Meeting Link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {activeMode === 'live' && '🎙️ Real-time Live Meeting Audio Recorder'}
              {activeMode === 'file' && '📁 Audio File & Meeting Link Analyzer'}
              {activeMode === 'text' && 'Meeting Notes & Transcript Analyzer'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {activeMode === 'live' && 'Records microphone audio live during a meeting and streams speech-to-text transcript below'}
              {activeMode === 'file' && 'Upload .mp3, .wav, .m4a, .webm audio recording or paste Zoom / Google Meet URL'}
              {activeMode === 'text' && 'Extracts key decisions, action items, assigned owners, and target deadlines'}
            </p>
          </div>
        </div>

        {/* Meeting Title & Duration Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Meeting Title"
            placeholder={activeMode === 'live' ? "e.g. Q3 Live Architecture Sync" : "e.g. Q3 Roadmap & Architecture Alignment"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            icon={FileText}
          />

          <Input
            label="Meeting Duration"
            placeholder="e.g. 45 mins"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            icon={Clock}
          />
        </div>

        {/* Mode 1: LIVE MEETING RECORDING PANEL */}
        {activeMode === 'live' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-100 text-indigo-600'}`}>
                  {isRecording ? <Mic className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {isRecording ? 'Live Recording in Progress...' : 'Ready to Record Live Meeting'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isRecording ? 'Speak clearly into your microphone during the meeting' : 'Click "Start Recording" when your meeting starts'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isRecording && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 font-mono font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>{formatTimer(recordingTime)}</span>
                  </div>
                )}

                <Button
                  type="button"
                  variant={isRecording ? 'danger' : 'primary'}
                  size="md"
                  icon={isRecording ? MicOff : Mic}
                  onClick={toggleLiveRecording}
                  className="font-bold px-5"
                >
                  {isRecording ? 'Stop Recording' : 'Start Live Recording'}
                </Button>
              </div>
            </div>

            {/* Live Audio Visualizer Waves */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 py-2">
                <div className="w-1 h-6 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-10 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-4 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                <div className="w-1 h-8 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                <div className="w-1 h-5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.25s' }} />
                <span className="text-xs font-semibold text-indigo-700 ml-2">Listening to live audio stream...</span>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: AUDIO FILE / MEETING LINK PANEL */}
        {activeMode === 'file' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Dropzone */}
              <div className="p-5 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl bg-slate-50 text-center space-y-2 cursor-pointer transition-colors">
                <FileAudio className="w-8 h-8 text-indigo-600 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Upload Audio File (.mp3, .wav, .m4a, .webm)'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">Click to select audio recording</p>
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                  id="audio-upload-input"
                />
                <label htmlFor="audio-upload-input" className="inline-block px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm">
                  {selectedFile ? 'Change File' : 'Browse File'}
                </label>
              </div>

              {/* Meeting Link Input */}
              <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                  <Link2 className="w-4 h-4" />
                  <span>Paste Meeting URL</span>
                </div>
                <Input
                  placeholder="https://meet.google.com/abc-defg-hij or Zoom URL"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 font-medium">
                  MeetMind will extract and transcribe discussion audio from supported meeting links.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Transcript / Notes Input Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              {activeMode === 'live' ? 'Live Transcribed Speech (Real-time)' : 'Raw Transcript or Discussion Notes'} <span className="text-rose-500">*</span>
            </label>
            {activeMode === 'live' && isRecording && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Transcribing...
              </span>
            )}
          </div>

          <textarea
            rows={8}
            required={activeMode !== 'file'}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={
              activeMode === 'live'
                ? "Live speech text will stream here word-by-word as team members speak during the meeting..."
                : "Paste meeting notes or transcript here..."
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500 font-medium">
            Accepts text from Zoom, Microsoft Teams, Otter.ai, Google Meet, or live recording.
          </p>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon={ArrowRight}
            className="w-full sm:w-auto font-bold px-6"
          >
            {activeMode === 'live' ? 'Analyze Live Meeting' : 'Process Action Items'}
          </Button>
        </div>
      </form>
    </div>
  );
};
