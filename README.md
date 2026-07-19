# BudgetBot ⛵📈

BudgetBot is an intelligent, AI-powered personal finance companion. It combines a beautiful, responsive dashboard with powerful generative AI models to help you seamlessly track expenses, manage budgets, and receive proactive, personalized financial advice.

![BudgetBot Dashboard](https://github.com/WhisperedCloud/BudgetBot/assets/placeholder.png)

## ✨ Key Features

- **AI Voice Assistant:** Log your transactions instantly by speaking to the app. Natural language processing powered by Grok and Gemini automatically categorizes and records your expenses.
- **Smart Financial Advisor:** Get real-time insights, budgeting tips, and a generated "Financial Health Score" based on your spending habits.
- **Beautiful Dashboard:** A clean, modern UI featuring interactive charts, a navy/gold premium color scheme, and an intuitive layout.
- **Goal & Budget Tracking:** Set monthly budgets per category and track your progress towards financial goals.
- **Two-Factor Authentication:** Built-in security to keep your financial data safe.

## 🛠️ Tech Stack

**Frontend**
- React 19 (Vite)
- Tailwind CSS v4 & Framer Motion for beautiful UI and animations
- React Query for efficient data fetching and caching
- Recharts for data visualization

**Backend**
- Node.js & Express.js
- Prisma ORM
- PostgreSQL (hosted on Neon)
- AI Integration (Google Gemini API, Grok API, OpenAI)
- JWT Authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A PostgreSQL database (e.g., Neon.tech)
- API Keys for Gemini, Grok, or OpenAI

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/WhisperedCloud/BudgetBot.git
   cd BudgetBot
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://user:password@host/db"
   JWT_SECRET="your_jwt_secret"
   PORT=5001
   GEMINI_API_KEY="your_api_key"
   GROK_API_KEY="your_api_key"
   ```
   Run the database migrations and seeder:
   ```bash
   npx prisma db push
   npm run seed
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL="http://localhost:5001/api"
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` and log in with the demo account (`demo@budgetbot.com` / `demo123`).

## 🌐 Deployment
This project is configured to be easily deployed on **Vercel**. Deploy the `frontend` and `backend` as two separate projects, and link them using the `VITE_API_URL` environment variable.

---

