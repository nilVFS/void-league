import React from 'react';

export function Header({ brand, navigationItems }) {
  return (
    <header className="site-header">
      <div className="site-header__block">
        <a className="site-header__brand" href="#">
          {brand}
        </a>
        <span className="site-header__meta">Private access protocol</span>
      </div>

      <nav className="site-header__nav" aria-label="Основная навигация">
        {navigationItems.map((item) => (
          <a key={item.label} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
