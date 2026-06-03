from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, get_settings
from .data_seed import TASK_POINTS
from .dependencies import get_current_user, get_storage
from .models import (
    AuthResponse,
    LadderEntry,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    Task,
    TaskCompletionRequest,
    UserPublic,
    UserRecord,
    UserUpdateRequest,
)
from .security import build_access_token, hash_password, verify_password
from .storage.base import Storage


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, debug=settings.debug)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", response_model=MessageResponse)
    def healthcheck() -> MessageResponse:
        return MessageResponse(message="ok")

    @app.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
    def register(
        payload: RegisterRequest,
        response: Response,
        storage: Storage = Depends(get_storage),
        settings: Settings = Depends(get_settings),
    ) -> AuthResponse:
        nickname = payload.nickname.strip()
        if not nickname or not payload.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Заполни логин и пароль.",
            )

        if payload.password != payload.confirmPassword:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пароли не совпадают.",
            )

        if storage.get_user_by_nickname(nickname) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Пользователь с таким логином уже существует.",
            )

        user = storage.create_user(nickname=nickname, password_hash=hash_password(payload.password))
        return build_auth_response(user, storage, settings, response)

    @app.post("/auth/login", response_model=AuthResponse)
    def login(
        payload: LoginRequest,
        response: Response,
        storage: Storage = Depends(get_storage),
        settings: Settings = Depends(get_settings),
    ) -> AuthResponse:
        user = storage.get_user_by_nickname(payload.nickname.strip())
        if user is None or not verify_password(payload.password, user.passwordHash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Не нашли такого пользователя или пароль не совпадает.",
            )

        return build_auth_response(user, storage, settings, response)

    @app.post("/auth/logout", response_model=MessageResponse)
    def logout(response: Response, settings: Settings = Depends(get_settings)) -> MessageResponse:
        clear_auth_cookie(response, settings)
        return MessageResponse(message="ok")

    @app.get("/me", response_model=UserPublic)
    def get_me(current_user: UserRecord = Depends(get_current_user), storage: Storage = Depends(get_storage)) -> UserPublic:
        return storage.to_public_user(current_user)

    @app.get("/tasks", response_model=list[Task])
    def list_tasks(storage: Storage = Depends(get_storage)) -> list[Task]:
        return storage.list_tasks()

    @app.get("/ladder", response_model=list[LadderEntry])
    def ladder(storage: Storage = Depends(get_storage)) -> list[LadderEntry]:
        return storage.list_ladder()

    @app.post("/tasks/{task_id}/complete", response_model=UserPublic)
    def complete_task(
        task_id: str,
        payload: TaskCompletionRequest,
        current_user: UserRecord = Depends(get_current_user),
        storage: Storage = Depends(get_storage),
    ) -> UserPublic:
        if task_id not in TASK_POINTS:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Задача не найдена.",
            )

        updated_user = storage.set_task_completion(
            user_id=current_user.id,
            task_id=task_id,
            completed=payload.completed,
        )
        return storage.to_public_user(updated_user)

    @app.patch("/me", response_model=UserPublic)
    def update_me(
        payload: UserUpdateRequest,
        current_user: UserRecord = Depends(get_current_user),
        storage: Storage = Depends(get_storage),
    ) -> UserPublic:
        updated_user = storage.update_user(current_user.id, payload)
        return storage.to_public_user(updated_user)

    return app


def build_auth_response(user: UserRecord, storage: Storage, settings: Settings, response: Response) -> AuthResponse:
    public_user = storage.to_public_user(user)
    token = build_access_token(user.id, settings)
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.auth_cookie_secure,
        max_age=settings.access_token_ttl_minutes * 60,
    )
    return AuthResponse(accessToken=token, user=public_user)


def clear_auth_cookie(response: Response, settings: Settings) -> None:
    response.delete_cookie(key=settings.auth_cookie_name, httponly=True, samesite="lax")


app = create_app()
