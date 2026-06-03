from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ProfileLinks(BaseModel):
    twitch: str = ""
    poeNinja: str = ""
    poeProfile: str = ""


class SlotRoll(BaseModel):
    id: str | None = None
    count: int
    multiplier: float
    label: str
    taskIds: list[str]
    rerollsUsed: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class SlotMachineState(BaseModel):
    activeRoll: SlotRoll | None = None
    bonusHistory: list[SlotRoll] = Field(default_factory=list)


class BoardTurn(BaseModel):
    roll: int
    from_: int = Field(alias="from")
    to: int
    penalty: int = 0


class BoardGameState(BaseModel):
    position: int = 0
    rollsUsed: int = 0
    turnHistory: list[BoardTurn] = Field(default_factory=list)


class UserPublic(BaseModel):
    id: str
    nickname: str
    completedTaskIds: list[str] = Field(default_factory=list)
    status: str = ""
    note: str = ""
    profileLinks: ProfileLinks = Field(default_factory=ProfileLinks)
    slotMachine: SlotMachineState = Field(default_factory=SlotMachineState)
    boardGame: BoardGameState = Field(default_factory=BoardGameState)


class UserRecord(UserPublic):
    passwordHash: str


class Task(BaseModel):
    id: str
    title: str
    category: str
    categoryLabel: str
    points: int
    description: str


class LadderEntry(UserPublic):
    completedCount: int = 0
    totalPoints: int = 0


class LoginRequest(BaseModel):
    nickname: str
    password: str


class RegisterRequest(BaseModel):
    nickname: str
    password: str
    confirmPassword: str


class TaskCompletionRequest(BaseModel):
    completed: bool = True


class AuthResponse(BaseModel):
    accessToken: str
    tokenType: Literal["bearer"] = "bearer"
    user: UserPublic


class MessageResponse(BaseModel):
    message: str


class UserUpdateRequest(BaseModel):
    completedTaskIds: list[str] | None = None
    status: str | None = None
    note: str | None = None
    profileLinks: ProfileLinks | None = None
    slotMachine: SlotMachineState | None = None
    boardGame: BoardGameState | None = None
