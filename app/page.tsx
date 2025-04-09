import { redirect } from 'next/navigation';
import { getAuthToken, getUserRole } from './lib/cookies';

export default function HomePage() {
  // Obtém o token e o papel do usuário
  const token = getAuthToken();
  const userRole = getUserRole();
  
  // Se não estiver autenticado, redireciona para o login
  if (!token) {
    redirect('/login');
  }
  
  // Se estiver autenticado, redireciona para o dashboard apropriado
  switch (userRole) {
    case 'admin':
      redirect('/admin/dashboard');
    case 'manager':
      redirect('/manager/dashboard');
    case 'influencer':
      redirect('/influencer/dashboard');
    default:
      redirect('/login');
  }
  
  // Este retorno nunca será executado devido aos redirecionamentos,
  // mas é necessário para satisfazer o TypeScript
  return null;
}
