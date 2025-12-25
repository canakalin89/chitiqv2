
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI, Modality } from '@google/genai';
import { StopIcon } from '../icons/StopIcon';
import { MicIcon } from '../icons/MicIcon';

interface RecorderProps {
  onStop: (audioBlob: Blob) => void;
  onCancel: () => void;
  topic: string;
}

const MAX_RECORDING_TIME = 180; 
const SILENCE_THRESHOLD = 0.008;
const SILENCE_TIMEOUT = 5000;

// Helper functions for base64 encoding/decoding as required by guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const Recorder: React.FC<RecorderProps> = ({ onStop, onCancel, topic }) => {
  const { t, i18n } = useTranslation();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSilent, setIsSilent] = useState(false);
  const [transcription, setTranscription] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const transcriptionEndRef = useRef<HTMLDivElement>(null);
  
  // Gemini Live Session Reference
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (transcriptionEndRef.current) {
      transcriptionEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcription]);

  useEffect(() => {
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const getSupportedMimeType = () => {
    const types = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/wav'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
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

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.05)'); 
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.4)'); 
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.7)'); 
      ctx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        const radius = barWidth / 2;
        const centerY = canvas.height / 2 - barHeight / 2;
        
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 + x, centerY, barWidth, barHeight, radius);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - x - barWidth, centerY, barWidth, barHeight, radius);
        ctx.fill();
        x += barWidth + 3;
      }
    };
    draw();
  };

  const createBlobForLive = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startRecording = async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err: any) {
      setError(t('errors.micPermission'));
      return;
    }

    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const audioContext = new AudioContextClass({ sampleRate: 16000 });
    audioContextRef.current = audioContext;
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => console.log("Live connection opened"),
        onmessage: async (message) => {
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            setTranscription(prev => prev + text);
          }
        },
        onerror: (e) => console.error("Live Error:", e),
        onclose: () => console.log("Live connection closed")
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        systemInstruction: "You are a speech-to-text transcriber. Transcribe the user's speech verbatim and with extreme precision. ONLY detect and output English or Turkish words. Ignore background noise, music, or non-human sounds. Do not translate, just transcribe.",
      }
    });
    sessionPromiseRef.current = sessionPromise;

    setError(null);
    setHasStarted(true);
    setIsRecording(true);

    try {
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.start(1000);
      
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

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Silence detection
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
        const rms = Math.sqrt(sum / inputData.length);
        if (rms < SILENCE_THRESHOLD) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => setIsSilent(true), SILENCE_TIMEOUT);
          }
        } else {
          setIsSilent(false);
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }

        // Stream to Gemini Live
        const pcmBlob = createBlobForLive(inputData);
        sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };
    } catch (err: any) {
      setError(t('errors.generic'));
      cleanup();
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        cleanup();
        onStop(audioBlob);
      };
      mediaRecorderRef.current.stop();
    } else {
      cleanup();
    }
  };

  const cleanup = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch(e) {}
    }
    if (processorRef.current) processorRef.current.disconnect();
    if (analyserRef.current) analyserRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    // Close Live Session
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        try { session.close(); } catch(e) {}
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center max-w-xl mx-auto shadow-2xl animate-fade-in">
        <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
        </div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Mikrofon Hatası</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg leading-relaxed font-medium">{error}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onCancel} className="px-10 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-all">{t('common.goBack')}</button>
          <button onClick={() => window.location.reload()} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/30 font-bold transition-all transform hover:scale-105">Tekrar Dene</button>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="w-full max-w-4xl mx-auto glass rounded-[3rem] p-12 md:p-20 shadow-2xl border border-white/20 dark:border-slate-800 flex flex-col items-center justify-center space-y-10 animate-fade-in min-h-[500px]">
        <div className="text-center space-y-4">
           <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight italic">"{topic}"</h3>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Konuşmaya Başlamaya Hazır mısın?</p>
        </div>
        <div className="relative group">
           <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition duration-500 animate-pulse"></div>
           <button 
             onClick={startRecording}
             className="relative z-10 w-32 h-32 md:w-40 md:h-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex flex-col items-center justify-center gap-3 shadow-2xl shadow-indigo-500/50 transition-all transform hover:scale-110 active:scale-95 group"
           >
              <MicIcon className="w-12 h-12 md:w-16 md:h-16 animate-bounce" />
              <span className="font-black text-xs uppercase tracking-widest">BAŞLAT</span>
           </button>
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium text-center max-w-xs leading-relaxed">
          Butona tıkladığında mikrofonun etkinleşecek ve kaydın başlayacaktır.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto glass rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden flex flex-col h-[700px] transition-all duration-300">
      <div className="bg-white/50 dark:bg-slate-900/50 px-10 py-6 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30">
             <div className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
             </div>
          </div>
          <span className="text-slate-800 dark:text-slate-100 font-black text-lg tracking-tight">{t('dashboard.recording')}</span>
        </div>
        <div className="font-mono text-2xl text-slate-900 dark:text-slate-100 font-black bg-white dark:bg-slate-800 px-6 py-2 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700">
          {formatTime(timer)} <span className="text-slate-400 text-lg">/ 03:00</span>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col p-8 overflow-hidden bg-gradient-to-b from-slate-50/30 to-white/30 dark:from-slate-900/30 dark:to-slate-950/30">
        <div className="text-center z-10 mb-8">
           <h3 className="text-slate-900 dark:text-white font-black text-2xl md:text-3xl truncate max-w-3xl mx-auto drop-shadow-sm italic">"{topic}"</h3>
        </div>
        
        {/* Transcription Area */}
        <div className="flex-1 overflow-y-auto mb-8 bg-white/40 dark:bg-slate-950/40 rounded-[2rem] p-8 border border-white/40 dark:border-slate-800/50 shadow-inner custom-scrollbar backdrop-blur-sm">
           <div className="flex items-center gap-2 mb-4 opacity-50">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('evaluation.transcription')} (CANLI)</span>
           </div>
           <p className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-200 leading-relaxed transition-all duration-300">
             {transcription || <span className="text-slate-400 italic font-medium">{t('recorder.listening')}</span>}
           </p>
           <div ref={transcriptionEndRef} />
        </div>

        <div className="relative w-full h-[120px] flex items-center justify-center">
           <canvas ref={canvasRef} width={1000} height={120} className="absolute inset-0 w-full h-full opacity-100 pointer-events-none" />
           <div className="relative z-10 bg-white dark:bg-slate-800 p-6 rounded-full shadow-2xl shadow-indigo-500/20 border-4 border-slate-100/50 dark:border-slate-700/50">
             <MicIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
           </div>
        </div>
        
        {isSilent && timer > 3 && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-12 bg-amber-500 text-white px-8 py-2.5 rounded-full text-sm font-black animate-bounce shadow-xl z-20 uppercase tracking-widest">
             {t('recorder.speakUp')}
           </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 flex justify-center gap-8 border-t border-slate-200/50 dark:border-slate-800/50 z-30">
        <button onClick={onCancel} className="px-10 py-4 rounded-2xl font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-sm">{t('common.cancel')}</button>
        <button onClick={stopRecording} className="group flex items-center gap-4 px-12 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-2xl shadow-rose-500/40 transition-all hover:scale-105 hover:-translate-y-1">
          <div className="bg-white/20 rounded-xl p-1.5"><StopIcon className="w-6 h-6 fill-current" /></div>
          <span className="uppercase tracking-widest">{t('dashboard.stopRecording')}</span>
        </button>
      </div>
    </div>
  );
};

export default Recorder;
