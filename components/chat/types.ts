import type { RecommendationItem } from '@/lib/chat';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendations?: RecommendationItem[];
};
