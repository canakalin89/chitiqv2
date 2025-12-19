
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { StopIcon } from '../icons/StopIcon';
import { MicIcon } from '../icons/MicIcon';

interface RecorderProps {
  onStop: (audioBlob: Blob) => void;
  onCancel: () => void;
  topic: string;
}

const MAX_RECORDING_TIME = 180; // 3 minutes in seconds
const SILENCE_THRESHOLD = 0.01;
const SILENCE_TIMEOUT = 5000;

const Recorder: React.FC<RecorderProps> = ({ onStop, onCancel, topic }) => {
  const { t } = useTranslation();
  
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSilent, setIsSilent] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const sessionRef = useRef<any>(null); 
  const transcriptRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const TARGET_SAMPLE_RATE = 16000;

  useEffect(() => {
    startRecording();
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (transcriptRef.current) {
      setTimeout(() => {
        if (transcriptRef.current) {
          transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [liveTranscript]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const resampleBuffer = (buffer: Float32Array, originalSampleRate: number): Int16Array => {
    const ratio = originalSampleRate / TARGET_SAMPLE_RATE;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Int16Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const originalIndex = Math.floor(i * ratio);
      const val = Math.max(-1, Math.min(1, buffer[originalIndex]));
      result[i] = val < 0 ? val * 0x8000 : val * 0x7FFF;
    }
    return result;
  };

  const base64EncodeAudio = (int16Array: Int16Array): string => {
    let binary = '';
    const bytes = new Uint8Array(int16Array.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)'); 
      gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.6)'); 
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.8)'); 

      ctx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.8; 
        ctx.fillRect(width / 2 + x, height / 2 - barHeight / 2, barWidth, barHeight);
        ctx.fillRect(width / 2 - x - barWidth, height / 2 - barHeight / 2, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      drawVisualizer();

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioContext.destination);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          systemInstruction: "You are a passive listener. Do not generate audio responses. Only transcribe the user's speech."
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
            setIsRecording(true);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
               const text = message.serverContent.inputTranscription.text;
               if (text) {
                 setLiveTranscript((prev) => prev + text);
               }
            }
          },
          onclose: () => console.log("Gemini Live Closed"),
          onerror: (err) => {
            console.error("Gemini Live Error", err);
          }
        }
      });

      sessionRef.current = sessionPromise;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);

        if (rms < SILENCE_THRESHOLD) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              setIsSilent(true);
            }, SILENCE_TIMEOUT);
          }
        } else {
          setIsSilent(false);
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }

        const pcm16 = resampleBuffer(inputData, audioContext.sampleRate);
        const base64Audio = base64EncodeAudio(pcm16);
        
        sessionPromise.then(session => {
            session.sendRealtimeInput({
                media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Audio
                }
            });
        }).catch(err => {
        });
      };

    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'NotFoundError') {
        setError(t('errors.micPermission'));
      } else {
        setError(t('errors.generic'));
      }
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        cleanup();
        onStop(audioBlob);
      };
    } else {
      cleanup();
    }
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      const ctx = audioContextRef.current;
      audioContextRef.current = null;
      if (ctx.state !== 'closed') {
        ctx.close().catch(e => console.error("Error closing AudioContext:", e));
      }
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-2xl animate-fade-in">
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Mikrofon Erişimi Gerekli</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg leading-relaxed">
          {error}
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 text-left">
           <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Rehber</p>
           <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
             {t('recorder.micHelp')}
           </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onCancel}
            className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-all"
          >
            {t('common.goBack')}
          </button>
          <button 
            onClick={() => startRecording()}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 font-bold transition-all transform hover:scale-105"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto glass rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden flex flex-col h-[600px] transition-all duration-300">
      <div className="bg-white/50 dark:bg-slate-900/50 px-8 py-5 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
             <div className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 bg-red-500`}></span>
             </div>
          </div>
          <span className="text-slate-700 dark:text-slate-200 font-bold tracking-wide">
             {t('dashboard.recording')}
          </span>
        </div>
        <div className="font-mono text-2xl text-slate-800 dark:text-slate-100 font-bold bg-white dark:bg-slate-800 px-4 py-1.5 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700">
          {formatTime(timer)} <span className="text-slate-400 text-lg">/ 03:00</span>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden bg-gradient-to-b from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-950/50">
        
        <div className="absolute top-6 left-0 right-0 text-center z-10 px-6">
           <h3 className="text-slate-800 dark:text-white font-bold text-xl md:text-2xl truncate max-w-3xl mx-auto drop-shadow-sm leading-relaxed">{topic}</h3>
        </div>

        <div className="relative w-full h-[250px] flex items-center justify-center mb-8">
           <canvas 
             ref={canvasRef}
             width={1000}
             height={300}
             className="absolute inset-0 w-full h-full opacity-80"
           />
           <div className="relative z-10 bg-white dark:bg-slate-800 p-8 rounded-full shadow-2xl shadow-indigo-500/20 border-4 border-slate-50 dark:border-slate-700/50">
             <MicIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400 animate-pulse-slow" />
           </div>
        </div>

        {isSilent && timer > 5 && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-32 bg-amber-500 text-white px-6 py-2 rounded-full text-sm font-bold animate-bounce shadow-lg z-20">
             {t('recorder.speakUp')}
           </div>
        )}

        <div className="w-full max-w-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-700 shadow-sm h-40 flex flex-col z-20">
          <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 rounded-t-2xl">
             <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t('recorder.liveTranscript')}</span>
          </div>
          <div 
            ref={transcriptRef}
            className="flex-1 p-6 overflow-y-auto font-sans text-base text-slate-600 dark:text-slate-300 leading-relaxed scroll-smooth"
          >
            {liveTranscript || <span className="text-slate-400 italic flex items-center gap-2"><span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span> {t('recorder.listening')}</span>}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 flex justify-center gap-8 border-t border-slate-200 dark:border-slate-800 z-30">
        <button
          onClick={onCancel}
          className="px-8 py-3.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={stopRecording}
          className="group flex items-center gap-3 px-10 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:-translate-y-0.5"
        >
          <div className="bg-white/20 rounded-full p-1">
             <StopIcon className="w-5 h-5 fill-current" />
          </div>
          {t('dashboard.stopRecording')}
        </button>
      </div>
    </div>
  );
};

export default Recorder;
