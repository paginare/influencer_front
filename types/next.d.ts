import 'next';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

declare module 'next/headers' {
  // Sobrescrever a função cookies para retornar o tipo correto
  function cookies(): ReadonlyRequestCookies;
} 