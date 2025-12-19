
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
import FeedbackForm from './components/FeedbackForm';

// Icons
import { Logo } from './icons/Logo';
import { HomeIcon } from './icons/HomeIcon';
import { HistoryIcon } from './icons/HistoryIcon';

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
  const [showFeedback, setShowFeedback] = useState(false);
  
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

  // Counter State
  const [displayCount, setDisplayCount] = useState(0);
  const targetCount = 2481 + history.length;

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

  // Testimonial logic ensures uniqueness and randomized selection from localized keys
  const testimonials = useMemo(() => {
    const teachersObj = t('landing.teacherTestimonials', { returnObjects: true }) as any;
    const studentsObj = t('landing.studentTestimonials', { returnObjects: true }) as any;
    
    if (!teachersObj || !studentsObj) return [];
    
    const pickedTeachers: any[] = [];
    const pickedStudents: any[] = [];
    const cats = ['star5', 'star4', 'star3'];
    
    // Pick 3 unique teachers
    const allTeachers: any[] = [];
    cats.forEach(cat => {
      if (teachersObj[cat]) {
        teachersObj[cat].forEach((item: any) => allTeachers.push({ ...item, stars: parseInt(cat.replace('star', '')), type: 'teacher' }));
      }
    });
    
    // Pick 3 unique students
    const allStudents: any[] = [];
    cats.forEach(cat => {
      if (studentsObj[cat]) {
        studentsObj[cat].forEach((item: any) => allStudents.push({ ...item, stars: parseInt(cat.replace('star', '')), type: 'student' }));
      }
    });

    const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);
    
    return [...shuffle(allTeachers).slice(0, 3), ...shuffle(allStudents).slice(0, 3)].sort(() => Math.random() - 0.5);
  }, [t, i18n.language, view]);

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
          <div className="flex flex-col items-center space-y-12 animate-fade-in relative z-10 pb-16">
            {/* --- HERO SECTION --- */}
            <div className="flex flex-col items-center text-center space-y-6 pt-2 relative w-full px-4">
              
              {/* Maarif Badge - Top center */}
              <div className="z-30 animate-slide-up">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-50/80 dark:bg-indigo-950/80 backdrop-blur-sm border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-black shadow-sm">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                   {t('landing.badge')}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                {/* Logo Section */}
                <div className="relative transform hover:scale-105 transition-transform duration-500">
                  <Logo className="md:scale-110" />
                </div>
                
                <div className="space-y-2 max-w-4xl">
                  <h1 className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1] drop-shadow-sm">
                    {t('landing.heroTitle')}
                  </h1>
                  <p className="text-base md:text-xl font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    {t('landing.heroDesc')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button 
                  onClick={() => setView('dashboard')} 
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white transition-all duration-300 bg-indigo-600 rounded-2xl focus:outline-none hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 active:scale-95"
                >
                  {t('landing.startBtn')}
                  <svg className="w-5 h-5 ml-2.5 transition-transform group-hover:translate-x-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                <div className="flex items-center gap-4 px-8 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                   <div className="text-center">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{t('dashboard.usageCount')}</p>
                     <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{displayCount.toLocaleString()}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* --- COMPACT HOW IT WORKS --- */}
            <div className="w-full max-w-5xl mx-auto px-4 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">{t('landing.howItWorks')}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">{t('landing.howDesc')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-black shadow-inner">
                      {step}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{t(`landing.step${step}Title`)}</h3>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs font-medium">{t(`landing.step${step}Desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- COMPACT CRITERIA SECTION --- */}
            <div className="w-full bg-slate-100/30 dark:bg-slate-900/30 py-10 border-y border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
              <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                 <div className="lg:col-span-4 space-y-3 text-center lg:text-left">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{t('landing.criteriaTitle')}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('landing.criteriaDesc')}</p>
                 </div>
                 <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.keys(CRITERIA[i18n.language.startsWith('tr') ? 'tr' : 'en']).map((key) => (
                      <div key={key} className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-2 transition-all hover:scale-105">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                           {key === 'rapport' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                           {key === 'organisation' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
                           {key === 'delivery' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
                           {key === 'languageUse' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>}
                           {key === 'creativity' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                        </div>
                        <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                           {(CRITERIA[i18n.language.startsWith('tr') ? 'tr' : 'en'] as any)[key]}
                        </h4>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* --- COMPACT TESTIMONIALS SECTION --- */}
            <div className="w-full max-w-6xl mx-auto px-4 space-y-12">
               <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('landing.testimonialsTitle')}</h2>
                  <button 
                    onClick={() => setShowFeedback(true)}
                    className="px-6 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 transition-all active:scale-95"
                  >
                    {t('feedback.writeBtn')}
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {testimonials.map((item, idx) => (
                    <div key={idx} className="flex flex-col p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative transition-all hover:shadow-md">
                       <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                             <svg 
                               key={i} 
                               className={`w-4 h-4 ${i < item.stars ? 'text-amber-400' : 'text-slate-100 dark:text-slate-800'}`} 
                               fill="currentColor" 
                               viewBox="0 0 20 20"
                             >
                               <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                             </svg>
                          ))}
                       </div>
                       <p className="flex-1 text-slate-600 dark:text-slate-300 text-sm font-bold italic leading-relaxed mb-6">
                          “{item.comment}”
                       </p>
                       <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm ${item.type === 'teacher' ? 'bg-indigo-600' : 'bg-purple-600'}`}>
                             <UserPlaceholder className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 dark:text-white leading-none mb-1 text-sm">{item.name}</h4>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.role}</p>
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
            </div>

            {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}
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
        return <ClassManager classes={classes} history={history} onUpdate={setClasses} onSelectHistory={handleSelectHistoryItem} onBack={() => setView('dashboard')} />;
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
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4 relative z-10 print:p-0 print:max-w-none">{renderContent()}</main>
      <footer className="w-full py-8 text-center relative z-10 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm mt-auto print:hidden"><div className="max-w-7xl mx-auto px-4"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Built with <span className="font-semibold text-sky-500">React</span>, <span className="font-semibold text-blue-500">TypeScript</span> & <span className="font-semibold text-cyan-500">Tailwind</span> by <a href="https://instagram.com/can_akalin" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-200 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1">Can AKALIN</a></p></div></footer>
    </div>
  );
};

export default App;
