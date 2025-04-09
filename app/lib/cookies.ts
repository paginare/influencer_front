import { cookies } from 'next/headers';

/**
 * Obtém o token de autenticação dos cookies
 */
export async function getAuthToken(): Promise<string | null> {
  const tokenCookie = await cookies().get('token');
  return tokenCookie?.value || null;
}

/**
 * Obtém o usuário atual dos cookies
 */
export async function getCurrentUser(): Promise<{ id: string; name: string; email: string; role: string } | null> {
  const userCookie = await cookies().get('user');
  
  if (!userCookie?.value) return null;
  
  try {
    return JSON.parse(userCookie.value);
  } catch (error) {
    console.error('Erro ao obter usuário dos cookies:', error);
    return null;
  }
}

/**
 * Obtém o papel/função do usuário atual
 */
export async function getUserRole(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.role || null;
}

/**
 * Define um cookie
 */
export async function setCookie(name: string, value: string, options: any = {}): Promise<void> {
  await cookies().set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 dias por padrão
    path: '/',
    ...options,
  });
}

/**
 * Remove um cookie
 */
export async function deleteCookie(name: string): Promise<void> {
  await cookies().delete(name);
} 