import type { Href } from 'expo-router';

import type { RecommendationItem } from '@/lib/chat';

// Forma común de un mensaje de chat, tanto para el estado de la pantalla como para
// lo que renderiza MessageBubble. "recommendations" y "cta" son opcionales porque
// solo las respuestas de la IA los traen (nunca los mensajes del usuario).
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendations?: RecommendationItem[];
  cta?: { label: string; href: Href };
};
