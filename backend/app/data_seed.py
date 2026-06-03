from __future__ import annotations

from .models import Task


TASKS: list[Task] = [
    Task(
        id="first-circle",
        title="Первый круг",
        category="start",
        categoryLabel="Старт",
        points=120,
        description="Закрыть все акты в первый игровой день хотя бы одним участником лиги.",
    ),
    Task(
        id="night-watch",
        title="Ночной дозор",
        category="start",
        categoryLabel="Старт",
        points=90,
        description="Собрать минимум пятерых живых участников онлайн в первые три часа после старта.",
    ),
    Task(
        id="altar-of-maps",
        title="Алтарь карт",
        category="mapping",
        categoryLabel="Карты",
        points=70,
        description="Открыть и зачистить первые десять карт белого тира в составе лиги без внешней помощи.",
    ),
    Task(
        id="atlas-spark",
        title="Искра атласа",
        category="mapping",
        categoryLabel="Карты",
        points=110,
        description="Закрыть первую желтую карту и зафиксировать, кто первым дотянул атлас до нового тира.",
    ),
    Task(
        id="black-vault",
        title="Черная казна",
        category="economy",
        categoryLabel="Экономика",
        points=95,
        description="Собрать первый общий пул ценных валютных дропов и отметить его как фонд сезона.",
    ),
    Task(
        id="first-trade",
        title="Первая сделка",
        category="economy",
        categoryLabel="Экономика",
        points=60,
        description="Заключить первую внутрилиговую сделку, которая реально помогает ускорить чей-то билд.",
    ),
    Task(
        id="abyss-oath",
        title="Клятва бездне",
        category="league",
        categoryLabel="Лига",
        points=100,
        description="Собрать первый ценный дроп сезона и зафиксировать его как общий трофей лиги.",
    ),
    Task(
        id="closed-circle",
        title="Закрытый круг",
        category="league",
        categoryLabel="Лига",
        points=140,
        description="Пройти стартовую неделю без добора случайных людей в состав лиги.",
    ),
    Task(
        id="first-blood",
        title="Первая кровь",
        category="bosses",
        categoryLabel="Боссы",
        points=130,
        description="Убить первого значимого босса эндгейма силами лиги и сохранить его как milestone сезона.",
    ),
    Task(
        id="bone-throne",
        title="Костяной трон",
        category="bosses",
        categoryLabel="Боссы",
        points=160,
        description="Закрыть сложный бой без вайпа всей пачки и отметить состав, который это сделал.",
    ),
    Task(
        id="iron-discipline",
        title="Железная дисциплина",
        category="league",
        categoryLabel="Лига",
        points=80,
        description="Собрать единый список билдов лиги, чтобы не дублировать ключевые роли и не терять темп.",
    ),
    Task(
        id="ashen-line",
        title="Пепельная линия",
        category="mapping",
        categoryLabel="Карты",
        points=75,
        description="Довести хотя бы одного участника до стабильного фарма карт без провала по выживаемости.",
    ),
]


TASK_POINTS = {task.id: task.points for task in TASKS}

