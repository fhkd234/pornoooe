import React, { useState, useEffect } from 'react';
import { ReelroomVideo } from '../types';
import {
  demoVideo,
  isLiked,
  toggleLike,
  parseYouTubeEmbed,
} from '../utils/storage';

interface WatchViewProps {
  video: ReelroomVideo;
  allVideos: ReelroomVideo[];
  onSelectVideo: (video: ReelroomVideo) => void;
  onBackToHome: () => void;
}

export const WatchView: React.FC<WatchViewProps> = ({
  video,
  allVideos,
  onSelectVideo,
  onBackToHome,
}) => {
  const [liked, setLiked] = useState<boolean>(false);

  useEffect(() => {
    setLiked(isLiked(video.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [video.id]);

  const handleLikeToggle = () => {
    const nextState = toggleLike(video.id);
    setLiked(nextState);
  };

  const related = allVideos.filter((item) => item.id !== video.id).slice(0, 4);
  const ytEmbed = parseYouTubeEmbed(video.videoSrc);
  const mediaSrc = video.videoSrc || demoVideo;

  return (
    <section>
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

      <div className="watch-layout">
        <div className="watch-main">
          <div className="player">
            {ytEmbed ? (
              <iframe
                src={ytEmbed}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={video.id}
                controls
                autoPlay
                playsInline
                poster={video.thumbnail}
                src={mediaSrc}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          <h1>{video.title}</h1>

          <div className="watch-meta">
            <p>
              {video.date || 'Just now'} <span aria-hidden="true">·</span>{' '}
              {video.tag || 'Video essay'}
            </p>

            <button
              type="button"
              className={`like-btn ${liked ? 'active' : ''}`}
              id="like-button"
              onClick={handleLikeToggle}
              aria-label={liked ? 'Unlike film' : 'Like film'}
            >
              <svg
                viewBox="0 0 24 24"
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" />
              </svg>
              <span>{liked ? 'Liked' : 'Like'}</span>
            </button>
          </div>

          <div className="description">
            {video.description || 'No description provided.'}
          </div>
        </div>

        <aside className="up-next">
          <h2>More from the room</h2>
          {related.length > 0 ? (
            related.map((item) => (
              <article
                key={item.id}
                className="mini-card"
                tabIndex={0}
                role="link"
                aria-label={`Watch ${item.title}`}
                onClick={() => onSelectVideo(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectVideo(item);
                  }
                }}
              >
                <div className="thumb-wrap">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="thumb-overlay">
                    <span className="duration">{item.duration || '—'}</span>
                  </div>
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.date || 'Just now'}</p>
                </div>
              </article>
            ))
          ) : (
            <p style={{ color: 'var(--dim)', fontSize: '13px' }}>
              No other films in library.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
};
