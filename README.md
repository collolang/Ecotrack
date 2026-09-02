# EcoTrack Frontend

React + Vite + Tailwind CSS frontend for the EcoTrack Carbon Footprint Tracker.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd ecotrack-frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend URL
```
Default: `VITE_API_URL=http://localhost:3000/api`

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

> **Note:** Make sure your EcoTrack backend is running on port 3000 first.

---

## 📁 Project Structure

```
ecotrack-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   └── ui.jsx             # Shared UI primitives (Button, Card, Input…)
│   ├── context/
│   │   ├── AuthContext.jsx    # JWT auth state + login/logout
│   │   └── ToastContext.jsx   # Global toast notifications
│   ├── pages/
│   │   ├── Landing.jsx        # Public landing page
│   │   ├── Auth.jsx           # Login + Register (tabbed)
│   │   ├── Dashboard.jsx      # Dashboard shell with sidebar routing
│   │   ├── DashboardPanel.jsx # Analytics: charts, metrics, recommendations
│   │   ├── CompanyProfile.jsx # View/edit company profile
│   │   ├── DataEntry.jsx      # Full CRUD emission entries
│   │   └── Reports.jsx        # Report generator + history
│   ├── services/
│   │   └── api.js             # All API calls + auto JWT refresh
│   ├── utils/
│   │   └── carbonCalculator.js # Emission factor calculations
│   ├── App.jsx                # Router + auth guards
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind + global styles
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🔌 Backend API Compatibility

This frontend is built to work with the EcoTrack Express backend. It calls:

| Endpoint | Used In |
|----------|---------|
| `POST /api/auth/register` | Auth page — Register |
| `POST /api/auth/login` | Auth page — Login |
| `POST /api/auth/refresh` | Auto token refresh (transparent) |
| `POST /api/auth/logout` | Sidebar logout button |
| `GET /api/auth/me` | Session restore on page reload |
| `GET/PUT /api/company/profile` | Company Profile page |
| `GET/POST /api/emissions` | Data Entry — list + create |
| `PUT/DELETE /api/emissions/:id` | Data Entry — edit + delete |
| `GET /api/emissions/monthly` | Dashboard chart |
| `GET /api/emissions/breakdown` | Dashboard pie chart |
| `GET /api/emissions/total` | Dashboard metric card |
| `GET /api/emissions/yearly` | Dashboard bar chart |
| `GET /api/reports` | Reports page |
| `GET /api/reports/history` | Reports history sidebar |

JWT access tokens are stored in `localStorage` and automatically refreshed using the refresh token when they expire (transparent to the user).

---

## 🎨 Tech Stack

- **React 18** — UI library
- **React Router v6** — Client-side routing
- **Recharts** — Charts (line, area, bar, pie)
- **Tailwind CSS 3** — Utility-first styling
- **Lucide React** — Icons
- **Vite** — Build tool + dev server

---

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🌍 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api` | Backend API base URL |
## Changes Made

### 1. API Service Updates (`src/services/api.js`)
**Added to `authApi` object:**
```javascript
async forgotPassword(email) {
  return apiRequest('/api/auth/forgot-password', { method: 'POST', body: { email } });
},
async resetPassword(token, password) {
  return apiRequest(`/api/auth/reset-password/${token}`, { method: 'POST', body: { password } });
},
```
- Calls backend endpoints exactly as specified
- Uses existing `apiRequest` helper with error handling and token refresh

### 2. Routing Updates (`src/App.jsx`)
**Added routes:**
```jsx
<Route path="/forgot-password" element={<Navigate to="/auth?mode=forgot" replace />} />
<Route path="/reset-password"  element={<Navigate to="/auth?mode=reset" replace />} />
```
- `/forgot-password` → `/auth?mode=forgot`
- `/reset-password?token=ABC` → `/auth?mode=reset` (token preserved)

### 3. Auth Page Implementation (`src/pages/Auth.jsx`) - Main Feature
**New Features Added:**
- **4-tab responsive switcher**: Login | Register | Forgot | Reset (grid-cols-2 md:grid-cols-4)
- **URL param handling**: `?mode=forgot/reset` auto-selects tab
- **Forgot Password tab (`tab === 'forgot'`)**:
  - Simple email input with Mail icon
  - Submit → `authApi.forgotPassword(email)` 
  - Success: Green toast + "Check inbox (15min)" message, form disabled
  - Loading state, error handling
  - "Back to Login" button
- **Reset Password tab (`tab === 'reset'`)**:
  - Token extracted from `?token=` param (validated, error if missing)
  - Password + Confirm Password fields with eye toggle
  - Full password strength indicator (reuse `validatePassword` - 5 rules with checkmarks)
  - Validation: strength + match before submit
  - Submit → `authApi.resetPassword(token, password)`
  - Success: Toast + redirect to login
  - Invalid token warning
- **Login tab update**: "Forgot Password?" now button → `/auth?mode=forgot`
- **UI Consistency**: Matches existing Tailwind design (leaf-600, rounded-xl, shadows, animations, responsive)
- **Accessibility**: Labels, focus states, disabled states, ARIA-ready

### 4. Progress Tracking (`TODO.md`)
Updated with ✅ checkboxes for all steps.

## Testing Instructions
1. `npm run dev`
2. **Forgot Password**: `/forgot-password` → Enter email → "Send Reset Link" → Success message
3. **Reset Password**: `/reset-password?token=test123` → New password → Strength indicators → Submit → Success toast → Login page
4. **Mobile**: Tabs stack 2-col on small screens
5. **Error handling**: Invalid token, network errors → Toasts + error banners

## Backend Dependencies
✅ POST `/api/auth/forgot-password` {email}
✅ POST `/api/auth/reset-password/:token` {password}