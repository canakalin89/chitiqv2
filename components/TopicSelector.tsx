import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SPEAKING_TOPICS } from '../constants';
import { MicIcon } from '../icons/MicIcon';

interface TopicSelectorProps {
  onSelectTopic: (topic: string) => void;
  onStart: () => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic, onStart }) => {
  const { t, i18n } = useTranslation();
  const [selectedTopic, setSelectedTopic] = useState('');

  const langKey = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const topicsData = SPEAKING_TOPICS[langKey];

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const topic = e.target.value;
    setSelectedTopic(topic);
    onSelectTopic(topic);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-10 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t('dashboard.selectTask')}
        </h2>
      </div>

      <div className="space-y-8">
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-200 blur-sm"></div>
            <div className="relative">
              <select
                id="topic-select"
                value={selectedTopic}
                onChange={handleTopicChange}
                className="block w-full rounded-xl border-0 bg-white dark:bg-slate-950 py-4 pl-4 pr-10 text-slate-700 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-base sm:leading-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <option value="" disabled>
                  {t('dashboard.selectTask')}...
                </option>
                {Object.entries(topicsData).map(([category, topics]) => (
                  <optgroup key={category} label={category} className="text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-800 font-bold">
                    {topics.map((topic, index) => (
                      <option key={`${category}-${index}`} value={topic} className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 font-normal py-2">
                        {topic}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
        </div>

        <button
          onClick={onStart}
          disabled={!selectedTopic}
          className={`
            w-full flex items-center justify-center gap-3 py-5 rounded-xl font-bold text-lg tracking-wide transition-all duration-300
            ${selectedTopic 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:scale-[1.02]' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}
          `}
        >
          <MicIcon className={`w-6 h-6 ${selectedTopic ? 'animate-pulse' : ''}`} />
          {t('dashboard.startRecording')}
        </button>
      </div>
    </div>
  );
};

export default TopicSelector;