from __future__ import annotations

from copy import deepcopy
from uuid import uuid4

from ..data_seed import TASK_POINTS, TASKS
from ..models import BoardGameState, LadderEntry, SlotMachineState, Task, UserPublic, UserRecord, UserUpdateRequest
from .base import Storage


class InMemoryStorage(Storage):
    def __init__(self) -> None:
        self._tasks = [task.model_copy(deep=True) for task in TASKS]
        self._users: dict[str, UserRecord] = {}

    def list_tasks(self) -> list[Task]:
        return [task.model_copy(deep=True) for task in self._tasks]

    def list_users(self) -> list[UserRecord]:
        return [user.model_copy(deep=True) for user in self._users.values()]

    def get_user_by_id(self, user_id: str) -> UserRecord | None:
        user = self._users.get(user_id)
        return user.model_copy(deep=True) if user else None

    def get_user_by_nickname(self, nickname: str) -> UserRecord | None:
        normalized = nickname.strip().lower()
        for user in self._users.values():
            if user.nickname.lower() == normalized:
                return user.model_copy(deep=True)
        return None

    def create_user(self, nickname: str, password_hash: str) -> UserRecord:
        user = UserRecord(
            id=f"user-{uuid4().hex[:12]}",
            nickname=nickname.strip(),
            passwordHash=password_hash,
            completedTaskIds=[],
            status="",
            note="",
            slotMachine=SlotMachineState(),
            boardGame=BoardGameState(),
        )
        self._users[user.id] = user
        return user.model_copy(deep=True)

    def set_task_completion(self, user_id: str, task_id: str, completed: bool) -> UserRecord:
        user = self._users[user_id]
        next_completed = set(user.completedTaskIds)
        if completed:
            next_completed.add(task_id)
        else:
            next_completed.discard(task_id)

        user.completedTaskIds = sorted(next_completed)
        user.boardGame.availableRolls = max(len(user.completedTaskIds) - len(user.boardGame.turnHistory), 0)
        self._users[user_id] = user
        return user.model_copy(deep=True)

    def update_user(self, user_id: str, payload: UserUpdateRequest) -> UserRecord:
        user = self._users[user_id]
        update_data = payload.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(user, key, value)

        self._users[user_id] = user
        return user.model_copy(deep=True)

    def list_ladder(self) -> list[LadderEntry]:
        entries = [self._to_ladder_entry(user) for user in self._users.values()]
        return sorted(
            entries,
            key=lambda item: (-item.totalPoints, -item.completedCount, item.nickname.lower()),
        )

    def to_public_user(self, user: UserRecord) -> UserPublic:
        return UserPublic(**user.model_dump(exclude={"passwordHash"}, by_alias=True))

    def _to_ladder_entry(self, user: UserRecord) -> LadderEntry:
        total_points = sum(TASK_POINTS.get(task_id, 0) for task_id in user.completedTaskIds)
        payload = self.to_public_user(user).model_dump()
        payload["completedCount"] = len(user.completedTaskIds)
        payload["totalPoints"] = total_points
        return LadderEntry(**deepcopy(payload))
