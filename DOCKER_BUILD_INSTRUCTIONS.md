# Working Docker Build Instructions

## Prerequisites
- Docker Desktop installed and running
- Docker Compose available (`docker compose`)

## Build and Start Containers
Run from project root:

```powershell
docker compose up --build -d
```

This command:
- Builds backend image from `backend/Dockerfile`
- Builds frontend image from `frontend/Dockerfile`
- Starts both services in detached mode

## Verify Services
Check running containers:

```powershell
docker compose ps
```

Expected service containers:
- `support-operations-backend`
- `support-operations-frontend`

## Verify Backend Health

```powershell
docker compose exec backend node -e "fetch('http://localhost:4000/health').then(r=>r.json()).then(console.log)"
```

Expected output:

```text
{ status: 'ok' }
```

## Run Backend Tests in Docker

```powershell
docker compose exec backend npm test
```

## Build Frontend in Docker

```powershell
docker compose exec frontend npm run build
```

## Open Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

## Stop Services

```powershell
docker compose down
```
