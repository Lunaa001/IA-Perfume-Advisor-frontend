import * as SecureStore from 'expo-secure-store';

import { apiFetch } from '@/lib/api';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'auth_role';
const USERNAME_KEY = 'auth_username';

export type AuthResponse = {
  token: string;
  expiresIn: number;
  type: string;
  username: string;
  email: string;
  role: string;
};

export type StoredSession = {
  token: string;
  role: string;
  username: string;
};

export async function login(username: string, password: string): Promise<StoredSession> {
  const response = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { username, password },
  });

  await SecureStore.setItemAsync(TOKEN_KEY, response.token);
  await SecureStore.setItemAsync(ROLE_KEY, response.role);
  await SecureStore.setItemAsync(USERNAME_KEY, response.username);

  return { token: response.token, role: response.role, username: response.username };
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(ROLE_KEY);
  await SecureStore.deleteItemAsync(USERNAME_KEY);
}

export async function loadSession(): Promise<StoredSession | null> {
  const [token, role, username] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(ROLE_KEY),
    SecureStore.getItemAsync(USERNAME_KEY),
  ]);

  if (!token || !role || !username) return null;
  return { token, role, username };
}
