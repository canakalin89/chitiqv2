
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
        save: "Save",
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
        manageClasses: "Class Management",
        analytics: "Analytics & Comparison",
        processingSteps: {
          uploading: "Uploading audio...",
          transcribing: "Transcribing speech...",
          analyzing: "Analyzing metrics...",
          finalizing: "Finalizing report..."
        },
        estimatedTime: "Estimated time: ~{{seconds}}s"
      },
      classes: {
        title: "Class Management",
        addClass: "Add New Class",
        className: "Class Name (e.g., 9-A)",
        addStudent: "Add Student",
        bulkAdd: "Bulk Add Students",
        bulkPlaceholder: "101 John Doe\n102 Jane Smith",
        bulkHelp: "Format: 'Number Firstname Lastname' (One per line)",
        noClasses: "No classes defined yet.",
        studentList: "Students",
        deleteClass: "Delete Class",
        compareClasses: "Compare Classes",
        studentAdded: "Student added to class.",
        classReport: "Generate Class Report",
        studentProfile: "Student Profile",
        noAttempts: "No exam records found for this student.",
        examHistory: "Exam History",
        avgScore: "Average Score",
        totalExams: "Exams Taken"
      },
      analytics: {
        title: "Analytics Dashboard",
        classStats: "Class Statistics",
        averageScore: "Average Score",
        studentPerformance: "Student Performance",
        classComparison: "Class Comparison",
        selectClasses: "Select Classes to Compare",
        noData: "Not enough exam data for analytics.",
        totalExams: "Total Exams",
        classReportTitle: "Speaking Exam Class Achievement List",
        studentName: "Student Name",
        total: "Total",
        studentNo: "No."
      },
      exam: {
        title: "Teacher Exam Mode",
        studentInfo: "Student Information",
        selectClass: "Select Class",
        selectStudent: "Select Student",
        firstName: "First Name",
        lastName: "Last Name",
        studentNumber: "Student Number",
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
        heroTitle: "Master Your Speaking Exams",
        heroDesc: "The ultimate AI assistant for English teachers and students. Aligned with the Century of Türkiye Education Model.",
        badge: "Century of Türkiye Education Model",
        startBtn: "Start Practicing",
        howItWorks: "How It Works",
        howDesc: "Achieve fluency in three simple steps.",
        step1Title: "Pick Your Topic",
        step1Desc: "Choose from curriculum-based speaking tasks.",
        step2Title: "Record & Transcribe",
        step2Desc: "Speak naturally. AI transcribes your words in real-time.",
        step3Title: "Smart Analysis",
        step3Desc: "Get instant scores and accurate feedback on 5 metrics.",
        criteriaTitle: "Evaluation Metrics",
        criteriaDesc: "Our AI evaluates performance based on these core pillars.",
        testimonialsTitle: "What They Say",
        teachers: "English Teachers",
        students: "Students",
        teacherTestimonials: {
          star5: [
            { name: "Mrs. Sarah L.", role: "9th Grade English Teacher", comment: "The luck wheel feature is a game changer for class participation! My students actually look forward to speaking exams now." },
            { name: "Mr. David W.", role: "English Teacher", comment: "Perfect alignment with the new curriculum. It saves me hours of manual grading while providing professional reports." }
          ],
          star4: [
            { name: "Ms. Emily R.", role: "9th Grade English Teacher", comment: "The transcription is very accurate. It helps me pinpoint exactly where students are making grammatical errors." }
          ],
          star3: [
            { name: "Mr. James H.", role: "High School ELT", comment: "Helpful tool, but it requires a very quiet room to work perfectly. Great for one-on-one sessions though." }
          ]
        },
        studentTestimonials: {
          star5: [
            { name: "Alex K.", role: "9th Grade Student", comment: "I used to be so nervous before exams. Practicing with ChitIQ gave me the confidence I needed to get an A!" },
            { name: "Maya S.", role: "11th Grade Student", comment: "The pronunciation feedback is amazing. I can see my mistakes and correct them immediately." }
          ],
          star4: [
            { name: "Liam O.", role: "10th Grade Student", comment: "Cool design and very easy to use. I like seeing my progress in the history section." }
          ],
          star3: [
            { name: "Sofia P.", role: "9th Grade Student", comment: "It's good for practice but sometimes it takes a bit long to load the results on slow Wi-Fi." }
          ]
        }
      },
      errors: {
        micPermission: "Microphone access is required. Please enable it in your browser.",
        generic: "Something went wrong. Please try again.",
        noSpeechDetected: "No speech detected. Please speak clearly."
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
        save: "Kaydet",
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
        manageClasses: "Sınıf Yönetimi",
        analytics: "Analiz ve Karşılaştırma",
        processingSteps: {
          uploading: "Ses yükleniyor...",
          transcribing: "Konuşma deşifre ediliyor...",
          analyzing: "Metrikler analiz ediliyor...",
          finalizing: "Rapor hazırlanıyor..."
        },
        estimatedTime: "Tahmini süre: ~{{seconds}}sn"
      },
      classes: {
        title: "Sınıf Yönetimi",
        addClass: "Yeni Sınıf Ekle",
        className: "Sınıf Adı (Örn: 9-A)",
        addStudent: "Öğrenci Ekle",
        bulkAdd: "Toplu Öğrenci Ekle",
        bulkPlaceholder: "101 Ahmet Yılmaz\n102 Ayşe Demir",
        bulkHelp: "Format: 'No Ad Soyad' (Her satıra bir kişi)",
        noClasses: "Henüz tanımlanmış sınıf yok.",
        studentList: "Öğrenci Listesi",
        deleteClass: "Sınıfı Sil",
        compareClasses: "Sınıfları Karşılaştır",
        studentAdded: "Öğrenci sınıfa kaydedildi.",
        classReport: "Sınıf Raporu Oluştur",
        studentProfile: "Öğrenci Profili",
        noAttempts: "Bu öğrenciye ait sınav kaydı bulunamadı.",
        examHistory: "Sınav Geçmişi",
        avgScore: "Ortalama Puan",
        totalExams: "Sınav Sayısı"
      },
      analytics: {
        title: "Analiz Paneli",
        classStats: "Sınıf İstatistikleri",
        averageScore: "Ortalama Puan",
        studentPerformance: "Öğrenci Performansı",
        classComparison: "Sınıf Karşılaştırması",
        selectClasses: "Karşılaştırmak İçin Sınıf Seçin",
        noData: "Analiz için yeterli sınav verisi bulunamadı.",
        totalExams: "Toplam Sınav",
        classReportTitle: "Konuşma Sınavı Sınıf Başarı Çizelgesi",
        studentName: "Öğrenci Adı Soyadı",
        total: "Top.",
        studentNo: "No."
      },
      exam: {
        title: "Öğretmen Sınav Modu",
        studentInfo: "Öğrenci Bilgileri",
        selectClass: "Sınıf Seçin",
        selectStudent: "Öğrenci Seçin",
        firstName: "Adı",
        lastName: "Soyadı",
        studentNumber: "Öğrenci No",
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
        heroTitle: "Konuşma Sınavlarında Başarıyı Yakalayın",
        heroDesc: "İngilizce öğretmenleri ve öğrencileri için akıllı yapay zeka asistanı. Türkiye Yüzyılı Maarif Modeli ile tam uyumlu.",
        badge: "Türkiye Yüzyılı Maarif Modeli",
        startBtn: "Çalışmaya Başla",
        howItWorks: "Nasıl Çalışır?",
        howDesc: "Akıcı konuşmaya üç basit adımda ulaşın.",
        step1Title: "Konu Seçin",
        step1Desc: "Müfredata uygun konuşma görevlerinden birini belirleyin.",
        step2Title: "Kaydet & Çözümle",
        step2Desc: "Doğal konuşun, yapay zeka her kelimenizi anlık metne döksün.",
        step3Title: "Akıllı Analiz",
        step3Desc: "5 kriterde anlık puan ve detaylı geri bildirim alın.",
        criteriaTitle: "Değerlendirme Kriterleri",
        criteriaDesc: "Yapay zekamız performansınızı bu temel başlıklar üzerinden puanlar.",
        testimonialsTitle: "Kullanıcı Yorumları",
        teachers: "İngilizce Öğretmenleri",
        students: "Öğrenciler",
        teacherTestimonials: {
          star5: [
            { name: "Selin Y.", role: "9. Sınıf İngilizce Öğretmeni", comment: "Çark özelliği sınıf katılımını inanılmaz artırdı! Öğrencilerim artık konuşma sınavlarını iple çekiyor." },
            { name: "Murat K.", role: "Lise Bölüm Başkanı", comment: "Maarif Modeli ile tam uyumlu. Manuel puanlama yükünü alırken profesyonel raporlar sunması harika." }
          ],
          star4: [
            { name: "Canan D.", role: "9. Sınıf İngilizce Öğretmeni", comment: "Deşifre özelliği çok başarılı. Öğrencilerin hangi gramer yapılarında zorlandığını net bir şekilde görebiliyorum." }
          ],
          star3: [
            { name: "Ahmet S.", role: "İngilizce Öğretmeni", comment: "Güzel bir asistan, ancak gürültülü sınıflarda bazen sesleri karıştırabiliyor. Birebir seanslarda mükemmel." }
          ]
        },
        studentTestimonials: {
          star5: [
            { name: "Arda K.", role: "9. Sınıf Öğrencisi", comment: "Sınavlardan önce çok geriliyordum. ChitIQ ile pratik yapmak bana büyük güven verdi, sınavdan 100 aldım!" },
            { name: "Selin B.", role: "11. Sınıf Öğrencisi", comment: "Telaffuz geri bildirimleri harika. Nerede hata yaptığımı görüp anında düzeltebiliyorum." }
          ],
          star4: [
            { name: "Mert E.", role: "10. Sınıf Öğrencisi", comment: "Tasarımı çok şık ve kullanımı kolay. Geçmiş bölümünden gelişimimi takip etmek motive edici." }
          ],
          star3: [
            { name: "Ece V.", role: "9. Sınıf Öğrencisi", comment: "Güzel uygulama ama internetim yavaşken sonuçların gelmesi biraz zaman alabiliyor." }
          ]
        }
      },
      errors: {
        micPermission: "Mikrofon erişimi gerekli. Lütfen tarayıcı ayarlarınızdan izin verin.",
        generic: "Bir hata oluştu. Lütfen tekrar deneyin.",
        noSpeechDetected: "Ses algılanamadı. Lütfen net konuşun."
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
