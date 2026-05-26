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
const AUTH_USERS_STORAGE_KEY = 'league-poe.auth.users';
const AUTH_SESSION_STORAGE_KEY = 'league-poe.auth.session';
const SLOT_MACHINE_VARIANTS = [
  { count: 1, multiplier: 1.5, label: 'x1.5' },
  { count: 3, multiplier: 3, label: 'x3' },
];

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

function readStoredUsers() {
  try {
    const raw = window.localStorage.getItem(AUTH_USERS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredUsers(users) {
  window.localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
}

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  if (!session) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
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
    if (!activeClip) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveClip(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeClip]);

  useEffect(() => {
    setAuthUsers(readStoredUsers().map(normalizeUser));
    const storedSession = readStoredSession();
    setSessionUser(storedSession ? normalizeUser(storedSession) : null);
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

  const handleLoginInputChange = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
    setAuthError('');
  };

  const handleRegisterInputChange = (field, value) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
    setAuthError('');
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();

    const nickname = loginForm.nickname.trim().toLowerCase();
    const password = loginForm.password;
    const user = authUsers.find((entry) => entry.nickname.toLowerCase() === nickname);

    if (!user || user.password !== password) {
      setAuthError('Не нашли такого пользователя или пароль не совпадает.');
      return;
    }

    const normalizedUser = normalizeUser(user);
    setSessionUser(normalizedUser);
    writeStoredSession(normalizedUser);
    setAuthError('');
    setLoginForm({ nickname: '', password: '' });
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();

    const nickname = registerForm.nickname.trim();
    const password = registerForm.password;
    const confirmPassword = registerForm.confirmPassword;

    if (!nickname || !password) {
      setAuthError('Заполни логин и пароль.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Пароли не совпадают.');
      return;
    }

    if (authUsers.some((user) => user.nickname.toLowerCase() === nickname.toLowerCase())) {
      setAuthError('Пользователь с таким логином уже существует.');
      return;
    }

    const nextUser = {
      id: `user-${Date.now()}`,
      nickname,
      password,
      completedTaskIds: [],
      profileLinks: {
        twitch: '',
        poeNinja: '',
        poeProfile: '',
      },
      slotMachine: normalizeSlotMachine(),
    };

    const nextUsers = [...authUsers, nextUser];
    setAuthUsers(nextUsers);
    writeStoredUsers(nextUsers);
    setSessionUser(nextUser);
    writeStoredSession(nextUser);
    setAuthError('');
    setRegisterForm({
      nickname: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleLogout = () => {
    setSessionUser(null);
    writeStoredSession(null);
  };

  const updateSessionUser = (updater) => {
    if (!sessionUser) {
      return;
    }

    const nextSessionUser = normalizeUser(
      typeof updater === 'function' ? updater(sessionUser) : updater,
    );

    const nextUsers = authUsers.map((user) => (
      user.id === sessionUser.id ? nextSessionUser : normalizeUser(user)
    ));

    setSessionUser(nextSessionUser);
    setAuthUsers(nextUsers);
    writeStoredSession(nextSessionUser);
    writeStoredUsers(nextUsers);
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
                <span>Баллы</span>
              </div>

              {ladderEntries.length ? (
                ladderEntries.map((user, index) => (
                        <article key={user.id} className="ladder-row">
                          <div className="ladder-row__player">
                            <strong>{index + 1}</strong>
                            <div>
                              <h2>{user.nickname}</h2>
                            </div>
                          </div>
                    <div className="ladder-row__score">{user.completedTaskIds.length}</div>
                    <div className="ladder-row__status">{formatPoints(user.score)}</div>
                  </article>
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
                  <article key={user.id} className="participant-card">
                    <div className="participant-card__head">
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
          <section className="ladder-page">
            <span className="ladder-page__eyebrow">Правила</span>
            <h1>Кодекс круга</h1>
            <p>Здесь потом соберем обязательные правила поведения, спорные кейсы и порядок участия в закрытом составе.</p>
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
                  <p>Пока без бэкенда, но уже с понятной формой: вход для своих и регистрация для новых участников лиги.</p>
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

                      <div className="auth-form__row">
                        <label className="auth-check">
                          <input type="checkbox" defaultChecked />
                          <span>Запомнить меня</span>
                        </label>
                        <a href="#forgot">Локальная демо-форма</a>
                      </div>

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
    </div>
  );
}
