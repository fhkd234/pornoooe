import React from 'react';
import { ReelroomVideo } from '../types';
import { VideoCard } from './VideoCard';

interface SearchViewProps {
  searchQuery: string;
  videos: ReelroomVideo[];
  onSelectVideo: (video: ReelroomVideo) => void;
  onBackToHome: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  videos,
  onSelectVideo,
  onBackToHome,
}) => {
  const cleanQuery = searchQuery.trim();
  const matches = videos.filter((video) => {
    if (!cleanQuery) return true;
    const q = cleanQuery.toLowerCase();
    return (
      video.title.toLowerCase().includes(q) ||
      video.description.toLowerCase().includes(q) ||
      (video.tag && video.tag.toLowerCase().includes(q))
    );
  });

  return (
    <section className="search-results">
      <a
        className="back-link"
        href="#/home"
        onClick={(e) => {
          e.preventDefault();
          onBackToHome();
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Back to all videos
      </a>

      <div className="section-head">
        <h2>
          {cleanQuery ? `Results for “${cleanQuery}”` : 'Search the room'}
        </h2>
        <span className="count">
          {matches.length} {matches.length === 1 ? 'RESULT' : 'RESULTS'}
        </span>
      </div>

      <div className="video-grid">
        {matches.length > 0 ? (
          matches.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelect={onSelectVideo}
            />
          ))
        ) : (
          <div className="empty">
            No videos found for “{cleanQuery}”. Try another title or keyword.
          </div>
        )}
      </div>
    </section>
  );
};
