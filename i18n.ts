
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
        print: "Print / Save as PDF",
        send: "Send"
      },
      feedback: {
        title: "Send Feedback",
        desc: "Your thoughts help us improve. Write a comment or suggestion below.",
        placeholder: "Your message...",
        name: "Full Name",
        success: "Thank you! Your feedback has been sent.",
        writeBtn: "Write a Comment"
      },
      landing: {
        heroTitle: "Master Your Speaking Exams",
        heroDesc: "The ultimate AI assistant for English teachers and students.",
        badge: "Prepared in accordance with the Century of Türkiye Education Model",
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
        criteriaDesc: "Our AI evaluates performance based on core pedagogical pillars.",
        testimonialsTitle: "User Reviews",
        teacherTestimonials: {
          star5: [
            { name: "Selin A.", role: "English Teacher", comment: "The lucky wheel feature turned my exams into a fun activity! My students are finally excited to speak English." },
            { name: "Murat B.", role: "English Teacher", comment: "This tool is a lifesaver during exam weeks. It aligns perfectly with the new curriculum standards." },
            { name: "Canan C.", role: "English Teacher", comment: "The AI analysis is incredibly accurate. It saves me so much time while providing objective results." },
            { name: "Ahmet D.", role: "English Teacher", comment: "Finally, an app that actually understands the needs of high school teachers. Highly recommended." },
            { name: "Elif E.", role: "English Teacher", comment: "My students' pronunciation improved drastically after using the feedback feature regularly." },
            { name: "Burak F.", role: "English Teacher", comment: "The reporting system is very professional. I use it for my official school documentation." }
          ],
          star4: [
            { name: "Zeynep G.", role: "English Teacher", comment: "Great for class engagement. The kids love the competitive aspect of the scores." },
            { name: "Deniz H.", role: "English Teacher", comment: "Very effective for individual practice. I assign it as homework for speaking skills." },
            { name: "Merve I.", role: "English Teacher", comment: "The transcript feature helps me identify common grammatical mistakes across the class." },
            { name: "Kerem J.", role: "English Teacher", comment: "User-friendly interface and fast processing. A solid companion for the classroom." },
            { name: "Pelin K.", role: "English Teacher", comment: "It bridges the gap between learning theory and speaking practice perfectly." },
            { name: "Hakan L.", role: "English Teacher", comment: "Detailed feedback allows students to work on their weaknesses independently." }
          ],
          star3: [
            { name: "Sibel M.", role: "English Teacher", comment: "Useful tool, but works best in quiet environments. Good for mock exams." },
            { name: "Tolga N.", role: "English Teacher", comment: "Helps set a standard for grading. A bit dependent on internet speed though." },
            { name: "Ayşe O.", role: "English Teacher", comment: "Provides a good baseline for speaking levels. Looking forward to more features." },
            { name: "Okan P.", role: "English Teacher", comment: "Interesting concept. My 11th graders find it helpful for their exam prep." },
            { name: "Nihal R.", role: "English Teacher", comment: "A good assistant for large classes where I can't listen to everyone individually." }
          ]
        },
        studentTestimonials: {
          star5: [
            { name: "Arda A.", role: "9th Grade Student", comment: "I was so scared of speaking exams, but practicing here made me feel like a pro. I got my first 100!" },
            { name: "Selin B.", role: "11th Grade Student", comment: "The pronunciation corrections are so helpful. I've finally fixed my accent on common words." },
            { name: "Mert C.", role: "10th Grade Student", comment: "I love how it saves my history. Seeing my score go up every week is super motivating." },
            { name: "Ece D.", role: "12th Grade Student", comment: "Great for YDT preparation. I wish I found this earlier in the year." },
            { name: "Umut E.", role: "9th Grade Student", comment: "The topics are exactly what we see in school. No more surprises in the real exam!" },
            { name: "Defne F.", role: "10th Grade Student", comment: "It feels like having a private tutor at home. The feedback is very clear." }
          ],
          star4: [
            { name: "Berk G.", role: "11th Grade Student", comment: "Really easy to use. I practice for 10 minutes every day and I feel much more confident." },
            { name: "Azra H.", role: "12th Grade Student", comment: "The transcript helps me see exactly what I said wrong. It's better than just a grade." },
            { name: "Emre I.", role: "9th Grade Student", comment: "Cool design and the wheel feature is fun. My English is getting better already." },
            { name: "Melis J.", role: "10th Grade Student", comment: "Helps me overcome my fear of speaking. Now I don't hesitate when the teacher calls me." },
            { name: "Kaan K.", role: "11th Grade Student", comment: "Good practice for real-life conversations too, not just for school exams." },
            { name: "Irmak L.", role: "12th Grade Student", comment: "A great tool for busy students. Fast and effective feedback every time." }
          ],
          star3: [
            { name: "Can M.", role: "9th Grade Student", comment: "Good for practice but sometimes it doesn't hear me when it's noisy." },
            { name: "Beril N.", role: "10th Grade Student", comment: "Useful app. I like comparing my scores with my previous attempts." },
            { name: "Onur O.", role: "11th Grade Student", comment: "Helps me prepare for the speaking section. Simple and helpful." },
            { name: "Simge P.", role: "12th Grade Student", comment: "Good for testing my level. I use it before every big exam." },
            { name: "Yiğit R.", role: "11th Grade Student", comment: "A helpful app to check if I'm pronouncing the words correctly." }
          ]
        }
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
        print: "Yazdır / PDF Olarak Kaydet",
        send: "Gönder"
      },
      feedback: {
        title: "Yorum Yapın",
        desc: "Düşünceleriniz bizim için değerli. Lütfen öneri veya yorumunuzu aşağıya yazın.",
        placeholder: "Mesajınız...",
        name: "Adınız Soyadınız",
        success: "Teşekkürler! Yorumunuz başarıyla iletildi.",
        writeBtn: "Yorum Yaz"
      },
      landing: {
        heroTitle: "Konuşma Sınavlarında Başarıyı Yakalayın",
        heroDesc: "İngilizce öğretmenleri ve öğrencileri için akıllı yapay zeka asistanı.",
        badge: "Türkiye Yüzyılı Maarif Modeli'ne uygun olarak hazırlanmıştır",
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
        criteriaDesc: "Yapay zekamız performansınızı Maarif Modeli kriterleriyle puanlar.",
        testimonialsTitle: "Kullanıcı Yorumları",
        teacherTestimonials: {
          star5: [
            { name: "Selin A.", role: "İngilizce Öğretmeni", comment: "Çark özelliği konuşma sınavlarını bir kabus olmaktan çıkarıp eğlenceli bir aktiviteye dönüştürdü. 9. sınıflarım artık derse çok daha istekli katılıyor." },
            { name: "Murat B.", role: "İngilizce Öğretmeni", comment: "Puanlama yükünü üzerimden alması harika. Yeni müfredatın gerektirdiği tüm analizleri saniyeler içinde raporlayabiliyorum." },
            { name: "Canan C.", role: "İngilizce Öğretmeni", comment: "Yapay zeka analizi inanılmaz derecede isabetli. Objektif sonuçlar sunması sınav adaletini artırıyor." },
            { name: "Ahmet D.", role: "İngilizce Öğretmeni", comment: "Lise öğretmenlerinin ihtiyaçlarını gerçekten anlayan bir uygulama. Kesinlikle tavsiye ediyorum." },
            { name: "Elif E.", role: "İngilizce Öğretmeni", comment: "Geri bildirim özelliği sayesinde öğrencilerimin telaffuz hataları gözle görülür şekilde azaldı." },
            { name: "Burak F.", role: "İngilizce Öğretmeni", comment: "Raporlama sistemi çok profesyonel. Resmi evraklarımda gönül rahatlığıyla kullanıyorum." }
          ],
          star4: [
            { name: "Zeynep G.", role: "İngilizce Öğretmeni", comment: "Sınıf içi katılımı artırmak için harika bir araç. Öğrenciler aldıkları puanlarla birbirleriyle yarışıyor." },
            { name: "Deniz H.", role: "İngilizce Öğretmeni", comment: "Bireysel pratikler için çok etkili. Konuşma ödevi olarak öğrencilerime düzenli kullandırıyorum." },
            { name: "Merve I.", role: "İngilizce Öğretmeni", comment: "Döküm özelliği, sınıf genelinde yapılan gramer hatalarını tespit etmemde bana çok yardımcı oluyor." },
            { name: "Kerem J.", role: "İngilizce Öğretmeni", comment: "Kullanıcı dostu arayüzü ve hızlı işlem gücüyle derslerin vazgeçilmez bir parçası oldu." },
            { name: "Pelin K.", role: "İngilizce Öğretmeni", comment: "Teorik bilgi ile konuşma pratiği arasındaki boşluğu mükemmel şekilde dolduruyor." },
            { name: "Hakan L.", role: "İngilizce Öğretmeni", comment: "Detaylı geri bildirimler sayesinde öğrencilerim eksiklerini kendi başlarına görebiliyorlar." }
          ],
          star3: [
            { name: "Sibel M.", role: "İngilizce Öğretmeni", comment: "Kullanışlı bir uygulama, sessiz ortamlarda çok daha iyi sonuç veriyor. Deneme sınavları için ideal." },
            { name: "Tolga N.", role: "İngilizce Öğretmeni", comment: "Puanlama standartı oluşturmak için yardımcı. Ancak internet hızına biraz bağımlı çalışıyor." },
            { name: "Ayşe O.", role: "İngilizce Öğretmeni", comment: "Seviye belirleme için güzel bir temel sunuyor. Yeni özelliklerle daha da gelişeceğine inanıyorum." },
            { name: "Okan P.", role: "İngilizce Öğretmeni", comment: "İlginç bir konsept. 11. sınıflarım sınav hazırlık sürecinde oldukça faydalı buldular." },
            { name: "Nihal R.", role: "İngilizce Öğretmeni", comment: "Her öğrenciyi tek tek dinleyemediğim kalabalık sınıflarda en büyük yardımcım." }
          ]
        },
        studentTestimonials: {
          star5: [
            { name: "Arda A.", role: "9. Sınıf Öğrencisi", comment: "Sınavda heyecandan konuşamıyordum. ChitIQ ile evde defalarca pratik yaptım ve sonunda sınavdan 100 almayı başardım!" },
            { name: "Selin B.", role: "11. Sınıf Öğrencisi", comment: "Telaffuzumu düzeltmek için harika bir asistan. Kelimeleri yanlış söylediğimde hemen uyarması çok iyi oluyor." },
            { name: "Mert C.", role: "10. Sınıf Öğrencisi", comment: "Geçmiş puanlarımı görmek beni çok motive ediyor. Her hafta puanımın yükseldiğini görmek harika bir duygu." },
            { name: "Ece D.", role: "12. Sınıf Öğrencisi", comment: "YDT hazırlık sürecinde konuşma pratiği yapmak için kullanıyorum. Keşke daha önce keşfetseydim." },
            { name: "Umut E.", role: "9. Sınıf Öğrencisi", comment: "Konular tam okulda işlediklerimiz gibi. Gerçek sınavda artık hiçbir şey sürpriz gelmiyor!" },
            { name: "Defne F.", role: "10. Sınıf Öğrencisi", comment: "Evde özel ders alıyor gibi hissediyorum. Geri bildirimler çok anlaşılır ve geliştirici." }
          ],
          star4: [
            { name: "Berk G.", role: "11. Sınıf Öğrencisi", comment: "Kullanımı çok basit. Günde 10 dakika pratikle bile kendime olan güvenim çok arttı." },
            { name: "Azra H.", role: "12. Sınıf Öğrencisi", comment: "Döküm özelliği sayesinde neyi yanlış söylediğimi net görüyorum. Sadece puan almaktan çok daha iyi." },
            { name: "Emre I.", role: "9. Sınıf Öğrencisi", comment: "Tasarımı çok şık, çark özelliği de çok eğlenceli. İngilizcem şimdiden gelişmeye başladı." },
            { name: "Melis J.", role: "10. Sınıf Öğrencisi", comment: "Konuşma korkumu yenmeme yardımcı oldu. Artık derste hoca söz verdiğinde çekinmiyorum." },
            { name: "Kaan K.", role: "11. Sınıf Öğrencisi", comment: "Sadece sınavlar için değil, günlük konuşmalar için de güzel bir çalışma alanı sunuyor." },
            { name: "Irmak L.", role: "12. Sınıf Öğrencisi", comment: "Vakti kısıtlı öğrenciler için harika bir araç. Her denemede hızlı ve etkili geri bildirim alıyorum." }
          ],
          star3: [
            { name: "Can M.", role: "9. Sınıf Öğrencisi", comment: "Pratik için güzel ama bazen gürültülü ortamlarda söylediklerimi tam anlamıyor." },
            { name: "Beril N.", role: "10. Sınıf Öğrencisi", comment: "Faydalı bir uygulama. Eski puanlarımla yenilerini karşılaştırmak hoşuma gidiyor." },
            { name: "Onur O.", role: "11. Sınıf Öğrencisi", comment: "Konuşma sınavına hazırlanırken yardımcı oluyor. Basit ve işlevsel bir yapısı var." },
            { name: "Simge P.", role: "12. Sınıf Öğrencisi", comment: "Seviyemi test etmek için güzel. Her büyük sınavdan önce mutlaka bir iki deneme yapıyorum." },
            { name: "Yiğit R.", role: "11. Sınıf Öğrencisi", comment: "Kelimeleri doğru telaffuz edip etmediğimi kontrol etmek için kullandığım başarılı bir uygulama." }
          ]
        }
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
