# 🔥 Lock In — The No-Cap Productivity Suite

An interactive, all-in-one personal productivity workspace featuring **Rich Notes**, an **Interactive To-Do Checklist**, and a **Smart Calendar & Events Manager**. Powered by [Clerk](https://clerk.com) for authentication and built with **React 19**, **Vite**, and **TypeScript**.

Each user gets their own private workspace stored safely per-account in the browser's `localStorage`.

---

## 🚀 Features

### 1. 📝 Rich Notes & Thoughts
- **Title & Multi-line Content**: Create comprehensive notes with clear titles and details.
- **Color-Coded Tags**: Organize by **Ideas** (Amber), **Work** (Blue), **Personal** (Green), or **Urgent** (Red).
- **Tag Filtering Bar & Instant Search**: Quickly filter by tag or search by keyword in real time.
- **Pinning & Hover Actions**: Pin important notes to the top. Edit and delete controls appear smoothly on hover to keep the interface uncluttered.
- **Modern Grid Layout**: Auto-adapting responsive card grid.

### 2. ✅ Interactive To-Do Checklist
- **Real-Time Progress Tracker**: Dynamic progress bar displaying completion percentage.
- **Priority Badges**: Set and visualize tasks as **Low**, **Medium**, or **High** priority.
- **Due Dates & Status Filters**: Assign due dates and filter between *All*, *Active*, and *Completed* tasks.
- **Quick Strike-through**: Interactive checkboxes with instant completion state.

### 3. 📅 Smart Calendar & Events
- **Interactive Month Grid**: Navigate between months with a quick "Today" reset button.
- **Event Dots**: Visual indicators for days with scheduled items.
- **Day Event Manager Sidebar**: Click any calendar day to inspect, add, or delete events, deadlines, meetings, and reminders.

### 4. 🎨 Design & Theme
- **iET SA Palette**: Clean, energetic Orange (`#ff6f29`), crisp calming Blue (`#2563eb`), and high-contrast cards.
- **Light & Dark Mode**: Persistent toggle with full theme styling across all pages.
- **Fully Responsive**: Adapts seamlessly to desktop, tablet, and mobile screens.

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
├── index.html            # Vite entry point
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript compiler config
├── vite.config.ts        # Vite build & plugin config
├── vite-env.d.ts         # Vite client type definitions
├── .env.local            # Clerk publishable key (ignored by Git)
├── .gitignore            # Git ignore rules for node_modules, dist, .env
└── src/
    ├── main.tsx          # App entry with ClerkProvider
    ├── app.tsx           # App shell with tab navigation & auth guards
    ├── app.css           # Styling for tabs, grid, notes, todos, & calendar
    ├── index.css         # Theme tokens (iET SA palette) & base reset
    ├── notes.tsx         # Notes component (grid, tags, search, pin)
    ├── todos.tsx         # To-Do component (checklists, progress, priorities)
    └── calendar.tsx      # Calendar component (month grid & day scheduler)
```

---

## ⚡ How to Run Locally

### 1. Prerequisites
- **Node.js**: v20.9.0 or higher (`node -v`)
- **Clerk Account**: Free API keys from [clerk.com](https://clerk.com)

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```
*(Make sure to use the **Publishable Key** starting with `pk_`, not the Secret Key `sk_`)*.

### 3. Install & Start
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts the local dev server with hot reload |
| `npm run build` | Runs TypeScript type checking (`tsc -b`) and builds production bundles |
| `npm run preview` | Previews the production build locally |

---

## 🛡️ Security & Git Best Practices

The repository includes a comprehensive [.gitignore](file:///d:/Logcheck/.gitignore) ensuring secrets and build artifacts stay private:
- ❌ `.env.local` and environment secrets are never committed.
- ❌ `node_modules/` and `dist/` are ignored.
- Only source code and project configuration are tracked.
