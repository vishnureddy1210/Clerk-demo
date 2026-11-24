# 🔥 Lock In — The No-Cap Productivity Suite

An interactive, all-in-one personal productivity workspace with **3D depth**, **tactile transitions**, and a clean mobile-first layout. Features **Rich Notes**, an **Interactive To-Do Checklist**, and a **Smart Calendar & Events Manager** — all powered by [Clerk](https://clerk.com) for authentication.

Each user gets their own private workspace stored per-account in the browser's `localStorage`.

---

## 🚀 Features

### 📝 Rich Notes & Thoughts
- **Title + Multi-line Content** with color-coded category tags (**Ideas**, **Work**, **Personal**, **Urgent**).
- **Tag Filtering Bar & Instant Search** — slice notes by keyword or category in real time.
- **Pinning & Hover Actions** — pin important notes to the top; Edit/Delete appear on hover to keep the UI clean.
- **3D Pointer Tilt** — note cards subtly follow your cursor with a specular light sheen, powered by CSS custom properties at 60fps with zero React re-renders.
- **Staggered 3D Card Entrance** — cards animate in with perspective depth on load and filter changes.

### ✅ Interactive To-Do Checklist
- **Dynamic Progress Bar** — real-time gradient showing completion percentage.
- **Priority Badges** — Low (Green), Medium (Amber), High (Red) with due dates.
- **Spring Checkbox Animation** — satisfying pop on task completion with smooth strike-through and fade.
- **Tactile Task Cards** — hover lift, staggered entrance, and press compression.

### 📅 Smart Calendar & Events
- **Interactive Month Grid** — navigate months with a "Today" reset; day cells pop on hover with 3D lift.
- **Color-Coded Event Dots** — visual indicators for Event, Deadline, Meeting, and Reminder types.
- **Day Event Sidebar** — click any day to view, add, or delete scheduled items with smooth entrance animations.
- **3D Month Transition** — horizontal perspective animation when switching between months.

### 🎨 Design, 3D & Interactions
- **iET SA Color Palette** — energetic Orange (`#ff6f29`), calm Blue (`#2563eb`), crisp White cards.
- **3D Tactile Buttons** — layered bottom-lip shadows with springy press compression on every interactive element.
- **Pointer-Following Tilt & Glare** — landing hero and note cards respond to mouse position with perspective rotation and radial light highlight.
- **Smooth View Transitions** — switching tabs triggers a 3D perspective entrance; editing a note flips in smoothly.
- **Light & Dark Mode** — persistent toggle with smooth color transitions across the entire UI.
- **Fully Responsive** — adapts to desktop, tablet, and mobile with touch-friendly actions always visible.
- **Accessibility** — respects `prefers-reduced-motion` to disable animations for users who need it.

### 🔥 Custom Favicon
- SVG flame icon with an orange-to-amber gradient on a dark rounded badge — crisp at any size.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19.0.0 | Component-based UI framework |
| [Vite](https://vite.dev) | 6.0.0+ | Fast build tool & hot module replacement |
| [TypeScript](https://www.typescriptlang.org) | ~5.7.0 | Strict static type checking |
| [Clerk React SDK](https://clerk.com/docs) | 6.19.5 | User authentication & session management |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | 4.4.0 | React JSX support in Vite |

---

## 📂 Project Structure

```
d:\Logcheck\
├── index.html            # Vite entry point with favicon link
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript compiler config
├── vite.config.ts        # Vite build & plugin config
├── vercel.json           # Vercel SPA rewrite rules for deployment
├── vite-env.d.ts         # Vite client type definitions
├── .env.local            # Clerk publishable key (ignored by Git)
├── .gitignore            # Git ignore rules
├── public/
│   └── favicon.svg       # Custom flame favicon
└── src/
    ├── main.tsx          # App entry with ClerkProvider
    ├── app.tsx           # App shell — header, tab navigation, auth guards
    ├── app.css           # All styling: 3D tilt, transitions, layout, responsive
    ├── index.css         # Theme tokens (iET SA palette) & base reset
    ├── tilt3d.ts         # Lightweight pointer-tilt handler (CSS variable driven)
    ├── notes.tsx         # Notes view — grid, tags, search, pin, 3D tilt cards
    ├── todos.tsx         # To-Do view — checklists, progress, priorities
    └── calendar.tsx      # Calendar view — month grid, day event sidebar
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js** v20.9.0 or higher (`node -v`)
- **Clerk Account** — free API keys from [clerk.com](https://clerk.com)

### 2. Environment Setup
Create a `.env.local` file in the project root:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```
> ⚠️ Use the **Publishable Key** (starts with `pk_`), not the Secret Key (`sk_`).

### 3. Install & Run
```bash
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts the local dev server with hot reload |
| `npm run build` | Type-checks (`tsc -b`) and builds production bundles to `dist/` |
| `npm run preview` | Serves the production build locally for testing |

---

## 🚢 Deploying to Vercel

1. Push your code to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Add the environment variable `VITE_CLERK_PUBLISHABLE_KEY` in **Settings → Environment Variables**.
4. Deploy — Vercel auto-detects Vite and uses the included `vercel.json` for SPA routing.

---

## 🛡️ Security & Git

The [.gitignore](.gitignore) ensures secrets and build artifacts stay private:
- ❌ `.env.local` and all environment files — never committed.
- ❌ `node_modules/` and `dist/` — excluded from version control.
- ✅ Only source code and project configuration are tracked.
