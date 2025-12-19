
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SPEAKING_TOPICS, CRITERIA } from './constants';
import { Evaluation, EvaluationResultData, ExamSession, StudentInfo, ClassRoom, Student } from './types';
import { evaluateSpeech } from './services/geminiService';
import { blobToBase64 } from './utils/audioUtils';

// Components
import TopicSelector from './components/TopicSelector';
import Recorder from './components/Recorder';
import EvaluationResult from './components/EvaluationResult';
import RecentHistory from './components/RecentHistory';
import HistoryView from './components/HistoryView';
import ExamMode from './components/ExamMode';
import ClassManager from './components/ClassManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';

// Icons
import { Logo } from './icons/Logo';
import { HomeIcon } from './icons/HomeIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { DashboardIcon } from './icons/DashboardIcon';

type ViewState = 'landing' | 'dashboard' | 'recorder' | 'evaluating' | 'result' | 'history' | 'exam-setup' | 'exam-wheel' | 'exam-result' | 'class-manager' | 'analytics';

const UserPlaceholder = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-full h-full p-2"}
  >
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Application State
  const [view, setView] = useState<ViewState>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  
  // Data State
  const [history, setHistory] = useState<(Evaluation | ExamSession)[]>(() => {
    try {
      const saved = localStorage.getItem('history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem('classes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load classes", e);
      return [];
    }
  });
  
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [evaluationData, setEvaluationData] = useState<EvaluationResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Exam Specific State
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [isExamMode, setIsExamMode] = useState(false);

  // Random Testimonials Logic
  const selectedTestimonials = useMemo(() => {
    const all = t('landing.testimonials', { returnObjects: true }) as any[];
    if (!Array.isArray(all)) return [];
    const shuffled = [...all].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [t, view === 'landing']);

  // Counter State
  const [displayCount, setDisplayCount] = useState(0);
  const targetCount = 1354 + history.length;

  // Loading State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(15);

  // Persistence Effects
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [classes]);

  // Counter Animation
  useEffect(() => {
    if (view === 'landing') {
      let start = 0;
      const duration = 2000;
      const increment = targetCount / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= targetCount) {
          setDisplayCount(targetCount);
          clearInterval(timer);
        } else {
          setDisplayCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [view, targetCount]);

  // Simulated Progress Logic
  useEffect(() => {
    let progressInterval: any;
    let timeInterval: any;
    if (view === 'evaluating') {
      setLoadingProgress(0);
      setEstimatedTimeLeft(15);
      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) return 95;
          const remaining = 100 - prev;
          const increment = Math.max(0.2, remaining / 30); 
          const noise = Math.random() * 0.5;
          return Math.min(95, prev + increment + noise);
        });
      }, 100);
      timeInterval = setInterval(() => {
        setEstimatedTimeLeft((prev) => {
          if (prev <= 1) return 1;
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, [view]);

  // Handlers
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr');

  const handleStopRecording = async (blob: Blob) => {
    setAudioBlob(blob);
    setView('evaluating');
    setError(null);

    try {
      const base64Audio = await blobToBase64(blob);
      const currentLang = i18n.language.startsWith('tr') ? 'tr' : 'en';
      const topicsObj = SPEAKING_TOPICS[currentLang];
      const allTopics = Object.values(topicsObj).flat();

      const result = await evaluateSpeech(
        base64Audio,
        blob.type,
        currentTopic,
        allTopics as string[],
        currentLang
      );

      const evaluationId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const dateString = new Date().toISOString();

      if (isExamMode && studentInfo) {
        const newExam: ExamSession = {
          ...result,
          id: evaluationId,
          date: dateString,
          studentInfo: studentInfo,
          isExam: true
        };
        setEvaluationData(newExam);
        setHistory(prev => [newExam, ...prev]);
        setLoadingProgress(100);
        setTimeout(() => setView('exam-result'), 500);
      } else {
        const newEvaluation: Evaluation = {
          ...result,
          id: evaluationId,
          date: dateString
        };
        setEvaluationData(result);
        setHistory(prev => [newEvaluation, ...prev]);
        setLoadingProgress(100);
        setTimeout(() => setView('result'), 500);
      }
    } catch (err) {
      setError(t('errors.generic'));
      setView('dashboard');
      alert(t('errors.generic'));
    }
  };

  const handleSelectHistoryItem = (id: string) => {
    const item = history.find(h => h.id === id);
    if (item) {
      if ('isExam' in item && item.isExam) {
        setStudentInfo(item.studentInfo);
        setIsExamMode(true);
        setEvaluationData(item);
        setAudioBlob(null);
        setView('exam-result');
      } else {
        setEvaluationData(item);
        setAudioBlob(null); 
        setView('result');
        setIsExamMode(false);
      }
    }
  };

  const handleExamComplete = (topic: string, info: StudentInfo) => {
    setCurrentTopic(topic);
    setStudentInfo(info);
    setIsExamMode(true);
    setView('recorder');

    // Auto-save student to class if it's a new name/no and a class is selected
    if (info.classId && info.firstName && info.lastName && info.studentNumber) {
      const targetClass = classes.find(c => c.id === info.classId);
      if (targetClass) {
        const exists = targetClass.students.some(s => 
          (s.firstName.toLowerCase() === info.firstName!.toLowerCase() && 
          s.lastName.toLowerCase() === info.lastName!.toLowerCase()) ||
          s.studentNumber === info.studentNumber
        );

        if (!exists) {
          const newStudent: Student = {
            id: crypto.randomUUID(),
            studentNumber: info.studentNumber!,
            firstName: info.firstName!.trim(),
            lastName: info.lastName!.trim()
          };
          setClasses(prev => prev.map(c => 
            c.id === info.classId ? { ...c, students: [...c.students, newStudent] } : c
          ));
        }
      }
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'landing':
        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-fade-in relative z-10 pb-20">
            {/* Maarif Modeli Badge Group */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold shadow-sm animate-fade-in cursor-default hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                 </span>
                 {t('landing.badge')}
              </div>
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 transform hover:scale-105 transition-all duration-300">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center overflow-hidden text-white ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-purple-500'}`}>
                       <UserPlaceholder className="w-4 h-4" />
                    </div>
                  ))}
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-0.5">{t('dashboard.usageCount')}</p>
                  <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">{displayCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-500 ease-out"><Logo className="scale-150" /></div>
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {t('landing.heroTitle')}
                <span className="block text-2xl md:text-3xl mt-4 font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-normal">{t('landing.heroDesc')}</span>
              </h1>
            </div>
            <button onClick={() => setView('dashboard')} className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transform hover:-translate-y-1">
              {t('landing.startBtn')}
              <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            <div className="mt-24 w-full max-w-6xl px-4 space-y-24">
              <div className="space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('landing.howItWorks')}</h2>
                  <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">{t('landing.howDesc')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 dark:from-indigo-800 dark:via-purple-800 dark:to-indigo-800 -z-10"></div>
                  {[{ step: "1", title: t('landing.step1Title'), desc: t('landing.step1Desc'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> }, { step: "2", title: t('landing.step2Title'), desc: t('landing.step2Desc'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg> }, { step: "3", title: t('landing.step3Title'), desc: t('landing.step3Desc'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> }].map((item, idx) => (
                    <div key={idx} className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 shadow-lg shadow-indigo-500/10 flex items-center justify-center mb-6 z-10 text-indigo-600 dark:text-indigo-400">{item.icon}</div>
                      <div className="glass w-full h-full p-8 rounded-2xl border border-white/40 dark:border-slate-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                        <div className="inline-block px-3 py-1 mb-4 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">Step {item.step}</div>
                        <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-3">{item.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-3xl p-8 md:p-12 border border-white/20 dark:border-slate-800 shadow-xl shadow-indigo-500/5 text-left">
                 <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"><div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg></div>{t('landing.criteriaTitle')}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">{t('landing.criteriaDesc')}</p>
                    </div>
                    <div className="flex-1 w-full">
                       <div className="flex flex-wrap gap-3 justify-center md:justify-start">{Object.values(CRITERIA[i18n.language.startsWith('tr') ? 'tr' : 'en']).map((criterion, idx) => (
                             <div key={idx} className="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 font-semibold text-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">{criterion}</div>
                          ))}</div>
                    </div>
                 </div>
              </div>
              <div className="space-y-16">
                 <div className="text-center space-y-4"><h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('landing.testimonialsTitle')}</h2></div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedTestimonials.map((t: any, idx: number) => (
                       <div key={idx} className="glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 text-left flex flex-col justify-between hover:shadow-2xl transition-all duration-500 group">
                          <div className="mb-6"><div className="flex text-amber-400 mb-4">{[1,2,3,4,5].map(i => (<svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg>))}</div><p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">"{t.comment}"</p></div>
                          <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-6"><div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center font-bold text-lg overflow-hidden shadow-sm group-hover:scale-110 transition-transform"><UserPlaceholder className="w-6 h-6" /></div><div><h4 className="font-bold text-slate-900 dark:text-white leading-none">{t.name}</h4><p className="text-xs text-slate-400 mt-1 font-medium">{t.role}</p></div></div>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="max-w-5xl mx-auto space-y-8 animate-slide-up relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-8">
                 <section className="glass rounded-2xl p-1 border border-white/20 dark:border-slate-800 shadow-xl shadow-indigo-500/5"><TopicSelector onSelectTopic={setCurrentTopic} onStart={() => setView('recorder')}/></section>
                 <section className="glass rounded-2xl p-8 border border-white/20 dark:border-slate-800 shadow-xl shadow-purple-500/5 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-900/10 dark:to-purple-900/10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                       <div className="flex-1 space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">Teacher Tool</div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.examMode')}</h2>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('dashboard.examModeDesc')}</p>
                          <div className="flex flex-wrap gap-3 mt-4">
                             <button onClick={() => { setIsExamMode(true); setView('exam-setup'); }} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-all hover:scale-105">{t('exam.beginExam')}</button>
                             <button onClick={() => setView('class-manager')} className="px-6 py-3 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-900 rounded-xl font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">{t('dashboard.manageClasses')}</button>
                             <button onClick={() => setView('analytics')} className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all">{t('dashboard.analytics')}</button>
                          </div>
                       </div>
                    </div>
                 </section>
              </div>
              <div className="md:col-span-4 space-y-4"><RecentHistory history={history} onSelect={handleSelectHistoryItem} /><button onClick={() => setView('history')} className="w-full py-3 px-4 rounded-xl text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors flex items-center justify-center gap-2 text-sm"><HistoryIcon className="w-4 h-4" /> {t('common.viewAllHistory')}</button></div>
            </div>
          </div>
        );
      case 'class-manager':
        return <ClassManager classes={classes} onUpdate={setClasses} onBack={() => setView('dashboard')} />;
      case 'analytics':
        return <AnalyticsDashboard history={history} classes={classes} onBack={() => setView('dashboard')} />;
      case 'exam-setup':
        return <div className="max-w-4xl mx-auto py-8 animate-fade-in relative z-10"><ExamMode classes={classes} onComplete={handleExamComplete} onCancel={() => { setIsExamMode(false); setView('dashboard'); }}/></div>;
      case 'recorder':
        return <div className="max-w-4xl mx-auto py-8 animate-fade-in relative z-10"><Recorder topic={currentTopic} onStop={handleStopRecording} onCancel={() => setView('dashboard')}/></div>;
      case 'evaluating':
        const radius = 70; const circumference = 2 * Math.PI * radius; const strokeDashoffset = circumference - (loadingProgress / 100) * circumference;
        return (<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in relative z-10"><div className="relative w-56 h-56 flex items-center justify-center"><div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full animate-pulse-slow"></div><svg className="w-full h-full" viewBox="0 0 224 224"><circle cx="112" cy="112" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-slate-800" /><circle cx="112" cy="112" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="text-indigo-600 dark:text-indigo-500 transition-all duration-300 ease-linear origin-center -rotate-90" /><text x="112" y="112" textAnchor="middle" dominantBaseline="middle" dy=".1em" className="text-4xl font-extrabold fill-slate-800 dark:fill-white" style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(loadingProgress)}%</text></svg></div><div className="text-center space-y-3 max-w-sm px-4"><h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight animate-pulse">{progressText(loadingProgress)}</h2><div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50"><p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{t('dashboard.estimatedTime', { seconds: estimatedTimeLeft })}</p></div></div></div>);
      case 'result':
      case 'exam-result':
        return evaluationData ? (<div className="max-w-5xl mx-auto py-4 animate-fade-in relative z-10 print:m-0 print:p-0"><EvaluationResult data={evaluationData} audioBlob={audioBlob} onBack={() => { setView('dashboard'); setIsExamMode(false); setStudentInfo(null); }} isExam={isExamMode} studentInfo={studentInfo}/></div>) : null;
      case 'history':
        return (<div className="max-w-5xl mx-auto py-4 animate-fade-in relative z-10"><HistoryView history={history} onSelect={handleSelectHistoryItem} onDelete={(id) => setHistory(prev => prev.filter(i => i.id !== id))} onClearAll={() => setHistory([])} onBack={() => setView('dashboard')}/></div>);
      default: return null;
    }
  };

  const progressText = (p: number) => {
    if (p < 25) return t('dashboard.processingSteps.uploading');
    if (p < 60) return t('dashboard.processingSteps.transcribing');
    if (p < 90) return t('dashboard.processingSteps.analyzing');
    return t('dashboard.processingSteps.finalizing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative font-sans print:bg-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden"><div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-[120px] animate-blob"></div><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div></div>
      <header className="sticky top-0 z-50 glass border-b border-white/20 dark:border-slate-800 transition-colors duration-300 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 cursor-pointer" onClick={() => { setView('landing'); setIsExamMode(false); }}><Logo /><div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700"></div><span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">{t('app.subtitle')}</span></div>
          <div className="flex items-center gap-2 sm:gap-3">
            {view !== 'landing' && <button onClick={() => { setView('dashboard'); setIsExamMode(false); }} className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200" title="Home"><HomeIcon className="w-5 h-5" /></button>}
            <button onClick={() => { setView('history'); setIsExamMode(false); }} className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200" title="History"><HistoryIcon className="w-5 h-5" /></button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <button onClick={toggleTheme} className="p-2.5 text-amber-500 hover:bg-amber-50 dark:text-slate-300 dark:hover:text-amber-400 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200" title="Toggle Theme">{theme === 'light' ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>}</button>
            <button onClick={toggleLanguage} className="ml-1 px-4 py-2 text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm">{i18n.language === 'tr' ? 'TR' : 'EN'}</button>
          </div>
        </div>
      </header>
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10 print:p-0 print:max-w-none">{renderContent()}</main>
      <footer className="w-full py-8 text-center relative z-10 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm mt-auto print:hidden"><div className="max-w-7xl mx-auto px-4"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Built with <span className="font-semibold text-sky-500">React</span>, <span className="font-semibold text-blue-500">TypeScript</span> & <span className="font-semibold text-cyan-500">Tailwind</span> by <a href="https://instagram.com/can_akalin" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-200 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1">Can AKALIN</a></p></div></footer>
    </div>
  );
};

export default App;
