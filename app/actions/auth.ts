'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Tipos
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'influencer';
  managerId?: string;
  couponCode?: string;
  whatsappNumber?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Login do usuário
 */
export async function login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: any }> {
  if (!email || !password) {
    return {
      success: false,
      message: 'Email e senha são obrigatórios',
    };
  }

  try {
    // Realizar requisição de login
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || `Erro no login: ${response.status}`,
      };
    }

    const data = await response.json();
    
    // Salvar token no cookie
    cookies().set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    // Salvar informações básicas do usuário (extrair da estrutura flat)
    const userInfo = {
      id: data._id,          // Use data._id directly
      name: data.name,        // Use data.name directly
      email: data.email,      // Use data.email directly
      role: data.role,        // Use data.role directly
    };
    
    // Verificar se extraiu corretamente
    if (!userInfo.id || !userInfo.name || !userInfo.email || !userInfo.role) {
        console.error("Erro ao extrair informações do usuário da resposta da API:", data);
        return {
            success: false,
            message: "Resposta de login inválida recebida do servidor."
        }
    }

    cookies().set('user', JSON.stringify(userInfo), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    return {
      success: true,
      user: userInfo,
    };
  } catch (error) {
    console.error('Erro de login:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Logout do usuário
 */
export async function logout(): Promise<{ success: boolean }> {
  try {
    // Remover cookies
    cookies().delete('token');
    cookies().delete('user');
    return { success: true };
  } catch (error) {
    console.error('Erro de logout:', error);
    return { success: false };
  }
}

// Função auxiliar para obter o token do cookie
export async function getAuthToken(): Promise<string | undefined> {
  return cookies().get('token')?.value;
}

// Função auxiliar para obter o usuário do cookie
export async function getCurrentUser(): Promise<{ id: string; name: string; email: string; role: string } | null> {
  const userCookie = cookies().get('user');
  if (!userCookie?.value) return null;
  
  try {
    return JSON.parse(userCookie.value);
  } catch (error) {
    console.error('Erro ao obter usuário dos cookies:', error);
    return null;
  }
}

/**
 * Registro de novo usuário
 */
export async function register(userData: { name: string; email: string; password: string }): Promise<{ success: boolean; message?: string; user?: any }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha no registro',
      };
    }

    // Não realizar login automático após registro
    // O usuário precisará passar pela aprovação do admin

    return {
      success: true,
      message: 'Registro realizado com sucesso! Aguarde aprovação do administrador.',
    };
  } catch (error) {
    console.error('Erro de registro:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém o perfil do usuário atual usando o token armazenado
 */
export async function getProfile(): Promise<{ success: boolean; message?: string; user?: any }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter perfil',
      };
    }

    return {
      success: true,
      user: data,
    };
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Registra um novo usuário
 */
export async function registerUser(userData: RegisterUserData): Promise<{ success: boolean; message?: string; user?: User }> {
  try {
    // Obter token do cookie para autorização (necessário para criar gerentes/influenciadores)
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(userData),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao registrar usuário',
      };
    }

    return {
      success: true,
      user: data,
    };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Obtém o papel/função do usuário atual
 */
export async function getUserRole(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.role || null;
}

// --- Password Reset Actions --- 

/**
 * Solicita um link de redefinição de senha para o email fornecido.
 */
export async function requestPasswordResetAction(email: string): Promise<{ success: boolean; message: string }> {
  console.log(`[SA requestPasswordResetAction] Requesting reset for email: ${email}`);
  try {
    const response = await fetch(`${API_URL}/api/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    const data = await response.json();

    // Sempre retorna sucesso no frontend para evitar revelar existência de emails
    return {
      success: true, 
      message: data.message || 'If an account with this email exists, a password reset link has been sent.'
    };

  } catch (error) {
    console.error('[SA requestPasswordResetAction] Exception:', error);
    // Retornar um erro genérico em caso de falha de conexão
    return {
      success: false,
      message: 'An error occurred while requesting the password reset. Please try again later.'
    };
  }
}

/**
 * Verifica a validade de um token de redefinição de senha.
 */
export async function verifyResetTokenAction(token: string): Promise<{ success: boolean; message?: string }> {
  console.log(`[SA verifyResetTokenAction] Verifying token: ${token ? token.substring(0, 5) + '...' : 'null'}`);
  if (!token) {
      return { success: false, message: 'Reset token is missing.' };
  }
  try {
    const response = await fetch(`${API_URL}/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[SA verifyResetTokenAction] Verification failed: ${data.message}`);
      return { success: false, message: data.message || 'Invalid or expired token.' };
    }

    console.log(`[SA verifyResetTokenAction] Token verified successfully.`);
    return { success: true };

  } catch (error) {
    console.error('[SA verifyResetTokenAction] Exception:', error);
    return { success: false, message: 'An error occurred while verifying the token.' };
  }
}

/**
 * Redefine a senha usando um token válido.
 */
export async function resetPasswordAction(token: string, password: string): Promise<{ success: boolean; message: string }> {
   console.log(`[SA resetPasswordAction] Attempting password reset with token: ${token ? token.substring(0, 5) + '...' : 'null'}`);
   if (!token || !password) {
       return { success: false, message: 'Token and password are required.' };
   }
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[SA resetPasswordAction] Reset failed: ${data.message}`);
      return { success: false, message: data.message || 'Failed to reset password.' };
    }

    console.log(`[SA resetPasswordAction] Password reset successful.`);
    return { success: true, message: data.message || 'Password has been reset successfully.' };

  } catch (error) {
    console.error('[SA resetPasswordAction] Exception:', error);
    return { success: false, message: 'An error occurred while resetting the password.' };
  }
} 