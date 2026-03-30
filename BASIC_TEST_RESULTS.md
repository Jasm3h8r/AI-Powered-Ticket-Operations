# Basic Test Results

Date: 2026-03-21
Environment: Docker Compose (`backend` + `frontend`)

## Commands Executed

```powershell
docker compose up --build -d
docker compose exec backend npm test
docker compose exec frontend npm run build
```

## Results Summary
- Docker images built successfully (`fs-backend`, `fs-frontend`)
- Containers started successfully:
  - `support-operations-backend`
  - `support-operations-frontend`
- Backend tests: passed
- Frontend production build: passed

## Backend Test Output (Key Lines)

```text
Test Files  1 passed (1)
Tests       4 passed (4)
Duration    773ms
```

Covered analyzer checks:
- classifies billing tickets
- detects urgency and higher priority for outages
- applies custom security rule for priority
- falls back to Other category

## Frontend Build Output (Key Lines)

```text
vite v5.4.21 building for production...
✓ 41 modules transformed.
dist/index.html                   2.37 kB │ gzip:  1.08 kB
dist/assets/index-Cb0_BJ8M.css   17.27 kB │ gzip:  4.27 kB
dist/assets/index-CyYIYq6N.js   193.58 kB │ gzip: 60.85 kB
✓ built in 2.52s
```
