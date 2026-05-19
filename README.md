# SermãoIA

Ferramenta completa para pastores, pregadores e estudantes de teologia gerarem esboços de pregação assistidos por Inteligência Artificial.

## 🎯 Visão Geral

**SermãoIA** é um PWA responsivo e mobile-first que permite:
- Selecionar um livro, capítulo e versículo da Bíblia (versão ARC)
- Escolher o tipo de estudo desejado
- Gerar automaticamente um esboço de pregação completo com 7 análises teológicas profundas
- Exportar em PDF, Word ou copiar para clipboard

## 🚀 MVP v1

### Funcionalidades Incluídas
- ✅ Autenticação Firebase (email/senha)
- ✅ Seleção de Livro → Capítulo → Versículo
- ✅ 6 tipos de estudos (Narrativa, Expositiva, Temática, Textual, Devocional, Bíblico)
- ✅ Geração com IA (7 análises principais)
- ✅ Visualização em cards coloridos
- ✅ Exportação PDF
- ✅ PWA responsivo (mobile-first)

### Fora do Escopo MVP
- ❌ Bíblia integrada
- ❌ Harpa cristã
- ❌ Dicionário teológico
- ❌ Pesquisa avançada
- ❌ Histórico de esboços
- ❌ Compartilhamento social

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Banco de Dados**: Turso (LibSQL)
- **ORM**: Drizzle ORM
- **Autenticação**: Firebase Auth
- **IA**: Claude API (Anthropic)
- **Styling**: Tailwind CSS
- **Hospedagem**: Vercel
- **Exportação**: jsPDF, html2pdf

## 📦 Instalação

### 1. Clone e instale dependências

```bash
git clone <repo>
cd sermon-ia
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha as variáveis em `.env.local`:
- Firebase credentials
- Turso database URL e token
- Claude API key
- Bible API key (opcional)

### 3. Setup do banco de dados

```bash
npm run db:push
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
sermon-ia/
├── src/
│  ├── app/
│  │  ├── (auth)/         # Rotas de autenticação
│  │  ├── (app)/          # Rotas autenticadas
│  │  └── api/            # API routes
│  ├── components/        # Componentes React
│  ├── lib/              # Utilitários (DB, IA, APIs)
│  └── types/            # Types TypeScript
├── db/
│  └── schema.ts         # Schema do banco com Drizzle
└── public/              # Arquivos estáticos
```

## 🔧 Configuração Inicial Necessária

### 1. Firebase
- Criar projeto no Firebase Console
- Habilitar Email/Password authentication
- Copiar credenciais para `.env.local`

### 2. Turso Database
- Criar conta em turso.io
- Criar novo banco de dados
- Copiar URL e token para `.env.local`

### 3. Claude API
- Obter chave em console.anthropic.com
- Adicionar a `.env.local`

### 4. Bible API (Opcional)
- Usar API gratuita (BibleAPI.com)
- Ou importar dados estáticos de versículos

## 📖 7 Análises do Esboço

1. **Contexto Histórico-Cultural** - Época, cultura, costumes
2. **Análise Textual & Estrutura** - Gênero, estrutura, palavras-chave
3. **Palavras no Original** - Hebraico/Grego, Strong, significado
4. **Análise Teológica** - Tema central, mensagem teológica
5. **Referências Cruzadas** - Paralelos AT/NT, ecos bíblicos
6. **Aplicação Prática Moderna** - Relevância hoje, discussão
7. **Estrutura do Sermão** - Intro, divisões, conclusão, apelo

## 🎨 Design

- Mobile-first responsive
- Cores temáticas cristãs
- Cards coloridos por seção
- Dark/Light mode ready
- Acessibilidade (a11y)

## 📝 Scripts Disponíveis

```bash
npm run dev          # Inicia dev server
npm run build        # Build para produção
npm start            # Inicia servidor de produção
npm run lint         # ESLint
npm run db:push      # Push schema para Turso
npm run db:studio    # Interface gráfica do Drizzle
```

## 🚢 Deploy na Vercel

```bash
vercel deploy
```

Configurar variáveis de ambiente na Vercel dashboard.

## 📋 Roadmap Futuro

### v2
- Histórico de esboços
- Bíblia integrada (ler versículos)

### v3
- Harpa cristã
- Dicionário teológico

### v4
- Pesquisa avançada
- Tema claro/escuro
- Compartilhamento social

## 🤝 Contribuindo

Este é um projeto em desenvolvimento. Para contribuir, crie uma branch e envie um PR.

## 📄 Licença

Proprioprietário - 2025

## 📞 Suporte

Para dúvidas, entre em contato em oseiascarvalho17@gmail.com

---

**Última atualização**: Maio 2025
