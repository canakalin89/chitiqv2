
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
        confirmDelete: "Delete this item?",
        retry: "Try Again",
        requestAccess: "Grant Permission",
        print: "Print / Save as PDF"
      },
      dashboard: {
        selectTask: "Select Task",
        recentAttempts: "Recent Attempts",
        startRecording: "Start Recording",
        stopRecording: "Stop Recording",
        processing: "Processing...",
        recording: "Recording...",
        usageCount: "Usage Count",
        examMode: "Teacher Exam Mode",
        examModeDesc: "Create structured exams, pick questions with a lucky wheel, and download reports.",
        processingSteps: {
          uploading: "Uploading audio...",
          transcribing: "Transcribing speech...",
          analyzing: "Analyzing metrics...",
          finalizing: "Finalizing report..."
        },
        estimatedTime: "Estimated time: ~{{seconds}}s"
      },
      exam: {
        title: "Teacher Exam Mode",
        studentInfo: "Student Information",
        firstName: "First Name",
        lastName: "Last Name",
        class: "Class",
        selectQuestions: "Select Questions for the Wheel",
        minQuestions: "Please select at least 2 questions.",
        startWheel: "Prepare Wheel",
        spinWheel: "Spin the Wheel!",
        spinning: "Spinning...",
        selectedTopic: "Selected Topic",
        beginExam: "Begin Exam",
        reportTitle: "Official Speaking Exam Report",
        examDate: "Exam Date",
        teacherNotes: "Notes",
        selectedQuestionsCount: "{{count}} questions selected"
      },
      recorder: {
        liveTranscript: "Live Transcript",
        listening: "Listening...",
        speakUp: "Speak up! I can't hear you clearly.",
        micHelp: "If you don't see the prompt, check your browser's address bar (click the lock icon) to allow microphone access."
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
        criteriaDesc: "Our AI evaluates your speech based on these 5 core pillars:",
        testimonialsTitle: "What Our Students Say",
        testimonials: [
          { name: "Ahmet Y.", comment: "I used to get very nervous before speaking exams, but practicing with ChitIQ gave me confidence!", role: "11th Grade Student" },
          { name: "Zeynep K.", comment: "The detailed feedback on my delivery helped me get a full score on my finals!", role: "12th Grade Student" },
          { name: "Caner D.", comment: "It's like having a private English tutor available 24/7. Definitely the best study tool.", role: "10th Grade Student" },
          { name: "Elif S.", comment: "As a 9th grader, I was worried about high school English, but this app made it fun and easy.", role: "9th Grade Student" },
          { name: "Mert Ö.", comment: "The AI understands me perfectly even when I make small mistakes. Very impressive!", role: "11th Grade Student" },
          { name: "Selin B.", comment: "I improved my pronunciation score from 60 to 95 in just two weeks of practice.", role: "9th Grade Student" },
          { name: "Burak T.", comment: "Perfect for IELTS preparation. The feedback is very professional and clear.", role: "12th Grade Student" },
          { name: "Ece V.", comment: "I love the user-friendly interface. It's so easy to just pick a topic and start speaking.", role: "10th Grade Student" },
          { name: "Deniz G.", comment: "My teacher recommended this app to the whole class. We all love it!", role: "9th Grade Student" },
          { name: "Yigit A.", comment: "The 'Century of Türkiye' alignment makes me feel like I'm studying exactly what I need.", role: "11th Grade Student" },
          { name: "Gamze R.", comment: "I used to struggle with organizing my thoughts. The AI's feedback on organization is a lifesaver.", role: "12th Grade Student" },
          { name: "Bora L.", comment: "Finally an app that gives specific feedback instead of just a generic score!", role: "9th Grade Student" },
          { name: "Derya P.", comment: "The real-time transcription helps me see where I hesitate. Truly useful tool.", role: "11th Grade Student" },
          { name: "Kerem U.", comment: "Helped me overcome my fear of speaking in front of the class.", role: "10th Grade Student" },
          { name: "Sude N.", comment: "I like how it tracks my history. Seeing my scores go up is so motivating.", role: "9th Grade Student" },
          { name: "Ozan C.", comment: "Best way to practice speaking without feeling judged. Very supportive tool.", role: "11th Grade Student" },
          { name: "Asli F.", comment: "The variety of topics is amazing. There is always something new to talk about.", role: "12th Grade Student" }
        ]
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
        confirmDelete: "Bu kaydı sil?",
        retry: "Tekrar Dene",
        requestAccess: "İzin Ver",
        print: "Yazdır / PDF Olarak Kaydet"
      },
      dashboard: {
        selectTask: "Görev Seçin",
        recentAttempts: "Son Denemeler",
        startRecording: "Kaydı Başlat",
        stopRecording: "Kaydı Bitir",
        processing: "İşleniyor...",
        recording: "Kaydediliyor...",
        usageCount: "Kullanılma Sayısı",
        examMode: "Öğretmen Sınav Modu",
        examModeDesc: "Sınav oturumları oluşturun, soruları çarkla seçin ve resmi raporlar alın.",
        processingSteps: {
          uploading: "Ses yükleniyor...",
          transcribing: "Konuşma deşifre ediliyor...",
          analyzing: "Metrikler analiz ediliyor...",
          finalizing: "Rapor hazırlanıyor..."
        },
        estimatedTime: "Tahmini süre: ~{{seconds}}sn"
      },
      exam: {
        title: "Öğretmen Sınav Modu",
        studentInfo: "Öğrenci Bilgileri",
        firstName: "Adı",
        lastName: "Soyadı",
        class: "Sınıfı",
        selectQuestions: "Çark İçin Soruları Seçin",
        minQuestions: "Lütfen en az 2 soru seçin.",
        startWheel: "Çarkı Hazırla",
        spinWheel: "Çarkı Çevir!",
        spinning: "Çevriliyor...",
        selectedTopic: "Seçilen Konu",
        beginExam: "Sınavı Başlat",
        reportTitle: "Resmi İngilizce Konuşma Sınav Raporu",
        examDate: "Sınav Tarihi",
        teacherNotes: "Notlar",
        selectedQuestionsCount: "{{count}} soru seçildi"
      },
      recorder: {
        liveTranscript: "Canlı Döküm",
        listening: "Dinleniyor...",
        speakUp: "Daha yüksek sesle konuşun! Sizi duyamıyorum.",
        micHelp: "Eğer mikrofon isteği gelmiyorsa, tarayıcınızın adres çubuğundaki kilit simgesine tıklayarak mikrofon iznini 'İzin Ver' olarak değiştirin."
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
        criteriaDesc: "Yapay zekamız konuşmanızı bu 5 temel esas üzerinden değerlendirir:",
        testimonialsTitle: "Öğrencilerimiz Ne Diyor?",
        testimonials: [
          { name: "Ahmet Y.", comment: "Konuşma sınavlarından önce çok geriliyordum ama ChitIQ ile pratik yapmak bana güven verdi!", role: "11. Sınıf Öğrencisi" },
          { name: "Zeynep K.", comment: "Sunum konusundaki detaylı geri bildirimler final sınavından 100 almama yardımcı oldu!", role: "12. Sınıf Öğrencisi" },
          { name: "Caner D.", comment: "7/24 yanımda olan bir özel İngilizce öğretmeni gibi. Kesinlikle harika bir araç.", role: "10. Sınıf Öğrencisi" },
          { name: "Elif S.", comment: "9. sınıf olarak lise İngilizcesinden korkuyordum ama bu uygulama işi çok kolaylaştırdı.", role: "9. Sınıf Öğrencisi" },
          { name: "Mert Ö.", comment: "Yapay zeka küçük hatalarımı bile anlıyor ve düzeltiyor. Çok etkileyici bir sistem.", role: "11. Sınıf Öğrencisi" },
          { name: "Selin B.", comment: "İki haftalık pratikle telaffuz puanımı 60'tan 95'e çıkardım. Çok mutluyum!", role: "9. Sınıf Öğrencisi" },
          { name: "Burak T.", comment: "IELTS hazırlığı için mükemmel. Geri bildirimler çok profesyonel ve yol gösterici.", role: "12. Sınıf Öğrencisi" },
          { name: "Ece V.", comment: "Kullanıcı arayüzü çok şık ve kolay. Konu seçip konuşmaya başlamak saniyeler sürüyor.", role: "10. Sınıf Öğrencisi" },
          { name: "Deniz G.", comment: "Öğretmenimiz tüm sınıfa tavsiye etti. Hepimiz severek kullanıyoruz.", role: "9. Sınıf Öğrencisi" },
          { name: "Yiğit A.", comment: "Maarif Modeli ile uyumlu olması tam olarak sınavda çıkacak şeylere odaklanmamı sağlıyor.", role: "11. Sınıf Öğrencisi" },
          { name: "Gamze R.", comment: "Düşüncelerimi organize etmekte zorlanıyordum. Organizasyon geri bildirimleri hayat kurtarıcı.", role: "12. Sınıf Öğrencisi" },
          { name: "Bora L.", comment: "Sadece puan vermek yerine gerçek tavsiyeler sunan ilk uygulama!", role: "9. Sınıf Öğrencisi" },
          { name: "Derya P.", comment: "Canlı döküm sayesinde nerede durakladığımı görebiliyorum. Çok faydalı.", role: "11. Sınıf Öğrencisi" },
          { name: "Kerem U.", comment: "Sınıf önünde konuşma korkumu yenmemde çok büyük desteği oldu.", role: "10. Sınıf Öğrencisi" },
          { name: "Sude N.", comment: "Geçmişimi takip edebilmeyi seviyorum. Puanlarımın arttığını görmek çok motive edici.", role: "9. Sınıf Öğrencisi" },
          { name: "Ozan C.", comment: "Yargılanma korkusu olmadan konuşma pratiği yapmanın en iyi yolu.", role: "11. Sınıf Öğrencisi" },
          { name: "Aslı F.", comment: "Konu çeşitliliği harika. Her gün konuşacak yeni ve ilginç bir başlık bulabiliyorum.", role: "12. Sınıf Öğrencisi" }
        ]
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
    lng: localStorage.getItem('i18nextLng') || 'tr',
    fallbackLng: 'tr',
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
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
