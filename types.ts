export interface ReelroomVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoSrc?: string;
  duration?: string;
  date?: string;
  tag?: string;
  sessionOnly?: boolean;
}

export type ActivePage = 'home' | 'watch' | 'search' | 'studio';
