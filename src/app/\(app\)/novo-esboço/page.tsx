'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LIVROS_BIBLIA, TIPOS_ESTUDO } from '@/lib/biblia-data';
import { v4 as uuidv4 } from 'uuid';

export default function NovoEsbocoPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [jobId, setJobId] = useState<string>('');

  // Form state
  const [livroSelecionado, setLivroSelecionado] = useState('');
  const [capituloSelecionado, setCapituloSelecionado] = useState('');
  const [versiculoSelecionado, setVersiculoSelecionado] = useState('');
  const [tipoEstudo, setTipoEstudo] = useState('expositiva');
  const [titulo, setTitulo] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');
  const [error, setError] = useState('');

  // Get available chapters for selected book
  const livroObj = livroSelecionado
    ? LIVROS_BIBLIA.find((l) => l.nome === livroSelecionado)
    : null;

  const capitulos = livroObj
    ? Array.from({ length: livroObj.numCapitulos }, (_, i) => i + 1)
    : [];

  // For now, set versículos from 1 to 50 (in real app, would vary)
  const versiculos = capituloSelecionado
    ? Array.from({ length: 50 }, (_, i) => i + 1)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!livroSelecionado || !capituloSelecionado || !versiculoSelecionado || !titulo) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const newJobId = uuidv4();
    setJobId(newJobId);
    setStep('loading');

    try {
      const response = await fetch('/api/esboço/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: newJobId,
          livro: livroSelecionado,
          capitulo: parseInt(capituloSelecionado),
          versiculo: parseInt(versiculoSelecionado),
          tipo: tipoEstudo,
          titulo,
          publicoAlvo,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar esboço');
      }

      const data = await response.json();
      setStep('success');

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/esboço/${data.esbocoId}`);
      }, 2000);
    } catch (err: any) {
      setStep('form');
      setError(err.message || 'Erro ao gerar esboço. Tente novamente.');
    }
  };

  if (step === 'loading') {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="animate-spin">
              <div className="h-16 w-16 rounded-full border-4 border-primary-blue border-t-transparent"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerando Esboço</h2>
          <p className="text-gray-600 mb-4">
            Seu esboço está sendo processado pela Inteligência Artificial. Esta página será
            atualizada automaticamente quando o resultado estiver pronto.
          </p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>⏱️ Isso pode levar 30-60 segundos</p>
            <p>🔄 Não feche esta página</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Esboço Gerado!</h2>
          <p className="text-gray-600">Redirecionando para visualização...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Esboço</h1>
        <p className="text-gray-600">Selecione um versículo e gere um esboço de pregação</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Livro */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📖 Livro da Bíblia *
          </label>
          <select
            value={livroSelecionado}
            onChange={(e) => {
              setLivroSelecionado(e.target.value);
              setCapituloSelecionado('');
              setVersiculoSelecionado('');
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
            required
          >
            <option value="">Selecione um livro...</option>
            {LIVROS_BIBLIA.map((livro) => (
              <option key={livro.nome} value={livro.nome}>
                {livro.nome} ({livro.abreviacao})
              </option>
            ))}
          </select>
        </div>

        {/* Capítulo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Capítulo *
          </label>
          <select
            value={capituloSelecionado}
            onChange={(e) => {
              setCapituloSelecionado(e.target.value);
              setVersiculoSelecionado('');
            }}
            disabled={!livroSelecionado}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">Selecione um capítulo...</option>
            {capitulos.map((cap) => (
              <option key={cap} value={cap}>
                Capítulo {cap}
              </option>
            ))}
          </select>
        </div>

        {/* Versículo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Versículo *
          </label>
          <select
            value={versiculoSelecionado}
            onChange={(e) => setVersiculoSelecionado(e.target.value)}
            disabled={!capituloSelecionado}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">Selecione um versículo...</option>
            {versiculos.map((vers) => (
              <option key={vers} value={vers}>
                Versículo {vers}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Estudo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Tipo de Estudo *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TIPOS_ESTUDO.map((tipo) => (
              <label
                key={tipo.id}
                className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  tipoEstudo === tipo.id
                    ? 'border-primary-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={tipo.id}
                  checked={tipoEstudo === tipo.id}
                  onChange={(e) => setTipoEstudo(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-gray-900">{tipo.nome}</p>
                  <p className="text-xs text-gray-600">{tipo.descricao}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Título do Esboço *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: As Bem-aventuranças"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
            required
          />
        </div>

        {/* Público-alvo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Público-alvo
          </label>
          <input
            type="text"
            value={publicoAlvo}
            onChange={(e) => setPublicoAlvo(e.target.value)}
            placeholder="Ex: Comunidade geral, Crianças, Adolescentes"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full btn-primary py-3 font-semibold text-lg rounded-lg"
        >
          🚀 Gerar Esboço com IA
        </button>
      </form>
    </div>
  );
}
