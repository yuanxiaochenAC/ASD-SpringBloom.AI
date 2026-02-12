import { type Part } from '@google/genai';

export enum Tab {
  HOME = 'HOME',
  LIVE = 'LIVE',
  CHAT = 'CHAT',
  VISUALS = 'VISUALS',
  SCREENING = 'SCREENING',
  ANALYSIS = 'ANALYSIS',
  COMMUNITY = 'COMMUNITY',
  REPORT = 'REPORT',
  PROFILE = 'PROFILE'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  media?: {
    data: string;
    mimeType: string;
    type: 'image' | 'video';
  };
  isThinking?: boolean;
  groundingUrls?: Array<{url: string, title: string}>;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface VisualGenerationState {
  prompt: string;
  isLoading: boolean;
  generatedImage: string | null;
  size: '1K' | '2K' | '4K';
}

export interface LiveState {
  isConnected: boolean;
  isTalking: boolean;
  volume: number;
}