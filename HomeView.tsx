import React from 'react';
import { ReelroomVideo } from '../types';
import { VideoCard } from './VideoCard';

interface HomeViewProps {
  videos: ReelroomVideo[];
  onSelectVideo: (video: ReelroomVideo) => void;
  onOpenStudio?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  videos,
  onSelectVideo,
  onOpenStudio,
}) => {
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">A small channel with big feelings</div>
          <h1 style={{ color: '#e5e5e5' }}>
            Watch the work
            <br />
            behind the <span style={{ color: '#ff0000' }}>work.</span>
          </h1>
        </div>
        <div className="hero-note">
          <strong>Welcome in.</strong>
          New videos, field notes, and honest process from one corner of the
          internet. Press play and stay awhile.
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Latest from the room</h2>
          <span className="count">
            {videos.length} {videos.length === 1 ? 'FILM' : 'FILMS'}
          </span>
        </div>

        <div className="video-grid">
          {videos.length > 0 ? (
            videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
              />
            ))
          ) : (
            <div className="empty">
              <p style={{ margin: '0 0 14px' }}>No videos yet.</p>
              {onOpenStudio && (
                <button
                  type="button"
                  className="solid-btn"
                  onClick={onOpenStudio}
                >
                  Open Studio to add the first one
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
