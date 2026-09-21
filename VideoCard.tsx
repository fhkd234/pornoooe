import React, { useState } from 'react';
import { ReelroomVideo } from '../types';
import { isLiked } from '../utils/storage';

interface VideoCardProps {
  video: ReelroomVideo;
  onSelect: (video: ReelroomVideo) => void;
}

const FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=85';

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  const [imgError, setImgError] = useState(false);
  const liked = isLiked(video.id);

  return (
    <article
      className="video-card"
      data-video-id={video.id}
      tabIndex={0}
      role="link"
      aria-label={`Watch ${video.title}`}
      onClick={() => onSelect(video)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(video);
        }
      }}
    >
      <div className="thumb-wrap">
        <img
          src={imgError ? FALLBACK_THUMBNAIL : video.thumbnail}
          alt={video.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
        <span className="series-tag">{video.tag || 'film'}</span>
        <div className="thumb-overlay">
          <span className="duration">{video.duration || '—'}</span>
        </div>
      </div>

      <div className="card-copy">
        <h3>{video.title}</h3>
        <p>
          {video.date || 'Just now'} <span aria-hidden="true">·</span>{' '}
          {liked ? 'Liked' : 'Video essay'}
        </p>
      </div>
    </article>
  );
};
