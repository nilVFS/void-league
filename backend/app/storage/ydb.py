from __future__ import annotations

from ..config import Settings
from ..models import LadderEntry, Task, UserPublic, UserRecord, UserUpdateRequest
from .base import Storage


class YdbStorage(Storage):
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def _not_ready(self) -> RuntimeError:
        return RuntimeError(
            "YDB storage is not implemented yet. "
            "Use STORAGE_BACKEND=memory for local development until the repository layer is added."
        )

    def list_tasks(self) -> list[Task]:
        raise self._not_ready()

    def list_users(self) -> list[UserRecord]:
        raise self._not_ready()

    def get_user_by_id(self, user_id: str) -> UserRecord | None:
        raise self._not_ready()

    def get_user_by_nickname(self, nickname: str) -> UserRecord | None:
        raise self._not_ready()

    def create_user(self, nickname: str, password_hash: str) -> UserRecord:
        raise self._not_ready()

    def set_task_completion(self, user_id: str, task_id: str, completed: bool) -> UserRecord:
        raise self._not_ready()

    def update_user(self, user_id: str, payload: UserUpdateRequest) -> UserRecord:
        raise self._not_ready()

    def list_ladder(self) -> list[LadderEntry]:
        raise self._not_ready()

    def to_public_user(self, user: UserRecord) -> UserPublic:
        raise self._not_ready()
