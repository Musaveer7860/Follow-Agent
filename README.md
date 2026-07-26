# MeetMind AI — Executive Meeting Intelligence & Follow-Up Agent 🚀

> **24-Hour Hackathon Winner Architecture** | Powered by **FastAPI**, **SQLite**, **React 19**, **Vite**, **Tailwind CSS**, and **Google Gemini API**.

MeetMind AI is a production-quality SaaS web application that transforms raw meeting transcripts into structured executive meeting summaries, key decisions, action items with assigned owners, priority levels, deadlines, risk analysis, and follow-up schedules. Inspired by the clean, fast aesthetics of **Linear**, **Notion**, **Slack**, and **ClickUp**.

---

## 📸 Key Features

- 🧠 **Google Gemini API Integration**: Advanced structured JSON output extraction for summaries, decisions, tasks, risks, and follow-ups. Includes an automatic fallback NLP parser for 100% demo uptime when offline or without an API key!
- 📊 **Executive Analytics Dashboard**: Recharts-powered task velocity timeline, priority distribution pie chart, and real-time metric cards.
- 📋 **Kanban Task Manager**: 3-stage visual board (Pending, In Progress, Completed) with status transition controls and filters.
- 💬 **Automated Follow-Up Reminder Generator**: Generate customizable copy-paste Slack, Email, and WhatsApp reminder messages for assigned task owners.
- 📄 **Minutes of Meeting (MOM) PDF Export**: Server-side ReportLab PDF generation for client delivery and archive.
- 🔒 **Enterprise JWT Authentication**: Complete signup, login, password hashing (`bcrypt`), and protected routes.
- 🎨 **Sleek Glassmorphism Dark UI**: Linear-inspired dark mode theme with glowing accent gradients and micro-animations.

---

## 📁 1. Project Folder Structure

```
Follow_Ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI entry point & CORS
│   │   ├── config.py            # Environment configuration & BaseSettings
│   │   ├── database.py          # SQLAlchemy engine & session factory
│   │   ├── models.py            # User, Meeting, Task, Notification models
│   │   ├── schemas.py           # Pydantic validation & response schemas
│   │   ├── auth.py              # JWT token handling & bcrypt security
│   │   ├── routes/
│   │   │   ├── auth_routes.py   # Signup, Login, Me endpoints
│   │   │   ├── meeting_routes.py# Transcript analysis, CRUD, PDF export
│   │   │   ├── task_routes.py   # Task CRUD, status updates, reminders
│   │   │   └── user_routes.py   # Dashboard analytics, profile, notifications
│   │   └── services/
│   │       ├── gemini_service.py# Google Gemini API & fallback engine
│   │       └── pdf_service.py   # ReportLab PDF MOM generation engine
│   ├── seed_data.py             # Pre-populates demo user, transcripts & tasks
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Backend environment template
├── frontend/
│   ├── public/
│   │   └── favicon.svg          # Brand favicon
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js         # Interceptor attached Axios instance
│   │   │   └── services.js      # API service methods wrapper
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Sidebar, Footer, AppLayout
│   │   │   ├── ui/              # Button, Card, Badge, Modal, Input, StatCard, Tabs
│   │   │   ├── dashboard/       # MetricsOverview, TaskCompletionChart, PriorityChart
│   │   │   ├── kanban/          # KanbanBoard, KanbanColumn, TaskCard
│   │   │   └── meeting/         # MeetingUploadForm, SamplePicker, ActionItemsTable, ReminderModal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # JWT Auth state manager
│   │   │   └── ThemeContext.jsx # Dark/Light mode manager
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # High-converting Hero & Feature showcase
│   │   │   ├── LoginPage.jsx    # Auth login form
│   │   │   ├── SignupPage.jsx   # Auth registration form
│   │   │   ├── DashboardPage.jsx# Executive analytics dashboard
│   │   │   ├── MeetingUploadPage.jsx # Transcript analyzer form & demo picker
│   │   │   ├── MeetingDetailPage.jsx # Summary, decisions, action items, PDF export
│   │   │   ├── MeetingsListPage.jsx  # Historical meeting list & search
│   │   │   ├── TaskManagerPage.jsx   # Kanban board & task manager
│   │   │   ├── ReminderGeneratorPage.jsx # Automated follow-up messages
│   │   │   ├── ProfilePage.jsx       # User profile editor
│   │   │   └── SettingsPage.jsx      # API key & system settings
│   │   ├── App.jsx              # React Router & protected layout routes
│   │   ├── main.jsx             # React 19 root mounting
│   │   └── index.css            # Tailwind & glassmorphism custom CSS
│   ├── index.html
│   ├── vite.config.js           # Vite dev server with proxy settings
│   ├── tailwind.config.js       # Custom glassmorphism dark theme palette
│   ├── postcss.config.js
│   └── package.json
└── README.md                    # Project documentation
```

---

## 🛠️ 2. Installation & Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Step 1: Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration file
cp .env.example .env

# Seed the database with demo user & transcripts
python seed_data.py

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
> Backend running at: `http://localhost:8000` (Swagger API Docs at `http://localhost:8000/docs`)

### Step 2: Set Up Frontend

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Launch Vite development server
npm run dev
```
> Frontend running at: `http://localhost:5173`

---

## 🔑 3. Environment Variables (.env)

### Backend `.env`
```env
# Database Configuration
DATABASE_URL=sqlite:///./meetmind.db

# JWT Security Secrets
SECRET_KEY=meetmind_super_secret_jwt_key_hackathon_2026_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Environment
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🔑 4. Demo Login Credentials

The `seed_data.py` script automatically provisions a pre-populated workspace:

- **Email**: `demo@meetmind.ai`
- **Password**: `demo1234`

---

## 🧠 5. Sample Gemini Prompt & JSON Output

### System Prompt Template
```text
You are MeetMind AI, an elite executive meeting intelligence assistant.
Analyze the meeting transcript and extract structured meeting details in pure JSON format matching this exact schema:

{
  "summary": "Concise high-level summary of the main discussion and outcomes.",
  "decisions": ["List of key decisions made"],
  "tasks": [
    {
      "title": "Action item title",
      "owner": "Name of assigned person",
      "deadline": "YYYY-MM-DD",
      "priority": "High / Medium / Low",
      "status": "Pending"
    }
  ],
  "risks": ["Identified risks or dependencies"],
  "followups": ["Follow-up items"]
}
```

### Sample Input Transcript
```text
Rahul: Good morning team. Let's align on the MeetMind AI product launch for Q3.
Priya: From the frontend perspective, React 19 and Tailwind CSS setup is complete. We need Alex to finalize the OAuth token refresh flow by Friday.
Alex: I will take care of the JWT refresh tokens and secure HTTP-Only cookie handling by July 28.
Vikram: The structured JSON response schemas are ready, but we need to implement fallback caching in case the rate limit is hit. I'll finish that by July 27.
```

### Sample Extracted JSON Response
```json
{
  "summary": "The team aligned on Q3 launch targets. Technical priorities include JWT refresh security and Gemini API rate caching.",
  "decisions": [
    "Adopt ReportLab async PDF generation to prevent API latency during MOM exports."
  ],
  "tasks": [
    {
      "title": "Finalize JWT refresh token flow & secure HTTP-only cookies",
      "owner": "Alex",
      "deadline": "2026-07-28",
      "priority": "High",
      "status": "Pending"
    },
    {
      "title": "Implement Gemini API fallback caching layer",
      "owner": "Vikram",
      "deadline": "2026-07-27",
      "priority": "High",
      "status": "Pending"
    }
  ],
  "risks": [
    "Potential Gemini API rate limiting during high volume demo traffic."
  ],
  "followups": [
    "Schedule sprint review call on Thursday at 10:00 AM PST."
  ]
}
```

---

## 🚀 6. Deployment Guide

### Deploy Backend to Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `SECRET_KEY`: `<your-jwt-secret>`
   - `GEMINI_API_KEY`: `<your-gemini-api-key>`
   - `DATABASE_URL`: `sqlite:///./meetmind.db` (or Render PostgreSQL URI)

### Deploy Frontend to Vercel

1. Import project into [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-render-backend-url.onrender.com/api`
4. Click **Deploy**.

---

## 🏆 Hackathon Highlights & Architectural Resilience

- **100% Uptime Guarantee**: If no Gemini API Key is provided or network issues occur, MeetMind AI's fallback parser automatically processes transcripts into valid structured JSON.
- **Production-Ready PDF Engine**: Server-side ReportLab formatting produces executive-grade Minutes of Meeting (MOM) documents with headers, tables, decision bullets, and timestamp footers.
- **State-of-the-Art UX**: Dark theme with backdrop blurs, glow badges, responsive grid layouts, and Framer Motion micro-animations.
