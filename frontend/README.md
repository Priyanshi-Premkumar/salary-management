# ACME CompensationOS: Frontend Application

Enterprise single-page application built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## Features

- **Executive KPI Dashboard**: Headcount metrics, department distribution, and currency breakdown.
- **Employee Directory**: Instant text search, pagination, and multi-faceted filtering (Country, Department, Designation, Status).
- **Employee Compensation Profile**: Biographical data, current base salary, bonus, and chronological effective-dated salary history.
- **Interactive Salary Revision Modal**: Increment calculator, percentage change preview, and date validation.
- **Multi-Currency Analytics**: Sovereign currency segregation (USD, INR, EUR, GBP, AED), native PostgreSQL department median charts, threshold projections, and distribution histograms.
- **Salary Audit Trail**: Immutable log of compensation actions with actor email, timestamps, and before/after values.
- **Formula-Sanitized CSV Export**: One-click streaming download with spreadsheet injection protection.

---

## Tech Stack

- **Framework**: React 18 with TypeScript 5
- **Bundler & Dev Server**: Vite 5
- **Styling**: Tailwind CSS 3 with PostCSS and Autoprefixer
- **State & Server Cache**: TanStack Query (React Query v5)
- **Forms & Validation**: React Hook Form + Zod
- **Charts**: Recharts 2
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with JWT interceptor

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

