'use server';

import { getAuthToken } from '../lib/cookies';

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Obtém estatísticas para o dashboard de admin
 */
export async function getAdminDashboardStats(): Promise<{ success: boolean; message?: string; stats?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/dashboard/admin`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter estatísticas',
      };
    }

    return {
      success: true,
      stats: data
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém estatísticas para o dashboard de gerente
 */
export async function getManagerDashboardStats(): Promise<{ success: boolean; message?: string; stats?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/dashboard/manager`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter estatísticas',
      };
    }

    return {
      success: true,
      stats: data
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém estatísticas para o dashboard de influenciador
 */
export async function getInfluencerDashboardStats(): Promise<{ success: boolean; message?: string; stats?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/dashboard/influencer`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter estatísticas',
      };
    }

    return {
      success: true,
      stats: data
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém gráfico de vendas por período
 */
export async function getSalesChart(period: 'week' | 'month' | 'year', userId?: string): Promise<{ success: boolean; message?: string; data?: any }> {
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
    params.append('period', period);
    if (userId) params.append('userId', userId);
    
    const response = await fetch(`${API_URL}/api/dashboard/sales-chart?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter dados do gráfico',
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Erro ao obter dados do gráfico:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém ranking de influenciadores por vendas
 */
export async function getInfluencerRanking(limit: number = 10, period: 'month' | 'year' | 'all' = 'month'): Promise<{ success: boolean; message?: string; ranking?: any[] }> {
  try {
    console.log(`[getInfluencerRanking] Solicitando ranking com limit=${limit}, period=${period}`);
    const token = getAuthToken();
    
    if (!token) {
      console.error('[getInfluencerRanking] Token não encontrado');
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    // Construir parâmetros de consulta
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('period', period);
    
    const url = `${API_URL}/api/dashboard/influencer-ranking?${params.toString()}`;
    console.log(`[getInfluencerRanking] Fazendo requisição para: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    console.log(`[getInfluencerRanking] Resposta da API (status ${response.status}):`, 
                data.length ? `Array com ${data.length} itens` : data);

    if (!response.ok) {
      console.error(`[getInfluencerRanking] Erro HTTP ${response.status}:`, data);
      return {
        success: false,
        message: data.message || 'Falha ao obter ranking de influenciadores',
      };
    }

    // Dados estão vindo como array diretamente?
    if (Array.isArray(data)) {
      console.log(`[getInfluencerRanking] Dados recebidos como array com ${data.length} itens`);
      return {
        success: true,
        ranking: data
      };
    }

    console.log('[getInfluencerRanking] Retorno bem-sucedido');
    return {
      success: true,
      ranking: data
    };
  } catch (error) {
    console.error('[getInfluencerRanking] Erro ao obter ranking de influenciadores:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém um resumo de comissões pendentes agrupadas por usuário
 */
export async function getPendingCommissionsSummary(): Promise<{ success: boolean; message?: string; summary?: any[] }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/dashboard/pending-commissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter resumo de comissões pendentes',
      };
    }

    return {
      success: true,
      summary: data
    };
  } catch (error) {
    console.error('Erro ao obter resumo de comissões pendentes:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém ranking de gerentes por vendas
 */
export async function getManagerRanking(limit: number = 10, period: 'month' | 'year' | 'all' = 'month'): Promise<{ success: boolean; message?: string; ranking?: any[] }> {
  try {
    console.log(`[getManagerRanking] Solicitando ranking com limit=${limit}, period=${period}`);
    const token = getAuthToken();
    
    if (!token) {
      console.error('[getManagerRanking] Token não encontrado');
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    // Construir parâmetros de consulta
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('period', period);
    
    const url = `${API_URL}/api/dashboard/manager-ranking?${params.toString()}`;
    console.log(`[getManagerRanking] Fazendo requisição para: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    console.log(`[getManagerRanking] Resposta da API (status ${response.status}):`, 
                data.length ? `Array com ${data.length} itens` : data);

    if (!response.ok) {
      console.error(`[getManagerRanking] Erro HTTP ${response.status}:`, data);
      return {
        success: false,
        message: data.message || 'Falha ao obter ranking de gerentes',
      };
    }

    // Dados estão vindo como array diretamente?
    if (Array.isArray(data)) {
      console.log(`[getManagerRanking] Dados recebidos como array com ${data.length} itens`);
      return {
        success: true,
        ranking: data
      };
    }

    console.log('[getManagerRanking] Retorno bem-sucedido');
    return {
      success: true,
      ranking: data
    };
  } catch (error) {
    console.error('[getManagerRanking] Erro ao obter ranking de gerentes:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém estatísticas resumidas para a visão geral de desempenho.
 */
export async function getPerformanceOverviewStats(
    period: 'month' | 'quarter' | 'year' = 'month',
    userType: 'all' | 'manager' | 'influencer' = 'all'
): Promise<{ success: boolean; message?: string; stats?: any }> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    const params = new URLSearchParams();
    params.append('period', period);
    params.append('userType', userType);

    const response = await fetch(`${API_URL}/api/dashboard/performance-overview?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store', // Ensure fresh data
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Falha ao obter estatísticas de desempenho' };
    }

    // Assuming the API returns the stats in the expected structure
    // { totalSales, salesGrowth, totalCommissions, commissionGrowth, activeUsers, conversionRate }
    return { success: true, stats: data };

  } catch (error) {
    console.error('Erro ao obter estatísticas de desempenho:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Obtém dados de vendas agregadas ao longo do tempo para comparação.
 */
export async function getPerformanceTimeline(
    period: 'year' | 'all' = 'year' // Example: defaulting to year, adjust as needed
): Promise<{ success: boolean; message?: string; data?: any[] }> {
    try {
        const token = getAuthToken();
        if (!token) {
            return { success: false, message: 'Não autorizado' };
        }

        const params = new URLSearchParams();
        params.append('period', period);

        const response = await fetch(`${API_URL}/api/dashboard/performance-timeline?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, message: data.message || 'Falha ao obter dados da timeline' };
        }

        // Assuming API returns data like: [{ month: "Jan", managerSales: 123, influencerSales: 456 }, ...]
        return { success: true, data: data };

    } catch (error) {
        console.error('Erro ao obter dados da timeline:', error);
        return { success: false, message: 'Erro ao conectar com o servidor' };
    }
} 