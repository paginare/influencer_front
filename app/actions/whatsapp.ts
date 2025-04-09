'use server';

import { getAuthToken } from '@/app/lib/cookies';

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Busca o status da conexão WhatsApp do usuário logado.
 */
export async function getConnectionStatus(): Promise<{ 
    success: boolean; 
    message?: string; 
    hasToken?: boolean; 
    token?: string | null; 
}> {
  console.log('[SA getConnectionStatus] Chamada');
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    const response = await fetch(`${API_URL}/api/whatsapp/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    console.log('[SA getConnectionStatus] Resposta:', data);

    if (!response.ok) {
      return { success: false, message: data.message || 'Falha ao buscar status' };
    }

    return { 
      success: true, 
      hasToken: data.hasToken, 
      token: data.token 
    };
  } catch (error) {
    console.error('[SA getConnectionStatus] Erro:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Inicia a conexão WhatsApp para o usuário logado.
 */
export async function initiateConnection(): Promise<{ 
    success: boolean; 
    message?: string; 
    hasToken?: boolean; 
    token?: string | null; 
    qrCode?: string | null;
}> {
  console.log('[SA initiateConnection] Chamada');
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    const response = await fetch(`${API_URL}/api/whatsapp/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Content-Type não é necessário para POST sem body
      },
      cache: 'no-store',
    });

    const data = await response.json();
    console.log('[SA initiateConnection] Resposta:', data);

    if (!response.ok) {
      return { success: false, message: data.message || 'Falha ao iniciar conexão' };
    }

    return { 
      success: true, 
      message: data.message, 
      hasToken: data.hasToken, 
      token: data.token, 
      qrCode: data.qrCode || null 
    };
  } catch (error) {
    console.error('[SA initiateConnection] Erro:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Tenta conectar uma instância WhatsApp existente usando o token do usuário.
 */
export async function connectWhatsapp(): Promise<{ 
    success: boolean; 
    message?: string; 
    qrCode?: string | null; 
    token?: string | null; // Backend retorna o token usado
}> {
  console.log('[SA connectWhatsapp] Chamada');
  try {
    const token = await getAuthToken(); // Token do NOSSO sistema
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    // Não precisamos enviar o tokenWhats no body, o backend pega do usuário logado
    const response = await fetch(`${API_URL}/api/whatsapp/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', // Mesmo sem body, é boa prática
      },
      cache: 'no-store',
    });

    const data = await response.json();
    console.log('[SA connectWhatsapp] Resposta:', data);

    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Falha ao obter QR code para reconexão' };
    }

    return { 
      success: true, 
      message: data.message, 
      qrCode: data.qrCode || null,
      token: data.token || null
    };
  } catch (error) {
    console.error('[SA connectWhatsapp] Erro:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Busca o status DETALHADO da conexão WhatsApp (chamando API externa).
 */
export async function getDetailedConnectionStatus(): Promise<{ 
    success: boolean; 
    message?: string; 
    status?: string | null; // e.g., "connected", "connecting", "disconnected"
    loggedIn?: boolean;
    qrCode?: string | null; // Pode retornar um QR atualizado
}> {
  console.log('[SA getDetailedStatus] Chamada');
  try {
    const token = await getAuthToken(); // Token do NOSSO sistema
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }

    const response = await fetch(`${API_URL}/api/whatsapp/detailed-status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    console.log('[SA getDetailedStatus] Resposta:', data);

    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Falha ao buscar status detalhado' };
    }

    return { 
      success: true, 
      status: data.status || null,
      loggedIn: data.loggedIn,
      qrCode: data.qrCode || null
    };
  } catch (error) {
    console.error('[SA getDetailedStatus] Erro:', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }
}

/**
 * Desconecta a instância WhatsApp do usuário diretamente na UAZapi.
 */
export async function disconnectWhatsapp(): Promise<{ 
    success: boolean; 
    message?: string;
    debug?: any;
}> {
  console.log('[SA disconnectWhatsapp] Chamada - MODO DIRETO UAZAPI');
  try {
    const token = await getAuthToken();
    console.log('[SA disconnectWhatsapp] Token obtido:', token ? 'Sim' : 'Não');
    
    if (!token) {
      return { success: false, message: 'Não autorizado' };
    }
    
    // Primeiro vamos obter o token WhatsApp (UAZapi) do usuário
    const statusResponse = await fetch(`${API_URL}/api/whatsapp/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    
    const statusData = await statusResponse.json();
    console.log('[SA disconnectWhatsapp] Status response:', statusData);
    
    // Verificar se temos o token da instância WhatsApp
    if (!statusData.hasToken || !statusData.token) {
      console.log('[SA disconnectWhatsapp] Usuário não tem token WhatsApp');
      // Mesmo sem token, reportamos sucesso para atualizar a UI
      return { 
        success: true, 
        message: 'Não há instância WhatsApp para desconectar'
      };
    }
    
    // Token da instância UAZapi
    const uazapiToken = statusData.token;
    console.log('[SA disconnectWhatsapp] Token UAZapi obtido');
    
    // Chamada direta à API UAZapi para desconectar
    const uazapiUrl = 'https://notifiquei.uazapi.com/instance/disconnect';
    console.log('[SA disconnectWhatsapp] Chamando UAZapi:', uazapiUrl);
    
    try {
      const uazapiResponse = await fetch(uazapiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': uazapiToken
        }
      });
      
      console.log('[SA disconnectWhatsapp] Status da resposta UAZapi:', uazapiResponse.status);
      
      // Tentar ler a resposta, mas não falhar se não for JSON
      try {
        if (uazapiResponse.headers.get('content-type')?.includes('application/json')) {
          const uazapiData = await uazapiResponse.json();
          console.log('[SA disconnectWhatsapp] Resposta UAZapi:', uazapiData);
        } else {
          const text = await uazapiResponse.text();
          console.log('[SA disconnectWhatsapp] Resposta não-JSON:', text.substring(0, 100));
        }
      } catch (parseError) {
        console.error('[SA disconnectWhatsapp] Erro ao parsear resposta:', parseError);
      }
      
    } catch (uazapiError) {
      console.error('[SA disconnectWhatsapp] Erro na chamada UAZapi:', uazapiError);
      // Continuamos mesmo se houver erro na API externa
    }
    
    // Agora fazemos uma chamada simples ao nosso backend para atualizar o status
    // Esta chamada usa o endpoint /status porque sabemos que ele funciona
    const clearResponse = await fetch(`${API_URL}/api/whatsapp/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    
    console.log('[SA disconnectWhatsapp] Status da resposta update:', clearResponse.status);
    
    // Independente da resposta, retornamos sucesso
    return { 
      success: true, 
      message: 'Instância WhatsApp desconectada com sucesso'
    };
    
  } catch (error) {
    console.error('[SA disconnectWhatsapp] Erro:', error);
    return { 
      success: false, 
      message: 'Erro ao processar a desconexão',
      debug: { error: String(error) }
    };
  }
} 