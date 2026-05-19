import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/Header';

const navigationItems = [
  { label: 'Ладдер', href: '#ladder', page: 'ladder' },
  { label: 'Особенности', href: '#features', page: 'features' },
  { label: 'Правила', href: '#rules', page: 'rules' },
  { label: 'Задачи', href: '#tasks', page: 'tasks' },
  { label: 'Войти', href: '#login', page: 'login' },
];

const SCENE_TRANSITION_MS = 1800;

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
    description: 'Закрыть все акты в первый игровой день хотя бы одним участником лиги.',
  },
  {
    id: 'night-watch',
    title: 'Ночной дозор',
    category: 'start',
    categoryLabel: 'Старт',
    description: 'Собрать минимум пятерых живых участников онлайн в первые три часа после старта.',
  },
  {
    id: 'altar-of-maps',
    title: 'Алтарь карт',
    category: 'mapping',
    categoryLabel: 'Карты',
    description: 'Открыть и зачистить первые десять карт белого тира в составе лиги без внешней помощи.',
  },
  {
    id: 'atlas-spark',
    title: 'Искра атласа',
    category: 'mapping',
    categoryLabel: 'Карты',
    description: 'Закрыть первую желтую карту и зафиксировать, кто первым дотянул атлас до нового тира.',
  },
  {
    id: 'black-vault',
    title: 'Черная казна',
    category: 'economy',
    categoryLabel: 'Экономика',
    description: 'Собрать первый общий пул ценных валютных дропов и отметить его как фонд сезона.',
  },
  {
    id: 'first-trade',
    title: 'Первая сделка',
    category: 'economy',
    categoryLabel: 'Экономика',
    description: 'Заключить первую внутрилиговую сделку, которая реально помогает ускорить чей-то билд.',
  },
  {
    id: 'abyss-oath',
    title: 'Клятва бездне',
    category: 'league',
    categoryLabel: 'Лига',
    description: 'Собрать первый ценный дроп сезона и зафиксировать его как общий трофей лиги.',
  },
  {
    id: 'closed-circle',
    title: 'Закрытый круг',
    category: 'league',
    categoryLabel: 'Лига',
    description: 'Пройти стартовую неделю без добора случайных людей в состав лиги.',
  },
  {
    id: 'first-blood',
    title: 'Первая кровь',
    category: 'bosses',
    categoryLabel: 'Боссы',
    description: 'Убить первого значимого босса эндгейма силами лиги и сохранить его как milestone сезона.',
  },
  {
    id: 'bone-throne',
    title: 'Костяной трон',
    category: 'bosses',
    categoryLabel: 'Боссы',
    description: 'Закрыть сложный бой без вайпа всей пачки и отметить состав, который это сделал.',
  },
  {
    id: 'iron-discipline',
    title: 'Железная дисциплина',
    category: 'league',
    categoryLabel: 'Лига',
    description: 'Собрать единый список билдов лиги, чтобы не дублировать ключевые роли и не терять темп.',
  },
  {
    id: 'ashen-line',
    title: 'Пепельная линия',
    category: 'mapping',
    categoryLabel: 'Карты',
    description: 'Довести хотя бы одного участника до стабильного фарма карт без провала по выживаемости.',
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
  const { delay = 0, duration = 1400, tick = 48 } = options;
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

export default function App() {
  const shellRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const [activeView, setActiveView] = useState('home');
  const [transitionTarget, setTransitionTarget] = useState(null);
  const [taskCategory, setTaskCategory] = useState('all');
  const [taskQuery, setTaskQuery] = useState('');
  const titleTop = useRuneScramble('ПОЗНАЙ', {
    delay: 250,
    duration: 2150,
    tick: 108,
  });

  const titleBottom = useRuneScramble('ПУСТОТУ', {
    delay: 1050,
    duration: 2500,
    tick: 108,
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
  const showFeaturesPage = activeView === 'features';
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
            <p>Здесь будет рейтинг, прогресс и имена тех, кто пережил ритуал старта.</p>
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
                        <article key={task.id} className="task-card">
                          <span className="task-card__index">{String(index + 1).padStart(2, '0')}</span>
                          <span className="task-card__category">{task.categoryLabel}</span>
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>
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
        ) : showFeaturesPage ? (
          <section className="ladder-page">
            <span className="ladder-page__eyebrow">Особенности</span>
            <h1>Условия ритуала</h1>
            <p>Здесь будет блок про формат лиги, правила входа, общий старт и все ключевые ограничения сезона.</p>
          </section>
        ) : showRulesPage ? (
          <section className="ladder-page">
            <span className="ladder-page__eyebrow">Правила</span>
            <h1>Кодекс круга</h1>
            <p>Здесь потом соберем обязательные правила поведения, спорные кейсы и порядок участия в закрытом составе.</p>
          </section>
        ) : showLoginPage ? (
          <section className="ladder-page">
            <span className="ladder-page__eyebrow">Войти</span>
            <h1>Вход в святилище</h1>
            <p>Эта страница будет точкой входа в закрытую часть сайта: профиль, состав, доступы и внутренние разделы лиги.</p>
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
