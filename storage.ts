import { ReelroomVideo } from '../types';

export const STORAGE_KEY = 'reelroom-videos-v1';
export const LIKES_KEY = 'reelroom-likes-v1';
export const ADMIN_KEY = 'reelroom-admin-v1';

export const demoVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export const seedVideos: ReelroomVideo[] = [
  {
    id: '1',
    title: 'A slower way to make things',
    description: 'A quiet afternoon in the studio: process, patience, and the tiny decisions that make a piece feel like yours.',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=85',
    duration: '08:42',
    date: '2 days ago',
    tag: 'studio notes',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: '2',
    title: 'Field notes from the coast',
    description: 'Three days, one notebook, and a coastline that kept changing color. Come along for the walk.',
    thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85',
    duration: '14:18',
    date: '1 week ago',
    tag: 'field trip',
    videoSrc: 'https://vjs.zencdn.net/v/oceans.mp4',
  },
  {
    id: '3',
    title: 'The little kitchen experiment',
    description: 'What happens when you cook dinner with only five ingredients and no plan? This is the good kind of messy.',
    thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=85',
    duration: '11:06',
    date: '2 weeks ago',
    tag: 'at home',
    videoSrc: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
  },
  {
    id: '4',
    title: 'Sunday light / 35mm',
    description: 'A short visual diary about golden hour, empty streets, and keeping your eyes open.',
    thumbnail: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=85',
    duration: '06:31',
    date: '3 weeks ago',
    tag: 'visual diary',
    videoSrc: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
  },
  {
    id: '5',
    title: 'How I reset my creative desk',
    description: 'A practical reset for the space where ideas happen. No perfect systems, just a clean start.',
    thumbnail: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85',
    duration: '09:24',
    date: '1 month ago',
    tag: 'behind the scenes',
    videoSrc: 'https://media.w3.org/2010/05/video/movie_300.mp4',
  },
  {
    id: '6',
    title: 'Notes on finding your voice',
    description: 'A candid talk about taste, influence, and making work before you feel ready to share it.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85',
    duration: '18:50',
    date: '1 month ago',
    tag: 'conversation',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
  },
];

export function loadVideos(): ReelroomVideo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedVideos));
      return seedVideos;
    }
    const parsed: ReelroomVideo[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedVideos));
      return seedVideos;
    }
    // Ensure every video has a valid working videoSrc fallback
    return parsed.map((v, i) => {
      const fallbackSrc = seedVideos[i % seedVideos.length]?.videoSrc || demoVideo;
      return {
        ...v,
        videoSrc: v.videoSrc || fallbackSrc,
      };
    });
  } catch {
    return seedVideos;
  }
}

export function saveVideos(videos: ReelroomVideo[]): void {
  try {
    const sanitized = videos.map((v) => ({
      ...v,
      videoSrc: v.sessionOnly ? '' : v.videoSrc,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.error('Failed to save videos to localStorage', err);
  }
}

export function getLikes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function isLiked(id: string): boolean {
  return getLikes().includes(id);
}

export function toggleLike(id: string): boolean {
  const current = getLikes();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  localStorage.setItem(LIKES_KEY, JSON.stringify(next));
  return next.includes(id);
}

export function isAdminLoggedIn(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminLoggedIn(status: boolean): void {
  if (status) {
    sessionStorage.setItem(ADMIN_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_KEY);
  }
}

export function parseYouTubeEmbed(url?: string): string | null {
  if (!url) return null;
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(ytRegex);
  return match && match[1] ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1` : null;
}
