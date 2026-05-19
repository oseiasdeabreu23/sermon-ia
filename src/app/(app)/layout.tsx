'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { signOut } from 'firebase/auth';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin">
            <div className="h-12 w-12 rounded-full border-4 border-primary-blue border-t-transparent"></div>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: '/novo-esboço', icon: '✏️', label: 'Novo', mobile: true },
    { href: '/biblia', icon: '📖', label: 'Bíblia', mobile: true },
    { href: '/harpa', icon: '🎵', label: 'Harpa', mobile: true },
    { href: '/dicionario', icon: '📚', label: 'Dicionário', mobile: true },
    { href: '/search', icon: '🔎', label: 'Pesquisar', mobile: true },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-navbar w-full">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset">
        <div className="flex justify-around items-center max-w-screen">
          {/* Novo Esboço */}
          <Link
            href="/novo-esboço"
            className={`flex-1 flex flex-col items-center justify-center py-3 text-xs transition-colors ${
              isActive('/novo-esboço')
                ? 'text-primary-blue border-t-2 border-primary-blue'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="text-xl mb-1">✏️</span>
            <span>Novo</span>
          </Link>

          {/* Bíblia (placeholder) */}
          <button className="flex-1 flex flex-col items-center justify-center py-3 text-xs text-gray-400 hover:text-gray-600 transition-colors opacity-50 cursor-not-allowed">
            <span className="text-xl mb-1">📖</span>
            <span>Bíblia</span>
          </button>

          {/* Harpa (placeholder) */}
          <button className="flex-1 flex flex-col items-center justify-center py-3 text-xs text-gray-400 hover:text-gray-600 transition-colors opacity-50 cursor-not-allowed">
            <span className="text-xl mb-1">🎵</span>
            <span>Harpa</span>
          </button>

          {/* Dicionário (placeholder) */}
          <button className="flex-1 flex flex-col items-center justify-center py-3 text-xs text-gray-400 hover:text-gray-600 transition-colors opacity-50 cursor-not-allowed">
            <span className="text-xl mb-1">📚</span>
            <span>Dicionário</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center py-3 text-xs text-red-600 hover:text-red-700 transition-colors"
            title="Sair"
          >
            <span className="text-xl mb-1">🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
