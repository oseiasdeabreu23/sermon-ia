import { db } from './db';
import { apiConfigs } from '../../db/schema';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export interface AIGenerationInput {
  livro: string;
  capitulo: number;
  versiculo: number;
  tipo: 'narrativa' | 'expositiva' | 'tematica' | 'textual' | 'devocional' | 'biblico';
  titulo: string;
  publicoAlvo: string;
  textoVersiculo: string;
}

export interface EsbocoConteudo {
  fundacao: {
    contexto: string;
    analiseTextual: string;
    palavrasOriginais: string;
  };
  analise: {
    teologia: string;
    referencias: string;
  };
  aplicacao: {
    pratica: string;
    sermao: {
      introducao: string;
      divisoes: string[];
      conclusao: string;
      apelo: string;
    };
  };
}

async function getActiveProvider() {
  try {
    // Primeira prioridade: variáveis de ambiente do Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('✅ Usando Anthropic da variável de ambiente');
      return {
        id: 'env-anthropic',
        provider: 'anthropic',
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        apiKey: process.env.ANTHROPIC_API_KEY,
        isActive: 1,
      };
    }

    // Segunda prioridade: configuração Anthropic ativa no banco
    const configs = await db.select().from(apiConfigs);
    let activeConfig = configs.find(c => c.isActive === 1 && c.provider === 'anthropic');

    if (activeConfig) {
      console.log('✅ Provider Anthropic encontrado no banco:', activeConfig.model);
      return activeConfig;
    }

    // Terceira prioridade: qualquer configuração ativa
    activeConfig = configs.find(c => c.isActive === 1);
    if (activeConfig) {
      console.log('⚠️  Usando configuração ativa (não é Anthropic):', activeConfig.provider);
      return activeConfig;
    }

    // Quarta prioridade: OpenAI do banco se houver chave real (não teste)
    const openaiConfig = configs.find(
      c => c.provider === 'openai' && c.apiKey && !c.apiKey.includes('test')
    );
    if (openaiConfig) {
      console.log('✅ Usando OpenAI encontrado no banco');
      return openaiConfig;
    }

    throw new Error('Nenhum provedor de IA válido configurado');
  } catch (error) {
    console.error('❌ Erro ao buscar provider:', (error as any).message);
    throw new Error('Erro ao buscar configuração de IA: ' + (error as any).message);
  }
}

const prompt = (input: AIGenerationInput) => `Você é um especialista teológico de classe mundial. Gere um esboço de pregação profundo e aplicável.

TEXTO BÍBLICO:
"${input.textoVersiculo}" (${input.livro} ${input.capitulo}:${input.versiculo} - ARC)

TIPO DE PREGAÇÃO: ${getTipoEstudo(input.tipo)}
TÍTULO: ${input.titulo}
PÚBLICO-ALVO: ${input.publicoAlvo}

Gere um esboço estruturado com as seguintes 7 análises:

1. **CONTEXTO HISTÓRICO-CULTURAL**
   - Época, cultura, costumes e tradições judaicas da época
   - Geografia e locais mencionados

2. **ANÁLISE TEXTUAL & ESTRUTURA**
   - Gênero literário
   - Estrutura do texto (paralelismo, quiasmos, etc.)
   - Palavras-chave e seu significado no contexto

3. **PALAVRAS NO ORIGINAL (Hebraico/Grego)**
   - Termos principais com transliteração
   - Números Strong quando aplicável
   - Significados profundos das palavras-chave

4. **ANÁLISE TEOLÓGICA**
   - Tema teológico central
   - Mensagem teológica principal
   - Conexão com a doutrina cristã

5. **REFERÊNCIAS CRUZADAS**
   - Paralelos no Antigo Testamento
   - Paralelos no Novo Testamento
   - Ecos e conexões bíblicas

6. **APLICAÇÃO PRÁTICA MODERNA**
   - Relevância para contexto contemporâneo
   - Pontos de reflexão
   - Perguntas para discussão em grupo
   - Sugestões de ilustrações e histórias

7. **ESTRUTURA DO SERMÃO**
   - Introdução impactante
   - 3 divisões principais com título
   - Conclusão desafiadora
   - Apelo final

RETORNE APENAS ESTE JSON (sem markdown, sem explicações):
{
  "fundacao": {
    "contexto": "...",
    "analiseTextual": "...",
    "palavrasOriginais": "..."
  },
  "analise": {
    "teologia": "...",
    "referencias": "..."
  },
  "aplicacao": {
    "pratica": "...",
    "sermao": {
      "introducao": "...",
      "divisoes": ["Divisão 1", "Divisão 2", "Divisão 3"],
      "conclusao": "...",
      "apelo": "..."
    }
  }
}`;

function getTipoEstudo(tipo: string): string {
  const tipos: Record<string, string> = {
    narrativa: 'uma pregação NARRATIVA, focando na história e sequência de eventos',
    expositiva: 'uma pregação EXPOSITIVA, explicando detalhadamente o texto versículo por versículo',
    tematica: 'uma pregação TEMÁTICA, desenvolvendo um tema central com múltiplos textos',
    textual: 'uma pregação TEXTUAL, focando em palavras-chave e sua profundidade',
    devocional: 'um estudo DEVOCIONAL, com reflexão pessoal e aplicação espiritual',
    biblico: 'um estudo BÍBLICO aprofundado, com análise contextual e teológica',
  };
  return tipos[tipo] || tipos.expositiva;
}

async function generateWithAnthropic(
  config: any,
  input: AIGenerationInput
): Promise<EsbocoConteudo> {
  // Tentar usar Vercel AI Gateway primeiro se disponível
  let apiKey = config.apiKey;
  let apiUrl = 'https://api.anthropic.com';

  // Se estiver em produção no Vercel, usar a gateway
  if (process.env.VERCEL === '1' && !config.apiKey?.startsWith('sk-ant')) {
    apiKey = process.env.ANTHROPIC_API_KEY || config.apiKey;
  }

  console.log(`📡 Usando Anthropic (modelo: ${config.model})`);

  const client = new Anthropic({
    apiKey: apiKey,
    baseURL: apiUrl,
  });

  const message = await client.messages.create({
    model: config.model,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt(input),
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Resposta inesperada da IA');
  }

  let jsonStr = content.text;
  if (jsonStr.includes('```json')) {
    jsonStr = jsonStr.split('```json')[1].split('```')[0];
  } else if (jsonStr.includes('```')) {
    jsonStr = jsonStr.split('```')[1].split('```')[0];
  }

  return JSON.parse(jsonStr.trim());
}

async function generateWithOpenAI(
  config: any,
  input: AIGenerationInput
): Promise<EsbocoConteudo> {
  const client = new OpenAI({
    apiKey: config.apiKey,
  });

  const message = await client.chat.completions.create({
    model: config.model,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt(input),
      },
    ],
  });

  const content = message.choices[0].message.content;
  if (!content) {
    throw new Error('Resposta vazia da IA');
  }

  let jsonStr = content;
  if (jsonStr.includes('```json')) {
    jsonStr = jsonStr.split('```json')[1].split('```')[0];
  } else if (jsonStr.includes('```')) {
    jsonStr = jsonStr.split('```')[1].split('```')[0];
  }

  return JSON.parse(jsonStr.trim());
}

// Fallback mock se a API falhar
function generateFallbackMock(input: AIGenerationInput): EsbocoConteudo {
  return {
    fundacao: {
      contexto: `${input.livro} ${input.capitulo}:${input.versiculo} é um texto importante que nos mostra a verdade de Deus. O contexto histórico e cultural é essencial para compreender completamente a mensagem divina contida neste versículo.`,
      analiseTextual: `O texto possui uma estrutura clara e bem definida. Análise linguística revela palavras-chave que estruturam toda a mensagem. A forma como o texto está organizado nos ajuda a compreender melhor sua profundidade espiritual.`,
      palavrasOriginais: `Os termos principais no idioma original (hebraico ou grego) carregam significados profundos. Cada palavra foi escolhida cuidadosamente para comunicar a verdade divina com precisão e poder espiritual.`
    },
    analise: {
      teologia: `Este texto comunica verdades teológicas centrais sobre a natureza de Deus e Seu relacionamento com a humanidade. A mensagem é consistente com os ensinamentos do Evangelho e com toda a Escritura Sagrada.`,
      referencias: `Existem muitos paralelos nas Escrituras que ecoam e confirmam este ensinamento. Tanto no Antigo quanto no Novo Testamento, vemos como Deus repetidamente comunica estas verdades de diferentes maneiras.`
    },
    aplicacao: {
      pratica: `A aplicação prática deste versículo em nossas vidas é transformadora. Podemos ver como a Palavra de Deus se aplica concretamente às nossas situações cotidianas. Discussão em grupo: Como você vê este texto mudando sua vida? Reflexão: Qual é meu próximo passo em resposta a esta Palavra?`,
      sermao: {
        introducao: `${input.titulo} - Estas são palavras de vida que Jesus Cristo deixou para nós. Hoje vamos explorar juntos como esta verdade pode transformar completamente a forma como vivemos.`,
        divisoes: [
          `A verdade central revelada neste texto e seu significado profundo`,
          `Como esta verdade se manifesta em nossas vidas práticas e relacionamentos`,
          `O chamado de Deus para nossa resposta e transformação pessoal`
        ],
        conclusao: `Quando realmente compreendemos e aplicamos esta verdade, não somos mais os mesmos. Somos chamados a uma vida de fé, obediência e proximidade com nosso Criador.`,
        apelo: `Você responderá ao chamado de Deus hoje? Qual decisão você precisa tomar em luz desta verdade revelada? Que Deus nos abençoe e guie em nossa jornada de fé.`
      }
    }
  };
}

export async function generateSermonOutline(
  input: AIGenerationInput
): Promise<EsbocoConteudo> {
  const config = await getActiveProvider();

  try {
    if (config.provider === 'anthropic') {
      return await generateWithAnthropic(config, input);
    } else if (config.provider === 'openai') {
      return await generateWithOpenAI(config, input);
    } else {
      throw new Error(`Provedor desconhecido: ${config.provider}`);
    }
  } catch (error: any) {
    // Se a API falhar (sem créditos, erro de autenticação, etc), usar mock
    console.warn('⚠️  Erro na API, usando resposta estruturada como fallback:', error.message);

    // Se o erro for por falta de créditos ou autenticação, retornar mock
    if (error.message?.includes('balance') ||
        error.message?.includes('401') ||
        error.message?.includes('unauthorized')) {
      console.log('📋 Retornando resposta estruturada (fallback) - verifique créditos na API');
      return generateFallbackMock(input);
    }

    // Para outros erros, re-lançar
    throw error;
  }
}
