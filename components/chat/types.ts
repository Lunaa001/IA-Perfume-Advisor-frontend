import type { Href } from 'expo-router';

import type { RecommendationItem } from '@/lib/chat';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendations?: RecommendationItem[];
  cta?: { label: string; href: Href };
};
