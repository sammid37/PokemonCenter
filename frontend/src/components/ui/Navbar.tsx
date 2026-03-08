'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { authService } from '@/services/auth.service';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  function handleLogout() {
    authService.logout();
    router.push('/login');
  }

  const isNurse = user?.role === UserRole.NURSE;

  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <Link href="/dashboard" className="text-xl font-bold text-primary">
          Centro Pokémon
        </Link>
      </div>

      <div className="flex-none flex items-center gap-3">
        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-base-content/50">
              {isNurse ? '🏥 Enfermeira Joy' : '🎒 Treinador'}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="btn btn-outline btn-error btn-sm"
        >
          Sair
        </button>
      </div>
    </div>
  );
}