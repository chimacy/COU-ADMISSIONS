# CHIMACY OF UNN — Admission Brokerage Management System

A multi-device, login-protected web application for generating professional admission quotations and invoices for **University of Nigeria, Nsukka (UNN)** clients. Built with React 19, Vite, Tailwind CSS, jsPDF, and a **Supabase** backend (Postgres + Auth + Storage).

---

## ⚠️ Please read this first — the backend model

Your earlier request was for a fully offline, no-backend app. This version asks for something that's actually a different kind of system: **admin login + client data accessible from any device**. Those two things — real accounts and data that syncs across devices — require a live, always-on database somewhere. There's no way to get that with only static files sitting on Netlify.

The realistic way to give you that *without* asking you to run and maintain your own server is **Supabase** — a hosted Postgres database with built-in login/auth and file storage, on a free tier that comfortably covers this use case. The React app talks to it directly and securely (row-level security policies restrict all read/write access to logged-in admins only). You do not need to write any server code; you run one SQL script once, and everything else happens through the Supabase dashboard.

**What this means in practice:**
- ✅ Client records, pricing, rules, and settings are now stored centrally and are the same on every device, the instant any admin saves a change.
- ✅ Real admin login (email + password), created and managed by you from the Supabase dashboard.
- ✅ Branding (name, colors, logo) is permanent and identical everywhere — because it's read from the database, not from any one browser.
- ⚠️ The app now **requires an internet connection** to load/save data (it can't be fully offline anymore — that requirement is fundamentally incompatible with "accessible from any device with shared login").
- ⚠️ Supabase's free tier is genuinely free for this scale of usage (a few thousand rows, a handful of admin users), but it is Anthropic-independent, third-party infrastructure you're signing up for — not something bundled into this codebase.

If, after seeing this, you'd rather keep everything 100% offline/local and drop the multi-device requirement, say so and I'll revert to the pure `localStorage` version — the two requirements are mutually exclusive.

---

## ✨ What's new in this version

- **Admin Login** (`/login`) — email/password authentication via Supabase Auth. Only people you've explicitly given credentials to can get in.
- **Shared backend** — every client record, quotation, invoice, programme, and rule lives in a central Postgres database, not the browser. Log in from a phone, a laptop, a different office — same data.
- **Checkout & Invoices page** — see every client who is `Eligible`/`Eligible (Double Working)` and hasn't paid yet, record a payment (amount, method, date), and instantly generate an invoice/receipt PDF. Paid clients are tracked separately from quotations.
- **Dashboard payment tracking** — "Clients Paid", "Total Collected", and "Outstanding Pipeline" stat cards, plus a "Recently Paid" panel.
- **Rebranded** — "CHIMACY OF UNN" throughout (title, sidebar, login screen, PDFs, dashboard).
- **Institution locked to UNN** — the "Preferred Institution" field has been removed from client registration entirely; every quotation and invoice PDF states "University of Nigeria, Nsukka" automatically (itself editable in Settings, in case that ever needs to change).
- **White & green design** — pure white background, a full green Tailwind color scale as the default theme, glass cards tinted green instead of blue.
- **Fully configurable branding that's actually permanent** — Settings → Company Name, Institution Name, Logo, Signature, Primary/Accent Colors. Save once, and it is identical on every device, forever (until you change it again), because it's read live from the database with realtime sync — not cached per-browser.
- **Full CRUD everywhere** — add/edit/delete programmes (Pricing Database), rules (Rules page), and settings, all from the UI, all persisted centrally.

---

## 🗂 Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS (white/green theme, dark mode via `class` strategy) |
| Icons | lucide-react |
| PDF Generation | jsPDF + jspdf-autotable |
| Routing | react-router-dom (`HashRouter`) |
| **Backend** | **Supabase** — Postgres database, Auth (email/password), Storage (logo/signature uploads), Row-Level Security |
| Language | JavaScript (no TypeScript) |

---

## 🚀 One-Time Backend Setup (do this before anything else)

### 1. Create a free Supabase project
Go to [supabase.com](https://supabase.com) → **New Project**. Pick any name/region/password (the DB password is separate from admin logins — just save it somewhere safe).

### 2. Run the schema script
In your Supabase project: **SQL Editor → New query**, paste the entire contents of **`supabase/schema.sql`** (included in this project), and click **Run**.

This one script:
- Creates the `settings`, `programmes`, `rules`, and `quotations` tables
- Enables Row-Level Security so only authenticated admins can read/write client data (branding is publicly readable so the Login screen can show your logo)
- Seeds `programmes` with your real pricing guide (76 programmes) and `rules` with your exact wording
- Seeds `settings` with CHIMACY OF UNN branding defaults (green, UNN)
- Creates a `branding` storage bucket for logo/signature uploads
- Sets up auto-generated quotation numbers (`CHM-2026-0001`, etc.)

### 3. Create your admin login(s)
In Supabase: **Authentication → Users → Add user**. Enter an email and password for each admin/staff member who should have access. (Tip: under **Authentication → Providers → Email**, you can disable "Confirm email" so accounts you create are usable immediately without an email confirmation step — appropriate for internal-only admin accounts.)

### 4. Get your API credentials
**Project Settings → API** — copy the **Project URL** and the **anon / public key**.

### 5. Configure the app
Copy `.env.example` to `.env` and fill in the two values:
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## 🚀 Local Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → /dist
npm run preview
```

---

## ☁️ Deploying to Netlify

1. Push this project to a Git repository.
2. Netlify → **Add new site → Import an existing project** → select the repo.
3. Build settings (already in `netlify.toml`): build command `npm run build`, publish directory `dist`.
4. **Site configuration → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. (If you added env vars after the first deploy, trigger **Deploys → Trigger deploy → Clear cache and deploy site**.)

Because the app uses `HashRouter`, no special SPA redirect configuration is required — routes like `/#/clients` just work.

---

## 🔐 How login & access control works

- Login is plain email/password via Supabase Auth (`src/pages/Login.jsx`, `src/context/AuthContext.jsx`).
- Every page except `/login` is wrapped in `<ProtectedRoute>` and redirects to the login screen if there's no active session.
- All data tables (`programmes`, `rules`, `quotations`) require `auth.role() = 'authenticated'` for every read and write — i.e. **any** admin you've created can see and edit **all** client data (this is a shared team database, not per-user siloed data, matching "anyone given the admin logins" from your requirements).
- `settings` (branding) is publicly readable (so the Login page itself can show your logo/colors before anyone signs in) but only writable by authenticated admins.
- There is no self-service sign-up screen anywhere in the app — accounts are only created by you, from the Supabase dashboard, which is what "admin logins" implies.

---

## 🎨 Branding — how "permanent everywhere" actually works

Settings → Company Name, Tagline, Institution Name, Phone/Email/Address, Footer Text, Currency, **Primary/Accent Color pickers**, Logo, Signature.

When you click **Save Settings**:
1. The change is written to the single `settings` row in Postgres.
2. A Supabase Realtime subscription (`src/context/SettingsContext.jsx`) pushes that change to every other open session immediately — no refresh needed.
3. The brand color is applied via a CSS variable (`--color-brand-primary`) that drives the sidebar highlight, primary buttons, and the login screen, so a color you pick shows up identically on every device without a redeploy.
4. Logo/signature uploads go to a public Supabase Storage bucket and are referenced by URL — so they render correctly wherever the app is loaded.

This is what makes it genuinely permanent: it isn't `localStorage` (per-browser) — it's one row in a shared database that every instance of the app reads from.

---

## 🧠 Smart Evaluation Engine

Unchanged in logic (`src/utils/evaluation.js`), still 100% data-driven off the `programmes` table (nothing hardcoded):

1. Score ≥ preferred/normal benchmark → `Eligible`, Single Working, normal price.
2. Score within the Double Working band → `Eligible (Double Working)`, double price.
3. Score above minimum but below the Double Working band → borderline; double working recommended.
4. Score below every threshold → `Not Eligible`; the New Client page automatically suggests eligible alternative programmes.

---

## 💳 Checkout, Payments & Invoices

- **Checkout & Invoices** page lists every client currently `Eligible` (single or double working) who hasn't paid.
- **Record Payment** captures amount, method (Bank Transfer / Cash / POS / Online), and date, marks the quotation `paid`, generates a sequential invoice number, and immediately downloads a professional invoice/receipt PDF.
- Paid clients show a green "Paid" badge everywhere (Dashboard, Client Records, Checkout) and can have their invoice re-downloaded at any time.
- Dashboard surfaces "Clients Paid", "Total Collected", and "Outstanding Pipeline" as live stat cards.

---

## 📁 Project Structure

```
chimacy-of-unn/
├── supabase/
│   └── schema.sql            # Run once in Supabase SQL Editor - tables, RLS, seed data
├── src/
│   ├── lib/supabaseClient.js
│   ├── context/
│   │   ├── AuthContext.jsx        # login/logout/session
│   │   ├── SettingsContext.jsx    # global branding, realtime-synced
│   │   └── ThemeContext.jsx       # dark/light mode (device-local, cosmetic only)
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   ├── Layout/                # Sidebar, Topbar, DashboardLayout
│   │   └── UI/                    # Card, FormField, Badge, Modal
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NewClient.jsx
│   │   ├── ClientRecords.jsx
│   │   ├── GenerateQuotation.jsx
│   │   ├── Checkout.jsx           # payments & invoices
│   │   ├── PricingDatabase.jsx
│   │   ├── RulesPage.jsx
│   │   └── Settings.jsx
│   ├── utils/
│   │   ├── db.js              # all Supabase reads/writes (programmes, rules, quotations)
│   │   ├── evaluation.js      # Smart Evaluation Engine
│   │   ├── pdfGenerator.js    # quotation + invoice PDFs
│   │   └── format.js
│   ├── data/admission_database.json  # kept only as the historical source used to seed schema.sql
│   ├── App.jsx / main.jsx / index.css
├── netlify.toml
├── .env.example
└── package.json
```

---

## 🧪 Verifying the Build

This project was authored without a live npm registry connection in the build sandbox, so `npm install`/`npm run build` could not be executed here. Every file was manually reviewed (import audits, comment/string-aware bracket-balance checks, SQL paren-balance check). Please run the following before deploying, and set your `.env` first — the app will render but every data call will fail without valid Supabase credentials:

```bash
cp .env.example .env   # then fill in your real values
npm install
npm run build
```

---

## 📄 License

Internal use — CHIMACY OF UNN Admission Brokerage Management System. Pricing and benchmark data is confidential; do not distribute publicly. Restrict Supabase admin accounts to trusted staff only.
