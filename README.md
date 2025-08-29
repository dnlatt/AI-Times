# 📰 AI Times

An AI-powered news reader built with **Next.js** and **Tailwind CSS**.  
It fetches the latest top headlines using [NewsAPI.org](https://newsapi.org/) and generates concise AI-powered summaries using [OpenRouter API](https://openrouter.ai/) with **Google Gemma-3-12B-IT**.  
The app also features a **Swiper-powered carousel** for seamless navigation between articles.

---

## ✨ Features

- 🚀 **Next.js 15 + Tailwind CSS** for a modern, responsive UI
- 📰 **NewsAPI.org** for fetching the latest headlines
- 🤖 **AI Summaries** powered by OpenRouter + Google Gemma-3-12B-IT
- 🎠 **Swiper.js** carousel for smooth browsing experience
- 🌙 **Dark mode support** for better readability
- 🔗 Direct link to **Read Full Story** from the original source
- 📤 Share options (Email, Like, Copy, etc.)

---

## 📸 Screenshots

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS
- **APIs**:
  - [NewsAPI.org](https://newsapi.org/) → Fetch latest news
  - [OpenRouter AI](https://openrouter.ai/) → Summarize content using Google Gemma-3-12B-IT
- **UI Enhancements**: Swiper.js, Lucide-react icons

---

## ⚙️ Installation

1. Clone the repository:

```bash
git clone https://github.com/dnlatt/ai-times.git
cd ai-times
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in `.env.local`:

```bash
NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
```

4. Run the development server:

```bash
npm run dev
```

---

## 📖 Usage

- Open the app at `http://localhost:3000`
- Browse through the latest news articles with the Swiper carousel
- View AI-generated summaries for each article
- Click **Read Full Story** to access the original article
- Share or like articles via the built-in actions

---

## 📌 Roadmap

- [ ] Improve AI summarization accuracy
- [ ] Add category filters (Business, Tech, Sports, etc.)
- [ ] Save and bookmark favorite articles

---

## 📜 License

MIT License
