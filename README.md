# TalentPulse — AI-Powered Interview & Recruitment Platform

An end-to-end full-stack recruitment, ATS resume intelligence, and AI-driven interview practice platform built with **React 19**, **TypeScript**, **Tailwind CSS**, **Express**, **MongoDB (with local JSON fallback)**, and **Google Gemini AI**.

---

## Key Features

### Candidate Portal
- **Always-On AI Task Interviews**: Candidates always have tailored AI task interviews ready (by experience track and skills). Completing any interview awards **+10 points**, updates the **daily streak** & 7-day activity tracker, and automatically provisions a fresh AI interview.
- **Track-Specific Preparation Suites**:
  - **Fresher Track**: Fresher Job Cracking Hub covering Core CS & DSA drills, Academic Project Defense, Fresher HR Behavioral practice, and Fresher ATS optimization.
  - **Experienced Track**: Professional Engineering Suite covering High-Scale System Design, Incident & Concurrency Triage, Senior STAR Leadership, and Executive XYZ Resume calibration.
- **Interactive Video/Voice Interview Room**: Real-time camera/microphone preview, live speech-to-text / text answer submission, per-question AI evaluation, and comprehensive post-interview feedback reports.
- **AI Resume Parser & ATS Checker**: Upload resumes (`.txt`, `.pdf`, `.docx`, etc.) for structured skill extraction, ATS compatibility scoring, and AI-assisted resume optimization.
- **Job Board & Application Tracking**: Filter jobs by experience track, compute AI match scores against your profile, and track application status in real time.

### Recruiter Portal
- **Job Management**: Create and manage job postings with AI-powered job requirement analysis.
- **Candidate Screening & Comparison**: Review applicants with match scores, inspect interview reports, compare candidates side by side, and schedule interviews.

### Admin Portal
- **Platform Metrics & User Management**: Monitor workspace activity, review user accounts, and manage platform roles and statuses.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express, `tsx`
- **AI Engine**: `@google/genai` (Google Gemini API) with deterministic fallbacks when `GEMINI_API_KEY` is not configured
- **Database**: MongoDB (`mongodb` driver) with automatic fallback to local JSON document storage (`server/data.json`)

---

## Prerequisites

- **Node.js** v20+ (includes `npm`)
- **VS Code** (or any terminal/editor)
- Optional: A **Google Gemini API Key** for live AI features
- Optional: A **MongoDB** URI (leave blank to use the built-in local JSON store)

---

## Running Locally in VS Code

1. **Open the project folder** in VS Code (`File` → `Open Folder...`).
2. **Open the integrated terminal** (`Ctrl + ~` / `Cmd + ~` or `Terminal` → `New Terminal`).
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a `.env` file** in the project root (copy `.env.example`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_DB_NAME=
   MONGODB_URI=
   ```
   - `GEMINI_API_KEY`: Enables live Gemini AI resume parsing, ATS scoring, AI task interview generation, and answer evaluation.
   - `MONGODB_URI` & `MONGODB_DB_NAME` *(optional)*: Leave empty to run cleanly out of the box using `server/data.json`.
5. **Start the development server** (runs Express API + Vite frontend on port `3000`):
   ```bash
   npm run dev
   ```
6. Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the full-stack dev server (`tsx server.ts`) on port `3000` |
| `npm run build` | Builds the Vite frontend (`dist/`) and bundles `server.ts` (`dist/server.cjs`) |
| `npm start` | Runs the production build (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type-checking (`tsc --noEmit`) |
| `npm run clean` | Removes build artifacts (`dist`, `server.js`) |

---

## Demo Accounts

You can register a new account from the Sign Up tab on the login screen (Candidate, Recruiter, or Admin), or sign in with the seeded demo accounts (default password: `demo1234`):

- **Candidate**: `alex.rivera@example.com`
- **Recruiter**: `sarah.lin@cloudscale.ai`
- **Admin**: `admin@platform.internal`

---

## Project Structure

```text
├── server.ts                  # Express server, API routes & Vite dev middleware
├── server/
│   ├── db.ts                  # Data access layer & persistence
│   ├── gemini.ts              # Gemini AI prompts & fallback logic
│   ├── mongodb.ts             # Optional MongoDB client connector
│   ├── initial_jobs.ts        # Initial job listings seed
│   └── data.json              # Local JSON database (fallback when MongoDB is unset)
├── src/
│   ├── App.tsx                # Main application state, routing & modals
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── components/            # Candidate, Recruiter, Admin & Interview Room UI
│   ├── context/               # ThemeContext (Light/Dark mode)
│   └── utils/                 # Client auth token helpers
├── .env.example               # Environment variable template
├── package.json
└── vite.config.ts
```
