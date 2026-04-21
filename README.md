

# 🏰 KodiVault

**Decentralized Rent Escrow & Property Management** *Secure. Transparent. Trustless.*

KodiVault is a Web3-native rental platform designed to eliminate trust issues between landlords and tenants. By leveraging the Solana blockchain, security deposits are held in a Program Derived Address (PDA) escrow vault, ensuring funds are only released upon mutual agreement or through a verified dispute resolution process.

-----

## 🛠 Tech Stack

### Backend (The Vault Core)

  - **Framework:** Django REST Framework (Python 3.13)
  - **Database:** PostgreSQL / SQLite
  - **Auth:** JWT (SimpleJWT)
  - **API:** RESTful ViewSets with automated filtering

### Frontend (The Dashboard)

  - **Framework:** React + Vite
  - **Routing:** TanStack Router (File-based)
  - **State Management:** TanStack Query (React Query)
  - **Styling:** Tailwind CSS v4 (Custom Prestige Wealth Theme)
  - **Icons:** Lucide React

-----

## 📂 Project Structure

```text
kodivault-system/
├── backend/            # Django REST Framework API
│   ├── core/           # Project settings & routing
│   ├── users/          # Custom User model & Auth
│   ├── properties/     # Property listings logic
│   ├── leases/         # Lease contracts & state
│   └── escrow/         # Solana transaction tracking
├── frontend/           # React + Vite Application
│   ├── src/
│   │   ├── features/   # Domain-driven feature slices
│   │   ├── routes/     # TanStack File-based routing
│   │   ├── services/   # Axios API integration
│   │   └── components/ # Shadcn UI components
│   └── e2e/            # Playwright testing suite
```

-----

## 🚀 Getting Started

### 1\. Backend Setup (Django)

Navigate to the backend directory:

```bash
cd backend
```

**Create and activate a virtual environment:**

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
```

**Install dependencies:**

```bash
pip install -r requirements.txt
# If requirements.txt isn't present, install core packages:
# pip install django djangorestframework django-cors-headers djangorestframework-simplejwt django-filter
```

**Database Setup:**
*Note: If you are resetting for a clean architecture:*

```bash
# Delete old DB if it exists
rm db.sqlite3 

# Apply fresh migrations
python manage.py makemigrations
python manage.py migrate
```

**Run the server:**

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api`.

-----

### 2\. Frontend Setup (React)

Navigate to the frontend directory:

```bash
cd ../frontend
```

**Install dependencies:**

```bash
bun install 
# or 
npm install
```

**Environment Variables:**
Create a `.env` file in the `frontend` root:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

**Run the development server:**

```bash
bun run dev
# or
npm run dev
```

The application will be available at `http://localhost:8080`.

-----

## 🧪 Testing

We use **Playwright** for end-to-end critical path testing.

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run tests
npm run test:e2e
```

-----

## 🎨 Design System: Prestige Wealth

KodiVault uses a high-end visual language built with **OKLCH** colors in Tailwind v4:

  - **Primary:** `oklch(0.25 0.05 45)` — Deep Espresso Brown
  - **Secondary:** `oklch(0.94 0.03 80)` — Soft Champagne
  - **Accent:** `oklch(0.82 0.12 85)` — Champagne Gold
  - **Success:** `oklch(0.45 0.12 155)` — Forest Green

-----

## ⚖️ License

© 2026 KodiVault. Built for the future of decentralized housing in Kenya and beyond.