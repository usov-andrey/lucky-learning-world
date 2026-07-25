# 🌟 Lucky's Learning World 🐾🎮

A gamified, multi-subject educational PWA hub designed for primary school students (Cambridge & Oxford Primary Grade 1-5). 

Combines mental math battles, spelling bee monsters, pet collection mechanics, and zero-friction LINE social sharing!

---

## ✨ Features

- 🧮 **Math Monster Realm**: Fast mental math duels (Addition, Subtraction, Multiplication Tables x2..x12, Division).
- 🔤 **Word Monster Realm**: Audio spelling tests with phonetic pronunciation, letter tiles, and custom word decks.
- 🐾 **Pokédex & Pet Collection**: Win battles to rescue, collect, and level up cute companion pets.
- 💬 **LINE & Social Share**: Teachers/parents can share custom word lists via LINE links. Classmates open and play in 1 click without logins!
- 📸 **OCR Homework Scanner (Python Pipeline)**: Snap a photo of weekly spelling lists or math worksheets to instantly generate interactive game decks.
- 📱 **Tablet & PWA Ready**: Optimized for iPad/tablet touch usage, works offline after first load.

---

## 🚀 Quick Start (Local Development)

Because **Lucky's Learning World** uses a **Zero-Build Vanilla ES Modules** architecture, no `npm install` or build step is required!

### 1. Launching the Web Hub

Using Python:
```bash
python -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.

Or using Node `serve`:
```bash
npx serve .
```

### 2. Running Unit Tests

```bash
node --test
```

---

## 🎨 Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Variables, Dynamic Glassmorphism, Micro-animations), Modern ES Modules JS.
- **Audio**: Web Audio API & HTML5 Audio with fallback TTS.
- **Content Pipeline**: Python 3 (Pillow, Tesseract OCR / Google Vision API integration).
- **Deployment**: GitHub Pages (Static hosting).

---

## 📜 License

MIT License. Built with ❤️ for Lucky & Classmates!
