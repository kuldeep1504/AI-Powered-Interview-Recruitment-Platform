import React, { useState, useEffect, useRef } from 'react';
import { Interview, InterviewQuestion, InterviewAnswerSubmission, InterviewResult } from '../types.ts';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Shield,
  Loader2,
  Play,
  RotateCcw,
  Bot,
  User,
  Check,
  Award,
  ChevronRight,
} from 'lucide-react';

interface InterviewRoomProps {
  interview: Interview;
  profileUserName?: string;
  onClose: () => void;
  onInterviewCompleted: (result: InterviewResult) => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  interview,
  profileUserName,
  onClose,
  onInterviewCompleted,
}) => {
  // Media streams & controls
  const [hasConsent, setHasConsent] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [micVolume, setMicVolume] = useState(0);

  // Question & progress
  const [questions, setQuestions] = useState<InterviewQuestion[]>(interview.questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex] || questions[0];

  // Speech to text & answer
  const [transcript, setTranscript] = useState('');
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [isEvaluatingCurrent, setIsEvaluatingCurrent] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState<InterviewAnswerSubmission[]>([]);
  const [currentQuestionEvaluation, setCurrentQuestionEvaluation] = useState<
    InterviewAnswerSubmission['evaluation'] | null
  >(null);

  // Timers
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [ttsSpeaking, setTtsSpeaking] = useState(false);

  // Completion state
  const [isFinalizingReport, setIsFinalizingReport] = useState(false);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Media Stream when consent granted
  useEffect(() => {
    if (!hasConsent) return;

    let localStream: MediaStream | null = null;

    async function setupMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setStream(localStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }

          // Audio Analyser for speaking volume meter
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioCtx();
            const source = audioCtx.createMediaStreamSource(localStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkVolume = () => {
              if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                setMicVolume(Math.min(100, Math.round(avg * 1.5)));
                requestAnimationFrame(checkVolume);
              }
            };
            requestAnimationFrame(checkVolume);
          } catch (audioErr) {
            console.warn('Audio Context meter fallback:', audioErr);
          }
        }
      } catch (err: any) {
        console.warn('getUserMedia media access note:', err.message);
        setMediaError(
          'Camera/microphone access could not be obtained automatically (iframe restrictions or permissions). Virtual camera simulation is active.'
        );
      }
    }

    setupMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [hasConsent]);

  // Overall session timer
  useEffect(() => {
    if (!hasConsent) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (isRecordingAnswer) {
        setQuestionSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hasConsent, isRecordingAnswer]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecordingAnswer = () => {
    if (!isRecordingAnswer) {
      setIsRecordingAnswer(true);
      setQuestionSeconds(0);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Speech recognition start note:', e);
      }
    } else {
      setIsRecordingAnswer(false);
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.warn('Speech recognition stop note:', e);
      }
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !cameraActive;
      });
      setCameraActive(!cameraActive);
    } else {
      setCameraActive(!cameraActive);
    }
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !micActive;
      });
      setMicActive(!micActive);
    } else {
      setMicActive(!micActive);
    }
  };

  // Text to Speech for question
  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onstart = () => setTtsSpeaking(true);
      utterance.onend = () => setTtsSpeaking(false);
      utterance.onerror = () => setTtsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit current answer and get immediate AI evaluation
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) {
      alert('Please speak or type your answer before submitting.');
      return;
    }

    setIsRecordingAnswer(false);
    try {
      recognitionRef.current?.stop();
    } catch (e) {}

    setIsEvaluatingCurrent(true);

    try {
      const res = await fetch('/api/ai/answer/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          transcript,
        }),
      });

      const data = await res.json();
      const evaluation = data.evaluation;
      setCurrentQuestionEvaluation(evaluation);

      const submission: InterviewAnswerSubmission = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        transcript,
        durationSeconds: questionSeconds || 45,
        evaluation,
      };

      const updatedAnswers = [...recordedAnswers, submission];
      setRecordedAnswers(updatedAnswers);
    } catch (err) {
      console.error('Answer evaluation failed:', err);
    } finally {
      setIsEvaluatingCurrent(false);
    }
  };

  // Move to next question or complete
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTranscript('');
      setCurrentQuestionEvaluation(null);
      setQuestionSeconds(0);
    } else {
      handleFinalizeSession();
    }
  };

  // Finalize full interview and generate dual report
  const handleFinalizeSession = async () => {
    setIsFinalizingReport(true);
    try {
      const res = await fetch(`/api/interviews/${interview.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: recordedAnswers,
          consentGiven: true,
        }),
      });

      const data = await res.json();
      if (data.result) {
        onInterviewCompleted(data.result);
      }
    } catch (err: any) {
      alert('Failed to finalize interview report: ' + err.message);
    } finally {
      setIsFinalizingReport(false);
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Preset quick answer simulator for convenience
  const injectSampleAnswer = (type: 'ideal' | 'mid') => {
    if (type === 'ideal') {
      setTranscript(
        `In our production WebRTC platform at Nexus Realtime, we handled NAT traversal by deploying redundant STUN/TURN clusters on AWS with geo-DNS routing. When a peer is behind a symmetric NAT where direct P2P fails, our signaling server automatically upgrades the connection to relay via TURN over TCP/TLS port 443. We also implemented trickle ICE candidates so the candidate pairs could be verified asynchronously without stalling the initial call setup.`
      );
    } else {
      setTranscript(
        `We use WebSockets to connect the two peers, and then send SDP offer and answer back and forth. If they cannot connect directly due to firewalls, we fall back to a TURN server to relay video packets.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col overflow-hidden">
      {/* Explicit Consent Dialog (SRS Privacy Hard Constraint) */}
      {!hasConsent && (
        <div className="fixed inset-0 z-60 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Privacy & Data Governance Notice
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                AI Interview & Recording Consent
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                You are entering an AI-assisted interview session for{' '}
                <strong className="text-neutral-200">{interview.jobTitle}</strong> at{' '}
                <strong className="text-neutral-200">{interview.companyName}</strong>.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-neutral-300 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Audio and video feeds are processed for transcription and answer evaluation.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Advisory Only:</strong> AI evaluations are strictly assistive signals for human recruiters. No automated decisions are made.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Protected demographic attributes are excluded from all evaluation criteria.</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-400 hover:text-white"
              >
                Decline & Exit
              </button>
              <button
                onClick={() => setHasConsent(true)}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all"
              >
                I Consent & Join Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="h-16 px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-tight">
              WebRTC Interview Session
            </span>
          </div>
          <span className="hidden sm:inline-block text-xs text-neutral-400 border-l border-neutral-700 pl-3">
            {interview.jobTitle} • {interview.type}
          </span>
        </div>

        {/* Timers & Question Count */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-neutral-800/80 border border-neutral-700 text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatSeconds(elapsedSeconds)}</span>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 font-sans font-semibold border border-emerald-800/60">
            Question {currentIndex + 1} of {questions.length}
          </span>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-sans font-semibold transition-colors"
          >
            Exit Session
          </button>
        </div>
      </header>

      {/* Main Room Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left: Video Streams (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 p-4 flex flex-col justify-between space-y-4 overflow-y-auto">
          {/* 2-up Video Grid: AI Interviewer & Candidate Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[300px]">
            {/* AI Interviewer Stage */}
            <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center p-6 shadow-inner">
              <div className="absolute top-3 left-3 flex items-center space-x-2 z-10">
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-neutral-800/90 text-neutral-300 border border-neutral-700 flex items-center">
                  <Bot className="w-3 h-3 mr-1 text-emerald-400" />
                  AI Interviewer (Gemini)
                </span>
                {ttsSpeaking && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center animate-pulse">
                    <Volume2 className="w-3 h-3 mr-1" />
                    Speaking
                  </span>
                )}
              </div>

              {/* AI Avatar Animation */}
              <div className="relative flex flex-col items-center justify-center">
                <div
                  className={`w-28 h-28 rounded-3xl bg-linear-to-br from-emerald-600 to-teal-800 p-1 flex items-center justify-center shadow-xl transition-transform ${
                    ttsSpeaking ? 'scale-105 ring-4 ring-emerald-500/40' : ''
                  }`}
                >
                  <div className="w-full h-full rounded-[22px] bg-neutral-900 flex items-center justify-center">
                    <Bot className="w-14 h-14 text-emerald-400" />
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-xs font-semibold text-neutral-200">Autonomous Interview Proctor</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Evaluating technical correctness & STAR criteria</div>
                </div>
              </div>

              <div className="absolute bottom-3 right-3">
                <button
                  onClick={() => speakQuestion(currentQuestion.question)}
                  className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center space-x-1 transition-colors"
                  title="Read question aloud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Read Question</span>
                </button>
              </div>
            </div>

            {/* Candidate Real Camera Stream / Mirror */}
            <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <div className="absolute top-3 left-3 flex items-center space-x-2 z-10">
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-neutral-800/90 text-neutral-300 border border-neutral-700 flex items-center">
                  <User className="w-3 h-3 mr-1 text-blue-400" />
                  {profileUserName || interview.candidateName} (You)
                </span>
              </div>

              {/* Mic volume level meter */}
              {micActive && (
                <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-neutral-900/80 px-2 py-1 rounded-md border border-neutral-800">
                  <Mic className="w-3 h-3 text-emerald-400" />
                  <div className="w-10 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${micVolume}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Real Video Element */}
              {cameraActive ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror scale-x-[-1]"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 mx-auto flex items-center justify-center text-neutral-500">
                    <VideoOff className="w-7 h-7" />
                  </div>
                  <div className="text-xs text-neutral-400 font-medium">Camera Disabled</div>
                </div>
              )}

              {/* Notice if permissions couldn't be granted */}
              {mediaError && (
                <div className="absolute bottom-3 left-3 right-3 p-2 rounded-lg bg-neutral-950/80 border border-amber-500/40 text-amber-300 text-[10px] text-center">
                  {mediaError}
                </div>
              )}
            </div>
          </div>

          {/* Media Control Bar */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-xl border transition-colors ${
                  micActive
                    ? 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
                    : 'bg-rose-950 border-rose-800 text-rose-300'
                }`}
              >
                {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-2.5 rounded-xl border transition-colors ${
                  cameraActive
                    ? 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
                    : 'bg-rose-950 border-rose-800 text-rose-300'
                }`}
              >
                {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Answer recording trigger */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleRecordingAnswer}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isRecordingAnswer
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${isRecordingAnswer ? 'bg-white' : 'bg-emerald-200'}`} />
                {isRecordingAnswer ? 'Pause Speaking / Transcribing' : 'Record / Speak Answer'}
              </button>

              <div className="hidden sm:flex items-center space-x-1.5 text-xs text-neutral-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>{formatSeconds(questionSeconds)}</span>
              </div>
            </div>

            {/* Simulation quick buttons for fast testing */}
            <div className="hidden xl:flex items-center space-x-2">
              <button
                type="button"
                onClick={() => injectSampleAnswer('ideal')}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
              >
                Simulate Strong Answer
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Prompt, Live Transcript & Evaluation (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 border-l border-neutral-800 bg-neutral-900/50 flex flex-col h-full overflow-y-auto p-5 space-y-5">
          {/* Question Card */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">
                {currentQuestion.category}
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                Difficulty: {currentQuestion.difficulty}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-white leading-relaxed">
              {currentQuestion.question}
            </h4>

            {/* Expected Criteria Preview */}
            <div className="pt-2 border-t border-neutral-800/80">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Evaluation Rubric Focus
              </div>
              <ul className="space-y-1 text-xs text-neutral-300 pl-4 list-disc text-[11px]">
                {currentQuestion.expectedKeyPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Spoken / Live Transcript Section */}
          <div className="flex-1 flex flex-col space-y-2 min-h-[160px]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center">
                <span>Spoken Answer Transcript</span>
                {isRecordingAnswer && (
                  <span className="ml-2 flex items-center text-emerald-400 text-[11px] normal-case animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
                    Listening via Web Speech API...
                  </span>
                )}
              </label>
              <button
                onClick={() => setTranscript('')}
                className="text-[11px] text-neutral-500 hover:text-neutral-300"
              >
                Clear
              </button>
            </div>

            <textarea
              rows={5}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your live speech will appear here automatically. You can also edit or type directly..."
              className="flex-1 w-full text-xs font-sans p-3.5 rounded-xl border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-950 text-neutral-200 resize-none leading-relaxed"
            />
          </div>

          {/* Current Evaluation Box if submitted */}
          {currentQuestionEvaluation && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">AI Evaluation Generated</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  {currentQuestionEvaluation.relevance}/100 Relevance
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400 text-[11px]">Technical Accuracy:</span>
                  <div className="font-bold text-white">{currentQuestionEvaluation.technicalCorrectness}%</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400 text-[11px]">Communication:</span>
                  <div className="font-bold text-white">{currentQuestionEvaluation.communication}%</div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-300 italic leading-relaxed">
                "{currentQuestionEvaluation.feedback}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            {!currentQuestionEvaluation ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={isEvaluatingCurrent || !transcript.trim()}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors flex items-center justify-center shadow-md shadow-emerald-900/30"
              >
                {isEvaluatingCurrent ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Evaluating Answer with AI...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Submit Answer for AI Evaluation
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={isFinalizingReport}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-white text-neutral-950 transition-colors flex items-center justify-center shadow-sm"
              >
                {isFinalizingReport ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Compiling Full Report...
                  </>
                ) : currentIndex < questions.length - 1 ? (
                  <>
                    Next Question ({currentIndex + 2}/{questions.length})
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Finalize Interview & View Report
                    <Award className="w-4 h-4 ml-1.5 text-emerald-600" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
