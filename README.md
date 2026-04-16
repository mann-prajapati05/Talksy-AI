# Talksy AI

Talksy AI is a full-stack AI mock interview platform where users can practice interview rounds, receive AI-generated feedback, track historical performance, and purchase additional interview credits.

It solves a practical interview-prep problem: candidates often do not get realistic, structured practice with actionable feedback. Talksy AI combines resume-based personalization, timed Q&A, and report analytics in one workflow.

Live on : https://talksy-ai-frontend.onrender.com

## Features

### Authentication and User Management

- Email/password signup and login with validation
- Google sign-in integration (Firebase Auth on frontend + backend session creation)
- Cookie-based authenticated session (`userToken` in HTTP-only cookie)
- Current user profile fetch and logout

### AI-Powered Interview Workflow

- Resume upload and parsing (`pdfjs-dist`) to extract experience, projects, and skills
- Personalized interview question generation based on:
  - Role
  - Experience level
  - Interview mode (`Technical`, `HR`, `Mixed`)
  - Resume context (skills/projects/text)
- Timed question-by-question interview flow
- Voice input support via browser speech recognition
- AI answer evaluation with structured scoring:
  - Confidence
  - Communication
  - Correctness
  - Final score and feedback

### Reports and History

- Final interview report generation with aggregate metrics
- Question-wise answer + feedback breakdown
- Trend visualization and score insights
- PDF report export (`jsPDF` + `jspdf-autotable`)
- Interview history listing with status and score cards

### Credits and Payments

- Credit-based interview usage (20 credits per generated interview)
- Minimum credit guard before starting interview
- Razorpay order creation and signature verification
- Credit top-up after successful payment verification

### UI/UX

- Modern responsive React UI
- Framer Motion transitions and micro-interactions
- Dashboard-like cards and visual score components

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit + React Redux
- Tailwind CSS (via `@tailwindcss/vite`)
- Framer Motion
- Axios
- Recharts
- `react-speech-recognition`
- `react-circular-progressbar`
- Firebase (Google Auth)
- jsPDF + jspdf-autotable

### Backend

- Node.js
- Express 5
- Mongoose
- JWT + cookie-parser
- bcrypt
- express-validator
- Multer
- Axios
- Razorpay SDK
- pdfjs-dist

### Database

- MongoDB (via Mongoose)

### External Services

- OpenRouter API (LLM calls for resume analysis, question generation, answer evaluation)
- Razorpay (payments)
- Firebase (Google sign-in)

## Architecture Overview

1. Frontend handles user interaction, interview flow state, and rendering.
2. Backend exposes REST APIs for auth, interview lifecycle, user profile, and payments.
3. MongoDB stores users, interviews, and payment transactions.
4. AI operations are delegated to OpenRouter through backend service calls.
5. Payment operations use Razorpay order APIs and server-side signature verification.

Flow summary:

- User action in React -> Axios request to Express API
- Express validates/authenticates request -> interacts with MongoDB and external services
- Backend returns structured JSON -> frontend updates Redux/local state and UI

## Installation and Setup

### 1. Clone repository

```bash
git clone <your-repo-url>
cd Talksy-ai
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create:

- `backend/.env`
- `frontend/.env`

Use the variables listed in the next section.

### 4. Update API base URL for local development

In `frontend/routes/App.jsx`, `serverUrl` is currently hardcoded to production:

```js
export const serverUrl = "https://talksy-ai.onrender.com";
```

For local backend, set it to:

```js
export const serverUrl = "http://localhost:<backend-port>";
```

### 5. Run backend

```bash
cd backend
npm start
```

### 6. Run frontend

```bash
cd frontend
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=
MONGO_CONNECTION_STRING=
JWT_SECRET=
OPENROUTER_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NODE_ENV=
```

- `PORT`: backend server port
- `MONGO_CONNECTION_STRING`: MongoDB connection URI
- `JWT_SECRET`: JWT signing/verification secret
- `OPENROUTER_API_KEY`: API key for OpenRouter chat completions
- `RAZORPAY_KEY_ID`: Razorpay public key ID used by server SDK
- `RAZORPAY_KEY_SECRET`: Razorpay secret used for SDK and signature verification
- `NODE_ENV`: affects cookie flags (`secure`, `sameSite`)

### Frontend (`frontend/.env`)

```env
VITE_FIREBASE_API=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_RAZORPAY_KEY_ID=
```

- Firebase keys are used in `frontend/src/utils/firebase.js`
- `VITE_RAZORPAY_KEY_ID` is used by Razorpay Checkout in pricing flow

## API Endpoints

Base URL (local): `http://localhost:<PORT>`

### Auth

- `POST /auth/signup` - Create user and set auth cookie
- `POST /auth/login` - Login and set auth cookie
- `POST /auth/google` - Continue with Google (backend user/session creation)
- `GET /auth/logout` - Clear auth cookie

### Users

- `GET /users/current-user` - Get authenticated user profile and credits

### Interview

- `POST /interview/resume-analyze` - Upload resume file and extract structured resume data
- `POST /interview/generate-questions` - Generate interview questions and deduct 20 credits
- `POST /interview/submit-answer` - Evaluate one answer and return feedback
- `POST /interview/finish` - Finalize interview and return report data
- `GET /interview/my-interviews` - List user interviews
- `GET /interview/report/:interviewId` - Get detailed report for one interview

### Payment

- `POST /payment/order` - Create Razorpay order and payment record
- `POST /payment/verify-payment` - Verify signature and add credits

Note: Most endpoints (except initial auth) require authentication via `userToken` cookie.

````

## Folder Structure

```text
Talksy-ai/
├─ backend/
│  ├─ app.js                     # Express app bootstrap
│  ├─ config/connectDB.js        # MongoDB connection
│  ├─ controller/                # Auth, interview, payment, user controllers
│  ├─ middleware/                # Auth guard + Multer upload config
│  ├─ model/                     # Mongoose models: User, Interview, Payment
│  ├─ routes/                    # API route modules
│  └─ services/                  # OpenRouter + Razorpay service wrappers
├─ frontend/
│  ├─ routes/                    # Page-level route components
│  ├─ components/                # Reusable UI and interview step components
│  ├─ src/
│  │  ├─ redux/                  # App store + user slice
│  │  ├─ utils/firebase.js       # Firebase config/auth provider
│  │  ├─ App.css                 # Global styles and utilities
│  │  └─ main.jsx                # App entry and router setup
│  ├─ index.html                 # Includes Razorpay checkout script
│  └─ vite.config.js
└─ README.md
````

## Usage

Typical user flow:

1. Sign up/login (email-password or Google).
2. Open `MockHire` and fill role, experience, mode, and interview length.
3. Optionally upload resume to personalize generated questions.
4. Start interview (20 credits deducted).
5. Answer each timed question (typed or speech-to-text).
6. Receive per-question feedback and continue.
7. Finish interview and review final report with score breakdown.
8. Download PDF report and revisit results in Interview History.
9. If credits are low, purchase a plan from Pricing.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit focused, descriptive changes
4. Open a pull request with:
   - What changed
   - Why it changed
   - How it was tested
