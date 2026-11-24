# 📝 My Notes — Clerk + React + Vite

A simple personal notes app with **user authentication** powered by [Clerk](https://clerk.com). Each user gets their own private notes stored in the browser's localStorage.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19.3.1 | UI framework — components, hooks, JSX |
| [Vite](https://vite.dev) | 6.4.6 | Dev server with hot reload and production bundler |
| [TypeScript](https://www.typescriptlang.org) | 5.7.3 | Static type checking for `.tsx` / `.ts` files |
| [Clerk React SDK](https://clerk.com/docs) | 6.19.5 | Authentication — sign-up, sign-in, user sessions |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | 4.x | Vite plugin for React JSX transform and fast refresh |
| Node.js | 24.18.0 | JavaScript runtime (minimum required: v20.9.0) |
| npm | (bundled) | Package manager — installs dependencies locally |

---

## Project Structure

```
d:\Logcheck\
├── index.html            # Vite entry point — loads src/main.tsx
├── package.json          # Dependencies and npm scripts
├── tsconfig.json         # TypeScript compiler configuration
├── vite.config.ts        # Vite build configuration with React plugin
├── vite-env.d.ts         # Type declarations for import.meta.env
├── .env.local            # Clerk publishable key (not committed to git)
├── node_modules/         # Installed packages (local to this project)
└── src/
    ├── main.tsx          # App bootstrap — ClerkProvider wraps the app
    ├── app.tsx           # Main layout — header, auth buttons, notes
    ├── app.css           # Styles for layout, buttons, list items
    ├── notes.tsx         # Notes component — add, delete, per-user storage
    └── index.css         # Global base styles (reset, font, background)
```

---

## How to Run

### Prerequisites

- **Node.js v20.9.0 or higher** — check with `node -v`
- A **Clerk account** with a publishable key — get one at [clerk.com](https://clerk.com)

### Steps

```powershell
# 1. Navigate to the project
d:
cd \Logcheck

# 2. Install dependencies (if not already done)
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Environment Variables

The file `.env.local` must contain your Clerk publishable key:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
```

> ⚠️ The key must start with `pk_`. If it starts with `sk_`, that is the **secret key** — replace it with the **publishable key** from your [Clerk Dashboard](https://dashboard.clerk.com).

If you change `.env.local`, stop the app with `Ctrl + C` and run `npm run dev` again.

---

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server at http://localhost:5173 |
| `npm run build` | Type-checks with `tsc` then builds for production |
| `npm run preview` | Previews the production build locally |

---

## Errors Encountered and How They Were Fixed

This section documents every error we hit during setup and the exact fix applied.

---

### Error 1 — Wrong Clerk Component API (TS2305 / Runtime)

**What happened:**
The original `src/app.tsx` used `<Show when="signed-in">` and `<Show when="signed-out">`, importing `Show` from `@clerk/react`. But the initial `package.json` specified `@clerk/react` **v5**, which does **not** export `Show`. The `Show` component was introduced in **v6**.

**Error messages:**
```
Cannot find module '@clerk/react' or its corresponding type declarations.
```
(This was a compound error — partly the missing `node_modules`, partly the wrong version.)

**Initial fix (v5 workaround):**
Replaced `Show` with `SignedIn` / `SignedOut`, which are the v5 equivalents:

```diff
- import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
+ import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/react'

- <Show when="signed-out">
+ <SignedOut>
    <SignInButton />
    <SignUpButton />
- </Show>
+ </SignedOut>

- <Show when="signed-in">
+ <SignedIn>
    <UserButton />
- </Show>
+ </SignedIn>
```

**Final fix (v6 upgrade):**
Later upgraded to `@clerk/react@latest` (v6.19.5) and reverted the code back to the original `Show` syntax, which is Clerk's current recommended API:

```bash
npm install @clerk/react@latest
```

```tsx
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

<Show when="signed-out"> ... </Show>
<Show when="signed-in"> ... </Show>
```

---

### Error 2 — Empty `package.json` (All "Cannot find module" Errors)

**What happened:**
The `package.json` file was **completely empty** (0 bytes). No dependencies were declared, so there was nothing to install.

**Error messages this caused:**
```
TS2307: Cannot find module 'react' or its corresponding type declarations.
TS2307: Cannot find module 'react-dom/client' or its corresponding type declarations.
TS2307: Cannot find module '@clerk/react' or its corresponding type declarations.
TS2875: This JSX tag requires the module path 'react/jsx-runtime' to exist, but none could be found.
TS7026: JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.
```

**Fix:**
Created a proper `package.json` with all required dependencies:

```json
{
  "name": "logcheck",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@clerk/react": "^5.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.4.0",
    "typescript": "~5.7.0",
    "vite": "^6.0.0"
  }
}
```

(Later updated `@clerk/react` from `^5.0.0` to `^6.19.5` via `npm install @clerk/react@latest`.)

---

### Error 3 — Missing `node_modules/` (No Dependencies Installed)

**What happened:**
Even after creating `package.json`, no packages were installed — the `node_modules/` folder did not exist.

**Error messages:**
Same as Error 2 — all "Cannot find module" errors persisted until install.

**Fix:**
```bash
npm install
```

This installed 79 packages locally into `d:\Logcheck\node_modules\`. These packages are **project-local** — they do not affect any other project on the system.

---

### Error 4 — Missing `tsconfig.json` (TypeScript Has No Configuration)

**What happened:**
TypeScript had no configuration file, so it didn't know how to handle JSX, what module system to use, or which files to include.

**Error messages:**
```
TS2339: Property 'env' does not exist on type 'ImportMeta'.
TS2875: This JSX tag requires the module path 'react/jsx-runtime' to exist...
TS7026: JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.
```

**Fix:**
Created `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src", "vite-env.d.ts"]
}
```

Key settings:
- `"jsx": "react-jsx"` — enables the modern JSX transform (no need to `import React` in every file)
- `"moduleResolution": "bundler"` — resolves modules the way Vite does
- `"lib": ["DOM", ...]` — provides browser API types like `document`, `localStorage`

---

### Error 5 — Missing `vite.config.ts` (Vite Has No Build Configuration)

**What happened:**
Vite needs a config file to know it should use the React plugin for JSX processing.

**Fix:**
Created `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

---

### Error 6 — Missing `vite-env.d.ts` (`import.meta.env` Not Recognized)

**What happened:**
`main.tsx` uses `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` to read the environment variable, but TypeScript didn't know about Vite's `import.meta.env` type extensions.

**Error message:**
```
TS2339: Property 'env' does not exist on type 'ImportMeta'.
```

**Fix:**
Created `vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

This single line tells TypeScript to include Vite's type definitions, which extend `ImportMeta` with the `env` property.

---

### Error 7 — Missing `index.html` (Vite Has No Entry Point)

**What happened:**
Vite uses `index.html` as its entry point (not a JavaScript file like Webpack). Without it, `npm run dev` would fail.

**Fix:**
Created `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Notes</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- `<div id="root">` — React mounts the app here via `createRoot(document.getElementById('root')!)`
- `<script type="module" src="/src/main.tsx">` — Vite processes this as the app entry

---

### Error 8 — Missing `src/index.css` (Imported File Doesn't Exist)

**What happened:**
`main.tsx` has `import './index.css'` on line 3, but the file didn't exist.

**Fix:**
Created `src/index.css` with basic global styles:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f9f9f9;
  color: #333;
}
```

---

### Error 9 — File Casing Mismatch in Imports (TS1149 / TS1261)

**What happened:**
Windows file system is case-insensitive, but TypeScript is case-sensitive for imports. Two imports had the wrong casing compared to the actual filenames on disk.

**Error messages:**
```
TS1149: File name 'd:/Logcheck/src/App.tsx' differs from already included file name
        'd:/Logcheck/src/app.tsx' only in casing.

TS1261: Already included file name 'D:/Logcheck/src/Notes.tsx' differs from file name
        'D:/Logcheck/src/notes.tsx' only in casing.
```

**Fix A — `main.tsx` line 4:**
```diff
- import App from './App.tsx'
+ import App from './app.tsx'
```
The file on disk is `app.tsx` (lowercase), not `App.tsx`.

**Fix B — `app.tsx` line 3:**
```diff
- import Notes from './Notes'
+ import Notes from './notes'
```
The file on disk is `notes.tsx` (lowercase), not `Notes.tsx`.

---

## Summary of All Changes Made

### Files Created (6 new files)

| File | Purpose |
|---|---|
| `package.json` | Overwrote the empty file with dependencies and scripts |
| `tsconfig.json` | TypeScript compiler configuration |
| `vite.config.ts` | Vite build config with React plugin |
| `vite-env.d.ts` | Type declarations for `import.meta.env` |
| `index.html` | Vite entry point with root div and script tag |
| `src/index.css` | Global base styles |

### Files Modified (2 files)

| File | Change |
|---|---|
| `src/app.tsx` | Fixed Clerk components (initially v5 workaround, then restored `Show` for v6), fixed import casing |
| `src/main.tsx` | Fixed import casing (`./App.tsx` → `./app.tsx`) |

### Files Not Touched (3 files)

| File | Status |
|---|---|
| `src/app.css` | Already correct |
| `src/notes.tsx` | Already correct |
| `.env.local` | Already had the Clerk publishable key |

---

## Quick Test Checklist

After running the app:

1. ✅ Sign up as **User A** and add 2 notes
2. ✅ Sign out — notes are hidden, "Please sign in" message shows
3. ✅ Sign up as **User B** — you see no notes (each user has their own)
4. ✅ Sign in as **User A** — your original notes are back

---

## Notes

- Dependencies are installed **locally** in `node_modules/` — they do not affect other projects.
- Notes are stored in `localStorage` keyed by Clerk user ID (`notes_{userId}`), so each user's notes are private to their browser.
- The `.env.local` file should **never** be committed to git — add it to `.gitignore`.
