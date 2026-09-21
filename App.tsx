import React, { useState, useEffect, useCallback } from 'react';
import { ReelroomVideo, ActivePage } from './types';
import { loadVideos, saveVideos } from './utils/storage';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { WatchView } from './components/WatchView';
import { SearchView } from './components/SearchView';
import { StudioView } from './components/StudioView';

export default function App() {
  const [videos, setVideos] = useState<ReelroomVideo[]>(() => loadVideos());
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync videos whenever changed
  useEffect(() => {
    saveVideos(videos);
  }, [videos]);

  const syncRouteFromHash = useCallback(() => {
    const rawHash = window.location.hash.replace(/^#\/?/, '') || 'home';

    if (rawHash === 'home' || rawHash === '') {
      setActivePage('home');
      document.title = 'Reelroom - Mini YouTube';
    } else if (rawHash.startsWith('watch/')) {
      const vidId = rawHash.split('/')[1];
      setSelectedVideoId(vidId);
      setActivePage('watch');
    } else if (rawHash.startsWith('search')) {
      const paramStr = rawHash.includes('?') ? rawHash.split('?')[1] : '';
      const params = new URLSearchParams(paramStr);
      const q = params.get('q') || '';
      setSearchQuery(q);
      setActivePage('search');
    } else if (rawHash === 'studio') {
      setActivePage('studio');
      document.title = 'Owner Studio - Reelroom';
    } else {
      window.location.hash = '#/home';
    }
  }, []);

  useEffect(() => {
    syncRouteFromHash();
    window.addEventListener('hashchange', syncRouteFromHash);
    return () => window.removeEventListener('hashchange', syncRouteFromHash);
  }, [syncRouteFromHash]);

  const handleNavigate = (page: ActivePage) => {
    if (page === 'home') {
      window.location.hash = '#/home';
    } else if (page === 'studio') {
      window.location.hash = '#/studio';
    } else if (page === 'search') {
      window.location.hash = searchQuery
        ? `#/search?q=${encodeURIComponent(searchQuery)}`
        : '#/search';
    }
  };

  const handleSelectVideo = (video: ReelroomVideo) => {
    setSelectedVideoId(video.id);
    window.location.hash = `#/watch/${video.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    window.location.hash = `#/search?q=${encodeURIComponent(query)}`;
  };

  const handleBackToHome = () => {
    window.location.hash = '#/home';
  };

  const handleVideoAdded = (newVideo: ReelroomVideo) => {
    setVideos((prev) => [newVideo, ...prev]);
    setSelectedVideoId(newVideo.id);
  };

  const handleVideoDeleted = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    if (selectedVideoId === id) {
      const remaining = videos.filter((v) => v.id !== id);
      if (remaining.length > 0) {
        setSelectedVideoId(remaining[0].id);
      }
    }
  };

  const handleVideoUpdated = (updatedVideo: ReelroomVideo) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === updatedVideo.id ? updatedVideo : v))
    );
  };

  const currentVideo =
    videos.find((v) => v.id === selectedVideoId) ||
    videos[0] ||
    null;

  return (
    <div className="shell">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        initialSearchQuery={searchQuery}
      />

      <main id="app">
        {activePage === 'home' && (
          <HomeView
            videos={videos}
            onSelectVideo={handleSelectVideo}
            onOpenStudio={() => handleNavigate('studio')}
          />
        )}

        {activePage === 'watch' && currentVideo && (
          <WatchView
            video={currentVideo}
            allVideos={videos}
            onSelectVideo={handleSelectVideo}
            onBackToHome={handleBackToHome}
          />
        )}

        {activePage === 'search' && (
          <SearchView
            searchQuery={searchQuery}
            videos={videos}
            onSelectVideo={handleSelectVideo}
            onBackToHome={handleBackToHome}
          />
        )}

        {activePage === 'studio' && (
          <StudioView
            videos={videos}
            onVideoAdded={handleVideoAdded}
            onVideoDeleted={handleVideoDeleted}
            onVideoUpdated={handleVideoUpdated}
            onSelectVideo={handleSelectVideo}
          />
        )}
      </main>

      <footer>
        <span>REELROOM / ONE CREATOR VIDEO LIBRARY</span>
        <span>BUILT FOR THE SMALL SCREEN</span>
      </footer>
    </div>
  );
}
