'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth } from '@/lib/firebase';
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
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
        setUserEmail(user.email || '');
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
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


  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      {/* Header com Perfil */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary-blue">SermãoIA</h1>
          <div className="text-right">
            <p className="text-xs text-gray-500">Acesso:</p>
            <p className="text-sm font-semibold text-gray-900">{userEmail}</p>
          </div>
        </div>
      </header>

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

          {/* Meus Esboços */}
          <Link
            href="/meus-esbocos"
            className={`flex-1 flex flex-col items-center justify-center py-3 text-xs transition-colors ${
              isActive('/meus-esbocos')
                ? 'text-primary-blue border-t-2 border-primary-blue'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="text-xl mb-1">📚</span>
            <span>Meus</span>
          </Link>

          {/* Bíblia (placeholder) */}
          <button className="flex-1 flex flex-col items-center justify-center py-3 text-xs text-gray-400 hover:text-gray-600 transition-colors opacity-50 cursor-not-allowed">
            <span className="text-xl mb-1">📖</span>
            <span>Bíblia</span>
          </button>

          {/* Admin */}
          <Link
            href="/admin"
            className={`flex-1 flex flex-col items-center justify-center py-3 text-xs transition-colors ${
              isActive('/admin')
                ? 'text-primary-blue border-t-2 border-primary-blue'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Painel Administrativo"
          >
            <span className="text-xl mb-1">⚙️</span>
            <span>Admin</span>
          </Link>

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
