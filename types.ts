
export enum View {
  HOME = 'home',
  STORIES = 'stories',
  GALLERY = 'gallery',
  CHAT = 'chat',
  SUBSCRIPTION = 'subscription'
}

export enum SubscriptionLevel {
  FREE = 'free',
  INTIMO = 'intimo',
  ELITE = 'elite'
}

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  duration: string;
  coverImage: string;
  isDemo: boolean;
  isPremium?: boolean;
}

export interface Photo {
  id: string;
  url: string;
  isLocked: boolean;
  isPremium?: boolean;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  timestamp: Date;
}
