'use server';

import { getAuthToken } from '@/app/lib/cookies';

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Interfaces
export interface SalesData {
  date: string;
  sales: number;
  commission: number;
}

export interface ManagerSales {
  weekly: SalesData[];
  monthly: SalesData[];
  totalSales: number;
  totalCommission: number;
  growth: number;
}

export interface InfluencerData {
  id: string;
  name: string;
  coupon: string;
  sales: number;
  commission: number;
  avatar?: string;
  trend: string;
  status: string;
  email: string;
  phone: string;
  instagram: string;
}

/**
 * Busca os dados de vendas do gestor (semanal e mensal)
 */
export async function getManagerSales(period?: string): Promise<{ success: boolean; message?: string; data?: ManagerSales }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const params = new URLSearchParams();
    if (period) {
      params.append('period', period);
    }
    
    const response = await fetch(`${API_URL}/api/manager/sales?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao buscar dados de vendas',
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Erro ao buscar dados de vendas:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Busca a lista de influencers do gestor logado
 */
export async function getMyInfluencers(): Promise<{ success: boolean; message?: string; influencers?: InfluencerData[] }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/manager/influencers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao buscar influencers',
      };
    }

    return {
      success: true,
      influencers: data
    };
  } catch (error) {
    console.error('Erro ao buscar influencers:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Cria um novo influencer para o gestor
 */
export async function createInfluencer(influencerData: {
  name: string;
  email: string;
  whatsappNumber: string;
  coupon: string;
}): Promise<{ success: boolean; message?: string; influencer?: InfluencerData }> {
  console.log("Server Action createInfluencer chamada com:", influencerData);
  try {
    const token = await getAuthToken();
    
    if (!token) {
      console.error('createInfluencer: No auth token found');
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const fetchURL = `${API_URL}/api/manager/influencers`;
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(influencerData),
      cache: 'no-store',
    };
    
    console.log(`Fetching POST ${fetchURL} with options:`, fetchOptions);
    
    const response = await fetch(fetchURL, fetchOptions);
    
    console.log(`Response status from POST ${fetchURL}:`, response.status);

    const data = await response.json();
    console.log(`Response data from POST ${fetchURL}:`, data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao criar influencer',
      };
    }

    return {
      success: true,
      message: 'Influencer criado com sucesso',
      influencer: data
    };
  } catch (error) {
    console.error('Erro ao criar influencer:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Atualiza um influencer existente
 */
export async function updateInfluencer(
  influencerId: string,
  influencerData: Partial<{
    name: string;
    email: string;
    phone: string;
    instagram: string;
    coupon: string;
    status: string;
  }>
): Promise<{ success: boolean; message?: string; influencer?: InfluencerData }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/manager/influencers/${influencerId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(influencerData),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao atualizar influencer',
      };
    }

    return {
      success: true,
      message: 'Influencer atualizado com sucesso',
      influencer: data
    };
  } catch (error) {
    console.error('Erro ao atualizar influencer:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Remove um influencer
 */
export async function deleteInfluencer(influencerId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/manager/influencers/${influencerId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (response.status === 204) {
      return {
        success: true,
        message: 'Influencer removido com sucesso',
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao remover influencer',
      };
    }

    return {
      success: true,
      message: 'Influencer removido com sucesso',
    };
  } catch (error) {
    console.error('Erro ao remover influencer:', error);
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
  console.log("[SA checkCoupon] Chamada com:", couponCode);
  try {
    const token = await getAuthToken();
    console.log("[SA checkCoupon] Token obtido:", token ? '******' : null);
    
    if (!token) {
      console.error('[SA checkCoupon] Erro: Token não encontrado');
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const fetchURL = `${API_URL}/api/commissions/check?code=${encodeURIComponent(couponCode)}`;
    const fetchOptions: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    };
    
    console.log(`[SA checkCoupon] Preparando para fazer fetch GET: ${fetchURL}`);
    
    const response = await fetch(fetchURL, fetchOptions);

    console.log(`[SA checkCoupon] Status da resposta fetch: ${response.status}`);

    const data = await response.json();
    console.log("[SA checkCoupon] Dados da resposta fetch:", data);

    if (!response.ok) {
      console.error('[SA checkCoupon] Resposta fetch não OK:', data.message);
      return {
        success: false,
        message: data.message || 'Falha ao verificar disponibilidade do cupom',
      };
    }

    console.log(`[SA checkCoupon] Retornando sucesso, available: ${data.available}`);
    return {
      success: true,
      available: data.available
    };
  } catch (error) {
    console.error('[SA checkCoupon] Erro no bloco catch:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor durante a verificação do cupom.',
    };
  }
}

/**
 * Obtém detalhes de um influencer específico
 */
export async function getInfluencerDetails(influencerId: string): Promise<{ success: boolean; message?: string; influencer?: InfluencerData }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/manager/influencers/${influencerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao buscar detalhes do influencer',
      };
    }

    return {
      success: true,
      influencer: data
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do influencer:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Salva as configurações de notificação de um influencer
 */
export async function saveInfluencerNotificationSettings(
  influencerId: string,
  settings: { 
    welcome?: boolean;
    report?: boolean;
    reminder?: boolean;
    reportFrequency?: string;
    reminderThreshold?: string;
  }
): Promise<{ success: boolean; message?: string; notifications?: any }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/manager/influencers/${influencerId}/notifications`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao salvar configurações de notificação',
      };
    }

    return {
      success: true,
      message: 'Configurações salvas com sucesso',
      notifications: data.notifications // Retorna as configurações salvas pelo backend
    };
  } catch (error) {
    console.error('Erro ao salvar configurações de notificação:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
} 