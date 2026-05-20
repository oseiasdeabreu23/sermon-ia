import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface EsbocoGenerationInput {
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

export async function gerarEsboço(
  input: EsbocoGenerationInput
): Promise<EsbocoConteudo> {
  const tiposEstudo = {
    narrativa: 'uma pregação NARRATIVA, focando na história e sequência de eventos',
    expositiva: 'uma pregação EXPOSITIVA, explicando detalhadamente o texto versículo por versículo',
    tematica: 'uma pregação TEMÁTICA, desenvolvendo um tema central com múltiplos textos',
    textual: 'uma pregação TEXTUAL, focando em palavras-chave e sua profundidade',
    devocional: 'um estudo DEVOCIONAL, com reflexão pessoal e aplicação espiritual',
    biblico: 'um estudo BÍBLICO aprofundado, com análise contextual e teológica',
  };

  const prompt = `Você é um especialista teológico de classe mundial. Gere um esboço de pregação profundo e aplicável.

TEXTO BÍBLICO:
"${input.textoVersiculo}" (${input.livro} ${input.capitulo}:${input.versiculo} - ARC)

TIPO DE PREGAÇÃO: ${tiposEstudo[input.tipo]}
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

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Resposta inesperada da IA');
  }

  // Parse JSON response
  let jsonStr = content.text;

  // Remove markdown code blocks if present
  if (jsonStr.includes('```json')) {
    jsonStr = jsonStr.split('```json')[1].split('```')[0];
  } else if (jsonStr.includes('```')) {
    jsonStr = jsonStr.split('```')[1].split('```')[0];
  }

  const parsed: EsbocoConteudo = JSON.parse(jsonStr.trim());
  return parsed;
}
