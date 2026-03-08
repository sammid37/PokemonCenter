'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function Navbar() {
  const router = useRouter();

  function handleLogout() {
    authService.logout();
    // Remove o cookie do token
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  }

  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <Link href="/dashboard" className="text-xl font-bold text-primary">
          Centro Pokémon
        </Link>
      </div>
      <div className="flex-none">
        <button onClick={handleLogout} className="btn btn-outline btn-error btn-sm">
          Sair
        </button>
      </div>
    </div>
  );
}