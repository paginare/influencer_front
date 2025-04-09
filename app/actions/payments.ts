'use server';

import { getAuthToken } from '../lib/cookies';

// Tipos
interface PaymentFilters {
  status?: 'pending' | 'paid' | 'failed';
  startDate?: string;
  endDate?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

interface PaymentUpdateData {
  status: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  paymentDate?: string;
  notes?: string;
}

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Obtém os pagamentos de comissão com filtros
 * Renomeado para evitar conflito com o módulo commissions.ts
 */
export async function getPaymentsList(filters: PaymentFilters = {}): Promise<{ success: boolean; message?: string; payments?: any[]; pagination?: any }> {
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
 * Obtém detalhes de um pagamento específico
 */
export async function getPaymentDetails(paymentId: string): Promise<{ success: boolean; message?: string; payment?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/commissions/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter detalhes do pagamento',
      };
    }

    return {
      success: true,
      payment: data
    };
  } catch (error) {
    console.error('Erro ao obter detalhes do pagamento:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Obtém o resumo de pagamentos pendentes por usuário
 */
export async function getPendingPaymentsSummary(): Promise<{ success: boolean; message?: string; summary?: any[] }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/commissions/payments/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao obter resumo de pagamentos',
      };
    }

    return {
      success: true,
      summary: data
    };
  } catch (error) {
    console.error('Erro ao obter resumo de pagamentos:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Atualiza informações de um pagamento (status, transactionId, notas)
 */
export async function updatePaymentInfo(paymentId: string, updateData: PaymentUpdateData): Promise<{ success: boolean; message?: string; payment?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/commissions/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao atualizar informações do pagamento',
      };
    }

    return {
      success: true,
      payment: data
    };
  } catch (error) {
    console.error('Erro ao atualizar informações do pagamento:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Gera relatório de pagamentos por período
 */
export async function generatePaymentsReport(startDate: string, endDate: string, status?: string): Promise<{ success: boolean; message?: string; reportUrl?: string }> {
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
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_URL}/api/commissions/payments/report?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao gerar relatório',
      };
    }

    return {
      success: true,
      reportUrl: data.reportUrl
    };
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
}

/**
 * Marca múltiplos pagamentos como pagos
 */
export async function markPaymentsAsPaid(paymentIds: string[], transactionId?: string): Promise<{ success: boolean; message?: string; results?: any }> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Não autorizado. Faça login novamente.',
      };
    }
    
    const response = await fetch(`${API_URL}/api/commissions/payments/batch-update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        paymentIds, 
        status: 'paid', 
        transactionId,
        paymentDate: new Date().toISOString()
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao atualizar pagamentos',
      };
    }

    return {
      success: true,
      message: 'Pagamentos atualizados com sucesso',
      results: data
    };
  } catch (error) {
    console.error('Erro ao atualizar pagamentos:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }
} 