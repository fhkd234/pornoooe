import React, { useState } from 'react';
import { ActivePage } from '../types';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onSearch: (query: string) => void;
  initialSearchQuery?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  onSearch,
  initialSearchQuery = '',
}) => {
  const [searchInput, setSearchInput] = useState(initialSearchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    onSearch(query);
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a
          className="brand"
          href="#/home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          aria-label="Reelroom home"
        >
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.7v12.6a1 1 0 0 0 1.5.86l10-6.3a1 1 0 0 0 0-1.72l-10-6.3A1 1 0 0 0 8 5.7Z" />
            </svg>
          </span>
          <span className="brand-name">
            reel<em>room</em>
          </span>
        </a>

        <form className="search" onSubmit={handleSubmit} role="search">
          <input
            id="search-input"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search the room"
            autoComplete="off"
          />
          <button aria-label="Search" type="submit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
          </button>
        </form>

        <nav className="top-actions" aria-label="Primary navigation">
          <a
            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            href="#/home"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m4 10 8-7 8 7v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10Z" />
              <path d="M9 21v-7h6v7" />
            </svg>
            <span>Home</span>
          </a>

          <a
            className={`nav-link ${activePage === 'studio' ? 'active' : ''}`}
            href="#/studio"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('studio');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 5h16v14H4z" />
              <path d="m9 9 6 3-6 3V9Z" />
            </svg>
            <span>Studio</span>
          </a>
        </nav>
      </div>
    </header>
  );
};
