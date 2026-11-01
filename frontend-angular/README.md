# ACME CompensationOS — Angular 18 Frontend

> **Modern Enterprise Front-End for Compensation & Salary Revision Management**  
> Architected with Angular 18 Standalone Components, Angular Signals, RxJS, Tailwind CSS, Lucide Icons, and Chart.js / ng2-charts.

---

## 1. Architecture & Design Principles

The Angular frontend is built in \rontend-angular/\ as a standalone, production-ready SPA that achieves 100% functional parity with the existing backend API contracts:

- **Angular 18 Standalone Architecture**: Zero NgModule boilerplate. Every component, directive, and pipe is standalone with explicit dependencies.
- **Angular Signals & Reactive State**: Component state and authentication reactive streams leverage \signal\, \computed\, and RxJS Observables.
- **Functional Interceptors & Guards**:
  - \uthInterceptor\: Automatically attaches Bearer JWT token to outgoing API requests and manages 401 session expirations.
  - \uthGuard\: Restricts unauthenticated access to platform routes with automatic redirect to \/login\ and preservation of eturnUrl\.
- **Clean Responsive UI with Tailwind CSS**: Exact brand fidelity matching the design language (Indigo/Slate themes, KPI cards, badges, and modals).
- **Interactive Visualizations**:
  - Chart.js 4.x + g2-charts\ 6.x for department salary distribution bar charts, country headcount doughnut charts, and compensation bracket histograms.
- **Tree-shakeable Lucide Icons**: Powered by \@lucide/angular\ standalone icon components.
- **Resilient Fallback Resolvers**: Supports multi-tier salary resolution for flattened fields (\currentBaseSalary\, \currentBonus\, \currency\) and nested \currentCompensation\.

---

## 2. Directory Structure

\frontend-angular/src/app/
├── core/
│   ├── auth/
│   │   ├── auth.service.ts         # Authentication state management with Signals
│   │   ├── auth.interceptor.ts       # Functional HTTP interceptor for JWT
│   │   └── auth.guard.ts             # Functional route guard
│   ├── models/
│   │   ├── auth.model.ts             # User and Login models
│   │   ├── employee.model.ts         # Employee summary and detail models
│   │   ├── compensation.model.ts     # Salary revision and history models
│   │   ├── analytics.model.ts        # Department, country, band, and threshold models
│   │   ├── audit.model.ts            # Audit trail models
│   │   └── index.ts                  # Centralized type exports and aliases
│   └── services/
│       ├── employee.service.ts       # Directory listing, detail, CSV streaming
│       ├── compensation.service.ts   # Active compensation, revision mutation, history
│       ├── analytics.service.ts      # Overview, departments, countries, bands, threshold
│       └── audit.service.ts          # Paginated audit trail and CSV download
├── features/
│   ├── login/                        # Login page with demo credentials
│   ├── dashboard/                    # Overview KPIs, regional cards, Chart.js charts
│   ├── employees/                    # Paginated directory, search debounce, profile detail
│   ├── analytics/                    # 5 sovereign currency tabs, threshold calculator, histogram
│   └── audit/                        # Append-only immutable audit trail table & search
├── layouts/
│   └── app-layout/                   # Shell with fixed sidebar and sticky header
├── shared/
│   ├── components/
│   │   ├── sidebar/                  # Navigation links, user initial avatar, logout
│   │   ├── header/                   # Multi-region badge, 10,000 sync indicator, role badge
│   │   └── modal/                    # Salary revision modal with live delta calculator
│   └── pipes/
│       └── currency-formatter.pipe.ts# Intl.NumberFormat multi-currency pipe (USD, INR, EUR, GBP, AED)
├── app.config.ts                     # Application providers (HttpClient, Charts, Router)
├── app.routes.ts                     # Routing definitions
├── app.component.ts                  # Root container
└── styles.css                        # Tailwind directives and utility classes
\
---

## 3. Running Locally

### Prerequisites
- Node.js \>= 18.19.0\ (tested with Node.js \20.16.0\)
- npm \>= 10.x- Running backend on port \8080\ (Spring Boot)

### Install Dependencies
\\ash
npm install --legacy-peer-deps
\
### Start Development Server
\\ash
npm start
# or: ng serve --proxy-config proxy.conf.json
\The application will launch on \http://localhost:4200/\ with API requests automatically proxied to \http://localhost:8080/\.

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| **HR Manager** | \hrmanager@acme.com\ | \Manager@123\ |
| **Administrator** | \dmin@acme.com\ | \Admin@123\ |

---

## 4. Building & Production Deployment

### Production Build
\\ash
npm run build
\Build output is saved to \dist/frontend-angular/browser\ (total initial transfer size: **~184 kB**).

### Netlify Deployment
The repository includes automated SPA configuration for Netlify:
- \public/_redirects\: Redirects all paths (\/* /index.html 200\) to support Angular HTML5 pushState routing.
- etlify.toml\: Configures build command pm run build\ and publish directory \dist/frontend-angular/browser\.

---

## 5. Running Unit Tests

\\ash
npm test -- --watch=false --browsers=ChromeHeadless
\Executes Karma / Jasmine test suite verifying \AuthService\, \EmployeeService\, \CompensationService\, \CurrencyFormatterPipe\, and component templates.
