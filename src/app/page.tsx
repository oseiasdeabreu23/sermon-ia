'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        router.push('/novo-esboço');
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-blue to-primary-gold">
        <div className="text-center">
          <div className="mb-4 animate-spin">
            <div className="h-12 w-12 rounded-full border-4 border-white border-t-transparent"></div>
          </div>
          <p className="text-xl font-semibold text-white">Carregando SermãoIA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue via-blue-500 to-primary-gold flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="text-5xl font-bold text-white mb-4">SermãoIA</h1>
        <p className="text-xl text-blue-100 max-w-md">
          Ferramenta inteligente para gerar esboços de pregação profundos e aplicáveis
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 max-w-2xl mb-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="font-semibold mb-2">Rápido</h3>
          <p className="text-sm text-blue-100">Esboços completos em minutos</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
          <div className="text-3xl mb-2">🧠</div>
          <h3 className="font-semibold mb-2">Inteligente</h3>
          <p className="text-sm text-blue-100">Análises teológicas profundas</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-semibold mb-2">Mobile</h3>
          <p className="text-sm text-blue-100">Funciona em qualquer dispositivo</p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/auth/login"
          className="btn-primary px-8 py-3 text-lg rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Entrar
        </Link>
        <Link
          href="/auth/register"
          className="btn-outline px-8 py-3 text-lg rounded-lg font-semibold bg-white/10 border-white text-white hover:bg-white/20 transition-all"
        >
          Criar Conta
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-blue-100 text-sm">
        <p>© 2025 SermãoIA. Desenvolvido com ❤️ para pregadores.</p>
      </div>
    </div>
  );
}
