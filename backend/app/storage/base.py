from __future__ import annotations

from abc import ABC, abstractmethod

from ..models import LadderEntry, Task, UserPublic, UserRecord, UserUpdateRequest


class Storage(ABC):
    @abstractmethod
    def list_tasks(self) -> list[Task]:
        raise NotImplementedError

    @abstractmethod
    def list_users(self) -> list[UserRecord]:
        raise NotImplementedError

    @abstractmethod
    def get_user_by_id(self, user_id: str) -> UserRecord | None:
        raise NotImplementedError

    @abstractmethod
    def get_user_by_nickname(self, nickname: str) -> UserRecord | None:
        raise NotImplementedError

    @abstractmethod
    def create_user(self, nickname: str, password_hash: str) -> UserRecord:
        raise NotImplementedError

    @abstractmethod
    def set_task_completion(self, user_id: str, task_id: str, completed: bool) -> UserRecord:
        raise NotImplementedError

    @abstractmethod
    def update_user(self, user_id: str, payload: UserUpdateRequest) -> UserRecord:
        raise NotImplementedError

    @abstractmethod
    def list_ladder(self) -> list[LadderEntry]:
        raise NotImplementedError

    @abstractmethod
    def to_public_user(self, user: UserRecord) -> UserPublic:
        raise NotImplementedError
