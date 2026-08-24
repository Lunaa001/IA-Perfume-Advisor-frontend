// Cliente del endpoint de chat con la IA: manda el mensaje nuevo junto con el historial
// previo (sin los mensajes de error locales, ver app/index.tsx) para que las respuestas
// tengan en cuenta el contexto de la conversación.
import { apiFetch } from '@/lib/api';

export type RecommendationItem = {
  perfumeId: number;
  name: string;
  brand: string;
  description: string | null;
  imageUrl: string | null;
  categories: string[];
  genderType: string;
  price: number;
  stock: number;
  rating: number | null;
  matchScore: number;
};

type ChatReply = {
  id: string;
  response: string;
  recommendations: RecommendationItem[];
};

type ChatHistoryItem = {
  role: 'user' | 'assistant';
  message: string;
};

export async function sendChatMessage(
  message: string,
  history: ChatHistoryItem[] = [],
): Promise<ChatReply> {
  return apiFetch<ChatReply>('/api/chat', {
    method: 'POST',
    body: { message, history },
  });
}
