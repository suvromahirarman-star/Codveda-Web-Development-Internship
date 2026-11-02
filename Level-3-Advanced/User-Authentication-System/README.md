# AUTHGUARD — User Authentication System
### Codveda Web Development Internship — Level 3 (Advanced), Task 2

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19+-000000?style=flat&logo=express&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Cluster01-47A248?style=flat&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-8.3+-880000?style=flat&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-HS256-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![bcryptjs](https://img.shields.io/badge/bcryptjs-10_Salt_Rounds-blue?style=flat)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=flat&logo=vite&logoColor=white)

---

## 📸 Visual Preview

![Application Preview](../../screenshots/level-3/user-authentication-system.png)

---

## 1. Project Overview & Official Objectives

AUTHGUARD is a production-inspired, full-stack user authentication system developed for **Codveda Tech Internship — Level 3 Advanced, Task 2**. The system provides end-to-end authentication, role-based authorization, cryptographic password hashing, stateless session management via JSON Web Tokens (JWT), and persistent cloud storage on MongoDB Atlas.

### Official Objectives Fulfilled:
1. **User Registration & Login Functionality**: Complete backend authentication server with Express, validating input credentials and authenticating against persistent cloud database records.
2. **Stateless Session Management via JWT**: Signed cryptographic tokens (HMAC-SHA256) managing user sessions, containing identity claims and token version identifiers.
3. **Route Security & Password Hashing**: Sensitive routes protected with Bearer token authentication middleware; passwords hashed using `bcrypt` (10 salt rounds) with a strict single-hash guarantee.

---

## 2. System Architecture & Component Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEMONSTRATION FRONTEND                             │
│       React 18 SPA + Vite (Modern SaaS Dashboard, Port 5173)                │
│                                                                             │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ Registration & Meter  │  │ Login & Demo Fill    │  │ Live JWT Claims  │  │
│  │ Password Strength     │  │ Sanitized Inputs     │  │ Inspector Widget │  │
│  └───────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ AuthContext: In-Memory State + sessionStorage Synchronizer            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Bearer Authorization (JWT)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            REST API BACKEND                                 │
│               Node.js + Express Server (Port 5000)                          │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Security Headers (Helmet) + CORS Policy + IP Rate Limiter             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐  │
│  │ Input Validation       │  │ Token Verification  │  │ Role Auth (RBAC) │  │
│  │ Email Regex / Min 8    │  │ protect Middleware  │  │ authorize(admin) │  │
│  └────────────────────────┘  └─────────────────────┘  └──────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Centralized Error Handler (MongoDB 11000 duplicate email -> 409)      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Mongoose ODM (auth_system DB)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PERSISTENT DATABASE STORAGE                             │
│                  MongoDB Atlas Cloud Cluster (M0 Free)                      │
│                                                                             │
│  User Document:                                                             │
│  • name, email (unique index), password (bcrypt hash, select: false)        │
│  • role (user | admin), tokenVersion (int), lastLoginAt, createdAt          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Seven Architectural Security Directives

### Directive 1 — Zero Role Escalation on Registration
- **Vulnerability Prevented**: Attackers passing `{ "role": "admin" }` in registration payloads to self-assign administrative privileges.
- **Implementation**: The registration controller hardcodes `role: 'user'` and discards any client-supplied role:
  ```javascript
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: 'user', // Forced default; client input ignored
  });
  ```

### Directive 2 — Token Storage Strategy & Trade-off Analysis
- **Chosen Architecture**: Primary state resides in React memory (`AuthContext`); synchronized with browser `sessionStorage` for persistence across tab reloads during evaluation.
- **Trade-off Analysis**:
  | Strategy | XSS Exposure | CSRF Vulnerability | Lifetime Scope |
  | :--- | :--- | :--- | :--- |
  | `localStorage` | High (Readable by injected scripts) | Immune (Requires header) | Permanent until manual clear |
  | **`sessionStorage` (Chosen)** | **Medium (Scoped to single browser tab)** | **Immune (Requires Bearer header)** | **Cleared on tab/window close** |
  | `HttpOnly` Cookies | Low (Inaccessible to JS) | High (Requires CSRF tokens) | Configurable via Set-Cookie |
- **Decision Rationale**: For client-side single-page applications consuming decoupled REST APIs, Bearer tokens with `sessionStorage` eliminate CSRF attacks completely while avoiding indefinite persistent storage on shared evaluation computers.

### Directive 3 — Session Invalidation on Password Changes
- **Vulnerability Prevented**: Compromised credentials allowing attackers with already-issued JWTs to stay authenticated indefinitely after the user resets their password.
- **Implementation**:
  1. Each User document contains a `tokenVersion` integer.
  2. The JWT payload encodes `{ id, role, tokenVersion }`.
  3. When changing passwords, the backend increments `tokenVersion`:
     ```javascript
     user.tokenVersion += 1;
     user.password = newPassword;
     await user.save();
     ```
  4. The `protect` middleware compares the decoded token version against the user's current version in MongoDB Atlas. If `decoded.tokenVersion !== user.tokenVersion`, the request is immediately rejected with `401 Unauthorized` and reason `SESSION_INVALIDATED_PASSWORD_CHANGED`.
  5. A fresh token with the new `tokenVersion` is returned to the active user.

### Directive 4 — Role Immutability on Profile Updates
- **Vulnerability Prevented**: Attackers updating their profile via `PUT /api/auth/profile` and attempting to change their role to `admin`.
- **Implementation**: The update controller explicitly whitelists only `name` and `email`:
  ```javascript
  if (req.body.name) user.name = req.body.name.trim();
  if (req.body.email) user.email = req.body.email.toLowerCase().trim();
  // req.body.role is completely ignored
  ```

### Directive 5 — Safe Duplicate Email Collision Handling
- **Implementation**: Two-tier protection:
  1. Proactive lookup in `registerUser` via `User.findOne({ email })`.
  2. Centralized fallback in `errorHandler.js` catching MongoDB E11000 duplicate key errors:
     ```javascript
     if (err.code === 11000) {
       return res.status(409).json({
         success: false,
         error: 'An account with this email address already exists. Please sign in instead.',
       });
     }
     ```

### Directive 6 — Single Canonical Backend Environment
- **Security Policy**: All secrets reside strictly in `server/.env`.
- **Git Safeguards**: The root `.gitignore` contains recursive ignore rules (`**/.env`, `**/.env.*`) with safe whitelist overrides for templates (`!.env.example`, `!**/.env.example`).
- **Log Masking**: Database connection logs mask credentials (`mongodb+srv://***:***@...`).

### Directive 7 — Cryptographic Single-Hash Guarantee
- **Vulnerability Prevented**: Double-hashing passwords (which corrupts authentication) or hashing passwords manually in controllers before model hooks execute.
- **Implementation**: Password hashing is strictly isolated in the Mongoose `pre('save')` lifecycle hook:
  ```javascript
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  ```
  Controllers never invoke `bcrypt.hash()` directly. Automated tests verified that the stored string is exactly 60 characters and starts with `$2a$` or `$2b$`.

---

## 4. Project Directory Structure

```
User-Authentication-System/
├── .env.example                       # Root sanitized environment template
├── .gitignore                         # Comprehensive recursive secrets exclusion
├── package.json                       # Monorepo orchestration scripts
├── README.md                          # Full system documentation
│
├── server/                            # Node.js + Express Backend
│   ├── .env                           # Canonical active backend environment (Git-ignored)
│   ├── .env.example                   # Server sanitized environment template
│   ├── package.json                   # Backend dependencies & startup scripts
│   ├── server.js                      # Entrypoint: connects Atlas then binds 0.0.0.0:5000
│   ├── app.js                         # Express configuration, Helmet, CORS, Rate Limiters
│   ├── config/
│   │   └── db.js                      # Strict Mongoose MongoDB Atlas connector with masking
│   ├── models/
│   │   └── User.js                    # Mongoose User schema, pre-save hash hook, matchPassword
│   ├── controllers/
│   │   └── authController.js          # Register, Login, Me, Profile, PasswordChange, Admin
│   ├── middleware/
│   │   ├── authMiddleware.js          # protect (JWT verification & tokenVersion) & authorize (RBAC)
│   │   ├── validateAuth.js            # Input validation (email regex, password length)
│   │   └── errorHandler.js            # Centralized error handler (MongoDB 11000 -> 409)
│   ├── routes/
│   │   └── authRoutes.js              # REST route definitions
│   └── utils/
│       └── generateToken.js           # Signs JWT with id, role, tokenVersion, exp
│
└── client/                            # React 18 + Vite Demonstration Frontend
    ├── index.html                     # HTML root template with Plus Jakarta Sans & Inter
    ├── package.json                   # Frontend dependencies
    ├── vite.config.js                 # Dev server configuration with /api proxy to port 5000
    ├── public/
    │   └── favicon.svg                # AUTHGUARD shield logo
    └── src/
        ├── main.jsx                   # React root mount with AuthProvider
        ├── App.jsx                    # Application shell, view manager, toast orchestrator
        ├── styles.css                 # Modern light SaaS design system (responsive, accessible)
        ├── context/
        │   └── AuthContext.jsx        # Auth state, sessionStorage sync, live JWT decoder
        ├── services/
        │   └── api.js                 # Centralized fetch client attaching Bearer headers
        ├── components/
        │   ├── Navbar.jsx             # Top bar, identity pill, role badge, sign out
        │   ├── Toast.jsx              # Accessible status/alert notifications
        │   └── ProtectedRoute.jsx     # Client-side route & role guard
        └── pages/
            ├── LoginPage.jsx          # Sign-in form with evaluator quick-fill button
            ├── RegisterPage.jsx       # Registration form with 5-point password strength meter
            └── DashboardPage.jsx      # Account overview, JWT inspector, RBAC tester, profile edit
```

---

## 5. REST API Documentation

### Base URL: `http://localhost:5000/api`

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Public | System status and persistent database connectivity check |
| `/auth/register` | `POST` | Public | Register new user account (`role` forced to `'user'`) |
| `/auth/login` | `POST` | Public | Authenticate user credentials and return Bearer JWT |
| `/auth/me` | `GET` | Protected | Retrieve current authenticated user profile |
| `/auth/profile` | `PUT` | Protected | Update profile name and email (`role` is immutable) |
| `/auth/change-password` | `PUT` | Protected | Update password, increment `tokenVersion`, invalidate prior sessions |
| `/auth/admin-only` | `GET` | Admin Only | Protected route requiring `admin` role |

---

## 6. Demonstration Frontend Highlights

1. **Password Strength Meter**: Real-time evaluation of password complexity across 5 criteria (minimum 8 chars, lowercase, uppercase, digit, symbol) with animated progress bar and color grading.
2. **Evaluator Quick-Fill**: One-click demo credential filler on the login page for rapid review during internship evaluation.
3. **Live JWT Claims Inspector**: Decodes and displays the active token payload (`id`, `role`, `tokenVersion`, `iat`, `exp`) inside a syntax-highlighted widget.
4. **Interactive RBAC Tester**: Live testing button on the dashboard allowing evaluators to verify that standard users receive an HTTP `403 Forbidden` when attempting to access `/api/auth/admin-only`.
5. **Session Revocation Demonstration**: Allows evaluators to change their password and watch `tokenVersion` increment, demonstrating cryptographic session invalidation.

---

## 7. Setup & Execution Guide

### Prerequisites
- Node.js version 18 or higher
- Internet connection (to access the MongoDB Atlas cluster)

### Step 1 — Clone / Navigate to Project Directory
```powershell
cd "D:\Codveda Tech Intern\Level-3-Advanced\User-Authentication-System"
```

### Step 2 — Configure Environment Secrets
Ensure `server/.env` is configured with your MongoDB Atlas cluster URI and JWT secret:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster01.dkbwqrk.mongodb.net/auth_system?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_high_entropy_jwt_key_min_32_chars
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Step 3 — Install Dependencies
```powershell
# From the project root:
npm run install:all
```

### Step 4 — Run Backend & Frontend Concurrently
```powershell
# Terminal 1: Backend Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Client (Port 5173)
npm run dev:client
```
Visit `http://localhost:5173` in your browser.

---

## 8. Automated Testing & QA Verification

The backend was tested against live MongoDB Atlas with 35 automated test cases:

```
====================================================
USER AUTHENTICATION SYSTEM — AUTOMATED BACKEND TEST
====================================================
📡 [AUTH DATABASE] Connecting to persistent MongoDB: mongodb+srv://***:***@cluster01.dkbwqrk.mongodb.net/auth_system...
✅ [AUTH DATABASE] Connected successfully to host: ac-1ko4kuw-shard-00-02.dkbwqrk.mongodb.net
   Database Name: auth_system

--- 1. Health Check Endpoint ---
  ✅ PASS: Health returns 200
  ✅ PASS: Reports persistent MongoDB Atlas

--- 2. Registration & Mass-Assignment Defense ---
  ✅ PASS: Registration returns 201
  ✅ PASS: Registration returns valid token
  ✅ PASS: DIRECTIVE 1: User role forced to "user" (admin rejected)

--- 3. Single-Hash Guarantee in Atlas ---
  ✅ PASS: DIRECTIVE 7: Password hash exists in Atlas
  ✅ PASS: DIRECTIVE 7: Password hash starts with $2a$ or $2b$
  ✅ PASS: DIRECTIVE 7: Password hash is exactly 60 chars
  ✅ PASS: DIRECTIVE 7: bcrypt.compare matches plaintext password (single hash verified)

--- 4. Duplicate Email Error Handling ---
  ✅ PASS: DIRECTIVE 5: Duplicate email returns 409 Conflict
  ✅ PASS: DIRECTIVE 5: Error message is informative

--- 5. Registration Validation ---
  ✅ PASS: Password < 8 chars returns 400
  ✅ PASS: Invalid email regex returns 400

--- 6. Login Endpoint ---
  ✅ PASS: Login with correct password returns 200
  ✅ PASS: Login returns JWT token
  ✅ PASS: Login with wrong password returns 401
  ✅ PASS: Generic timing-safe error message
  ✅ PASS: Login with unknown email returns 401
  ✅ PASS: Generic timing-safe error message

--- 7. Protected Route (GET /api/auth/me) ---
  ✅ PASS: GET /api/auth/me returns 200 with valid token
  ✅ PASS: Returns current user profile
  ✅ PASS: Password is not included in profile
  ✅ PASS: GET /api/auth/me without token returns 401
  ✅ PASS: GET /api/auth/me with bad token returns 401

--- 8. Profile Update & Role Escalation Defense ---
  ✅ PASS: Update profile returns 200
  ✅ PASS: Name updated successfully
  ✅ PASS: DIRECTIVE 4: Role remains "user" (role escalation blocked)

--- 9. Password Change & Session Invalidation ---
  ✅ PASS: Change password returns 200
  ✅ PASS: Returns fresh token B
  ✅ PASS: DIRECTIVE 3: Old token A is rejected with 401 after password change
  ✅ PASS: DIRECTIVE 3: Message indicates session expired due to password change
  ✅ PASS: New token B is valid (200 OK)
  ✅ PASS: Login with new password succeeds (200 OK)
  ✅ PASS: Login with old password fails (401 Unauthorized)

--- 10. Role-Based Access Control (Admin Guard) ---
  ✅ PASS: User role accessing admin route returns 403 Forbidden

✅ Test user cleaned up from MongoDB Atlas.

====================================================
TEST SUMMARY: 35 Passed, 0 Failed
====================================================
```

### Production Build Verification:
```
vite v5.4.21 building for production...
transforming...
✓ 38 modules transformed.
rendering chunks...
dist/index.html                   1.00 kB │ gzip:  0.56 kB
dist/assets/index-DJSugGRS.css   13.60 kB │ gzip:  3.31 kB
dist/assets/index-B2lmYlLN.js   171.71 kB │ gzip: 53.02 kB
✓ built in 753ms (0 errors, 0 warnings)
```

