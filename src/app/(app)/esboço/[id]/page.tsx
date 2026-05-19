'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import html2pdf from 'html2pdf.js';
import { EsbocoResponse } from '@/types';

export default function EsbocoPage({ params }: { params: { id: string } }) {
  const [esboço, setEsboço] = useState<EsbocoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEsboço = async () => {
      try {
        const { fetchWithAuth } = await import('@/lib/firebase-client');
        const response = await fetchWithAuth(`/api/esboço/${params.id}`);
        if (!response.ok) {
          throw new Error('Esboço não encontrado');
        }
        const data = await response.json();
        setEsboço(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar esboço');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEsboço();
  }, [params.id]);

  const handleExportPDF = () => {
    if (!esboço) return;

    const element = document.getElementById('esboço-content');
    const opt = {
      margin: 10,
      filename: `${esboço.titulo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };

    if (element) html2pdf().set(opt).from(element).save();
  };

  const handleCopyToClipboard = async () => {
    if (!esboço) return;

    const text = JSON.stringify(esboço.conteudo, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      alert('Esboço copiado para a área de transferência!');
    } catch (err) {
      alert('Erro ao copiar');
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 animate-spin">
            <div className="h-12 w-12 rounded-full border-4 border-primary-blue border-t-transparent"></div>
          </div>
          <p className="text-gray-600">Carregando esboço...</p>
        </div>
      </div>
    );
  }

  if (error || !esboço) {
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
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/novo-esboço"
          className="text-primary-blue hover:text-blue-700 font-semibold text-sm mb-4 inline-block"
        >
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{esboço.titulo}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
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
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handleExportPDF}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold"
        >
          📥 Baixar PDF
        </button>
        <button
          onClick={handleCopyToClipboard}
          className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold"
        >
          📋 Copiar
        </button>
        <button className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed">
          📤 Compartilhar
        </button>
      </div>

      {/* Content */}
      <div id="esboço-content" className="space-y-6">
        {/* FUNDAÇÃO Section */}
        <div>
          <h2 className="text-2xl font-bold text-white bg-primary-blue rounded-lg px-4 py-3 mb-4">
            🏛️ Fundação
          </h2>
          <div className="space-y-4">
            {/* Contexto */}
            <div className="card bg-blue-50 border-l-4 border-primary-blue">
              <h3 className="card-header text-primary-blue">📍 Contexto Histórico-Cultural</h3>
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {esboço.conteudo.fundacao.contexto}
              </div>
            </div>

            {/* Análise Textual */}
            <div className="card bg-blue-50 border-l-4 border-primary-blue">
              <h3 className="card-header text-primary-blue">📖 Análise Textual & Estrutura</h3>
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {esboço.conteudo.fundacao.analiseTextual}
              </div>
            </div>

            {/* Palavras Originais */}
            <div className="card bg-blue-50 border-l-4 border-primary-blue">
              <h3 className="card-header text-primary-blue">🔤 Palavras no Original</h3>
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {esboço.conteudo.fundacao.palavrasOriginais}
              </div>
            </div>
          </div>
        </div>

        {/* ANÁLISE Section */}
        <div>
          <h2 className="text-2xl font-bold text-white bg-primary-purple rounded-lg px-4 py-3 mb-4">
            📚 Análise Profunda
          </h2>
          <div className="space-y-4">
            {/* Teologia */}
            <div className="card bg-purple-50 border-l-4 border-primary-purple">
              <h3 className="card-header text-primary-purple">✨ Análise Teológica</h3>
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {esboço.conteudo.analise.teologia}
              </div>
            </div>

            {/* Referências */}
            <div className="card bg-purple-50 border-l-4 border-primary-purple">
              <h3 className="card-header text-primary-purple">🔗 Referências Cruzadas</h3>
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {esboço.conteudo.analise.referencias}
              </div>
            </div>
          </div>
        </div>

        {/* APLICAÇÃO Section */}
        <div>
          <h2 className="text-2xl font-bold text-white bg-primary-green rounded-lg px-4 py-3 mb-4">
            💡 Aplicação & Sermão
          </h2>
          <div className="space-y-4">
            {/* Prática */}
            <div className="card bg-green-50 border-l-4 border-primary-green">
              <h3 className="card-header text-primary-green">🌍 Aplicação Prática Moderna</h3>
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {esboço.conteudo.aplicacao.pratica}
              </div>
            </div>

            {/* Estrutura do Sermão */}
            <div className="card bg-green-50 border-l-4 border-primary-green">
              <h3 className="card-header text-primary-green">🎯 Estrutura do Sermão</h3>
              <div className="space-y-4">
                {/* Introdução */}
                <div className="bg-white rounded p-3 border-l-2 border-green-400">
                  <h4 className="font-semibold text-green-700 mb-2">Introdução</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {esboço.conteudo.aplicacao.sermao.introducao}
                  </p>
                </div>

                {/* Divisões */}
                <div className="space-y-3">
                  {esboço.conteudo.aplicacao.sermao.divisoes.map((divisao, idx) => (
                    <div key={idx} className="bg-white rounded p-3 border-l-2 border-green-400">
                      <h4 className="font-semibold text-green-700 mb-2">
                        {idx + 1}. {divisao}
                      </h4>
                    </div>
                  ))}
                </div>

                {/* Conclusão */}
                <div className="bg-white rounded p-3 border-l-2 border-green-400">
                  <h4 className="font-semibold text-green-700 mb-2">Conclusão</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {esboço.conteudo.aplicacao.sermao.conclusao}
                  </p>
                </div>

                {/* Apelo */}
                <div className="bg-white rounded p-3 border-l-2 border-green-400">
                  <h4 className="font-semibold text-green-700 mb-2">Apelo</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {esboço.conteudo.aplicacao.sermao.apelo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-12 py-6 border-t border-gray-200 flex justify-center gap-4">
        <Link href="/novo-esboço" className="btn-primary px-6 py-2 rounded-lg font-semibold">
          ✏️ Novo Esboço
        </Link>
      </div>
    </div>
  );
}
