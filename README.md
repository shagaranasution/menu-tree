# 📦 Menu Tree — Fullstack Application

A full-stack project built with **NestJS**, **React (Vite)**, and **PostgreSQL** for menu tree creation and management. This repository includes both the backend and frontend code, as well as a Docker environment for local development.

---

## 🚀 Tech Stack

### Frontend
* **React** (Vite)
* **TypeScript**
* **TailwindCSS**

### Backend
* **NestJS**
* **TypeScript**
* **PostgreSQL** (via Docker)
* **Prisma**
* **Swagger** for API documentation

### Development Tools
* **Docker** & **Docker Compose**
* **Node.js** (v18+ recommended)
* `pnpm` / `npm` / `yarn`

---

## 📂 Project Structure

```bash
.
├── apps/
│   └── backend/         # NestJS API server
│   └── frontend/        # React + Vite client
├── docker/              # Docker-related resources
│   └── postgres/
│       └── data/        # Local Postgres volume (ignored by Git)
└── docker-compose.yml   # Database container
```

---

## 🛠️ Local Development

1. Clone the repository
   
```bash
git clone https://github.com/shagaranasution/menu-tree.git
cd menu-tree
```

---

## 🗄️ Database Setup (PostgreSQL via Docker)

1. Create a .env file
Create a .env file in the project root:
```bash
# .env
POSTGRES_USER=YOUR_POSTGRES_USER
POSTGRES_PASSWORD=YOUR_POSTGRES_PASSWORD
POSTGRES_DB=YOUR_POSTGRES_DB_NAME
```

2. Start PostgreSQL

```bash
docker-compose up -d
```

---

## 🧩 Backend (NestJS)

1. Install dependencies

```bash
cd apps/backend
npm install
```

2. Configure environment
Create apps/backend/.env:
```bash
# .env
PORT=3001
DATABASE_URL=YOUR_DB_CONNECTION_STRING
```

3. Run the backend

```bash
npm run start:dev
```
API will run at http://localhost:3001

4. Swagger Documentation
After starting the server:
```bash
http://localhost:3001/api/docs
```

---

## 🎨 Frontend (React + Vite)

1. Install dependencies
```bash
cd apps/frontend
npm install
```

2. Configure .env
Create apps/frontend/.env:
```bash
VITE_BACKEND_PORT=3001
VITE_BACKEND_HOST=http://localhost
```

4. Run dev server
npm run dev
Frontend UI will be available at http://localhost:5173

---

## 📜 Scripts

Backend (/apps/backend)
```bash
npm run start:dev     # Start backend in watch mode
npm run build         # Build backend
npm run start:prod    # Start production server
```
Frontend (/apps/frontend)
```bash
npm run dev           # Start Vite dev server
npm run build         # Build production client
npm run preview       # Preview production build
```




