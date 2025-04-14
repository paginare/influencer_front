import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/registro', '/recuperar-senha'];

// Rotas específicas por papel/função de usuário
const roleRoutes = {
  admin: ['/admin', '/dashboard/admin', '/usuarios', '/comissoes', '/pagamentos', '/configuracoes'],
  manager: ['/dashboard/gerente', '/influenciadores', '/vendas'],
  influencer: ['/dashboard/influenciador', '/minhas-vendas', '/minhas-comissoes'],
};

const publicPaths = ['/login', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const userCookie = request.cookies.get('user');
  
  // Extrair o caminho da URL
  const path = request.nextUrl.pathname;
  
  // Verificar se é uma rota pública
  const isPublicPath = publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath + '/'));
  
  // Se não houver token e o caminho não for público, redirecionar para login
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Se tiver token e estiver tentando acessar uma página pública
  if (token && isPublicPath) {
    // Tentar obter o papel do usuário dos cookies
    let role = 'influencer'; // Valor padrão
    
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie.value);
        role = userData.role;
      } catch (error) {
        console.error('Erro ao analisar o cookie do usuário:', error);
      }
    }
    
    // Redirecionar para o dashboard apropriado
    let dashboardPath;
    switch (role) {
      case 'admin':
        dashboardPath = '/admin/dashboard';
        break;
      case 'manager':
        dashboardPath = '/manager/dashboard';
        break;
      case 'influencer':
        dashboardPath = '/influencer/dashboard';
        break;
      default:
        dashboardPath = '/login';
    }
    
    const dashboardUrl = new URL(dashboardPath, request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Continuar com a requisição em outros casos
  return NextResponse.next();
}

// Configurar quais caminhos o middleware deve executar
export const config = {
  matcher: [
    // Aplicar a todas as rotas, exceto arquivos estáticos e API
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}; 