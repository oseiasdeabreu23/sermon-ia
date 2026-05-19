# SermãoIA - Documentação do Projeto

## Visão Geral
**SermãoIA** é um PWA para geração de esboços de pregação assistidos por IA. MVP focado em funcionalidade core, sem features secundárias.

## Decisões Técnicas

### Stack
- **Next.js 14** (Node.js) - Framework principal
- **Vercel** - Hospedagem
- **Turso (LibSQL)** - Banco de dados
- **Firebase Auth** - Autenticação
- **Claude API** - IA generativa
- **Tailwind CSS** - Estilo
- **Drizzle ORM** - Queries BD

### Por quê?
- Next.js: Best-in-class para PWA, API routes integradas, deploy Vercel simples
- Turso: SQLite distribuído, edge-friendly, free tier generoso
- Drizzle: Type-safe, menos boilerplate que alternatives
- Firebase: Auth simples e confiável, sem backend overhead
- Claude: IA mais capaz para análise teológica profunda

## Arquitetura

### Banco de Dados
```
users
├── id (PK)
├── firebaseUid (unique)
├── email
├── nome
└── createdAt

esbocos
├── id (PK)
├── userId (FK)
├── livro
├── capitulo
├── versiculo
├── tipo (enum: narrativa, expositiva, tematica, textual, devocional, biblico)
├── titulo
├── publicoAlvo
├── conteudo_json (armazena as 7 análises)
├── status (enum: pending, completed, failed)
└── createdAt, updatedAt
```

### 7 Análises (Estrutura do Prompt)

O prompt único envia:
```javascript
{
  "livro": "Mateus",
  "capitulo": 5,
  "versiculo": 1,
  "tipo": "expositiva",
  "titulo": "Bem-aventuranças",
  "publicoAlvo": "Comunidade geral"
}
```

E espera receber JSON com:
```json
{
  "fundacao": {
    "contexto": "Contexto Histórico-Cultural",
    "analiseTextual": "Análise Textual & Estrutura",
    "palavrasOriginais": "Palavras no Original (Hebraico/Grego)"
  },
  "analise": {
    "teologia": "Análise Teológica",
    "referencias": "Referências Cruzadas"
  },
  "aplicacao": {
    "pratica": "Aplicação Prática Moderna",
    "sermao": {
      "introducao": "...",
      "divisoes": ["Divisão 1", "Divisão 2", "Divisão 3"],
      "conclusao": "...",
      "apelo": "..."
    }
  }
}
```

## Fluxo Principal (MVP)

1. **Autenticação** → Firebase Auth (email/senha)
2. **Seleção Bíblica** → Dropdowns em cascata (Livro → Cap → Vers)
3. **Formulário** → Tipo de estudo, título, público-alvo
4. **Geração** → Claude API com prompt único + status página carregamento
5. **Visualização** → Cards coloridos agrupados por seção
6. **Exportação** → PDF, copiar clipboard

## URLs Principais

### Rotas Autenticadas
- `/` → Splash/Login se não autenticado
- `/novo-esboço` → Formulário + gerar
- `/novo-esboço/[jobId]` → Loading com polling
- `/esboço/[id]` → Visualização + exportação

### API Routes
- `POST /api/auth/register` → Criar conta
- `POST /api/auth/login` → Login
- `POST /api/esboço/gerar` → Gerar novo esboço (Claude)
- `GET /api/esboço/[id]` → Buscar esboço
- `GET /api/biblias/livros` → Lista de livros

## Variáveis de Ambiente Necessárias

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
TURSO_CONNECTION_URL
TURSO_AUTH_TOKEN
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL (para links compartilháveis)
```

## Considerações Importantes

### Custos
- **Claude API**: ~$0.10-0.50 por esboço (depende do tamanho do versículo)
- **Turso**: Free tier até 9GB, depois $29/mês
- **Vercel**: Free tier, ou $20/mês Pro

### Performance
- Geração leva ~30-60s (aguardar resposta Claude)
- Precisa polling ou WebSocket na tela de carregamento
- Cards devem ser lazy-loaded em mobile

### Dados Bíblicos
- Versão ARC (Almeida Revista e Corrigida)
- Pode usar API gratuita ou importar JSON estático
- Prefere estático para evitar dependência externa

## Features NÃO inclusos no MVP
- Histórico persistido de esboços (apenas para dev/test)
- Bíblia integrada (ler livros dentro do app)
- Harpa cristã
- Dicionário teológico
- Pesquisa avançada
- Dark mode automático
- Compartilhamento social direto

## Próximas Fases (v2+)
1. **v2**: Histórico + Bíblia integrada
2. **v3**: Harpa + Dicionário
3. **v4**: Pesquisa + Exportação avançada

## Notas para Implementação
- Usar Turso + Drizzle para queries type-safe
- Firebase Auth para não gerir senhas manualmente
- Claude para linguagem natural + análise teológica
- Tailwind + componentes custom (sem shadcn no MVP)
- PWA: adicionar manifest.json para instalação mobile
- Responsividade: mobile-first, testar em iPhone SE
- Acessibilidade: ARIA labels, contraste, navegação teclado
