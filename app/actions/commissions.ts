'use server';

import { getAuthToken } from '../lib/cookies';

// Tipos
interface CommissionTier {
  _id?: string;
  name: string;
  minSalesValue: number;
  maxSalesValue?: number;
  commissionPercentage: number;
  appliesTo: 'influencer' | 'manager';
  isActive: boolean;
}

interface SaleFilters {
  startDate?: string;
  endDate?: string;
  influencerId?: string;
  managerId?: string;
  page?: number;
  limit?: number;
}

interface PaymentFilters {
  status?: 'pending' | 'paid' | 'failed';
  startDate?: string;
  endDate?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Cria uma nova faixa de comissão
 */
export async function createCommissionTier(tierData: CommissionTier): Promise<{ success: boolean; message?: string; tier?: CommissionTier }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/commissions/tiers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(tierData),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao criar faixa de comissão',
      };
    }

    return {
      success: true,
      tier: data,
    };
  } catch (error) {
    console.error('Erro ao criar faixa de comissão:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém todas as faixas de comissão
 */
export async function getCommissionTiers(appliesTo?: 'influencer' | 'manager', isActive?: boolean): Promise<{ success: boolean; message?: string; tiers?: CommissionTier[] }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    // Construir parâmetros de consulta
    const params = new URLSearchParams();
    if (appliesTo) params.append('appliesTo', appliesTo);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    
    const response = await fetch(`${API_URL}/api/commissions/tiers${params.toString() ? `?${params.toString()}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter faixas de comissão',
      };
    }

    return {
      success: true,
      tiers: data,
    };
  } catch (error) {
    console.error('Erro ao obter faixas de comissão:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Atualiza uma faixa de comissão existente
 */
export async function updateCommissionTier(id: string, tierData: Partial<CommissionTier>): Promise<{ success: boolean; message?: string; tier?: CommissionTier }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/commissions/tiers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(tierData),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao atualizar faixa de comissão',
      };
    }

    return {
      success: true,
      tier: data,
    };
  } catch (error) {
    console.error('Erro ao atualizar faixa de comissão:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Desativa uma faixa de comissão
 */
export async function deleteCommissionTier(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/commissions/tiers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao desativar faixa de comissão',
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('Erro ao desativar faixa de comissão:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém as vendas com filtros
 */
export async function getSales(filters: SaleFilters = {}): Promise<{ success: boolean; message?: string; sales?: any; pagination?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    // Construir parâmetros de consulta
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.influencerId) params.append('influencerId', filters.influencerId);
    if (filters.managerId) params.append('managerId', filters.managerId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const response = await fetch(`${API_URL}/api/commissions/sales?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter vendas',
      };
    }

    return {
      success: true,
      sales: data.sales,
      pagination: {
        page: data.page,
        pages: data.pages,
        total: data.total
      }
    };
  } catch (error) {
    console.error('Erro ao obter vendas:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Processa comissões pendentes (admin)
 */
export async function processCommissions(): Promise<{ success: boolean; message?: string; result?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/commissions/process-pending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao processar comissões',
      };
    }

    return {
      success: true,
      message: data.message,
      result: data
    };
  } catch (error) {
    console.error('Erro ao processar comissões:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Gera pagamentos para um período específico (admin)
 */
export async function generatePayments(startDate: string, endDate: string): Promise<{ success: boolean; message?: string; result?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/commissions/generate-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ startDate, endDate }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao gerar pagamentos',
      };
    }

    return {
      success: true,
      message: data.message,
      result: data
    };
  } catch (error) {
    console.error('Erro ao gerar pagamentos:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém os pagamentos de comissão com filtros
 */
export async function getCommissionPayments(filters: PaymentFilters = {}): Promise<{ success: boolean; message?: string; payments?: any; pagination?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    // Construir parâmetros de consulta
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const response = await fetch(`${API_URL}/api/commissions/payments?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter pagamentos',
      };
    }

    return {
      success: true,
      payments: data.payments,
      pagination: {
        page: data.page,
        pages: data.pages,
        total: data.total
      }
    };
  } catch (error) {
    console.error('Erro ao obter pagamentos:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Atualiza o status de um pagamento (admin)
 */
export async function updatePaymentStatus(id: string, status: 'pending' | 'paid' | 'failed', transactionId?: string): Promise<{ success: boolean; message?: string; payment?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/commissions/payments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status, transactionId }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao atualizar status do pagamento',
      };
    }

    return {
      success: true,
      payment: data
    };
  } catch (error) {
    console.error('Erro ao atualizar status do pagamento:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Salva (substitui) todas as faixas de comissão para um tipo específico.
 */
export async function saveCommissionTiersBulk(appliesTo: 'influencer' | 'manager', tiers: Array<Partial<CommissionTier>>): Promise<{ success: boolean; message?: string; tiers?: CommissionTier[] }> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    // Validar e limpar os tiers antes de enviar
    const validatedTiers = tiers.map(tier => ({
        // Certificar que os valores numéricos são números
        minSalesValue: Number(tier.minSalesValue) || 0, 
        maxSalesValue: tier.maxSalesValue ? Number(tier.maxSalesValue) : undefined,
        commissionPercentage: Number(tier.commissionPercentage) || 0,
        // Remover campos que não devem ser enviados (como _id)
        // O backend irá definir appliesTo e isActive
    })).filter(tier => 
        // Remover tiers inválidos (ex: sem min ou rate)
        tier.minSalesValue !== undefined && tier.commissionPercentage !== undefined
    );

    // Verificar se max é maior que min
    for (let i = 0; i < validatedTiers.length; i++) {
        const tier = validatedTiers[i];
        if (tier.maxSalesValue !== undefined && tier.maxSalesValue <= tier.minSalesValue) {
             return { success: false, message: `Erro na faixa ${i + 1}: Valor máximo (${tier.maxSalesValue}) deve ser maior que o mínimo (${tier.minSalesValue}).` };
        }
        // Verificar sobreposição ou lacunas (mais complexo, pode ser feito no backend)
    }

    const body = {
      appliesTo,
      tiers: validatedTiers
    };

    const response = await fetch(`${API_URL}/api/commissions/tiers/bulk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Falha ao salvar faixas de comissão' };
    }

    return { success: true, tiers: data };

  } catch (error) {
    console.error('Erro ao salvar faixas de comissão:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
} 