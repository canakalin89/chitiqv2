# ChitIQ - Smart Speaking Evaluator / Akıllı Konuşma Asistanı

[English](#english) | [Türkçe](#türkçe)

---

<a name="english"></a>
## 🇬🇧 English

### Overview
ChitIQ is a modern React application designed to help users, especially high school students, practice and evaluate their English speaking skills. Powered by the Google Gemini API, it provides instant, detailed feedback on Rapport, Organization, Delivery, Language Use, and Creativity.

### Features
- **AI-Powered Analysis**: Uses Google's Gemini 2.5 Flash model for accurate speech evaluation, transcription, and summarization.
- **Exam Focused**: Tailored for high school speaking exams with specific topics (Freestyle, IELTS, TOEFL, etc.).
- **Educational Alignment**: Aligned with the **"Century of Türkiye Education Model"**, focusing on holistic skill development.
- **Comprehensive Feedback**: Provides detailed scoring (0-100) and constructive advice across 5 key metrics.
- **History Tracking**: Saves evaluations locally so students can track their progress over time.
- **Responsive Design**: Fully responsive UI with dark mode support and mobile-friendly gestures (swipe-to-delete).

### Tech Stack
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Internationalization**: i18next (English & Turkish support)
- **Audio**: Native Web Audio API for recording and visualization

### Installation
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up your API Key:
   - Create a `.env` file in the root directory.
   - Add your key: `API_KEY=your_google_gemini_api_key`
4. Run the application: `npm start`

---

<a name="türkçe"></a>
## 🇹🇷 Türkçe

### Genel Bakış
ChitIQ, kullanıcıların, özellikle lise öğrencilerinin İngilizce konuşma becerilerini geliştirmelerine ve sınavlara hazırlanmalarına yardımcı olmak için tasarlanmış modern bir React uygulamasıdır. Google Gemini API gücüyle çalışan uygulama; Uyum, Organizasyon, Sunum, Dil Kullanımı ve Yaratıcılık gibi kriterler üzerinden anında ve detaylı geri bildirim sağlar.

### Özellikler
- **Yapay Zeka Destekli Analiz**: Google Gemini 2.5 Flash modeli ile konuşmaları dinler, metne döker ve puanlar.
- **Sınav Odaklı**: Lise İngilizce konuşma sınavlarına hazırlık için müfredata uygun konular içerir.
- **Eğitim Modeli Uyumu**: **"Türkiye Yüzyılı Maarif Modeli"** vizyonuna uygun olarak öğrencilerin dil becerilerini geliştirmeyi hedefler.
- **Kapsamlı Geri Bildirim**: 5 temel kriter üzerinden 100 üzerinden puanlama ve kişisel gelişim tavsiyeleri sunar.
- **Geçmiş Takibi**: Öğrencilerin gelişimlerini izleyebilmeleri için değerlendirmeleri tarayıcıda saklar.
- **Mobil Uyumlu**: Karanlık mod desteği ve mobil cihazlarda kaydırarak silme (swipe-to-delete) özelliği ile kullanıcı dostu arayüz.

### Teknolojiler
- **Arayüz**: React 19, TypeScript
- **Stil**: Tailwind CSS
- **Yapay Zeka**: Google GenAI SDK (`@google/genai`)
- **Dil Desteği**: i18next (Türkçe & İngilizce)
- **Ses**: Web Audio API (Kayıt ve Görselleştirme)

### Kurulum
1. Projeyi bilgisayarınıza indirin.
2. Gerekli paketleri yükleyin: `npm install`
3. API Anahtarını ayarlayın:
   - Ana dizinde `.env` dosyası oluşturun.
   - Şu satırı ekleyin: `API_KEY=google_gemini_api_anahtariniz`
4. Uygulamayı başlatın: `npm start`

---

*Developed by [Can AKALIN](https://instagram.com/can_akalin)*
