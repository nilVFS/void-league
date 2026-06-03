import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/Header';

const navigationItems = [
  { label: 'Ладдер', href: '#ladder', page: 'ladder' },
  { label: 'Участники', href: '#participants', page: 'participants' },
  { label: 'Клипы', href: '#clips', page: 'clips' },
  { label: 'Правила', href: '#rules', page: 'rules' },
  { label: 'Задачи', href: '#tasks', page: 'tasks' },
  { label: 'Войти', href: '#login', page: 'login' },
];

const SCENE_TRANSITION_MS = 650;
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const SLOT_MACHINE_VARIANTS = [
  { count: 1, multiplier: 1.5, label: 'x1.5' },
  { count: 3, multiplier: 3, label: 'x3' },
];
const BOARD_GAME_SIZE = 100;
const BOARD_GAME_PENALTIES = {
  4: 1,
  8: 2,
  14: 3,
  27: 6,
  39: 8,
  46: 7,
  52: 11,
  68: 9,
  74: 8,
  83: 12,
  93: 10,
  97: 16,
};
const BOARD_GAME_CELLS = Array.from({ length: BOARD_GAME_SIZE }, (_, index) => {
  const position = index + 1;
  const moveBack = BOARD_GAME_PENALTIES[position] ?? 0;

  return {
    position,
    moveBack,
  };
});

const TASK_CATEGORIES = [
  { key: 'all', label: 'Все' },
  { key: 'start', label: 'Старт' },
  { key: 'mapping', label: 'Карты' },
  { key: 'economy', label: 'Экономика' },
  { key: 'bosses', label: 'Боссы' },
  { key: 'league', label: 'Лига' },
];

const TASKS = [
  {
    id: 'first-circle',
    title: 'Первый круг',
    category: 'start',
    categoryLabel: 'Старт',
    points: 120,
    description: 'Закрыть все акты в первый игровой день хотя бы одним участником лиги.',
  },
  {
    id: 'night-watch',
    title: 'Ночной дозор',
    category: 'start',
    categoryLabel: 'Старт',
    points: 90,
    description: 'Собрать минимум пятерых живых участников онлайн в первые три часа после старта.',
  },
  {
    id: 'altar-of-maps',
    title: 'Алтарь карт',
    category: 'mapping',
    categoryLabel: 'Карты',
    points: 70,
    description: 'Открыть и зачистить первые десять карт белого тира в составе лиги без внешней помощи.',
  },
  {
    id: 'atlas-spark',
    title: 'Искра атласа',
    category: 'mapping',
    categoryLabel: 'Карты',
    points: 110,
    description: 'Закрыть первую желтую карту и зафиксировать, кто первым дотянул атлас до нового тира.',
  },
  {
    id: 'black-vault',
    title: 'Черная казна',
    category: 'economy',
    categoryLabel: 'Экономика',
    points: 95,
    description: 'Собрать первый общий пул ценных валютных дропов и отметить его как фонд сезона.',
  },
  {
    id: 'first-trade',
    title: 'Первая сделка',
    category: 'economy',
    categoryLabel: 'Экономика',
    points: 60,
    description: 'Заключить первую внутрилиговую сделку, которая реально помогает ускорить чей-то билд.',
  },
  {
    id: 'abyss-oath',
    title: 'Клятва бездне',
    category: 'league',
    categoryLabel: 'Лига',
    points: 100,
    description: 'Собрать первый ценный дроп сезона и зафиксировать его как общий трофей лиги.',
  },
  {
    id: 'closed-circle',
    title: 'Закрытый круг',
    category: 'league',
    categoryLabel: 'Лига',
    points: 140,
    description: 'Пройти стартовую неделю без добора случайных людей в состав лиги.',
  },
  {
    id: 'first-blood',
    title: 'Первая кровь',
    category: 'bosses',
    categoryLabel: 'Боссы',
    points: 130,
    description: 'Убить первого значимого босса эндгейма силами лиги и сохранить его как milestone сезона.',
  },
  {
    id: 'bone-throne',
    title: 'Костяной трон',
    category: 'bosses',
    categoryLabel: 'Боссы',
    points: 160,
    description: 'Закрыть сложный бой без вайпа всей пачки и отметить состав, который это сделал.',
  },
  {
    id: 'iron-discipline',
    title: 'Железная дисциплина',
    category: 'league',
    categoryLabel: 'Лига',
    points: 80,
    description: 'Собрать единый список билдов лиги, чтобы не дублировать ключевые роли и не терять темп.',
  },
  {
    id: 'ashen-line',
    title: 'Пепельная линия',
    category: 'mapping',
    categoryLabel: 'Карты',
    points: 75,
    description: 'Довести хотя бы одного участника до стабильного фарма карт без провала по выживаемости.',
  },
];

const CLIPS = [
  {
    id: 'clip-1',
    author: 'VoidRunner',
    title: 'Первый жирный дроп на старте лиги без права на ошибку',
    slug: 'AuspiciousVainSrirachaResidentSleeper',
    previewImage: '/media/void-ritual-hero.png',
  },
  {
    id: 'clip-2',
    author: 'AtlasKeep',
    title: 'Пачка чудом доживает до босса и все равно забирает килл',
    slug: 'SlickSuspiciousPigHassaanChop',
    previewImage: '/media/hero-back-layer.png',
  },
  {
    id: 'clip-3',
    author: 'HexBloom',
    title: 'Тот самый момент когда карта внезапно превращается в мясорубку',
    slug: 'DifficultArbitraryWitchTebowing',
    previewImage: '/media/hero-figure-layer.png',
  },
  {
    id: 'clip-4',
    author: 'AshenMap',
    title: 'Лут, паника и последний флакон ровно в нужную секунду',
    slug: 'SpicyWimpyPancakeTakeNRG',
    previewImage: '/media/hero-smoke-layer.png',
  },
];

const RULE_SECTIONS = [
  {
    id: 'format',
    title: 'Формат лиги',
    items: [
      'Это закрытая внутренняя лига, где каждый участник играет своим персонажем, но общий прогресс воспринимается как командный результат.',
      'Главная цель сезона не просто качаться поодиночке, а совместно закрывать достижения, двигать ладдер и открывать новые игровые цели.',
      'В личном кабинете игрок отмечает выполненные достижения, следит за своими бросками в мини-игре и обновляет профильные ссылки.',
    ],
  },
  {
    id: 'points',
    title: 'Система баллов',
    items: [
      'Каждое достижение имеет собственную ценность в баллах. Чем сложнее или важнее цель для прогресса лиги, тем больше очков она приносит.',
      'Общий счет игрока складывается из базовых баллов за выполненные достижения и дополнительных бонусов, если они были получены через игровые механики.',
      'Ладдер сортирует участников по сумме баллов. Если счет совпадает, выше оказывается тот, кто выполнил больше достижений.',
    ],
  },
  {
    id: 'achievements',
    title: 'Достижения',
    items: [
      'Список достижений разбит по категориям: старт, карты, экономика, боссы и лига. Это помогает быстро понимать, где у команды проседает темп.',
      'Игрок может фильтровать, искать и отмечать выполненные достижения в личном кабинете, а также видеть, сколько еще целей остается открытыми.',
      'В будущем сюда можно добавить подтверждение достижений через офицеров, скриншоты, ссылки на клипы или журнал прогресса по датам.',
    ],
  },
  {
    id: 'board-game',
    title: 'Игра на 100 клеток',
    items: [
      'За каждое выполненное достижение игрок получает один бросок кубика. Броски копятся и тратятся в отдельной вкладке личного кабинета.',
      'Игрок двигается по полю на 100 клеток. На части клеток есть штрафы: попав на них, участник откатывается назад на указанное количество шагов.',
      'История бросков сохраняется и используется не только в кабинете, но и в popup игрока в ладдере, чтобы можно было посмотреть, как он двигался по полю.',
    ],
  },
  {
    id: 'slot-bonus',
    title: 'Автомат и бонусы',
    items: [
      'Во вкладке автомата игрок может получить дополнительную выдачу задач с множителем награды. Это отдельная механика поверх обычных достижений.',
      'Одинарная выдача дает умеренный бонус, а более рискованные наборы из нескольких задач дают усиленный множитель к очкам.',
      'Если активная выдача еще не закрыта, новую получить нельзя. Это удерживает баланс и не дает бесконечно искать только самые удобные задачи.',
    ],
  },
  {
    id: 'ladder',
    title: 'Что видно в ладдере',
    items: [
      'В таблице отображаются ник игрока, количество выполненных достижений, текущая клетка в настольной игре и общий счет.',
      'По клику на игрока открывается popup с двумя разделами: список выполненных достижений и история его ходов в игре.',
      'Такой формат дает быстрый обзор по рейтингу и позволяет без переходов в кабинет понять, за счет чего человек держится в топе.',
    ],
  },
];

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛝ', 'ᛟ', 'ᛞ'];

function buildInitialRunes(target) {
  return target
    .split('')
    .map((char, index) => {
      if (char === ' ') {
        return ' ';
      }

      return RUNES[(index + Math.floor(Math.random() * RUNES.length)) % RUNES.length];
    })
    .join('');
}

function buildScrambledText(target, progress) {
  const revealCount = Math.floor(progress * target.length);

  return target
    .split('')
    .map((char, index) => {
      if (char === ' ') {
        return ' ';
      }

      if (index < revealCount) {
        return char;
      }

      return RUNES[Math.floor(Math.random() * RUNES.length)];
    })
    .join('');
}

function useRuneScramble(target, options = {}) {
  const { delay = 0, duration = 900, tick = 40 } = options;
  const [text, setText] = useState(() => buildInitialRunes(target));
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let intervalId;
    let timeoutId;
    const startedAt = Date.now() + delay;

    setIsDone(false);
    setText(buildInitialRunes(target));

    timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
          setText(target);
          setIsDone(true);
          window.clearInterval(intervalId);
          return;
        }

        setText(buildScrambledText(target, progress));
      }, tick);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [delay, duration, target, tick]);

  return { text, isDone };
}

async function apiRequest(path, options = {}) {
  const requestOptions = {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  };
  const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);
  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail = typeof payload === 'object' && payload?.detail
      ? payload.detail
      : 'Не удалось выполнить запрос.';
    throw new Error(detail);
  }

  return payload;
}

function mergeUserList(users, nextUser) {
  const hasUser = users.some((user) => user.id === nextUser.id);

  if (hasUser) {
    return users.map((user) => (user.id === nextUser.id ? normalizeUser(nextUser) : normalizeUser(user)));
  }

  return [...users.map((user) => normalizeUser(user)), normalizeUser(nextUser)];
}

function normalizeUser(user) {
  return {
    ...user,
    completedTaskIds: Array.isArray(user.completedTaskIds) ? user.completedTaskIds : [],
    status: user.status ?? '',
    note: user.note ?? '',
    profileLinks: {
      twitch: user.profileLinks?.twitch ?? '',
      poeNinja: user.profileLinks?.poeNinja ?? '',
      poeProfile: user.profileLinks?.poeProfile ?? '',
    },
    slotMachine: normalizeSlotMachine(user.slotMachine),
    boardGame: normalizeBoardGame(user.boardGame),
  };
}

function normalizeSlotMachine(slotMachine) {
  const bonusHistory = Array.isArray(slotMachine?.bonusHistory)
    ? slotMachine.bonusHistory
      .map((roll) => normalizeSlotRoll(roll))
      .filter(Boolean)
    : [];

  return {
    activeRoll: normalizeSlotRoll(slotMachine?.activeRoll),
    bonusHistory,
  };
}

function normalizeSlotRoll(roll) {
  if (!roll || !Array.isArray(roll.taskIds) || !roll.taskIds.length) {
    return null;
  }

  const normalizedTaskIds = [...new Set(roll.taskIds)].filter((taskId) => (
    TASKS.some((task) => task.id === taskId)
  ));

  if (!normalizedTaskIds.length) {
    return null;
  }

  const normalizedCount = roll.count === 3 ? 3 : 1;
  const normalizedMultiplier = normalizedCount === 3 ? 3 : 1.5;

  return {
    id: roll.id ?? `slot-roll-${normalizedTaskIds.join('-')}`,
    taskIds: normalizedTaskIds,
    count: normalizedCount,
    multiplier: normalizedMultiplier,
    label: normalizedCount === 3 ? 'x3' : 'x1.5',
    rerollsUsed: roll.rerollsUsed === 1 ? 1 : 0,
  };
}

function normalizeBoardGame(boardGame) {
  const rawPosition = Number(boardGame?.position);
  const rawRollsUsed = Number(boardGame?.rollsUsed);
  const normalizedPosition = Number.isFinite(rawPosition)
    ? Math.min(Math.max(Math.floor(rawPosition), 0), BOARD_GAME_SIZE)
    : 0;
  const normalizedRollsUsed = Number.isFinite(rawRollsUsed)
    ? Math.max(Math.floor(rawRollsUsed), 0)
    : 0;
  const turnHistory = Array.isArray(boardGame?.turnHistory)
    ? boardGame.turnHistory
      .map((turn) => normalizeBoardGameTurn(turn))
      .filter(Boolean)
    : [];

  return {
    position: normalizedPosition,
    rollsUsed: normalizedRollsUsed,
    turnHistory,
  };
}

function normalizeBoardGameTurn(turn) {
  if (!turn || typeof turn !== 'object') {
    return null;
  }

  const roll = Number(turn.roll);
  const from = Number(turn.from);
  const to = Number(turn.to);
  const penalty = Number(turn.penalty);

  if (!Number.isFinite(roll) || !Number.isFinite(from) || !Number.isFinite(to) || !Number.isFinite(penalty)) {
    return null;
  }

  return {
    roll: Math.min(Math.max(Math.floor(roll), 1), 6),
    from: Math.min(Math.max(Math.floor(from), 0), BOARD_GAME_SIZE),
    to: Math.min(Math.max(Math.floor(to), 0), BOARD_GAME_SIZE),
    penalty: Math.max(Math.floor(penalty), 0),
  };
}

function getTaskPoints(taskIds) {
  return taskIds.reduce((total, taskId) => {
    const task = TASKS.find((item) => item.id === taskId);
    return total + (task?.points ?? 0);
  }, 0);
}

function getSlotBonusPoints(user) {
  const normalizedUser = normalizeUser(user);

  return normalizedUser.slotMachine.bonusHistory.reduce((total, roll) => {
    const completedBonusTaskIds = roll.taskIds.filter((taskId) => (
      normalizedUser.completedTaskIds.includes(taskId)
    ));

    if (!completedBonusTaskIds.length) {
      return total;
    }

    return total + getTaskPoints(completedBonusTaskIds) * (roll.multiplier - 1);
  }, 0);
}

function getTotalScore(user) {
  const normalizedUser = normalizeUser(user);
  return getTaskPoints(normalizedUser.completedTaskIds) + getSlotBonusPoints(normalizedUser);
}

function formatPoints(points) {
  return Number.isInteger(points) ? String(points) : points.toFixed(1);
}

function shuffleTasks(tasks) {
  const nextTasks = [...tasks];

  for (let index = nextTasks.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextTasks[index], nextTasks[randomIndex]] = [nextTasks[randomIndex], nextTasks[index]];
  }

  return nextTasks;
}

function countDistinctCategories(tasks) {
  return new Set(tasks.map((task) => task.category)).size;
}

function buildSlotRoll(completedTaskIds, options = {}) {
  const { excludeTaskIds = [], rerollsUsed = 0, forcedCount = null } = options;
  const openTasks = TASKS.filter((task) => !completedTaskIds.includes(task.id));

  if (!openTasks.length) {
    return null;
  }

  const variants = SLOT_MACHINE_VARIANTS.filter(({ count }) => (
    openTasks.length >= count && countDistinctCategories(openTasks) >= count
  ));

  if (!variants.length) {
    return null;
  }

  const variantPool = variants.length ? variants : [SLOT_MACHINE_VARIANTS[0]];
  const forcedVariant = forcedCount
    ? variantPool.find(({ count }) => count === forcedCount)
    : null;
  const variant = forcedVariant ?? variantPool[Math.floor(Math.random() * variantPool.length)];
  const preferredPool = openTasks.filter((task) => !excludeTaskIds.includes(task.id));
  const preferredDistinctCategories = countDistinctCategories(preferredPool);
  const taskPool = preferredPool.length >= variant.count && preferredDistinctCategories >= variant.count
    ? preferredPool
    : openTasks;
  const excludedSet = new Set(excludeTaskIds);
  let selectedTasks = [];

  const pickTasksFromDistinctCategories = (pool, count) => {
    const pickedCategories = new Set();

    return shuffleTasks(pool).filter((task) => {
      if (pickedCategories.has(task.category)) {
        return false;
      }

      pickedCategories.add(task.category);
      return true;
    }).slice(0, count);
  };

  selectedTasks = pickTasksFromDistinctCategories(taskPool, variant.count);

  if (excludeTaskIds.length && openTasks.length > variant.count) {
    let attempts = 0;

    while (
      attempts < 8
      && selectedTasks.every((task) => excludedSet.has(task.id))
    ) {
      selectedTasks = pickTasksFromDistinctCategories(openTasks, variant.count);
      attempts += 1;
    }
  }

  return {
    id: `slot-roll-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    taskIds: selectedTasks.map((task) => task.id),
    count: variant.count,
    multiplier: variant.multiplier,
    label: variant.label,
    rerollsUsed,
  };
}

function resolveCompletedSlotRoll(user) {
  const normalizedUser = normalizeUser(user);
  const activeRoll = normalizedUser.slotMachine.activeRoll;

  if (!activeRoll) {
    return normalizedUser;
  }

  const isCompleted = activeRoll.taskIds.every((taskId) => normalizedUser.completedTaskIds.includes(taskId));

  if (!isCompleted) {
    return normalizedUser;
  }

  const alreadyStored = normalizedUser.slotMachine.bonusHistory.some((roll) => roll.id === activeRoll.id);

  return {
    ...normalizedUser,
    slotMachine: {
      activeRoll: null,
      bonusHistory: alreadyStored
        ? normalizedUser.slotMachine.bonusHistory
        : [...normalizedUser.slotMachine.bonusHistory, activeRoll],
    },
  };
}

function buildParticipantLinks(profileLinks) {
  return [
    { key: 'twitch', label: 'Twitch', href: profileLinks?.twitch ?? '' },
    { key: 'poeNinja', label: 'PoE Ninja', href: profileLinks?.poeNinja ?? '' },
    { key: 'poeProfile', label: 'PoE Profile', href: profileLinks?.poeProfile ?? '' },
  ].filter((link) => link.href);
}

function extractTwitchChannel(twitchUrl) {
  if (!twitchUrl) {
    return '';
  }

  try {
    const normalizedUrl = twitchUrl.startsWith('http') ? twitchUrl : `https://${twitchUrl}`;
    const parsedUrl = new URL(normalizedUrl);
    const segments = parsedUrl.pathname.split('/').filter(Boolean);

    if (!segments.length) {
      return '';
    }

    if (segments[0] === 'videos' || segments[0] === 'directory' || segments[0] === 'settings') {
      return '';
    }

    return segments[0].toLowerCase();
  } catch {
    return '';
  }
}

function getBoardGameAvailableRolls(user) {
  const normalizedUser = normalizeUser(user);
  return Math.max(normalizedUser.completedTaskIds.length - normalizedUser.boardGame.rollsUsed, 0);
}

export default function App() {
  const shellRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const [activeView, setActiveView] = useState('home');
  const [transitionTarget, setTransitionTarget] = useState(null);
  const [taskCategory, setTaskCategory] = useState('all');
  const [taskQuery, setTaskQuery] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authUsers, setAuthUsers] = useState([]);
  const [sessionUser, setSessionUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [activeClip, setActiveClip] = useState(null);
  const [activeLadderUserId, setActiveLadderUserId] = useState(null);
  const [ladderModalTab, setLadderModalTab] = useState('tasks');
  const [twitchStatuses, setTwitchStatuses] = useState({});
  const [cabinetTab, setCabinetTab] = useState('tasks');
  const [cabinetTaskQuery, setCabinetTaskQuery] = useState('');
  const [cabinetTaskStatus, setCabinetTaskStatus] = useState('all');
  const [cabinetTaskCategory, setCabinetTaskCategory] = useState('all');
  const [slotSpinCount, setSlotSpinCount] = useState(1);
  const [loginForm, setLoginForm] = useState({ nickname: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    nickname: '',
    password: '',
    confirmPassword: '',
  });
  const titleTop = useRuneScramble('ПОЗНАЙ', {
    delay: 100,
    duration: 950,
    tick: 64,
  });

  const titleBottom = useRuneScramble('ПУСТОТУ', {
    delay: 420,
    duration: 1100,
    tick: 64,
  });

  const titleComplete = titleTop.isDone && titleBottom.isDone;
  const subtitleClassName = useMemo(
    () => `hero-subtitle${titleComplete ? ' hero-subtitle--visible' : ''}`,
    [titleComplete],
  );

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return undefined;
    }

    const node = shellRef.current;

    if (!node) {
      return undefined;
    }

    const updateParallax = (clientX, clientY) => {
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;

      node.style.setProperty('--parallax-x', x.toFixed(4));
      node.style.setProperty('--parallax-y', y.toFixed(4));
    };

    const handleMove = (event) => {
      updateParallax(event.clientX, event.clientY);
    };

    const handleLeave = () => {
      node.style.setProperty('--parallax-x', '0');
      node.style.setProperty('--parallax-y', '0');
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  useEffect(() => () => {
    window.clearTimeout(transitionTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!activeClip && !activeLadderUserId) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveClip(null);
        setActiveLadderUserId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeClip, activeLadderUserId]);

  useEffect(() => {
    let isCancelled = false;

    const loadBootstrapData = async () => {
      try {
        const [ladderResponse, meResponse] = await Promise.all([
          apiRequest('/ladder').catch(() => []),
          apiRequest('/me').catch(() => null),
        ]);

        if (isCancelled) {
          return;
        }

        setAuthUsers(Array.isArray(ladderResponse) ? ladderResponse.map(normalizeUser) : []);
        setSessionUser(meResponse ? normalizeUser(meResponse) : null);
      } catch {
        if (!isCancelled) {
          setAuthUsers([]);
          setSessionUser(null);
        }
      }
    };

    loadBootstrapData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const startSceneTransition = (nextView) => {
    if (nextView === activeView || transitionTarget) {
      return;
    }

    setTransitionTarget(nextView);
    window.clearTimeout(transitionTimeoutRef.current);

    transitionTimeoutRef.current = window.setTimeout(() => {
      setActiveView(nextView);
      setTransitionTarget(null);
    }, SCENE_TRANSITION_MS);
  };

  const handleNavigationClick = (event, item) => {
    if (!item.page) {
      return;
    }

    event.preventDefault();
    startSceneTransition(item.page);
  };

  const handleBrandClick = (event) => {
    if (activeView === 'home' && !transitionTarget) {
      return;
    }

    event.preventDefault();
    startSceneTransition('home');
  };

  const shellClassName = useMemo(() => {
    const classes = ['app-shell', `app-shell--view-${activeView}`];
    const isInnerView = activeView !== 'home';

    if (isInnerView) {
      classes.push('app-shell--inner-view');
    }

    if (transitionTarget && activeView === 'home' && transitionTarget !== 'home') {
      classes.push('app-shell--transitioning', 'app-shell--transitioning-to-inner');
    }

    if (transitionTarget === 'home' && activeView !== 'home') {
      classes.push('app-shell--transitioning', 'app-shell--transitioning-to-home');
    }

    return classes.join(' ');
  }, [activeView, transitionTarget]);

  const showHeroPage = activeView === 'home';
  const showLadderPage = activeView === 'ladder';
  const showTasksPage = activeView === 'tasks';
  const showParticipantsPage = activeView === 'participants';
  const showClipsPage = activeView === 'clips';
  const showRulesPage = activeView === 'rules';
  const showLoginPage = activeView === 'login';
  const normalizedTaskQuery = taskQuery.trim().toLowerCase();
  const filteredTasks = useMemo(() => TASKS.filter((task) => {
    const matchesCategory = taskCategory === 'all' || task.category === taskCategory;
    const haystack = `${task.title} ${task.description} ${task.categoryLabel}`.toLowerCase();
    const matchesQuery = !normalizedTaskQuery || haystack.includes(normalizedTaskQuery);

    return matchesCategory && matchesQuery;
  }), [normalizedTaskQuery, taskCategory]);
  const groupedTasks = useMemo(() => TASK_CATEGORIES
    .filter((category) => category.key !== 'all')
    .map((category) => ({
      ...category,
      items: filteredTasks.filter((task) => task.category === category.key),
    }))
    .filter((group) => group.items.length > 0), [filteredTasks]);
  const completedTaskIds = sessionUser?.completedTaskIds ?? [];
  const completedTasksCount = completedTaskIds.length;
  const completedTasksPoints = getTaskPoints(completedTaskIds);
  const slotBonusPoints = sessionUser ? getSlotBonusPoints(sessionUser) : 0;
  const totalScore = completedTasksPoints + slotBonusPoints;
  const activeSlotRoll = sessionUser?.slotMachine?.activeRoll ?? null;
  const boardGameState = sessionUser?.boardGame ?? normalizeBoardGame();
  const boardGamePosition = boardGameState.position;
  const boardGameTurnHistory = boardGameState.turnHistory;
  const availableBoardRolls = sessionUser ? getBoardGameAvailableRolls(sessionUser) : 0;
  const boardProgress = Math.round((boardGamePosition / BOARD_GAME_SIZE) * 100);
  const boardGameRows = useMemo(() => Array.from({ length: 10 }, (_, rowIndex) => {
    const base = rowIndex * 10;
    const rowCells = BOARD_GAME_CELLS.slice(base, base + 10);

    return rowIndex % 2 === 0 ? [...rowCells].reverse() : rowCells;
  }).reverse(), []);
  const availableSlotTasks = TASKS.filter((task) => !completedTaskIds.includes(task.id));
  const availableSlotCategoryCount = countDistinctCategories(availableSlotTasks);
  const slotRollTasks = activeSlotRoll
    ? activeSlotRoll.taskIds
      .map((taskId) => TASKS.find((task) => task.id === taskId))
      .filter(Boolean)
    : [];
  const canStartSlotRoll = Boolean(sessionUser)
    && !activeSlotRoll
    && availableSlotTasks.length >= slotSpinCount
    && availableSlotCategoryCount >= slotSpinCount;
  const canRerollSlot = Boolean(activeSlotRoll)
    && activeSlotRoll.rerollsUsed < 1
    && availableSlotTasks.length > activeSlotRoll.count;
  const normalizedCabinetTaskQuery = cabinetTaskQuery.trim().toLowerCase();
  const ladderEntries = useMemo(() => authUsers
    .map((user) => {
      const normalizedUser = normalizeUser(user);

      return {
        ...normalizedUser,
        score: getTotalScore(normalizedUser),
        boardPosition: normalizedUser.boardGame.position,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.completedTaskIds.length !== left.completedTaskIds.length) {
        return right.completedTaskIds.length - left.completedTaskIds.length;
      }

      return left.nickname.localeCompare(right.nickname, 'ru');
    }), [authUsers]);
  const participantEntries = useMemo(() => authUsers
    .map((user) => {
      const normalizedUser = normalizeUser(user);

      return {
        ...normalizedUser,
        score: getTotalScore(normalizedUser),
        links: buildParticipantLinks(normalizedUser.profileLinks),
        twitchChannel: extractTwitchChannel(normalizedUser.profileLinks?.twitch),
      };
    })
    .sort((left, right) => left.nickname.localeCompare(right.nickname, 'ru')), [authUsers]);
  const cabinetFilteredTasks = useMemo(() => TASKS.filter((task) => {
    const isCompleted = completedTaskIds.includes(task.id);
    const matchesStatus = cabinetTaskStatus === 'all'
      || (cabinetTaskStatus === 'completed' && isCompleted)
      || (cabinetTaskStatus === 'open' && !isCompleted);
    const matchesCategory = cabinetTaskCategory === 'all' || task.category === cabinetTaskCategory;
    const haystack = `${task.title} ${task.description} ${task.categoryLabel}`.toLowerCase();
    const matchesQuery = !normalizedCabinetTaskQuery || haystack.includes(normalizedCabinetTaskQuery);

    return matchesStatus && matchesCategory && matchesQuery;
  }), [cabinetTaskCategory, cabinetTaskStatus, completedTaskIds, normalizedCabinetTaskQuery]);
  const cabinetGroupedTasks = useMemo(() => TASK_CATEGORIES
    .filter((category) => category.key !== 'all')
    .map((category) => ({
      ...category,
      items: cabinetFilteredTasks.filter((task) => task.category === category.key),
    }))
    .filter((group) => group.items.length > 0), [cabinetFilteredTasks]);
  const activeLadderUser = useMemo(() => (
    activeLadderUserId
      ? ladderEntries.find((user) => user.id === activeLadderUserId) ?? null
      : null
  ), [activeLadderUserId, ladderEntries]);
  const activeLadderUserTasks = useMemo(() => (
    activeLadderUser
      ? TASKS.filter((task) => activeLadderUser.completedTaskIds.includes(task.id))
      : []
  ), [activeLadderUser]);
  const activeLadderUserTurns = activeLadderUser?.boardGame.turnHistory ?? [];

  const handleLoginInputChange = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
    setAuthError('');
  };

  const handleRegisterInputChange = (field, value) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
    setAuthError('');
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          nickname: loginForm.nickname.trim(),
          password: loginForm.password,
        }),
      });

      const normalizedUser = normalizeUser(response.user);
      setSessionUser(normalizedUser);
      setAuthUsers((current) => mergeUserList(current, normalizedUser));
      setAuthError('');
      setLoginForm({ nickname: '', password: '' });
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nickname: registerForm.nickname.trim(),
          password: registerForm.password,
          confirmPassword: registerForm.confirmPassword,
        }),
      });

      const normalizedUser = normalizeUser(response.user);
      setAuthUsers((current) => mergeUserList(current, normalizedUser));
      setSessionUser(normalizedUser);
      setAuthError('');
      setRegisterForm({
        nickname: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout transport issues and clear client state anyway.
    }

    setSessionUser(null);
  };

  const updateSessionUser = async (updater) => {
    if (!sessionUser) {
      return null;
    }

    const previousSessionUser = sessionUser;
    const nextSessionUser = normalizeUser(
      typeof updater === 'function' ? updater(sessionUser) : updater,
    );

    setSessionUser(nextSessionUser);
    setAuthUsers((current) => mergeUserList(current, nextSessionUser));

    try {
      const response = await apiRequest('/me', {
        method: 'PATCH',
        body: JSON.stringify({
          completedTaskIds: nextSessionUser.completedTaskIds,
          status: nextSessionUser.status,
          note: nextSessionUser.note,
          profileLinks: nextSessionUser.profileLinks,
          slotMachine: nextSessionUser.slotMachine,
          boardGame: nextSessionUser.boardGame,
        }),
      });
      const normalizedUser = normalizeUser(response);
      setSessionUser(normalizedUser);
      setAuthUsers((current) => mergeUserList(current, normalizedUser));
      setAuthError('');
      return normalizedUser;
    } catch (error) {
      setSessionUser(previousSessionUser);
      setAuthUsers((current) => mergeUserList(current, previousSessionUser));
      setAuthError(error.message);
      return null;
    }
  };

  useEffect(() => {
    if (!sessionUser?.slotMachine?.activeRoll) {
      return;
    }

    const resolvedUser = resolveCompletedSlotRoll(sessionUser);

    if (resolvedUser.slotMachine.activeRoll?.id === sessionUser.slotMachine.activeRoll?.id) {
      return;
    }

    updateSessionUser(resolvedUser);
  }, [sessionUser]);

  useEffect(() => {
    if (activeView !== 'participants') {
      return undefined;
    }

    const channels = [...new Set(
      participantEntries
        .map((user) => user.twitchChannel)
        .filter(Boolean),
    )];

    if (!channels.length) {
      setTwitchStatuses({});
      return undefined;
    }

    let isCancelled = false;

    const loadStatuses = async () => {
      const nextStatuses = {};

      await Promise.all(channels.map(async (channel) => {
        try {
          const response = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(channel)}`);
          const text = (await response.text()).trim().toLowerCase();
          const isOnline = response.ok
            && text
            && text !== `${channel} is offline`
            && text !== 'offline'
            && !text.includes('could not resolve channel');

          nextStatuses[channel] = {
            state: isOnline ? 'online' : 'offline',
          };
        } catch {
          nextStatuses[channel] = {
            state: 'unknown',
          };
        }
      }));

      if (!isCancelled) {
        setTwitchStatuses(nextStatuses);
      }
    };

    loadStatuses();
    const intervalId = window.setInterval(loadStatuses, 60000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeView, participantEntries]);

  const toggleTaskCompletion = (taskId) => {
    if (!sessionUser) {
      return;
    }

    const hasTask = sessionUser.completedTaskIds.includes(taskId);
    const nextCompletedTaskIds = hasTask
      ? sessionUser.completedTaskIds.filter((id) => id !== taskId)
      : [...sessionUser.completedTaskIds, taskId];

    updateSessionUser({
      ...sessionUser,
      completedTaskIds: nextCompletedTaskIds,
    });
  };

  const handleProfileLinkChange = (field, value) => {
    updateSessionUser({
      ...sessionUser,
      profileLinks: {
        ...sessionUser.profileLinks,
        [field]: value,
      },
    });
  };

  const handleSlotSpin = () => {
    if (!sessionUser || activeSlotRoll) {
      return;
    }

    const nextRoll = buildSlotRoll(sessionUser.completedTaskIds, {
      forcedCount: slotSpinCount,
    });

    if (!nextRoll) {
      return;
    }

    updateSessionUser({
      ...sessionUser,
      slotMachine: {
        ...sessionUser.slotMachine,
        activeRoll: nextRoll,
      },
    });
  };

  const handleSlotReroll = () => {
    if (!sessionUser || !activeSlotRoll || activeSlotRoll.rerollsUsed >= 1) {
      return;
    }

    const nextRoll = buildSlotRoll(sessionUser.completedTaskIds, {
      excludeTaskIds: activeSlotRoll.taskIds,
      rerollsUsed: 1,
      forcedCount: activeSlotRoll.count,
    });

    if (!nextRoll) {
      return;
    }

    updateSessionUser({
      ...sessionUser,
      slotMachine: {
        ...sessionUser.slotMachine,
        activeRoll: nextRoll,
      },
    });
  };

  const handleBoardGameRoll = () => {
    if (!sessionUser || availableBoardRolls <= 0 || boardGamePosition >= BOARD_GAME_SIZE) {
      return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    const from = boardGamePosition;
    const advancedTo = Math.min(from + roll, BOARD_GAME_SIZE);
    const penalty = BOARD_GAME_PENALTIES[advancedTo] ?? 0;
    const to = Math.max(advancedTo - penalty, 0);

    updateSessionUser({
      ...sessionUser,
      boardGame: {
        position: to,
        rollsUsed: boardGameState.rollsUsed + 1,
        turnHistory: [
          {
            roll,
            from,
            to,
            penalty,
          },
          ...boardGameTurnHistory,
        ].slice(0, 12),
      },
    });
  };

  const boardGameHistoryItems = boardGameTurnHistory.length
    ? boardGameTurnHistory.map((turn, index) => ({
      id: `turn-${index}-${turn.from}-${turn.to}-${turn.roll}`,
      label: `Бросок ${boardGameState.rollsUsed - index}`,
      ...turn,
    }))
    : [];
  const ladderModalHistoryItems = activeLadderUserTurns.length
    ? activeLadderUserTurns.map((turn, index) => ({
      id: `ladder-turn-${index}-${turn.from}-${turn.to}-${turn.roll}`,
      label: `Бросок ${activeLadderUser.boardGame.rollsUsed - index}`,
      ...turn,
    }))
    : [];

  const buildClipEmbedUrl = (slug) => `https://clips.twitch.tv/embed?clip=${slug}&parent=${window.location.hostname || 'localhost'}`;

  return (
    <div className={shellClassName} ref={shellRef}>
      <CustomCursor />
      <div className="hero-bg hero-bg--back" aria-hidden="true" />
      <div className="hero-bg hero-bg--figure" aria-hidden="true" />
      <div className="hero-bg hero-bg--front" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-circle hero-circle--outer" aria-hidden="true" />
      <div className="hero-orbit hero-orbit--outer" aria-hidden="true">
        <span className="hero-orbit__rune hero-orbit__rune--primary">ᛟ</span>
        <span className="hero-orbit__rune hero-orbit__rune--secondary">ᚱ</span>
        <span className="hero-orbit__rune hero-orbit__rune--tertiary">ᛞ</span>
        <span className="hero-orbit__rune hero-orbit__rune--quaternary">ᚨ</span>
        <span className="hero-orbit__rune hero-orbit__rune--quinary">ᛉ</span>
      </div>
      <div className="hero-circle hero-circle--inner" aria-hidden="true" />
      <div className="hero-axis" aria-hidden="true" />

      <Header
        activeView={activeView}
        brand="Void Ritual"
        navigationItems={navigationItems}
        onBrandClick={handleBrandClick}
        onNavigationClick={handleNavigationClick}
      />

      <main className="hero-stage">
        {showLadderPage ? (
          <section className="ladder-page">
            <span className="ladder-page__eyebrow">Ладдер</span>
            <h1>Зал призванных</h1>
            <p>Локальный рейтинг по прогрессу задач. Потом это можно будет привязать к реальному аккаунту и серверным данным.</p>

            <div className="ladder-board">
              <div className="ladder-board__head">
                <span>Игрок</span>
                <span>Выполнено задач</span>
                <span>Клетка</span>
                <span>Баллы</span>
              </div>

              {ladderEntries.length ? (
                ladderEntries.map((user, index) => (
                        <button
                          key={user.id}
                          type="button"
                          className="ladder-row ladder-row--button"
                          onClick={() => {
                            setActiveLadderUserId(user.id);
                            setLadderModalTab('tasks');
                          }}
                        >
                          <div className="ladder-row__player">
                            <strong>{index + 1}</strong>
                            <div>
                              <h2>{user.nickname}</h2>
                            </div>
                          </div>
                    <div className="ladder-row__score">{user.completedTaskIds.length}</div>
                    <div className="ladder-row__cell">{user.boardPosition || 'Старт'}</div>
                    <div className="ladder-row__status">{formatPoints(user.score)}</div>
                  </button>
                ))
              ) : (
                <div className="ladder-empty">
                  <h2>Пока пусто</h2>
                  <p>Как только появятся локальные профили и первые отмеченные задачи, они появятся здесь.</p>
                </div>
              )}
            </div>
          </section>
        ) : showTasksPage ? (
          <section className="tasks-page">
            <div className="tasks-page__head">
              <span className="tasks-page__eyebrow">Задачи</span>
              <h1>Ритуалы сезона</h1>
              <p>Когда задач станет очень много, здесь должно быть тупо понятно: нашел категорию, вбил слово, открыл нужный блок и пошел делать.</p>
            </div>

            <div className="tasks-toolbar">
              <label className="tasks-search">
                <span className="tasks-search__label">Поиск</span>
                <input
                  type="text"
                  placeholder="Например: карты, старт, дроп, босс..."
                  value={taskQuery}
                  onChange={(event) => setTaskQuery(event.target.value)}
                />
              </label>

              <div className="tasks-filters" aria-label="Категории задач">
                {TASK_CATEGORIES.map((category) => {
                  const count = category.key === 'all'
                    ? TASKS.length
                    : TASKS.filter((task) => task.category === category.key).length;

                  return (
                    <button
                      key={category.key}
                      type="button"
                      className={taskCategory === category.key ? 'is-active' : undefined}
                      onClick={() => setTaskCategory(category.key)}
                    >
                      <span>{category.label}</span>
                      <strong>{count}</strong>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tasks-summary">
              <span>Найдено задач: {filteredTasks.length}</span>
              {(taskCategory !== 'all' || normalizedTaskQuery) ? (
                <button
                  type="button"
                  className="tasks-summary__reset"
                  onClick={() => {
                    setTaskCategory('all');
                    setTaskQuery('');
                  }}
                >
                  Сбросить фильтры
                </button>
              ) : null}
            </div>

            {groupedTasks.length ? (
              <div className="tasks-groups">
                {groupedTasks.map((group) => (
                  <section key={group.key} className="task-group">
                    <div className="task-group__head">
                      <h2>{group.label}</h2>
                      <span>{group.items.length}</span>
                    </div>

                    <div className="tasks-grid">
                      {group.items.map((task, index) => (
                        <article
                          key={task.id}
                          className={`task-card${completedTaskIds.includes(task.id) ? ' task-card--completed' : ''}`}
                        >
                          <span className="task-card__index">{String(index + 1).padStart(2, '0')}</span>
                          <span className="task-card__category">{task.categoryLabel}</span>
                          <span className="task-card__points">{task.points} баллов</span>
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>
                          {sessionUser ? (
                            <button
                              type="button"
                              className={`task-card__toggle${completedTaskIds.includes(task.id) ? ' is-active' : ''}`}
                              onClick={() => toggleTaskCompletion(task.id)}
                            >
                              {completedTaskIds.includes(task.id) ? 'Засчитано' : 'Засчитать себе'}
                            </button>
                          ) : (
                            <span className="task-card__hint">Войди, чтобы засчитывать задачи себе</span>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="tasks-empty">
                <h2>Ничего не найдено</h2>
                <p>Попробуй другую категорию или убери часть слов из поиска.</p>
              </div>
            )}
          </section>
        ) : showParticipantsPage ? (
          <section className="participants-page">
            <div className="participants-page__head">
              <span className="ladder-page__eyebrow">Участники</span>
              <h1>Круг призванных</h1>
              <p>Здесь отображаются все зарегистрированные аккаунты. В рамках этой страницы аккаунт и есть участник лиги.</p>
            </div>

            <div className="participants-grid">
              {participantEntries.length ? (
                participantEntries.map((user) => (
                  <article
                    key={user.id}
                    className={`participant-card${twitchStatuses[user.twitchChannel]?.state === 'online' ? ' participant-card--online' : ''}`}
                  >
                    <div className="participant-card__head">
                      {twitchStatuses[user.twitchChannel]?.state === 'online' ? (
                        <span className="participant-card__live">Онлайн на Twitch</span>
                      ) : null}
                      <h2>{user.nickname}</h2>
                    </div>

                    <dl className="participant-card__stats">
                      <div>
                        <dt>Задач выполнено</dt>
                        <dd>{user.completedTaskIds.length}</dd>
                      </div>
                      <div>
                        <dt>Баллы</dt>
                        <dd>{formatPoints(user.score)}</dd>
                      </div>
                    </dl>

                    {user.links.length ? (
                      <div className="participant-card__links">
                        {user.links.map((link) => (
                          <a key={link.key} href={link.href} target="_blank" rel="noreferrer">
                            {link.label}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="participant-card__empty">Пока без добавленных ссылок профиля.</span>
                    )}
                  </article>
                ))
              ) : (
                <article className="participant-card participant-card--empty">
                  <h2>Пока пусто</h2>
                  <p>Как только кто-то зарегистрирует аккаунт через страницу входа, он сразу появится здесь как участник.</p>
                </article>
              )}
            </div>
          </section>
        ) : showClipsPage ? (
          <section className="clips-page">
            <div className="clips-page__head">
              <span className="ladder-page__eyebrow">Клипы</span>
              <h1>Моменты лиги</h1>
              <p>Пока здесь моковые карточки, но дальше этот раздел можно будет наполнять клипами с Twitch от всех участников, у кого привязана ссылка.</p>
            </div>

            <div className="clips-grid">
              {CLIPS.map((clip) => (
                <button
                  key={clip.id}
                  type="button"
                  className="clip-card"
                  onClick={() => setActiveClip(clip)}
                >
                  <div className="clip-card__preview">
                    <img src={clip.previewImage} alt={clip.title} />
                    <span className="clip-card__play">Смотреть</span>
                  </div>

                  <div className="clip-card__body">
                    <span className="clip-card__author">{clip.author}</span>
                    <h2 title={clip.title}>{clip.title}</h2>
                  </div>
                </button>
              ))}
            </div>

            {activeClip ? (
              <div
                className="clip-modal"
                role="presentation"
                onClick={() => setActiveClip(null)}
              >
                <div
                  className="clip-modal__dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="clip-modal-title"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="clip-modal__close"
                    onClick={() => setActiveClip(null)}
                    aria-label="Закрыть просмотр клипа"
                  >
                    Закрыть
                  </button>

                  <div className="clip-modal__meta">
                    <span>{activeClip.author}</span>
                    <h2 id="clip-modal-title">{activeClip.title}</h2>
                  </div>

                  <div className="clip-modal__frame">
                    <iframe
                      src={buildClipEmbedUrl(activeClip.slug)}
                      title={activeClip.title}
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        ) : showRulesPage ? (
          <section className="ladder-page rules-page">
            <span className="ladder-page__eyebrow">Правила</span>
            <h1>Кодекс круга</h1>
            <p>Это временное демо-наполнение, чтобы посмотреть, как на странице будут выглядеть реальные правила, договоренности и внутренние регламенты лиги.</p>

            <div className="rules-grid">
              {RULE_SECTIONS.map((section, index) => (
                <article key={section.id} className="rules-card">
                  <div className="rules-card__head">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <h2>{section.title}</h2>
                  </div>

                  <div className="rules-card__list">
                    {section.items.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : showLoginPage ? (
          <section className={`auth-page${sessionUser ? ' auth-page--cabinet' : ''}`}>
            {sessionUser ? (
              <div className="cabinet-layout">
                <aside className="cabinet-panel">
                  <div className="cabinet-card__head">
                    <div>
                      <span className="cabinet-card__eyebrow">Личный кабинет</span>
                      <h2>{sessionUser.nickname}</h2>
                    </div>
                  </div>

                  <div className="cabinet-nav" aria-label="Разделы кабинета">
                    <button
                      type="button"
                      className={cabinetTab === 'tasks' ? 'is-active' : undefined}
                      onClick={() => setCabinetTab('tasks')}
                    >
                      Задачи
                    </button>
                    <button
                      type="button"
                      className={cabinetTab === 'slot' ? 'is-active' : undefined}
                      onClick={() => setCabinetTab('slot')}
                    >
                      Автомат
                    </button>
                    <button
                      type="button"
                      className={cabinetTab === 'board' ? 'is-active' : undefined}
                      onClick={() => setCabinetTab('board')}
                    >
                      Игра
                    </button>
                    <button
                      type="button"
                      className={cabinetTab === 'profile' ? 'is-active' : undefined}
                      onClick={() => setCabinetTab('profile')}
                    >
                      Профиль
                    </button>
                  </div>

                  <div className="cabinet-grid">
                    <article className="cabinet-item">
                      <span>Выполнено задач</span>
                      <strong>{completedTasksCount}</strong>
                    </article>
                    <article className="cabinet-item">
                      <span>Баллы</span>
                      <strong>{formatPoints(totalScore)}</strong>
                    </article>
                    <article className="cabinet-item">
                      <span>Бонус слота</span>
                      <strong>{formatPoints(slotBonusPoints)}</strong>
                    </article>
                    <article className="cabinet-item">
                      <span>Бросков в запасе</span>
                      <strong>{availableBoardRolls}</strong>
                    </article>
                  </div>

                  <button type="button" className="cabinet-card__logout" onClick={handleLogout}>
                    Выйти
                  </button>
                </aside>

                {cabinetTab === 'tasks' ? (
                  <div className="cabinet-tasks">
                    <div className="cabinet-tasks__head">
                      <div>
                        <span className="cabinet-card__eyebrow">Прогресс</span>
                        <h3>Мои задачи</h3>
                      </div>
                      <span>{cabinetFilteredTasks.length} / {TASKS.length}</span>
                    </div>

                    <div className="cabinet-tasks__controls">
                      <label className="cabinet-search">
                        <span>Поиск</span>
                        <input
                          type="text"
                          placeholder="Найти задачу, категорию, слово..."
                          value={cabinetTaskQuery}
                          onChange={(event) => setCabinetTaskQuery(event.target.value)}
                        />
                      </label>

                      <div className="cabinet-filters" aria-label="Фильтр задач кабинета">
                        <button
                          type="button"
                          className={cabinetTaskStatus === 'all' ? 'is-active' : undefined}
                          onClick={() => setCabinetTaskStatus('all')}
                        >
                          Все
                        </button>
                        <button
                          type="button"
                          className={cabinetTaskStatus === 'open' ? 'is-active' : undefined}
                          onClick={() => setCabinetTaskStatus('open')}
                        >
                          Не выполнены
                        </button>
                        <button
                          type="button"
                          className={cabinetTaskStatus === 'completed' ? 'is-active' : undefined}
                          onClick={() => setCabinetTaskStatus('completed')}
                        >
                          Выполнены
                        </button>
                      </div>
                    </div>

                    <div className="cabinet-category-filters" aria-label="Категории задач кабинета">
                      {TASK_CATEGORIES.map((category) => {
                        const count = category.key === 'all'
                          ? TASKS.length
                          : TASKS.filter((task) => task.category === category.key).length;

                        return (
                          <button
                            key={category.key}
                            type="button"
                            className={cabinetTaskCategory === category.key ? 'is-active' : undefined}
                            onClick={() => setCabinetTaskCategory(category.key)}
                          >
                            <span>{category.label}</span>
                            <strong>{count}</strong>
                          </button>
                        );
                      })}
                    </div>

                    {cabinetGroupedTasks.length ? (
                      <div className="cabinet-task-groups">
                        {cabinetGroupedTasks.map((group) => (
                          <section key={group.key} className="cabinet-task-group">
                            <div className="cabinet-task-group__head">
                              <h4>{group.label}</h4>
                              <span>{group.items.length}</span>
                            </div>

                            <div className="cabinet-tasks__list">
                              {group.items.map((task) => {
                                const isCompleted = completedTaskIds.includes(task.id);

                                return (
                                  <label key={task.id} className={`cabinet-task${isCompleted ? ' is-completed' : ''}`}>
                                    <input
                                      type="checkbox"
                                      checked={isCompleted}
                                      onChange={() => toggleTaskCompletion(task.id)}
                                    />
                                    <span className="cabinet-task__body">
                                      <strong>{task.title}</strong>
                                      <small>{task.categoryLabel} · {task.points} баллов</small>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </section>
                        ))}
                      </div>
                    ) : (
                      <div className="cabinet-tasks__empty">
                        <h4>Ничего не найдено</h4>
                        <p>Попробуй убрать часть слов или переключить фильтр.</p>
                      </div>
                    )}
                  </div>
                ) : cabinetTab === 'slot' ? (
                  <div className="cabinet-tasks">
                    <div className="cabinet-tasks__head">
                      <div>
                        <span className="cabinet-card__eyebrow">Случайная выдача</span>
                        <h3>Автомат задач</h3>
                      </div>
                      <span>{activeSlotRoll ? activeSlotRoll.label : 'Готов к запуску'}</span>
                    </div>

                    <section className="slot-machine">
                      <div className="slot-machine__hero">
                        <div className="slot-machine__copy">
                          <span className="slot-machine__eyebrow">Риск и бонус</span>
                          <h4>1 задача дает x1.5, 3 задачи дают x3</h4>
                          <p>
                            Пока текущая выдача не закрыта, новый прокрут недоступен.
                            Для каждого набора есть один перекрут, который полностью меняет выпавшие задачи.
                          </p>
                        </div>

                        <div className="slot-machine__actions">
                          <div className="slot-machine__modes" aria-label="Выбор количества задач">
                            <button
                              type="button"
                              className={`slot-machine__mode${slotSpinCount === 1 ? ' is-active' : ''}`}
                              onClick={() => setSlotSpinCount(1)}
                              disabled={Boolean(activeSlotRoll)}
                            >
                              1 задача
                            </button>
                            <button
                              type="button"
                              className={`slot-machine__mode${slotSpinCount === 3 ? ' is-active' : ''}`}
                              onClick={() => setSlotSpinCount(3)}
                              disabled={Boolean(activeSlotRoll) || availableSlotTasks.length < 3 || availableSlotCategoryCount < 3}
                            >
                              3 задачи
                            </button>
                          </div>
                          <button
                            type="button"
                            className="slot-machine__button"
                            onClick={handleSlotSpin}
                            disabled={!canStartSlotRoll}
                          >
                            Крутить на {slotSpinCount}
                          </button>
                          <button
                            type="button"
                            className="slot-machine__button slot-machine__button--secondary"
                            onClick={handleSlotReroll}
                            disabled={!canRerollSlot}
                          >
                            Перекрутить
                          </button>
                        </div>
                      </div>

                      <div className="slot-machine__stats">
                        <article className="slot-machine__stat">
                          <span>Текущий режим</span>
                          <strong>{activeSlotRoll ? `${activeSlotRoll.count} задачи` : 'Нет активной выдачи'}</strong>
                        </article>
                        <article className="slot-machine__stat">
                          <span>Множитель</span>
                          <strong>{activeSlotRoll ? activeSlotRoll.label : 'Ожидание'}</strong>
                        </article>
                        <article className="slot-machine__stat">
                          <span>Перекрут</span>
                          <strong>{activeSlotRoll ? `${1 - activeSlotRoll.rerollsUsed} из 1` : '1 из 1'}</strong>
                        </article>
                      </div>

                      {activeSlotRoll ? (
                        <div className="slot-machine__roll">
                          <div className="slot-machine__roll-head">
                            <div>
                              <span className="slot-machine__label">Выпало сейчас</span>
                              <h4>{activeSlotRoll.count === 1 ? 'Один шанс на жирный бонус' : 'Тройной пак задач'}</h4>
                            </div>
                            <span className="slot-machine__multiplier">{activeSlotRoll.label}</span>
                          </div>

                          <div className="slot-machine__tasks">
                            {slotRollTasks.map((task) => {
                              const isCompleted = completedTaskIds.includes(task.id);

                              return (
                                <article key={task.id} className={`slot-task${isCompleted ? ' slot-task--completed' : ''}`}>
                                  <div className="slot-task__head">
                                    <span>{task.categoryLabel}</span>
                                    <strong>{formatPoints(task.points * activeSlotRoll.multiplier)} балла</strong>
                                  </div>
                                  <h5>{task.title}</h5>
                                  <p>{task.description}</p>
                                  <button
                                    type="button"
                                    className={`slot-task__toggle${isCompleted ? ' is-active' : ''}`}
                                    onClick={() => toggleTaskCompletion(task.id)}
                                  >
                                    {isCompleted ? 'Засчитано' : 'Отметить выполнение'}
                                  </button>
                                </article>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="slot-machine__empty">
                          <h4>Автомат ждет прокрут</h4>
                          <p>
                            Когда выпадение завершится и все задачи будут закрыты, можно будет снова крутить новый набор.
                          </p>
                        </div>
                      )}
                    </section>
                  </div>
                ) : cabinetTab === 'board' ? (
                  <div className="cabinet-tasks">
                    <div className="cabinet-tasks__head">
                      <div>
                        <span className="cabinet-card__eyebrow">Настольная игра</span>
                        <h3>Путь на 100 клеток</h3>
                      </div>
                      <span>{boardGamePosition} / {BOARD_GAME_SIZE}</span>
                    </div>

                    <section className="board-game">
                      <div className="board-game__hero">
                        <div className="board-game__copy">
                          <span className="slot-machine__eyebrow">Броски за достижения</span>
                          <h4>Каждое выполненное достижение дает 1 бросок кубика</h4>
                          <p>
                            Доходишь до клетки, бросаешь кубик и двигаешься вперед.
                            Но некоторые клетки нестабильны и отбрасывают назад на несколько шагов.
                          </p>
                        </div>

                        <span className="board-game__hint">
                          {availableBoardRolls > 0
                            ? `Доступно бросков: ${availableBoardRolls}`
                            : 'Сначала выполни новое достижение, чтобы получить бросок.'}
                        </span>
                      </div>

                      <div className="board-game__stats">
                        <article className="slot-machine__stat">
                          <span>Текущая клетка</span>
                          <strong>{boardGamePosition || 'Старт'}</strong>
                        </article>
                        <article className="slot-machine__stat">
                          <span>Прогресс</span>
                          <strong>{boardProgress}%</strong>
                        </article>
                        <article className="slot-machine__stat">
                          <span>Бросков потрачено</span>
                          <strong>{boardGameState.rollsUsed}</strong>
                        </article>
                      </div>

                      <div className="board-game__controls">
                        <button
                          type="button"
                          className="slot-machine__button board-game__button"
                          onClick={handleBoardGameRoll}
                          disabled={availableBoardRolls <= 0 || boardGamePosition >= BOARD_GAME_SIZE}
                        >
                          {boardGamePosition >= BOARD_GAME_SIZE ? 'Финиш достигнут' : 'Бросить кубик'}
                        </button>
                      </div>

                      <div className="board-game__layout">
                        <div className="board-game__grid" aria-label="Игровое поле на 100 клеток">
                          {boardGameRows.map((row, rowIndex) => (
                            <div key={`row-${rowIndex}`} className="board-game__row">
                              {row.map((cell) => {
                                const isPlayer = cell.position === boardGamePosition && boardGamePosition > 0;
                                const isPenalty = cell.moveBack > 0;
                                const isPassed = cell.position < boardGamePosition;

                                return (
                                  <article
                                    key={cell.position}
                                    className={`board-cell${isPenalty ? ' board-cell--penalty' : ''}${isPlayer ? ' board-cell--player' : ''}${isPassed ? ' board-cell--passed' : ''}`}
                                  >
                                    <span className="board-cell__position">{cell.position}</span>
                                    {isPenalty ? <small>-{cell.moveBack}</small> : null}
                                    {isPlayer ? <strong>Вы</strong> : null}
                                  </article>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="board-game__turn">
                        <span className="slot-machine__label">История ходов</span>
                        {boardGameHistoryItems.length ? (
                          <div className="board-game__history">
                            {boardGameHistoryItems.map((turn) => (
                              <article key={turn.id} className="board-game__history-item">
                                <strong>{turn.label}</strong>
                                <p>
                                  Кубик: {turn.roll}. С {turn.from || 'старта'} до {turn.to}.
                                  {turn.penalty ? ` Откат на ${turn.penalty}.` : ' Без отката.'}
                                </p>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <>
                            <h4>Ходов еще не было</h4>
                            <p>Первый бросок станет доступен сразу после первого выполненного достижения.</p>
                          </>
                        )}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="cabinet-tasks">
                    <div className="cabinet-tasks__head">
                      <div>
                        <span className="cabinet-card__eyebrow">Профиль</span>
                        <h3>Ссылки и профили</h3>
                      </div>
                    </div>

                    <form className="cabinet-profile">
                      <label className="auth-field">
                        <span>Twitch</span>
                        <input
                          type="text"
                          placeholder="https://twitch.tv/..."
                          value={sessionUser.profileLinks.twitch}
                          onChange={(event) => handleProfileLinkChange('twitch', event.target.value)}
                        />
                      </label>

                      <label className="auth-field">
                        <span>PoE Ninja</span>
                        <input
                          type="text"
                          placeholder="https://poe.ninja/..."
                          value={sessionUser.profileLinks.poeNinja}
                          onChange={(event) => handleProfileLinkChange('poeNinja', event.target.value)}
                        />
                      </label>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-card">
                <div className="auth-page__head">
                  <span className="ladder-page__eyebrow">Войти</span>
                  <h1>Вход в святилище</h1>
                  <p>Авторизация теперь идет через бэкенд: регистрация, вход и прогресс игрока больше не живут в localStorage.</p>
                </div>

                  <div className="auth-tabs" aria-label="Переключение формы входа">
                    <button
                      type="button"
                      className={authMode === 'login' ? 'is-active' : undefined}
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                      }}
                    >
                      Вход
                    </button>
                    <button
                      type="button"
                      className={authMode === 'register' ? 'is-active' : undefined}
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError('');
                      }}
                    >
                      Регистрация
                    </button>
                  </div>

                  {authMode === 'login' ? (
                    <form className="auth-form" onSubmit={handleLoginSubmit}>
                      <label className="auth-field">
                        <span>Логин</span>
                        <input
                          type="text"
                          placeholder="Введите логин"
                          value={loginForm.nickname}
                          onChange={(event) => handleLoginInputChange('nickname', event.target.value)}
                        />
                      </label>

                      <label className="auth-field">
                        <span>Пароль</span>
                        <input
                          type="password"
                          placeholder="Введите пароль"
                          value={loginForm.password}
                          onChange={(event) => handleLoginInputChange('password', event.target.value)}
                        />
                      </label>

                      {authError ? <p className="auth-error">{authError}</p> : null}

                      <button type="submit" className="auth-submit">
                        Войти в лигу
                      </button>
                    </form>
                  ) : (
                    <form className="auth-form" onSubmit={handleRegisterSubmit}>
                      <label className="auth-field">
                        <span>Логин</span>
                        <input
                          type="text"
                          placeholder="Придумай логин"
                          value={registerForm.nickname}
                          onChange={(event) => handleRegisterInputChange('nickname', event.target.value)}
                        />
                      </label>

                      <label className="auth-field">
                        <span>Пароль</span>
                        <input
                          type="password"
                          placeholder="Придумай пароль"
                          value={registerForm.password}
                          onChange={(event) => handleRegisterInputChange('password', event.target.value)}
                        />
                      </label>

                      <label className="auth-field">
                        <span>Повтори пароль</span>
                        <input
                          type="password"
                          placeholder="Еще раз тот же пароль"
                          value={registerForm.confirmPassword}
                          onChange={(event) => handleRegisterInputChange('confirmPassword', event.target.value)}
                        />
                      </label>

                      {authError ? <p className="auth-error">{authError}</p> : null}

                      <button type="submit" className="auth-submit">
                        Создать доступ
                      </button>
                    </form>
                  )}
              </div>
            )}
          </section>
        ) : showHeroPage ? (
          <section className="hero-content">
            <div className="hero-mark">
              <span className="hero-mark__top">Path of Exile II</span>
              <span className="hero-mark__bottom">Private League</span>
            </div>

            <div className="hero-copy">
              <h1>
                <span
                  className="hero-title__top hero-title__scramble"
                  data-final-text="ПОЗНАЙ"
                >
                  <span className="hero-title__ghost" aria-hidden="true">
                    ПОЗНАЙ
                  </span>
                  <span className="hero-title__live">{titleTop.text}</span>
                </span>
                <span
                  className="hero-title__bottom hero-title__scramble"
                  data-final-text="ПУСТОТУ"
                >
                  <span className="hero-title__ghost" aria-hidden="true">
                    ПУСТОТУ
                  </span>
                  <span className="hero-title__live">{titleBottom.text}</span>
                </span>
              </h1>
              <p className={subtitleClassName}>
                <span>Стань её</span>
                <span>избранным</span>
              </p>
            </div>

            <a className="hero-cta" href="#join">
              <span className="hero-cta__label">Вступить</span>
            </a>
          </section>
        ) : null}
      </main>

      {activeLadderUser ? (
        <div
          className="clip-modal"
          role="presentation"
          onClick={() => setActiveLadderUserId(null)}
        >
          <div
            className="clip-modal__dialog ladder-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ladder-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="clip-modal__close"
              onClick={() => setActiveLadderUserId(null)}
              aria-label="Закрыть карточку участника"
            >
              Закрыть
            </button>

            <div className="clip-modal__meta">
              <span>Профиль игрока</span>
              <h2 id="ladder-modal-title">{activeLadderUser.nickname}</h2>
            </div>

            <div className="ladder-modal__stats">
              <article className="slot-machine__stat">
                <span>Выполнено задач</span>
                <strong>{activeLadderUser.completedTaskIds.length}</strong>
              </article>
              <article className="slot-machine__stat">
                <span>Клетка</span>
                <strong>{activeLadderUser.boardPosition || 'Старт'}</strong>
              </article>
              <article className="slot-machine__stat">
                <span>Баллы</span>
                <strong>{formatPoints(activeLadderUser.score)}</strong>
              </article>
            </div>

            <div className="ladder-modal__tabs" aria-label="Разделы карточки игрока">
              <button
                type="button"
                className={ladderModalTab === 'tasks' ? 'is-active' : undefined}
                onClick={() => setLadderModalTab('tasks')}
              >
                Достижения
              </button>
              <button
                type="button"
                className={ladderModalTab === 'history' ? 'is-active' : undefined}
                onClick={() => setLadderModalTab('history')}
              >
                История игры
              </button>
            </div>

            {ladderModalTab === 'tasks' ? (
              activeLadderUserTasks.length ? (
                <div className="ladder-modal__list">
                  {activeLadderUserTasks.map((task) => (
                    <article key={task.id} className="ladder-modal__item">
                      <div className="ladder-modal__item-head">
                        <span>{task.categoryLabel}</span>
                        <strong>{task.points} баллов</strong>
                      </div>
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="ladder-modal__empty">
                  <h3>Пока без достижений</h3>
                  <p>У этого игрока еще нет отмеченных выполненных задач.</p>
                </div>
              )
            ) : ladderModalHistoryItems.length ? (
              <div className="ladder-modal__list">
                {ladderModalHistoryItems.map((turn) => (
                  <article key={turn.id} className="ladder-modal__item">
                    <div className="ladder-modal__item-head">
                      <span>{turn.label}</span>
                      <strong>Кубик: {turn.roll}</strong>
                    </div>
                    <h3>С {turn.from || 'старта'} до {turn.to}</h3>
                    <p>{turn.penalty ? `Попал на штрафную клетку и откатился на ${turn.penalty}.` : 'Ход прошел без отката.'}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ladder-modal__empty">
                <h3>Ходов еще не было</h3>
                <p>История появится после первых бросков в игре.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
