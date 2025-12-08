import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      app: {
        title: "ChitIQ",
        subtitle: "Your Smart Speaking Assistant"
      },
      common: {
        goBack: "Go Back",
        cancel: "Cancel",
        summary: "Summary",
        history: "History",
        viewAllHistory: "View All History",
        clearAll: "Clear All",
        delete: "Delete",
        confirmDeleteAll: "Are you sure you want to delete all history?",
        confirmDelete: "Delete this item?"
      },
      dashboard: {
        selectTask: "Select Task",
        recentAttempts: "Recent Attempts",
        startRecording: "Start Recording",
        stopRecording: "Stop Recording",
        processing: "Processing...",
        recording: "Recording..."
      },
      recorder: {
        liveTranscript: "Live Transcript",
        listening: "Listening...",
        speakUp: "Speak up! I can't hear you clearly."
      },
      evaluation: {
        rapport: "Rapport",
        organisation: "Organisation",
        delivery: "Delivery",
        languageUse: "Language Use",
        creativity: "Creativity",
        overallScore: "Overall Score",
        feedback: "Feedback",
        transcription: "Transcription",
        pronunciation: "Pronunciation"
      },
      history: {
        title: "History",
        empty: "No history available yet."
      },
      landing: {
        heroTitle: "Ace Your Speaking Exams",
        heroDesc: "The smartest way for high school students to prepare for English exams. Fully aligned with the Century of Türkiye Education Model.",
        badge: "Aligned with Century of Türkiye Education Model",
        features: "Features",
        startBtn: "Start Evaluating",
        howItWorks: "How It Works",
        howDesc: "Three simple steps to master your speaking skills.",
        step1Title: "Choose a Topic",
        step1Desc: "Select from exam-focused topics or freestyle to practice specific scenarios.",
        step2Title: "Record Speech",
        step2Desc: "Speak naturally. Our AI listens, transcribes, and analyzes your speech in real-time.",
        step3Title: "Get Feedback",
        step3Desc: "Receive instant scores and detailed advice on 5 key performance metrics.",
        criteriaTitle: "What We Evaluate",
        criteriaDesc: "Our AI evaluates your speech based on these 5 core pillars:"
      },
      errors: {
        micPermission: "Microphone access is required to evaluate your speech. Please enable it in your browser settings.",
        generic: "Something went wrong. Please try again.",
        noSpeechDetected: "No speech detected. Please try again."
      }
    }
  },
  tr: {
    translation: {
      app: {
        title: "ChitIQ",
        subtitle: "Akıllı Konuşma Asistanınız"
      },
      common: {
        goBack: "Geri Dön",
        cancel: "İptal",
        summary: "Özet",
        history: "Geçmiş",
        viewAllHistory: "Tüm Geçmişi Gör",
        clearAll: "Tümünü Temizle",
        delete: "Sil",
        confirmDeleteAll: "Tüm geçmişi silmek istediğinize emin misiniz?",
        confirmDelete: "Bu kaydı sil?"
      },
      dashboard: {
        selectTask: "Görev Seçin",
        recentAttempts: "Son Denemeler",
        startRecording: "Kaydı Başlat",
        stopRecording: "Kaydı Bitir",
        processing: "İşleniyor...",
        recording: "Kaydediliyor..."
      },
      recorder: {
        liveTranscript: "Canlı Döküm",
        listening: "Dinleniyor...",
        speakUp: "Daha yüksek sesle konuşun! Sizi duyamıyorum."
      },
      evaluation: {
        rapport: "Uyum",
        organisation: "Organizasyon",
        delivery: "Sunum",
        languageUse: "Dil Kullanımı",
        creativity: "Yaratıcılık",
        overallScore: "Genel Puan",
        feedback: "Geri Bildirim",
        transcription: "Transkripsiyon",
        pronunciation: "Telaffuz"
      },
      history: {
        title: "Geçmiş",
        empty: "Henüz geçmiş kaydı yok."
      },
      landing: {
        heroTitle: "İngilizce Konuşma Sınavlarında Başarıya Ulaşın",
        heroDesc: "Lise öğrencilerinin sınavlara hazırlanması için en akıllı yol. Türkiye Yüzyılı Maarif Modeli ile tam uyumlu.",
        badge: "Türkiye Yüzyılı Maarif Modeli ile Uyumlu",
        features: "Özellikler",
        startBtn: "Değerlendirmeye Başla",
        howItWorks: "Nasıl Çalışır?",
        howDesc: "Konuşma becerilerinizi geliştirmek için üç basit adım.",
        step1Title: "Konu Seçin",
        step1Desc: "Sınav müfredatına uygun konulardan veya serbest konulardan birini seçin.",
        step2Title: "Ses Kaydı Yapın",
        step2Desc: "Doğal bir şekilde konuşun. Yapay zekamız sizi dinler, dökümünü alır ve analiz eder.",
        step3Title: "Geri Bildirim Alın",
        step3Desc: "5 temel performans kriteri üzerinden anında puanlar ve detaylı tavsiyeler alın.",
        criteriaTitle: "Neleri Değerlendiriyoruz?",
        criteriaDesc: "Yapay zekamız konuşmanızı bu 5 temel esas üzerinden değerlendirir:"
      },
      errors: {
        micPermission: "Konuşmanızı değerlendirmek için mikrofon erişimi gereklidir. Lütfen tarayıcı ayarlarınızdan etkinleştirin.",
        generic: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
        noSpeechDetected: "Ses algılanamadı. Lütfen tekrar deneyin."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // Explicitly set 'tr' as default if no language is found in localStorage.
    // We strictly look at localStorage first, then fallback to 'tr', ignoring navigator.
    lng: localStorage.getItem('i18nextLng') || 'tr',
    fallbackLng: 'tr',
    detection: {
      order: ['localStorage'], // Only look at local storage
      caches: ['localStorage'], // Cache selection in local storage
      lookupLocalStorage: 'i18nextLng'
    },
    debug: false,
    interpolation: {
      escapeValue: false, 
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;