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

export type ChatReply = {
  id: string;
  response: string;
  recommendations: RecommendationItem[];
};

export async function sendChatMessage(message: string): Promise<ChatReply> {
  return apiFetch<ChatReply>('/api/chat', {
    method: 'POST',
    body: { message },
  });
}
