# Influencer Dashboard - Frontend

Interface de usuário para gerenciamento de influenciadores, visualização de vendas, comissões e desempenho.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- ShadcnUI

## Estrutura do Projeto

- `/app` - Páginas e recursos usando a estrutura App Router do Next.js
- `/components` - Componentes reutilizáveis
- `/hooks` - Custom hooks React
- `/lib` - Utilitários e funções auxiliares
- `/public` - Arquivos estáticos
- `/styles` - Estilos globais e configurações
- `/types` - Tipagens TypeScript

## Principais Funcionalidades

- Dashboard com métricas de desempenho
- Gerenciamento de influenciadores
- Visualização e análise de vendas
- Gerenciamento de comissões
- Autenticação e autorização

## Páginas

- Dashboard - Visão geral de desempenho
- Influenciadores - Gerenciamento de influenciadores
- Vendas - Registro e acompanhamento de vendas
- Comissões - Cálculo e histórico de comissões
- Configurações - Configurações da plataforma

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Crie um arquivo .env.local baseado no .env.example

# Executar em modo de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Iniciar build
npm start
```

## Integração com o Backend

Este frontend consome a API fornecida pelo backend do projeto Influencer Dashboard. 