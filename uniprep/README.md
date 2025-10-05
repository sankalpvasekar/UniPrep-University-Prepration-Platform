# Uniprep Frontend

## 🚀 Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Create a `.env` file
   ```env
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

3. Run the app
   ```bash
   npm run dev
   ```

## 📂 Pages Flow

- `/login` → Login with `user@test.com` / `123456`
- `/branches` → Select branch (CSE, ECE, MECH)
- `/branch/:branchId/subjects` → Select subject
- `/subject/:subjectId` → Subject page with tabs

## 📊 Data

- `src/data/questions.js` → Easy / Medium / Hard probable questions
- `src/data/papers.js` → Past papers list (PDF links from `public/papers/`)
- `src/data/videos.js` → Reference videos list

## 🤖 Chatbot

- Powered by OpenAI API (gpt-3.5-turbo by default)
- Add your API key in `.env` file
- One question → one answer (no history)
