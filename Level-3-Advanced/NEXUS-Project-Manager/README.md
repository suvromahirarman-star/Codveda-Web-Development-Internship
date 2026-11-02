# NEXUS — Full-Stack Project Management SaaS Application

> **Codveda Web Development Internship — Level 3, Task 1: Full-Stack CRUD Application**  
> Built by: **Suvro Mahir Arman** | Date: October 2026 | Technology: **MERN Stack (MongoDB Atlas, Express, React 18, Node.js)**

---

## 📸 Visual Preview

![Application Preview](../../screenshots/level-3/nexus-project-manager.png)

---

## 🌟 1. Project Overview

**NEXUS** is an enterprise-grade, lightweight SaaS project and task management application built with a modern decoupled architecture. The frontend is powered by **React 18** and styled with a **Light Premium SaaS design system**, communicating via asynchronous REST API calls with an **Express.js** backend connected strictly to a **persistent MongoDB Atlas cloud database** through **Mongoose**.

### Core Capabilities:
- **Full Project CRUD:** Create, read, update, and delete projects with real-time lifecycle tracking (*Planning, Active, In Progress, Completed, On Hold*) and priority weighting (*Low, Medium, High, Urgent*).
- **Full Task CRUD:** Create, read, update, and delete actionable items linked to parent projects with workflow status (*Todo, In Progress, Review, Completed*).
- **Dynamic Progress Calculation:** Parent project progress percentages and workspace health metrics are calculated dynamically from associated tasks in MongoDB Atlas upon creation, status transition, or deletion.
- **Cascading Referential Integrity:** Deleting a parent project automatically cascades and deletes all associated tasks, maintaining a clean database state.
- **Strict Cloud Persistence:** Communicates directly with persistent MongoDB Atlas (`mongodb+srv://`) and fails fast with diagnostic guidance if the database is unreachable. Zero in-memory or fake storage fallbacks.
- **Defensive Proxy & Error Interceptor:** Vite's reverse proxy interceptor prevents unhelpful 500 errors if the backend is offline, returning descriptive guidance to the frontend.
- **Accidental Deletion Protection:** Multi-step accessible confirmation dialogs prevent single-click data loss.

---

## 🏗️ 2. Full-Stack Architecture

```text
┌────────────────────────────────────────────────────────┐
│               React 18 Frontend (Vite)                 │
│   Light Premium SaaS Theme • Components, Props, State │
│   Port 5173 • Accessible Modals • Toast Notifications  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP REST via Vite Proxy (/api -> http://127.0.0.1:5000)
                           ▼
┌────────────────────────────────────────────────────────┐
│             Express.js Application Server              │
│    Helmet Security • CORS • Validation • Error Handler │
│    Bound to 0.0.0.0:5000 • Pre-flight Database Guard   │
└──────────────────────────┬─────────────────────────────┘
                           │ Mongoose ODM (TLS / SRV)
                           ▼
┌────────────────────────────────────────────────────────┐
│             MongoDB Atlas (Cloud Cluster)              │
│      Projects Collection ◄────► Tasks Collection       │
│      Strict Schemas • Foreign Keys • Auto-Seeder       │
└────────────────────────────────────────────────────────┘
```

---

## 📁 3. Project Directory Structure

```text
NEXUS-Project-Manager/
├── package.json              # Monorepo script coordinator (dev:server, dev:client, install:all, seed)
├── .gitignore                # Protects node_modules, .env, and build artifacts
├── .env                      # Active root environment configuration (ignored by git)
├── .env.example              # Sanitized root environment template with safe placeholders
├── README.md                 # Project documentation & evaluation manual (this file)
├── server/                   # Node.js + Express Backend
│   ├── .env                  # Active server environment configuration (contains MONGODB_URI)
│   ├── .env.example          # Sanitized server environment template
│   ├── package.json          # Express, Mongoose, Helmet, Cors, Dotenv, Morgan
│   ├── server.js             # Starts server ONLY after MongoDB connection succeeds (bound to 0.0.0.0)
│   ├── app.js                # Express app setup, security middleware & route mounting
│   ├── config/
│   │   ├── db.js             # Strict persistent Mongoose connector & safe auto-seeder
│   │   └── seed.js           # Standalone manual seed script (npm run seed)
│   ├── models/
│   │   ├── Project.js        # Mongoose Schema: name, description, status, priority, progress, dueDate
│   │   └── Task.js           # Mongoose Schema: title, description, status, priority, project (ref), dueDate
│   ├── controllers/
│   │   ├── projectController.js # Project CRUD, cascading deletion, and dashboard metrics
│   │   └── taskController.js    # Task CRUD and dynamic project progress recalculation
│   ├── routes/
│   │   ├── projectRoutes.js  # /api/projects routes
│   │   ├── taskRoutes.js     # /api/tasks routes
│   │   └── statsRoutes.js    # /api/stats route
│   └── middleware/
│       ├── errorHandler.js   # Centralized error formatting (CastError, ValidationError, MongoError)
│       └── validateRequest.js# Defensive payload validation for projects and tasks
└── client/                   # React 18 + Vite Frontend
    ├── package.json          # React 18, React DOM, Vite
    ├── vite.config.js        # Reverse proxy config (/api -> http://127.0.0.1:5000 with 503 error handler)
    ├── index.html            # Plus Jakarta Sans & Inter font imports
    ├── public/
    │   └── favicon.svg       # Custom geometric SVG logo
    └── src/
        ├── main.jsx          # React DOM entry point
        ├── App.jsx           # Master state manager, navigation, modals & toasts
        ├── styles.css        # Light Premium SaaS design system & responsive rules
        ├── services/
        │   └── api.js        # Decoupled REST API client wrapper with informative errors
        ├── components/
        │   ├── Header.jsx    # Wordmark, search input, quick action buttons, user profile
        │   ├── Sidebar.jsx   # Desktop sidebar & mobile drawer (Dashboard, Projects, Tasks, Analytics)
        │   ├── ProjectModal.jsx # Create/Edit Project form modal with validation
        │   ├── TaskModal.jsx    # Create/Edit Task form modal with project selector
        │   ├── ConfirmModal.jsx # Deletion safety modal
        │   └── Toast.jsx        # Notification alert banner
        └── pages/
            ├── DashboardView.jsx # 4 metric cards, completion bar, recent project/task lists
            ├── ProjectsView.jsx  # Multi-filter project cards grid & CRUD controls
            ├── TasksView.jsx     # Multi-filter task list with quick status switcher
            └── AnalyticsView.jsx # Workflow distribution & priority analytics
```

---

## 🗄️ 4. MongoDB Atlas Persistence & Configuration

### Strict Database Rules
1. **Zero In-Memory Fallbacks:** The application does **NOT** use `mongodb-memory-server` or `localStorage`.
2. **Pre-Flight Connection Check:** In [`server/server.js`](./server/server.js), `await connectDB()` is executed **before** calling `app.listen()`. If MongoDB Atlas is unreachable, the server refuses to start, displaying clear diagnostic troubleshooting.
3. **Dual `.env` Discovery:** Both `server/.env` and root `.env` are automatically discovered by the backend loader.
4. **Credential Masking:** Connection strings in console logs and exception messages are automatically sanitized (`//***:***@`) to prevent leaking passwords.
5. **Safe Initial Seeding:** Auto-seeding inspects `Project.countDocuments()`. If documents already exist, seeding is safely skipped so server restarts never duplicate records.

### Environment Setup (`server/.env` and `.env`)
Configure your active `.env` file with your MongoDB Atlas connection URI:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
AUTO_SEED=true

# MongoDB Atlas Cloud Cluster
MONGODB_URI=mongodb+srv://<username>:<password>@cluster01.dkbwqrk.mongodb.net/nexus?retryWrites=true&w=majority

# Or Local MongoDB Community Service
# MONGODB_URI=mongodb://127.0.0.1:27017/nexus
```

---

## 🔌 5. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check reporting service status and persistent MongoDB confirmation |
| `GET` | `/api/stats` | Aggregates total projects, active projects, tasks, and overall completion rate |
| `GET` | `/api/projects` | Retrieves projects with task counts and filter support (`status`, `priority`, `search`) |
| `GET` | `/api/projects/:id` | Retrieves a single project with populated child tasks |
| `POST` | `/api/projects` | Creates a new project in MongoDB Atlas with payload validation |
| `PUT` | `/api/projects/:id` | Updates an existing project in MongoDB Atlas |
| `DELETE` | `/api/projects/:id` | Deletes a project and **cascades deletion** to all associated tasks |
| `GET` | `/api/tasks` | Retrieves tasks with filter support (`project`, `status`, `priority`, `search`) |
| `GET` | `/api/tasks/:id` | Retrieves a single task with populated project details |
| `POST` | `/api/tasks` | Creates a task and recalculates parent project progress in MongoDB Atlas |
| `PUT` | `/api/tasks/:id` | Updates task status or details and recalculates progress |
| `DELETE` | `/api/tasks/:id` | Removes task from MongoDB Atlas and recalculates parent progress |

---

## 🎨 6. Light Premium UI Design System

The application strictly implements the requested modern SaaS aesthetic:

```css
:root {
  --color-background: #F6F8FB;       /* Crisp light-gray canvas */
  --color-surface: #FFFFFF;          /* Pure white card surfaces */
  --color-surface-soft: #F0F3F8;     /* Soft background tints */

  --color-primary: #4F46E5;          /* Indigo action color */
  --color-primary-hover: #4338CA;

  --color-secondary: #7C3AED;        /* Violet accent */
  --color-accent: #06B6D4;           /* Cyan micro-highlights */

  --color-heading: #172033;          /* Dark navy/slate headings */
  --color-text: #475569;             /* Crisp readable body */
  --color-muted: #94A3B8;            /* Secondary labels */

  --color-border: #E2E8F0;           /* Subtle card borders */

  --color-success: #16A34A;          /* Emerald completed state */
  --color-warning: #D97706;          /* Amber medium/warning state */
  --color-danger: #DC2626;           /* Red danger/high priority */

  --color-shadow: rgba(15, 23, 42, 0.08); /* Soft ambient card shadow */
}
```

---

## 🚀 7. Installation & Launch Instructions

### Prerequisites
- Node.js (version 18 or newer, tested on Node.js v24.16.0)
- npm (version 9 or newer)
- Active internet access for MongoDB Atlas cloud connectivity

### Step 1: Install Dependencies
From the project root:
```powershell
cd "D:\Codveda Tech Intern\Level-3-Advanced\NEXUS-Project-Manager"
npm run install:all
```

### Step 2: Configure Environment
Ensure `server/.env` (and root `.env`) has your MongoDB Atlas URI:
```powershell
# In server/.env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster01.dkbwqrk.mongodb.net/nexus?retryWrites=true&w=majority
```

### Step 3: Start the Backend Server
```powershell
cd "D:\Codveda Tech Intern\Level-3-Advanced\NEXUS-Project-Manager\server"
npm run dev
# -> Output:
# 📡 [NEXUS DATABASE] Connecting to persistent MongoDB: mongodb+srv://***:***@cluster01...
# ✅ [NEXUS DATABASE] Connected successfully to host: ac-1ko4kuw-shard-00-01.dkbwqrk.mongodb.net
# 🚀 [NEXUS SERVER] Running on port 5000 (0.0.0.0)
```

### Step 4: Start the Frontend Application (In a Second Terminal)
```powershell
cd "D:\Codveda Tech Intern\Level-3-Advanced\NEXUS-Project-Manager\client"
npm run dev
# -> Opens on http://localhost:5173/
```

---

## 🧪 8. How to Verify MongoDB Atlas Persistence

You can verify genuine cloud persistence during your internship evaluation with this step-by-step walkthrough:

1. **Verify Startup:** Start the backend. Observe that Mongoose connects directly to your Atlas cluster with masked credentials:
   ```text
   📡 [NEXUS DATABASE] Connecting to persistent MongoDB: mongodb+srv://***:***@cluster01.dkbwqrk.mongodb.net/nexus?retryWrites=true&w=majority...
   ✅ [NEXUS DATABASE] Connected successfully to host: ac-1ko4kuw-shard-00-01.dkbwqrk.mongodb.net
   ```
2. **Create a Project:** In the web UI (`http://localhost:5173`), click **"+ New Project"**, enter `"Global Supply Chain Optimizer"`, set priority to `"High"`, and click **Create Project**.
3. **Verify Creation:** The project appears instantly in the Projects view with an ObjectId generated by MongoDB Atlas.
4. **Create a Task:** Click **"+ New Task"**, assign it to the created project, and set status to `"Completed"`. Observe that the parent project's progress recalculates to **`100%`** dynamically.
5. **Restart Server:** In your backend terminal, press `Ctrl+C` to completely kill the Express server. Then restart it:
   ```powershell
   npm run dev
   ```
   Notice the log: `[NEXUS DATABASE] Existing data detected. Auto-seed skipped.`
6. **Verify Persistence:** Refresh your browser at `http://localhost:5173/`. Notice that `"Global Supply Chain Optimizer"` and its task **still exist exactly as created with 100% progress**.
7. **Delete Project & Verify Cascading:** Click the trash icon, confirm deletion. Both the project and its associated task are permanently removed from Atlas.

---

## 🛡️ 9. Security & Error Handling

- **Helmet Security Headers:** Protects against MIME-type sniffing (`nosniff`), clickjacking (`SAMEORIGIN`), and cross-site scripting.
- **Strict CORS Protection:** Only allows configured client origins (`http://localhost:5173`).
- **Credential Protection:** Passwords and usernames in MongoDB URIs are masked in logs (`***:***@`), and `.env` is excluded in `.gitignore`.
- **Fail-Safe Centralized Error Handler:** Converts Mongoose `CastError`, `ValidationError`, and duplicate key errors (`11000`) into safe, structured JSON responses without exposing internal server stack traces.
- **Vite Proxy Error Guard:** Returns a clean `503 Service Unavailable` JSON response with clear instructions if the backend server is stopped.
