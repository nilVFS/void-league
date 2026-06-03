# League POE Backend

## What is included

- `FastAPI` application scaffold
- in-memory storage for local development
- YDB storage stub for the next iteration
- auth endpoints with JWT
- tasks and ladder endpoints
- Dockerfile for Yandex Serverless Containers

## API routes

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `GET /tasks`
- `GET /ladder`
- `POST /tasks/{task_id}/complete`

## Local run

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Copy env template and adjust values if needed:

```bash
cp backend/.env.example backend/.env
```

4. Start the API:

```bash
uvicorn app.main:app --app-dir backend --reload
```

## Current limitations

- passwords are hashed with PBKDF2-SHA256
- data is not persisted when `STORAGE_BACKEND=memory`
- YDB repository implementation is still pending
