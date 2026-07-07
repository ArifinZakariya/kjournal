# 한국어 저널링 학습 (Korean Journal Learning)

Web aplikasi pembelajaran bahasa Korea dengan metode journaling - terjemahkan paragraf dari bahasa Inggris/Indonesia ke bahasa Korea dengan bantuan AI real-time.

## 🌟 Fitur Utama

### 1. **Generate Paragraf**
- Pilih bahasa sumber (English atau Indonesian)
- AI akan generate paragraf random untuk latihan terjemahan
- Topik: kehidupan sehari-hari, hobi, budaya, makanan, perjalanan

### 2. **Input Real-time dengan AI Suggestions**
- Kolom input Korean dengan font Noto Sans KR
- Setiap mengetik kata Korea, AI memberikan saran kata + arti secara real-time
- Tooltip otomatis muncul dengan informasi:
  - Kata lengkap dalam Hangul
  - Arti dalam English/Indonesian
  - Pronunciation (Romanisasi)

### 3. **Evaluasi Terjemahan Komprehensif**
Submit terjemahan Anda dan dapatkan:
- ✅ **Terjemahan Anda** - Review apa yang Anda tulis
- ✅ **Terjemahan yang Benar** - Versi correct dari AI
- ✅ **Penjelasan & Analisis** - Apa yang bagus dan perlu diperbaiki
- ✅ **Koreksi Grammar** - Detail kesalahan grammar dengan penjelasan
- ✅ **Rekomendasi** - Tips untuk improvement

### 4. **Design Profesional**
- Modern gradient purple theme
- Smooth animations (fade-in, slide-up)
- Responsive layout untuk mobile & desktop
- Typography jelas dengan Korean font support

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js v14 atau lebih baru
- NPM atau Yarn

### Instalasi

1. Clone atau download project ini

2. Install dependencies:
```bash
cd journal-translator
npm install
```

3. Jalankan server:
```bash
node server.js
```

4. Buka browser dan akses:
```
http://localhost:3000
```

### Test API
Akses halaman test untuk memverifikasi semua endpoint:
```
http://localhost:3000/test.html
```

## 📡 API Endpoints

### 1. Generate Paragraph
```http
POST /api/generate-paragraph
Content-Type: application/json

{
  "language": "en" // atau "id"
}
```

**Response:**
```json
{
  "success": true,
  "paragraph": "Last weekend, I visited a traditional Korean restaurant..."
}
```

### 2. Word Suggestion
```http
POST /api/suggest-word
Content-Type: application/json

{
  "word": "한국"
}
```

**Response:**
```json
{
  "success": true,
  "suggestion": {
    "word": "한국",
    "meaning": "Korea / Korean language",
    "pronunciation": "hanguk"
  }
}
```

### 3. Evaluate Translation
```http
POST /api/evaluate-translation
Content-Type: application/json

{
  "originalText": "I love learning Korean.",
  "userTranslation": "나는 한국어를 배우는 것을 좋아해요.",
  "sourceLang": "en"
}
```

**Response:**
```json
{
  "success": true,
  "userTranslation": "나는 한국어를 배우는 것을 좋아해요.",
  "correctTranslation": "저는 한국어를 배우는 것을 좋아합니다.",
  "explanation": "Overall good translation...",
  "grammarCorrections": "- Use 저는 instead of 나는 for politeness...",
  "recommendations": "- Practice more formal expressions..."
}
```

## 🛠️ Teknologi yang Digunakan

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, TailwindCSS, Vanilla JavaScript
- **AI:** IAHMC API (OpenAI-compatible)
- **Font:** Google Fonts (Inter, Noto Sans KR)

## 📝 Struktur Project

```
journal-translator/
├── server.js              # Backend API server
├── package.json           # Dependencies
├── public/
│   ├── index.html        # Main application
│   └── test.html         # API testing page
└── README.md             # Documentation
```

## 🎯 Cara Menggunakan

1. **Klik "Generate New"** untuk mendapatkan paragraf dalam bahasa Inggris/Indonesia
2. **Ketik terjemahan Korea** di kolom input
   - Suggestions akan muncul otomatis saat mengetik
3. **Klik "Submit for Review"** untuk mendapat evaluasi lengkap
4. **Baca feedback** dan pelajari koreksinya
5. **Klik "Start New Practice"** untuk latihan berikutnya

## 💡 Tips Belajar

- Mulai dengan paragraf bahasa Inggris (lebih mudah)
- Gunakan suggestions untuk belajar kosakata baru
- Baca dengan teliti bagian "Grammar Corrections"
- Practice daily untuk hasil terbaik
- Fokus pada satu aspek grammar per sesi

## 🔧 Konfigurasi

API Key sudah terkonfigurasi di `server.js`:
```javascript
const API_KEY = 'sk-MqG01KtjBrCgK74aanMRT5zKOel9MKk8JOCZONWSaaEZVk2K';
const API_BASE_URL = 'https://api.iamhc.cn/v1';
```

## 📄 License

Project ini dibuat untuk tujuan pembelajaran bahasa Korea.

## 🤝 Contributing

Silakan laporkan bug atau request fitur baru melalui issues.

---

**Happy Learning Korean! 화이팅! 🇰🇷**
