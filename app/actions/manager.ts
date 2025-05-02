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
  sales: number;
  commission: number;
  avatar?: string;
  trend: string;
  status: string;
  email: string;
  phone: string;
  instagram: string;
}

// Interface for Coupon Data
export interface CouponData {
  _id: string;
  code: string;
  influencer: string; // Influencer ID
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  instagram?: string;
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
    sales?: boolean;
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
        message: data.message || 'Falha ao atualizar notificações',
      };
    }

    return {
      success: true,
      message: data.message || 'Notificações atualizadas com sucesso',
      notifications: data.notifications // Retorna as configurações salvas pelo backend
    };
  } catch (error) {
    console.error('Erro ao atualizar notificações:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

// --- Coupon Management Actions --- 

/**
 * Busca os cupons de um influencer específico
 */
export async function getInfluencerCoupons(influencerId: string): Promise<{ success: boolean; message?: string; coupons?: CouponData[] }> {
  console.log(`[SA getInfluencerCoupons] Fetching coupons for influencer ID: ${influencerId}`);
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado.' };
    }

    const response = await fetch(`${API_URL}/api/coupons/influencer/${influencerId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[SA getInfluencerCoupons] Error fetching coupons: ${data.message}`);
      return { success: false, message: data.message || 'Falha ao buscar cupons.' };
    }

    console.log(`[SA getInfluencerCoupons] Successfully fetched ${data.length} coupons.`);
    return { success: true, coupons: data };

  } catch (error) {
    console.error('[SA getInfluencerCoupons] Exception:', error);
    return { success: false, message: 'Erro ao conectar com o servidor.' };
  }
}

/**
 * Cria um novo cupom para um influencer
 */
export async function createInfluencerCoupon(influencerId: string, code: string): Promise<{ success: boolean; message?: string; coupon?: CouponData }> {
  console.log(`[SA createInfluencerCoupon] Creating coupon '${code}' for influencer ID: ${influencerId}`);
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado.' };
    }

    const response = await fetch(`${API_URL}/api/coupons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ influencerId, code }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[SA createInfluencerCoupon] Error creating coupon: ${data.message}`);
      return { success: false, message: data.message || 'Falha ao criar cupom.' };
    }

    console.log(`[SA createInfluencerCoupon] Successfully created coupon:`, data);
    return { success: true, coupon: data };

  } catch (error) {
    console.error('[SA createInfluencerCoupon] Exception:', error);
    return { success: false, message: 'Erro ao conectar com o servidor.' };
  }
}

/**
 * Atualiza o status (ativo/inativo) de um cupom
 */
export async function updateInfluencerCoupon(couponId: string, isActive: boolean): Promise<{ success: boolean; message?: string; coupon?: CouponData }> {
  console.log(`[SA updateInfluencerCoupon] Updating coupon ID: ${couponId} to isActive: ${isActive}`);
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado.' };
    }

    const response = await fetch(`${API_URL}/api/coupons/${couponId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[SA updateInfluencerCoupon] Error updating coupon: ${data.message}`);
      return { success: false, message: data.message || 'Falha ao atualizar cupom.' };
    }

    console.log(`[SA updateInfluencerCoupon] Successfully updated coupon:`, data);
    return { success: true, coupon: data };

  } catch (error) {
    console.error('[SA updateInfluencerCoupon] Exception:', error);
    return { success: false, message: 'Erro ao conectar com o servidor.' };
  }
}

/**
 * Deleta um cupom
 */
export async function deleteInfluencerCoupon(couponId: string): Promise<{ success: boolean; message?: string }> {
  console.log(`[SA deleteInfluencerCoupon] Deleting coupon ID: ${couponId}`);
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado.' };
    }

    const response = await fetch(`${API_URL}/api/coupons/${couponId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });

    // DELETE often returns 200 or 204 for success without a body
    if (response.ok) {
       console.log(`[SA deleteInfluencerCoupon] Successfully deleted coupon.`);
       // Try to parse JSON only if there's content, otherwise return generic success
       const text = await response.text();
       let message = 'Cupom deletado com sucesso.';
       try {
           const data = JSON.parse(text);
           message = data.message || message;
       } catch(e) { /* Ignore parsing error if body is empty */ }
      return { success: true, message };
    } else {
      const data = await response.json(); // Try to get error message from body
      console.error(`[SA deleteInfluencerCoupon] Error deleting coupon: ${data.message}`);
      return { success: false, message: data.message || 'Falha ao deletar cupom.' };
    }

  } catch (error) {
    console.error('[SA deleteInfluencerCoupon] Exception:', error);
    return { success: false, message: 'Erro ao conectar com o servidor.' };
  }
} 