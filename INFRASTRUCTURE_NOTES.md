# League POE Infrastructure Notes

## Current status

This project started as frontend-only, but now includes a first backend scaffold under `backend/`.

Yandex Cloud resources already prepared:

- `Managed Service for YDB`
  - Name: `league-poe-db`
  - Mode: `Serverless`
  - Status: `Running`
  - Endpoint: `grpcs://ydb.serverless.yandexcloud.net:2135`
  - Database path: `/ru-central1/b1gl50g1821kp8k1kc6o/etn4bllre16i47ddt15s`
- `Service Account`
  - Name: `league-poe-backend-sa`
  - Roles:
    - `container-registry.images.puller`
    - `lockbox.payloadViewer`
    - `ydb.editor`
- `Lockbox`
  - Secret name: `league-poe-backend-secrets`
  - Intended keys:
    - `JWT_SECRET`
    - `YDB_ENDPOINT`
    - `YDB_DATABASE`
    - `APP_ENV`
- `Object Storage`
  - Bucket planned/created for static assets
  - Suggested name: `league-poe-static-storage`
  - Suggested initial limit: `5 GB`
  - Access mode: private by default

## Explicit decisions

- Do not use `Cloud Logging` as part of the planned stack.
- Do not configure `Smart Web Security`, `SmartCaptcha`, `Message Queue`, or `Monitoring` for the MVP.
- Use `Serverless Containers` for backend hosting once backend code and image exist.
- Use `API Gateway` only after the backend container revision is ready.

## Planned Yandex Cloud stack

- `Managed Service for YDB`
- `Container Registry`
- `Serverless Containers`
- `API Gateway`
- `Lockbox`
- `Service Account`
- `Object Storage` as needed for static/media

## What is still missing

### In the repository

- Initial backend scaffold is now present
- Environment/config handling is present
- MVP authentication endpoints are present
- Dockerfile for backend image is present
- YDB integration is still pending
- Persistent storage layer is still pending

### In Yandex Cloud

- `Container Registry` setup if not completed
- Backend Docker image pushed to registry
- `Serverless Containers` revision based on the image
- `API Gateway` bound to the container

## Recommended next implementation steps

1. Finish the repository layer for YDB.
2. Connect the frontend to the new API routes.
3. Build and push the backend image to `Container Registry`.
4. Create a `Serverless Containers` revision using:
   - HTTP server mode
   - service account `league-poe-backend-sa`
   - secrets from `league-poe-backend-secrets`
5. Create an `API Gateway` route for `/api/*`.

## MVP API draft

- `POST /auth/login`
- `POST /auth/register`
- `GET /me`
- `GET /ladder`
- `GET /tasks`
- `POST /tasks/{id}/complete`

## Draft YDB entities

- `users`
- `tasks`
- `task_completions`
- `player_stats`
- `board_moves`

## Notes for deployment

- In `Serverless Containers`, use `HTTP server` mode.
- Recommended initial resources:
  - `1 vCPU`
  - `20%` guaranteed CPU
  - `512 MB RAM`
  - timeout: `30 seconds`
- Keep logging disabled unless we intentionally re-enable it later.
