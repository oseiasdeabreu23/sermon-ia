'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from '@/lib/firebase';

interface AIConfig {
  id: string;
  provider: 'anthropic' | 'openai';
  model: string;
  apiKey: string;
  isActive: number;
}

const AVAILABLE_MODELS = {
  anthropic: [
    'claude-opus-4-7',
    'claude-sonnet-4-6',
    'claude-haiku-4-5-20251001',
    'claude-3-5-opus-20241022',
    'claude-3-5-sonnet-20241022',
  ],
  openai: [
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'gpt-4o',
    'gpt-4o-mini',
  ],
};

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [newProvider, setNewProvider] = useState<'anthropic' | 'openai'>('anthropic');
  const [newModel, setNewModel] = useState('claude-opus-4-7');
  const [newApiKey, setNewApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/admin/ai-configs', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (response.status === 401) {
          router.push('/');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setConfigs(data.configs);
          setIsAdmin(true);
        }
      } catch (err) {
        console.error(err);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  const handleAddConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newModel || !newApiKey) {
      setError('Modelo e API Key são obrigatórios');
      return;
    }

    try {
      const { fetchWithAuth: fetch } = await import('@/lib/firebase-client');
      const response = await fetch('/api/admin/ai-configs', {
        method: 'POST',
        body: JSON.stringify({
          provider: newProvider,
          model: newModel,
          apiKey: newApiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao adicionar configuração');
        return;
      }

      setSuccess('Configuração adicionada com sucesso!');
      setNewModel('');
      setNewApiKey('');

      // Recarregar configurações
      const listResponse = await fetch('/api/admin/ai-configs');
      const listData = await listResponse.json();
      setConfigs(listData.configs);
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar configuração');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const { fetchWithAuth: fetch } = await import('@/lib/firebase-client');
      const response = await fetch(`/api/admin/ai-configs/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'activate' }),
      });

      if (!response.ok) {
        setError('Erro ao ativar configuração');
        return;
      }

      setSuccess('Configuração ativada com sucesso!');

      // Atualizar status
      setConfigs(configs.map(c => ({
        ...c,
        isActive: c.id === id ? 1 : 0,
      })));
    } catch (err: any) {
      setError(err.message || 'Erro ao ativar configuração');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta configuração?')) {
      return;
    }

    try {
      const { fetchWithAuth: fetch } = await import('@/lib/firebase-client');
      const response = await fetch(`/api/admin/ai-configs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setError('Erro ao deletar configuração');
        return;
      }

      setSuccess('Configuração deletada com sucesso!');
      setConfigs(configs.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar configuração');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary-blue border-t-transparent mx-auto"></div>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">Acesso negado</p>
          <p className="text-gray-600">Você não tem permissão para acessar esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
      <p className="text-gray-600 mb-8">Gerenciar APIs de IA (Claude e ChatGPT)</p>

      {/* Mensagens */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Formulário Adicionar */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Adicionar Nova Configuração</h2>

        <form onSubmit={handleAddConfig} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Provedor
            </label>
            <select
              value={newProvider}
              onChange={(e) => {
                const provider = e.target.value as 'anthropic' | 'openai';
                setNewProvider(provider);
                setNewModel(AVAILABLE_MODELS[provider][0]);
              }}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (ChatGPT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Modelo
            </label>
            <select
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
            >
              <option value="">Selecione um modelo</option>
              {AVAILABLE_MODELS[newProvider].map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="Cole sua chave de API aqui"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-2 font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Adicionar Configuração
          </button>
        </form>
      </div>

      {/* Lista de Configurações */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Configurações Existentes</h2>

        {configs.length === 0 ? (
          <p className="text-gray-600">Nenhuma configuração adicionada ainda</p>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <div
                key={config.id}
                className={`border-2 rounded-lg p-4 ${
                  config.isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      {config.provider === 'anthropic' ? '🤖 Anthropic (Claude)' : '💬 OpenAI (ChatGPT)'}
                    </p>
                    <p className="text-lg font-bold text-gray-900">{config.model}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      API Key: {config.apiKey}
                    </p>
                  </div>

                  {config.isActive && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ✓ Ativa
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {!config.isActive && (
                    <button
                      onClick={() => handleActivate(config.id)}
                      className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Ativar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
