import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register'];

// Verifica se o token JWT tem estrutura válida (três partes separadas por ponto)
function isTokenStructureValid(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isPublicRoute = PUBLIC_ROUTES.includes(request.nextUrl.pathname);

  // Token presente mas com estrutura inválida
  // limpa o cookie e redireciona para login
  if (token && !isTokenStructureValid(token)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('access_token');
    return response;
  }

  // Redireciona para login se não autenticado em rota protegida
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redireciona para dashboard se já autenticado tentando acessar login/register
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};