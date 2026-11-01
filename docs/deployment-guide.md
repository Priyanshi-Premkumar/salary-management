# ACME CompensationOS: Free-Tier Cloud Deployment Guide

## 1. Production Architecture Overview

ACME CompensationOS is deployed across a decoupled, multi-cloud architecture optimized for zero idle cost and high availability:

```
                    +------------------------------------+
                    |       Client Web Browser           |
                    +-----------------+------------------+
                                      |
                                      | HTTPS (Port 443)
                                      v
                    +------------------------------------+
                    |        Firebase Hosting            |
                    |  (https://priyanshi-dev.web.app)   |
                    |   Global CDN Edge / Angular SPA    |
                    +-----------------+------------------+
                                      |
                                      | REST API / HTTPS
                                      v
                    +------------------------------------+
                    |       Google Cloud Run             |
                    |  (Java 21 + Spring Boot 3.3.4)     |
                    |     Scale-to-Zero Container        |
                    +-----------------+------------------+
                                      |
                                      | JDBC + SSL (TLS 1.3)
                                      v
                    +------------------------------------+
                    |       Neon PostgreSQL              |
                    |  Serverless Postgres (AWS us-east-2)|
                    | 10,000 Employees | btree_gist gist |
                    +------------------------------------+
```

---

## 2. Component Specifications & Free-Tier Quotas

| Component | Platform | Configuration | Free-Tier Limits & Cost Optimization |
|---|---|---|---|
| **Frontend** | Firebase Hosting | Angular 18 Standalone SPA (esbuild) | 10 GB storage, 360 MB/day transfer (Always Free) |
| **Backend** | Google Cloud Run | Spring Boot (Eclipse Temurin JRE 21 Alpine) | 2M requests/mo, 360k vCPU-sec, 180k GiB-sec free; `--min-instances=0` (Scale to zero) |
| **Database** | Neon PostgreSQL | PostgreSQL 16/18 with `btree_gist` | 0.5 GiB storage, auto-suspend compute on idle |
| **Source Control** | GitHub | `main` branch with CI/CD | 2,000 GitHub Actions build minutes/month |

---

## 3. Database: Neon PostgreSQL

### 3.1 SSL/TLS & Pool Configuration
Neon requires SSL/TLS (`sslmode=require`). Connection pooling is configured via HikariCP in Spring Boot to prevent pool exhaustion:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    hikari:
      maximum-pool-size: 5
      minimum-idle: 1
      idle-timeout: 300000
      connection-timeout: 30000
      max-lifetime: 600000
```

### 3.2 Temporal Exclusion Constraint (`btree_gist`)
Neon supports PostgreSQL temporal exclusion constraints natively:
```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

### 3.3 Verified Data Migration
The 10,000 seeded synthetic employee dataset and immutable audit trail were restored to Neon without data loss:
- **Employees**: 10,000
- **Compensation Packages**: 13,735
- **Salary Audit Logs**: 3,735
- **Exchange Rates**: 5
- **System Users**: 3 (`admin@acme.com`, `hrmanager@acme.com`, `executive@acme.com`)

---

## 4. Backend Deployment: Google Cloud Run

### 4.1 Production Dockerfile
Multi-stage build in `backend/Dockerfile`:
- **Build Stage**: `maven:3.9.9-eclipse-temurin-21`
- **Runtime Stage**: `eclipse-temurin:21-jre-alpine` running as unprivileged user `appuser:appgroup`.
- **JVM Optimization**: `-XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom`.

### 4.2 Cloud Run Deployment Command
```bash
gcloud run deploy compensation-backend \
    --image gcr.io/priyanshi-dev/compensation-backend:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --min-instances 0 \
    --max-instances 2 \
    --memory 512Mi \
    --cpu 1 \
    --concurrency 80 \
    --set-env-vars SEED_AUTO_RUN=false,PORT=8080 \
    --set-secrets SPRING_DATASOURCE_URL=NEON_DB_URL:latest,SPRING_DATASOURCE_USERNAME=NEON_DB_USER:latest,SPRING_DATASOURCE_PASSWORD=NEON_DB_PASSWORD:latest,JWT_SECRET=JWT_SECRET:latest
```

---

## 5. Frontend Deployment: Firebase Hosting

### 5.1 Firebase Configuration (`firebase.json`)
```json
{
  "hosting": {
    "public": "frontend-angular/dist/frontend-angular/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 5.2 Build & Deploy Commands
```bash
cd frontend-angular
npm run build
cd ..
firebase deploy --only hosting --project priyanshi-dev
```
**Live Firebase Hosting URL**: https://priyanshi-dev.web.app

---

## 6. Environment Variables Reference

| Variable | Description | Example (No Plaintext Secrets) |
|---|---|---|
| `PORT` | Cloud Run HTTP listening port | `8080` |
| `SPRING_DATASOURCE_URL` | Neon PostgreSQL JDBC connection string | `jdbc:postgresql://<neon-endpoint>.neon.tech/neondb?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Neon database username | `neondb_owner` |
| `SPRING_DATASOURCE_PASSWORD` | Neon database password | Managed in GCP Secret Manager |
| `JWT_SECRET` | 256-bit HMAC-SHA signing key | Managed in GCP Secret Manager |
| `JWT_EXPIRATION_MS` | Token lifetime (24 hours) | `86400000` |
| `SEED_AUTO_RUN` | Disable auto-seeder in production | `false` |
| `CORS_ALLOWED_ORIGINS` | Permitted frontend origins | `https://priyanshi-dev.web.app,https://priyanshi-dev.firebaseapp.com` |

---

## 7. Security Best Practices

1. **Least-Privilege Cloud Run IAM**: Run with dedicated service account.
2. **Secret Manager Integration**: Database credentials and JWT secrets injected at container launch, never baked into Docker images or git commits.
3. **CORS Restrictions**: Only explicit Firebase origins are permitted.
4. **HTTPS Enforcement**: Strict-Transport-Security (HSTS) enforced by Firebase CDN and Cloud Run.
5. **Non-Root Execution**: Container processes run under POSIX user `appuser` (UID 1000).

---

## 8. Rollback & Troubleshooting

### 8.1 Rollback Procedures
- **Firebase Hosting**: Rollback instantly via CLI:
  ```bash
  firebase hosting:rollback --project priyanshi-dev
  ```
- **Cloud Run**: Route traffic to previous revision:
  ```bash
  gcloud run services update-traffic compensation-backend --to-revisions PREVIOUS_REVISION=100
  ```

### 8.2 Troubleshooting Checklist
1. **Cold-Start Latency**: First request after idle may take 4-8 seconds while container spins up from scale-to-zero.
2. **Neon Auto-Suspend**: Neon compute auto-suspends after 5 minutes of inactivity. First query will resume within ~500ms.
3. **CORS 403 on Login**: Ensure frontend origin is added to `CORS_ALLOWED_ORIGINS`.

---

## 9. Cost Monitoring & Budget Alerts
- Set up a Google Cloud budget alert at $1.00 USD to prevent accidental costs.
- Neon compute automatically sleeps when inactive.
- Firebase Hosting is well within free monthly quotas.