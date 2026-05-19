# ⚡ Quick Start - SermãoIA MVP

Guia rápido para rodar o app localmente em 15 minutos.

## 1️⃣ Pré-requisitos

- Node.js 18+ instalado
- Conta no [Firebase](https://firebase.google.com)
- Conta no [Turso](https://turso.io)
- Chave API da [Claude (Anthropic)](https://console.anthropic.com)

## 2️⃣ Instalar & Configurar (5 min)

```bash
# Instalar dependências
npm install

# Copiar template de env
cp .env.example .env.local

# Abrir .env.local e preencher com suas credenciais
# (veja seções 3-5 abaixo para cada serviço)
```

## 3️⃣ Firebase Setup (3 min)

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Criar projeto (nome: `SermãoIA`)
3. Ativar **Autenticação** → **Email/Senha**
4. **Project Settings** → Copiar as credenciais Web
5. Adicionar ao `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sermon-ia-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sermon-ia-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sermon-ia-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...
```

## 4️⃣ Turso Setup (3 min)

```bash
# Criar conta em turso.io (GitHub ou email)

# Via CLI:
npm install -g @turso/cli
turso login
turso db create sermon-ia
turso db show sermon-ia --http
```

Copiar para `.env.local`:

```
TURSO_CONNECTION_URL=libsql://sermon-ia-xxx.turso.io
TURSO_AUTH_TOKEN=eyJh...
```

## 5️⃣ Claude API Setup (1 min)

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. **API Keys** → **Create Key**
3. Copiar para `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## 6️⃣ Deploy Database & Run (3 min)

```bash
# Push schema para Turso
npm run db:push

# Iniciar dev server
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) 🎉

## 7️⃣ Testar (1 min)

1. Clique **Criar Conta**
2. Email: `test@example.com` | Senha: `password123`
3. Selecione: **Mateus** → **Capítulo 5** → **Versículo 1**
4. Tipo: **Expositiva**
5. Título: "As Bem-aventuranças"
6. Clique **Gerar Esboço com IA** ⏳ (aguarde 30-60s)
7. Veja resultado com 7 análises coloridas! 🎨

---

## ✅ Checklist Final

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] `.env.local` preenchido com todas as credenciais
- [ ] `npm install` executado
- [ ] `npm run db:push` executado (criou tabelas no Turso)
- [ ] `npm run dev` rodando em http://localhost:3000
- [ ] Conta criada com sucesso
- [ ] Esboço gerado com sucesso

Se tudo OK, você tem o MVP completo! 🚀

---

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| `TURSO_CONNECTION_URL is missing` | Verificar `.env.local` tem `TURSO_CONNECTION_URL` |
| `Firebase project not found` | Copiar `PROJECT_ID` correto de Firebase Console |
| `ANTHROPIC_API_KEY invalid` | Verificar key em console.anthropic.com é válida |
| `Error at db:push` | Turso URL/token errados ou BD não existe |
| Timeout gerando esboço | Versículo longo demais ou quota da Claude esgotada |

---

## 📖 Próximos Passos

1. **Customizar**: Mudar cores em `tailwind.config.ts`
2. **Integrar Bible API Real**: Ver `DEVELOPMENT.md`
3. **Adicionar Features**: Histórico, Bíblia integrada, etc
4. **Deploy**: `vercel deploy` (Vercel conecta automaticamente)

---

## 📚 Documentação

- **SETUP.md** - Setup detalhado
- **DEVELOPMENT.md** - Guia de desenvolvimento
- **CLAUDE.md** - Arquitetura técnica
- **README.md** - Visão geral do projeto

---

## 💡 Tips

- **Versículos em cache**: Mateus 5:1-10, Gênesis 1:1, João 3:16, Salmos 23:1, etc
- **Teste rápido**: Use "Mateus 5:1" para testar (está em cache, não precisa de API)
- **Prompt personalizado**: Ver em `src/lib/claude.ts` - customize as 7 análises
- **Mais versículos**: Adicionar em `src/lib/bible-service.ts`

---

Pronto! Seu MVP SermãoIA está rodando localmente! 🎉

Dúvidas? Veja DEVELOPMENT.md ou abra uma issue no GitHub.
