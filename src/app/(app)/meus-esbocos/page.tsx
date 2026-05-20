'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface EsbocoItem {
  id: string;
  livro: string;
  capitulo: number;
  versiculo: number;
  tipo: string;
  titulo: string;
  publicoAlvo: string;
  status: string;
  createdAt: string;
}

export default function MeusEsbocosPage() {
  const [esbocos, setEsbocos] = useState<EsbocoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEsbocos = async () => {
      try {
        const { fetchWithAuth } = await import('@/lib/firebase-client');
        const response = await fetchWithAuth('/api/esbocos');
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Você precisa estar autenticado');
          }
          throw new Error('Erro ao carregar esboços');
        }
        const data = await response.json();
        setEsbocos(data || []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar esboços');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEsbocos();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 animate-spin">
            <div className="h-12 w-12 rounded-full border-4 border-primary-blue border-t-transparent"></div>
          </div>
          <p className="text-gray-600">Carregando esboços...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/novo-esboço" className="btn-primary px-6 py-2 rounded-lg inline-block">
            ← Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Esboços</h1>
        <p className="text-gray-600">Todos os esboços de pregação que você criou</p>
      </div>

      {esbocos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum esboço criado</h2>
          <p className="text-gray-600 mb-6">Comece criando seu primeiro esboço de pregação</p>
          <Link href="/novo-esboço" className="btn-primary px-6 py-2 rounded-lg inline-block">
            🚀 Criar Novo Esboço
          </Link>
        </div>
      ) : (
        <div>
          {/* Summary */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-primary-blue">
            <p className="text-sm text-gray-600">
              Total de esboços: <span className="font-bold text-primary-blue">{esbocos.length}</span>
            </p>
          </div>

          {/* Sketches Grid */}
          <div className="space-y-4">
            {esbocos.map((esboço) => (
              <Link
                key={esboço.id}
                href={`/esboço/${esboço.id}`}
                className="block p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-primary-blue hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left side - Sketch info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{esboço.titulo}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span>📖 {esboço.livro} {esboço.capitulo}:{esboço.versiculo}</span>
                      <span>•</span>
                      <span className="capitalize">{esboço.tipo}</span>
                      {esboço.publicoAlvo && (
                        <>
                          <span>•</span>
                          <span>{esboço.publicoAlvo}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Criado em {new Date(esboço.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Right side - Status badge */}
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      esboço.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : esboço.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {esboço.status === 'completed' && '✅ Concluído'}
                      {esboço.status === 'failed' && '❌ Falha'}
                      {esboço.status === 'pending' && '⏳ Processando'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Create new button */}
          <div className="mt-8 text-center">
            <Link href="/novo-esboço" className="btn-primary px-6 py-2 rounded-lg inline-block">
              🚀 Criar Novo Esboço
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
