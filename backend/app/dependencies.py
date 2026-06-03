from __future__ import annotations

from functools import lru_cache

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import Settings, get_settings
from .security import decode_access_token
from .storage.base import Storage
from .storage.in_memory import InMemoryStorage
from .storage.ydb import YdbStorage

bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def get_storage() -> Storage:
    settings = get_settings()
    if settings.storage_backend == "ydb":
        return YdbStorage(settings)
    return InMemoryStorage()


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    storage: Storage = Depends(get_storage),
    settings: Settings = Depends(get_settings),
):
    token = credentials.credentials if credentials else request.cookies.get(settings.auth_cookie_name)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется токен доступа.",
        )

    payload = decode_access_token(token, settings)
    user_id = payload.get("sub")
    user = storage.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден.",
        )
    return user
