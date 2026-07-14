# Jogjagem (Explore Jogja) 🏯🌟

Jogjagem is a premium web portal designed to help tourists explore the best attractions, cultural events, and hidden gems in Yogyakarta (Jogja), Indonesia. It features AI-powered recommendations, interactive trip planning, real-time reviews, and a dedicated admin console.

---

## 🚀 Key Features

* **🎭 100+ Curated Destinations**: Complete with high-quality descriptions, categories, coordinates, and photo credits.
* **📅 Dynamic Event Calendar**: Keep track of upcoming cultural festivals and local events in Yogyakarta.
* **🤖 AI Trip Planner**: Powered by Google Gemini AI, offering custom itineraries based on duration, traveler type, budget, and tags.
* **🛡️ Admin Dashboard**: Secure backoffice portal for managing destinations, events, reviews, and roles.
* **👥 Social Authentication**: Google and Facebook OAuth integration.
* **💬 Community Reviews**: Live user ratings and testimonials.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 15 (React 19), Tailwind CSS, Lucide React (Icons), Motion (Animations)
* **Backend**: Go (Golang) REST API, PostgreSQL database (Docker-based)
* **AI Integration**: Google Gemini API via `@google/genai`

---

## 💻 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Go](https://go.dev/) (v1.21 or higher) — for backend
* [PostgreSQL](https://www.postgresql.org/) (or Docker) — for database

---

### 2. Frontend Configuration & Execution

1. **Clone & Navigate**:
   ```bash
   cd explore-jogja
   ```

2. **Configure Environment Variables**:
   Create a `.env` or `.env.local` file from the example:
   ```bash
   cp .env.example .env
   ```
   Fill in the required environment variables:
   ```env
   PORT=3001
   NEXT_PUBLIC_API_BASE=http://localhost:8081
   NEXT_PUBLIC_ADMIN_URL=http://localhost:3005
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3001](http://localhost:3001) in your browser.

---

### 3. Backend (API) Configuration & Execution

1. Navigate to the backend directory:
   ```bash
   cd ../explore-jogja-fullstack
   ```

2. Configure the database and environment keys in `.env`.

3. Run the Go server:
   ```bash
   go run cmd/api/main.go
   ```
   The backend API will run on `http://localhost:8081`.

---

## 🌐 Deployment on Vercel

To host the frontend on Vercel, make sure to add the following **Environment Variables** in your Vercel Dashboard:
* `NEXT_PUBLIC_API_BASE`: Set to `/api/pleco` (for proxy routing) or your deployed production backend API URL.
* `NEXT_PUBLIC_ADMIN_URL`: URL of the deployed admin portal (e.g. `https://admin.jogjagem.com`).
* `GEMINI_API_KEY`: Your Google Gemini API key.

