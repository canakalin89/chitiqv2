
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SPEAKING_TOPICS } from '../constants';
import { StudentInfo } from '../types';
import { BackIcon } from '../icons/BackIcon';

interface ExamModeProps {
  onComplete: (topic: string, info: StudentInfo) => void;
  onCancel: () => void;
}

const ExamMode: React.FC<ExamModeProps> = ({ onComplete, onCancel }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<'setup' | 'wheel'>('setup');
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    firstName: '',
    lastName: '',
    studentClass: ''
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const langKey = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const topicsData = SPEAKING_TOPICS[langKey];
  const allAvailableQuestions = useMemo(() => Object.values(topicsData).flat(), [topicsData]);

  const handleToggleQuestion = (question: string) => {
    setSelectedQuestions(prev => 
      prev.includes(question) 
        ? prev.filter(q => q !== question) 
        : [...prev, question]
    );
  };

  const handleStartWheel = () => {
    if (selectedQuestions.length < 2) {
      alert(t('exam.minQuestions'));
      return;
    }
    setStep('wheel');
  };

  const spinWheel = () => {
    if (isSpinning) return;
    
    setWinner(null);
    setIsSpinning(true);
    // Add at least 5-8 full rotations + random offset
    const extraRotations = 1800 + Math.floor(Math.random() * 1800); 
    const newRotation = rotation + extraRotations;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const actualDegrees = newRotation % 360;
      const sliceAngle = 360 / selectedQuestions.length;
      // Index is determined by where the pointer (at the top / 0 deg) lands relative to the rotation
      // Since wheel rotates clockwise, we need 360 - offset
      const winningIndex = Math.floor(((360 - (actualDegrees % 360)) / sliceAngle) % selectedQuestions.length);
      setWinner(selectedQuestions[winningIndex]);
    }, 4000);
  };

  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', 
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e'
  ];

  const renderSetup = () => (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('exam.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 space-y-6 shadow-xl shadow-indigo-500/5">
          <h3 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
             <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xs">01</div>
             {t('exam.studentInfo')}
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t('exam.firstName')}</label>
              <input 
                type="text" 
                value={studentInfo.firstName}
                onChange={e => setStudentInfo(prev => ({...prev, firstName: e.target.value}))}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                placeholder="Örn: Ahmet"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t('exam.lastName')}</label>
              <input 
                type="text" 
                value={studentInfo.lastName}
                onChange={e => setStudentInfo(prev => ({...prev, lastName: e.target.value}))}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                placeholder="Örn: Yılmaz"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t('exam.class')}</label>
              <input 
                type="text" 
                value={studentInfo.studentClass}
                onChange={e => setStudentInfo(prev => ({...prev, studentClass: e.target.value}))}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                placeholder="Örn: 11-A"
              />
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 space-y-6 flex flex-col shadow-xl shadow-purple-500/5">
          <h3 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
             <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center text-white text-xs">02</div>
             {t('exam.selectQuestions')}
          </h3>
          
          <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-2 custom-scrollbar">
             {allAvailableQuestions.map((q, idx) => (
               <label key={idx} className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                 selectedQuestions.includes(q) 
                 ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' 
                 : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
               }`}>
                 <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors ${selectedQuestions.includes(q) ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {selectedQuestions.includes(q) && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                 </div>
                 <input 
                   type="checkbox" 
                   checked={selectedQuestions.includes(q)} 
                   onChange={() => handleToggleQuestion(q)}
                   className="hidden"
                 />
                 <span className="text-sm font-semibold leading-tight">{q}</span>
               </label>
             ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-auto">
             <span className="text-sm font-bold text-slate-400">
               {t('exam.selectedQuestionsCount', { count: selectedQuestions.length })}
             </span>
             <button
               onClick={handleStartWheel}
               disabled={selectedQuestions.length < 2 || !studentInfo.firstName || !studentInfo.lastName}
               className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
             >
               {t('exam.startWheel')}
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWheel = () => {
    const numSlices = selectedQuestions.length;
    const sliceAngle = 360 / numSlices;
    
    return (
      <div className="flex flex-col items-center justify-center space-y-12 animate-slide-up py-4">
        <div className="text-center space-y-3">
           <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mb-2">
              Sınav Oturumu
           </div>
           <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
             {studentInfo.firstName} {studentInfo.lastName}
           </h2>
           <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">{studentInfo.studentClass}</p>
        </div>

        <div className="relative group">
           {/* Wheel Background Shadow */}
           <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full group-hover:bg-purple-500/20 transition-colors duration-500"></div>
           
           {/* Wheel Pointer Container */}
           <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-30 drop-shadow-xl transition-transform ${isSpinning ? 'animate-bounce' : ''}`}>
              <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 50L40 0H0L20 50Z" fill="#F43F5E" />
                <circle cx="20" cy="15" r="5" fill="white" fillOpacity="0.5" />
              </svg>
           </div>

           {/* The Wheel SVG */}
           <div className="relative w-[300px] h-[300px] sm:w-[500px] sm:h-[500px]">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-2xl"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
                }}
              >
                <defs>
                   {selectedQuestions.map((_, i) => (
                      <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colors[i % colors.length]} />
                        <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity="0.8" />
                      </linearGradient>
                   ))}
                </defs>
                
                {selectedQuestions.map((q, i) => {
                  const startAngle = i * sliceAngle;
                  const endAngle = (i + 1) * sliceAngle;
                  const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                  
                  // Calculate path coordinates
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                  return (
                    <g key={`slice-${i}`}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={`url(#grad-${i})`}
                        stroke="white"
                        strokeWidth="0.5"
                      />
                      {/* Label Text */}
                      <text
                        x="80"
                        y="50"
                        fill="white"
                        fontSize="2.5"
                        fontWeight="bold"
                        textAnchor="end"
                        alignmentBaseline="middle"
                        transform={`rotate(${startAngle + sliceAngle / 2}, 50, 50)`}
                        className="pointer-events-none select-none uppercase"
                        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        {q.length > 25 ? q.substring(0, 22) + '...' : q}
                      </text>
                    </g>
                  );
                })}

                {/* Center Hub */}
                <circle cx="50" cy="50" r="8" fill="white" className="dark:fill-slate-900 shadow-xl" />
                <circle cx="50" cy="50" r="5" fill="currentColor" className="text-indigo-500 animate-pulse" />
              </svg>
              
              {/* Outer Ring Decoration */}
              <div className="absolute inset-0 rounded-full border-[12px] border-white/10 dark:border-slate-800/20 pointer-events-none"></div>
           </div>
        </div>

        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
           {winner && !isSpinning ? (
             <div className="space-y-8 text-center animate-fade-in w-full">
                <div className="glass p-8 rounded-[2.5rem] border-4 border-indigo-500 shadow-2xl shadow-indigo-500/20 bg-white/80 dark:bg-slate-900/80 transform scale-105 transition-transform">
                   <div className="flex justify-center mb-4">
                      <div className="px-4 py-1 rounded-full bg-indigo-600 text-white text-xs font-black uppercase tracking-widest animate-pulse">
                         SEÇİLEN SORU
                      </div>
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-tight">
                     {winner}
                   </h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={spinWheel}
                    className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    Tekrar Çevir
                  </button>
                  <button
                    onClick={() => onComplete(winner, studentInfo)}
                    className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-emerald-500/40 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
                  >
                    <span>{t('exam.beginExam')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
             </div>
           ) : (
             <button
               onClick={spinWheel}
               disabled={isSpinning}
               className={`
                 relative group overflow-hidden px-16 py-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95
                 ${isSpinning ? 'shadow-none opacity-80 cursor-not-allowed' : 'shadow-indigo-500/40'}
               `}
             >
               <span className="relative z-10">
                  {isSpinning ? t('exam.spinning') : t('exam.spinWheel')}
               </span>
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
             </button>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full pb-20">
      {step === 'setup' ? renderSetup() : renderWheel()}
    </div>
  );
};

export default ExamMode;
