'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    try {
      const auth = getAuth();
      if (auth) {
        setFirebaseReady(true);
        console.log('✅ Firebase Auth ready');
      }
    } catch (err) {
      console.error('❌ Firebase not ready:', err);
      setError('Firebase não está inicializado. Recarregue a página.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('📝 Iniciando login...');
    setIsLoading(true);

    try {
      console.log('🔐 Chamando Firebase signInWithEmailAndPassword...');
      const auth = getAuth();
      
      if (!auth) {
        throw new Error('Firebase Auth não está inicializado');
      }

      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login bem-sucedido!');
      router.push('/novo-esboço');
    } catch (err: any) {
      let errorMessage = 'Erro ao fazer login';
      console.error('❌ Login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'Usuário desabilitado';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue via-blue-500 to-primary-gold flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-2">📖</div>
        <h1 className="text-4xl font-bold text-white">SermãoIA</h1>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Entrar</h2>

        {!firebaseReady && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">⏳ Carregando Firebase...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !firebaseReady}
            className="w-full btn-primary py-2 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ Entrando...' : '🔓 Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Não tem conta?{' '}
          <Link href="/register" className="text-primary-blue hover:underline font-semibold">
            Criar Conta
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-white/60 text-sm">
        <p>© 2025 SermãoIA. Desenvolvido com ❤️ para pregadores.</p>
      </div>
    </div>
  );
}
