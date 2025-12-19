
import React, { useState, useEffect, useRef } from 'react';
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
  const allAvailableQuestions = Object.values(topicsData).flat();

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
    
    setIsSpinning(true);
    const spinDegrees = 1800 + Math.random() * 1800; // At least 5 full rotations
    const newRotation = rotation + spinDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const actualDegrees = newRotation % 360;
      const sliceAngle = 360 / selectedQuestions.length;
      // Note: CSS rotation goes clockwise, but we need to account for the pointer being at top
      // Simplified winner selection based on rotation
      const winningIndex = Math.floor(((360 - (actualDegrees % 360)) / sliceAngle) % selectedQuestions.length);
      setWinner(selectedQuestions[winningIndex]);
    }, 4000);
  };

  const renderSetup = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('exam.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm">1</div>
             {t('exam.studentInfo')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-1">{t('exam.firstName')}</label>
              <input 
                type="text" 
                value={studentInfo.firstName}
                onChange={e => setStudentInfo(prev => ({...prev, firstName: e.target.value}))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-1">{t('exam.lastName')}</label>
              <input 
                type="text" 
                value={studentInfo.lastName}
                onChange={e => setStudentInfo(prev => ({...prev, lastName: e.target.value}))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-1">{t('exam.class')}</label>
              <input 
                type="text" 
                value={studentInfo.studentClass}
                onChange={e => setStudentInfo(prev => ({...prev, studentClass: e.target.value}))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 space-y-6 flex flex-col">
          <h3 className="text-xl font-bold flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm">2</div>
             {t('exam.selectQuestions')}
          </h3>
          
          <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-2 custom-scrollbar">
             {allAvailableQuestions.map((q, idx) => (
               <label key={idx} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                 selectedQuestions.includes(q) 
                 ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' 
                 : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
               }`}>
                 <input 
                   type="checkbox" 
                   checked={selectedQuestions.includes(q)} 
                   onChange={() => handleToggleQuestion(q)}
                   className="mt-1 w-4 h-4 text-purple-600 rounded"
                 />
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">{q}</span>
               </label>
             ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
             <span className="text-sm font-bold text-slate-400">
               {t('exam.selectedQuestionsCount', { count: selectedQuestions.length })}
             </span>
             <button
               onClick={handleStartWheel}
               disabled={selectedQuestions.length < 2 || !studentInfo.firstName || !studentInfo.lastName}
               className="px-6 py-2.5 bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
             >
               {t('exam.startWheel')}
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWheel = () => {
    const sliceAngle = 360 / selectedQuestions.length;
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

    return (
      <div className="flex flex-col items-center justify-center space-y-12 animate-slide-up">
        <div className="text-center space-y-2">
           <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
             {studentInfo.firstName} {studentInfo.lastName}
           </h2>
           <p className="text-slate-500 font-medium">{studentInfo.studentClass}</p>
        </div>

        <div className="relative w-80 h-80 sm:w-[450px] sm:h-[450px]">
           {/* Wheel Pointer */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
              <div className="w-8 h-8 bg-rose-500 rounded-b-full shadow-lg flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
           </div>

           {/* The Wheel */}
           <div 
             className="w-full h-full rounded-full border-[8px] border-white dark:border-slate-800 shadow-2xl overflow-hidden relative"
             style={{ 
               transform: `rotate(${rotation}deg)`,
               transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
             }}
           >
              {selectedQuestions.map((q, i) => (
                <div 
                  key={i}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full origin-bottom"
                  style={{ 
                    transform: `rotate(${i * sliceAngle}deg)`,
                    backgroundColor: colors[i % colors.length],
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.sin(sliceAngle * Math.PI / 180)}% 0%, 50% 0%)`,
                    width: '100%',
                    left: '0%'
                  }}
                />
              ))}
              
              {/* Question Text Labels */}
              {selectedQuestions.map((q, i) => (
                <div 
                  key={`text-${i}`}
                  className="absolute top-[25%] left-1/2 -translate-x-1/2 h-[25%] flex items-center justify-end origin-bottom pointer-events-none"
                  style={{ 
                    transform: `translateX(-50%) rotate(${i * sliceAngle + sliceAngle / 2}deg)`,
                    width: '40%'
                  }}
                >
                   <span className="text-white font-bold text-[10px] sm:text-xs rotate-90 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-[180px]">
                     {q}
                   </span>
                </div>
              ))}

              <div className="absolute inset-0 m-auto w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-inner border-4 border-slate-50 dark:border-slate-800 z-10 flex items-center justify-center">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              </div>
           </div>
        </div>

        <div className="flex flex-col items-center gap-6">
           {winner && !isSpinning ? (
             <div className="space-y-6 text-center animate-fade-in">
                <div className="glass p-6 rounded-2xl border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 max-w-lg">
                   <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2">{t('exam.selectedTopic')}</p>
                   <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white leading-relaxed">{winner}</h3>
                </div>
                <button
                  onClick={() => onComplete(winner, studentInfo)}
                  className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-indigo-500/30 transition-all transform hover:scale-105"
                >
                   {t('exam.beginExam')}
                </button>
             </div>
           ) : (
             <button
               onClick={spinWheel}
               disabled={isSpinning}
               className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-extrabold text-xl shadow-2xl shadow-indigo-500/40 transition-all transform hover:scale-105 active:scale-95"
             >
               {isSpinning ? t('exam.spinning') : t('exam.spinWheel')}
             </button>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {step === 'setup' ? renderSetup() : renderWheel()}
    </div>
  );
};

export default ExamMode;
