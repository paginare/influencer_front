'use server';

import { getAuthToken } from '@/app/lib/cookies';

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Tipos (podem precisar de ajuste conforme o modelo real)
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'influencer';
  whatsappNumber?: string;
  status?: string; // ou boolean para ativo/inativo
  createdAt?: Date;
  manager?: { _id: string; name: string }; // Para influencers
  influencers?: { _id: string; name: string }[]; // Para managers
  couponCode?: string; // Para influencers
}

interface UserFilters {
  role?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Define a generic response type if not already defined
interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    [key: string]: any; // Allow other properties like 'user', 'token', 'ranking' etc.
}

// Interface representing user data (adjust if API response differs)
interface UserDataFromApi {
    _id: string;
    name: string;
    email: string;
    role: string;
    // include other relevant fields returned by API
}

// --- Nova Interface --- 
// Interface para as configurações de notificação do usuário
export interface UserNotificationSettings {
  welcome?: boolean;
  report?: boolean;
  reminder?: boolean;
  reportFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly'; // Tipos específicos
  reminderThreshold?: string; // Ajustar tipo se necessário (ex: '3days')
  lastReportSentAt?: string | Date; // API pode retornar como string
}

// Type for message templates keys
export type MessageType = 'welcome' | 'report' | 'reminder';

/**
 * Busca usuários com filtros
 */
export async function getUsers(filters: UserFilters = {}): Promise<{ success: boolean; message?: string; users?: User[]; total?: number; pages?: number }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_URL}/api/users?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Falha ao buscar usuários' };
    }

    return { success: true, users: data.users, total: data.total, pages: data.pages };
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Cria um novo usuário
 */
export async function createUser(userData: Omit<User, '_id' | 'createdAt'>): Promise<{ success: boolean; message?: string; user?: User }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    // A API de registro existente pode ser usada ou criar uma específica /api/users
    const response = await fetch(`${API_URL}/api/users`, { // Assumindo /api/users para criação via admin
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Falha ao criar usuário' };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Atualiza um usuário existente
 */
export async function updateUser(userId: string, userData: Partial<Omit<User, '_id' | 'createdAt'>>): Promise<{ success: boolean; message?: string; user?: User }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Falha ao atualizar usuário' };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Deleta um usuário
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, message: data.message || 'Falha ao deletar usuário' };
    }

    // Status 204 (No Content) normalmente não tem corpo
    if (response.status === 204) {
        return { success: true };
    }

    const data = await response.json(); // Caso retorne algo (ex: { message: "Success" })
    return { success: true, message: data?.message };

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Obtem um usuário específico pelo ID
 */
export async function getUserById(userId: string): Promise<{ success: boolean; message?: string; user?: any }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter usuário',
      };
    }

    return {
      success: true,
      user: data
    };
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtem todos os gerentes (para selecionar ao criar influenciador)
 */
export async function getManagers(): Promise<{ success: boolean; message?: string; managers?: any[] }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/users?role=manager`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter gerentes',
      };
    }

    return {
      success: true,
      managers: data.users
    };
  } catch (error) {
    console.error('Erro ao obter gerentes:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Cria um novo gerente
 */
export async function createManager(managerData: any): Promise<{ success: boolean; message?: string; manager?: any }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    // Adicionar role=manager ao dados
    const data = {
      ...managerData,
      role: 'manager'
    };
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || 'Falha ao criar gerente',
      };
    }

    return {
      success: true,
      manager: responseData
    };
  } catch (error) {
    console.error('Erro ao criar gerente:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Cria um novo influenciador
 */
export async function createInfluencer(influencerData: any): Promise<{ success: boolean; message?: string; influencer?: any }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    // Adicionar role=influencer aos dados
    const data = {
      ...influencerData,
      role: 'influencer'
    };
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || 'Falha ao criar influenciador',
      };
    }

    return {
      success: true,
      influencer: responseData
    };
  } catch (error) {
    console.error('Erro ao criar influenciador:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Desativa um usuário
 */
export async function deactivateUser(userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/users/${userId}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao desativar usuário',
      };
    }

    return {
      success: true,
      message: 'Usuário desativado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém os influenciadores de um gerente específico
 */
export async function getManagerInfluencers(managerId: string): Promise<{ success: boolean; message?: string; influencers?: any[] }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/users/${managerId}/influencers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter influenciadores do gerente',
      };
    }

    return {
      success: true,
      influencers: data
    };
  } catch (error) {
    console.error('Erro ao obter influenciadores do gerente:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Verifica se um código de cupom já está em uso
 */
export async function checkCouponAvailability(couponCode: string): Promise<{ success: boolean; message?: string; available?: boolean }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/coupons/check?code=${encodeURIComponent(couponCode)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao verificar disponibilidade do cupom',
      };
    }

    return {
      success: true,
      available: data.available
    };
  } catch (error) {
    console.error('Erro ao verificar disponibilidade do cupom:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

// Helper function to get auth token (assuming it exists)
async function getUserAuthToken() {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies(); // Get the cookie store
    return cookieStore.get('token')?.value; // Corrected cookie name
}

// Add updatePassword server action
export async function updatePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<any>> {
    'use server'
    console.log("[Server Action - updatePassword] Received data:", data);
    try {
        const token = await getUserAuthToken();
        console.log("[Server Action - updatePassword] Token:", token ? '******' : 'null');
        if (!token) {
            return { success: false, message: 'Usuário não autenticado.' };
        }

        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const targetURL = `${apiURL}/api/users/me/password`;
        console.log("[Server Action - updatePassword] Fetching URL:", targetURL);

        const res = await fetch(targetURL, { 
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        
        console.log("[Server Action - updatePassword] Response Status:", res.status, "OK:", res.ok);

        // Try to parse JSON only if there's likely content
        let result = {};
        if (res.headers.get('content-type')?.includes('application/json')) {
            result = await res.json();
            console.log("[Server Action - updatePassword] Response JSON:", result);
        } else {
            console.log("[Server Action - updatePassword] Response has no JSON content.");
        }

        if (!res.ok) {
            return { success: false, message: (result as any).message || `Falha ao atualizar senha (Status: ${res.status})` };
        }

        return { success: true, message: 'Senha atualizada com sucesso.' };
    } catch (error) {
        console.error("[Server Action - updatePassword] Error:", error);
        return { success: false, message: 'Erro de conexão ao atualizar senha.' };
    }
}

// Add updateProfile server action
export async function updateProfile(data: { name: string; email: string }): Promise<ApiResponse<UserDataFromApi>> {
    'use server'
    console.log("[Server Action - updateProfile] Received data:", data);
    try {
        const token = await getUserAuthToken();
        console.log("[Server Action - updateProfile] Token:", token ? '******' : 'null');
        if (!token) {
            return { success: false, message: 'Usuário não autenticado.' };
        }

        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const targetURL = `${apiURL}/api/users/me/profile`;
        console.log("[Server Action - updateProfile] Fetching URL:", targetURL);
        
        const res = await fetch(targetURL, { 
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
            cache: 'no-store', 
        });

        console.log("[Server Action - updateProfile] Response Status:", res.status, "OK:", res.ok);

        let result: Partial<UserDataFromApi> = {};
        if (res.headers.get('content-type')?.includes('application/json')) {
            try {
                result = await res.json() as Partial<UserDataFromApi>;
                console.log("[Server Action - updateProfile] Response JSON:", result);
            } catch (parseError) {
                console.error("[Server Action - updateProfile] Failed to parse JSON response:", parseError);
            }
        } else {
             console.log("[Server Action - updateProfile] Response has no JSON content.");
        }

        if (!res.ok) {
            return { success: false, message: (result as any).message || `Falha ao atualizar perfil (Status: ${res.status})` };
        }

        // API call succeeded, now update the user cookie
        if (result && result._id && result.name && result.email && result.role) {
            const userInfo = {
                id: result._id,
                name: result.name, 
                email: result.email,
                role: result.role,
            };
             console.log("[Server Action - updateProfile] Updating user cookie with:", userInfo);
             const { cookies } = await import("next/headers");
             cookies().set('user', JSON.stringify(userInfo), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // Re-set with same expiry as login
                path: '/',
             });
             return { success: true, message: 'Perfil atualizado com sucesso.', data: result as UserDataFromApi }; 
        } else {
             console.error("[Server Action - updateProfile] API response did not contain expected user data for cookie update:", result);
             return { success: true, message: 'Perfil atualizado no servidor, mas falha ao atualizar dados da sessão.' }; 
        }
    } catch (error) {
        console.error("[Server Action - updateProfile] Error:", error);
        return { success: false, message: 'Erro de conexão ao atualizar perfil.' };
    }
}

/**
 * Obtem as configurações de notificação do usuário logado
 */
export async function getUserSettings(): Promise<{ success: boolean; message?: string; settings?: UserNotificationSettings }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    const response = await fetch(`${API_URL}/api/users/me/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Falha ao buscar configurações' };
    }

    // A API retorna diretamente o objeto de notificações
    return { success: true, settings: data as UserNotificationSettings }; 
  } catch (error) {
    console.error('Erro ao buscar configurações do usuário:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Atualiza as configurações de notificação do usuário logado
 */
export async function updateUserSettings(settings: Partial<UserNotificationSettings>): Promise<{ success: boolean; message?: string; settings?: UserNotificationSettings }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    const response = await fetch(`${API_URL}/api/users/me/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // A API espera o objeto de configurações dentro de um campo 'notifications'
      body: JSON.stringify({ notifications: settings }), 
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Falha ao atualizar configurações' };
    }

    // A API retorna o objeto atualizado de notificações
    return { success: true, settings: data as UserNotificationSettings }; 
  } catch (error) {
    console.error('Erro ao atualizar configurações do usuário:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Atualiza um template de mensagem específico para o usuário logado
 */
export async function updateMessageTemplate(
  type: MessageType, 
  content: string
): Promise<{ success: boolean; message?: string; updatedTemplate?: { type: MessageType; content: string } }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    const response = await fetch(`${API_URL}/api/users/me/message-template`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // Enviar o tipo e o conteúdo no corpo da requisição
      body: JSON.stringify({ type, content }), 
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Falha ao atualizar template da mensagem' };
    }

    // A API retorna o objeto { type, content } atualizado
    return { success: true, updatedTemplate: data }; 
  } catch (error) {
    console.error('Erro ao atualizar template da mensagem:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
} 