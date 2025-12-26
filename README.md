# Station‑2100

Station‑2100 is a modern aviation maintenance and inventory management system built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and shadcn UI.

## Current Status

**UI-First Phase (Current)**
- ✅ Dashboard layout with sidebar navigation
- ✅ Module summary cards with pie charts
- ✅ Analytics charts (line and pie)
- ✅ Theme toggle (light/dark mode)
- ✅ Responsive design with Tailwind CSS
- ⏳ Database integration (not yet implemented)
- ⏳ API endpoints (not yet implemented)
- ⏳ Authentication (not yet implemented)

This is a **UI-first scaffold**. The dashboard and module pages are visually complete with placeholder/mocked data. All charts, metrics, and module summaries display static dummy data for UI demonstration purposes. Backend services, database connections, and authentication are intentionally not implemented yet.

## Project Structure

| Folder           | Purpose                                                   |
|------------------|-----------------------------------------------------------|
| `app/`           | Next.js App Router structure                             |
| `components/`   | React components (charts, layout, UI)                     |
| `lib/`           | Utility files, types, theme provider                     |
| `prisma/`        | Prisma schema (prepared, not connected)                   |
| `sql/`           | SQL scripts for MySQL tables                              |
| `docs/`          | Architecture and development documentation               |

### App Router Structure

- `/` – Landing page
- `/dashboard` – Main dashboard with KPI cards and module summaries
- `/dashboard/inventory` – Inventory module page
- `/dashboard/job-cards` – Job cards module page
- `/dashboard/rotables` – Rotables module page
- `/dashboard/tools` – Tools module page
- `/dashboard/suppliers` – Suppliers module page
- `/dashboard/customers` – Customers module page
- `/dashboard/reports` – Reports module page
- `/dashboard/admin` – Admin module page
- `/dashboard/settings` – Settings module page

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000/dashboard`

### What Works

- Dashboard UI with all module cards
- Navigation sidebar
- Theme switching (light/dark)
- Chart components (Recharts)
- Responsive layout

### What's Not Implemented Yet

- Database connections (Prisma schema exists but not connected)
- API routes or server actions
- Authentication/authorization
- Real data (currently using dummy data)
- Form submissions
- Data persistence

## Next Steps

After UI verification, the next phase will be:
1. Database setup and Prisma connection
2. Authentication implementation
3. API routes for each module
4. Replace dummy data with real database queries

See `docs/architecture.md` for the full development plan.