# 🚀 Guia de Setup - SermãoIA MVP

## Pré-requisitos

- Node.js 18+ e npm/yarn
- Conta no Firebase
- Conta no Turso (turso.io)
- API key da Claude (Anthropic)

---

## 1️⃣ Instalar Dependências

```bash
npm install
```

---

## 2️⃣ Configurar Firebase

### 2.1 Criar Projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em "Criar Projeto"
3. Nome: `SermãoIA` (ou similar)
4. Passe pelas etapas de setup

### 2.2 Habilitar Authentication

1. No console Firebase, vá para **Autenticação**
2. Clique em **Configurar Método de Entrada**
3. Habilite **Email/Senha**
4. Salve

### 2.3 Copiar Credenciais

1. No Firebase, clique na engrenagem → **Configurações do Projeto**
2. Desça até **Seus apps**
3. Clique em Web (ou crie uma)
4. Copie as credenciais:

```javascript
{
  "apiKey": "AIza...",
  "authDomain": "sermon-ia-xxx.firebaseapp.com",
  "projectId": "sermon-ia-xxx",
  "storageBucket": "sermon-ia-xxx.appspot.com",
  "messagingSenderId": "123...",
  "appId": "1:123..."
}
```

### 2.4 Adicionar ao `.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sermon-ia-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sermon-ia-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sermon-ia-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...
```

---

## 3️⃣ Configurar Turso Database

### 3.1 Criar Conta

1. Acesse [turso.io](https://turso.io)
2. Faça signup (GitHub ou email)
3. Crie uma organização

### 3.2 Criar Banco de Dados

```bash
turso db create sermon-ia
```

Ou via interface web:
1. Clique em **Databases** → **Create**
2. Nome: `sermon-ia`
3. Region: `sjc` (San Jose, USA) recomendado
4. Criar

### 3.3 Copiar Credenciais

```bash
turso db show sermon-ia --http
```

Você verá:
- `URL`: `libsql://...turso.io`
- `Token`: (copiar)

Ou via interface web:
- Database → Settings → Connection URL

### 3.4 Adicionar ao `.env.local`

```
TURSO_CONNECTION_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_token_here
```

### 3.5 Push Schema

```bash
npm run db:push
```

Isso vai criar as tabelas `users` e `esbocos`.

---

## 4️⃣ Configurar Claude API

### 4.1 Obter API Key

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Faça login ou crie conta
3. Vá para **API Keys**
4. Clique **Create Key**
5. Copie a chave

### 4.2 Adicionar ao `.env.local`

```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 5️⃣ Verificar `.env.local`

Seu arquivo deve ter:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Turso
TURSO_CONNECTION_URL=libsql://...
TURSO_AUTH_TOKEN=...

# Claude
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6️⃣ Instalar Firebase Admin SDK (Backend)

Precisamos adicionar a dependência do Firebase Admin:

```bash
npm install firebase-admin
```

Você também precisa do arquivo de credenciais do Firebase Admin. Veja abaixo.

### 6.1 Obter Service Account

1. Firebase Console → Engrenagem → **Configurações do Projeto**
2. Aba **Contas de Serviço**
3. Clique **Gerar Nova Chave Privada**
4. Salve como `firebase-admin-key.json` (NUNCA comitar!)
5. Adicione a `.gitignore` se não estiver

**Para desenvolvimento local**, você pode usar a autenticação via token ID do cliente.

---

## 7️⃣ Rodar o App

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

Você deve ver a página home com botões "Entrar" e "Criar Conta".

---

## 8️⃣ Testar Fluxo

### 8.1 Criar Conta

1. Clique **Criar Conta**
2. Preencha: Nome, Email, Senha
3. Clique **Criar Conta**
4. Se tudo funcionar, será redirecionado para `/novo-esboço`

### 8.2 Gerar Esboço

1. Selecione um livro (ex: Mateus)
2. Selecione capítulo (ex: 5)
3. Selecione versículo (ex: 1)
4. Selecione tipo (ex: Expositiva)
5. Digite título (ex: "As Bem-aventuranças")
6. Clique **Gerar Esboço com IA**
7. Aguarde a IA processar (~30-60 segundos)
8. Veja o resultado em cards coloridos

---

## 🐛 Troubleshooting

### "TURSO_CONNECTION_URL is missing"
- Verifique se `.env.local` tem `TURSO_CONNECTION_URL` preenchido
- Reinicie o servidor (`Ctrl+C`, `npm run dev`)

### "Firebase project not found"
- Verificar `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- Usuários criados em Firebase devem existir

### "Erro ao gerar esboço"
- Verifique se `ANTHROPIC_API_KEY` está correto
- Confira quotas na console da Anthropic
- Tente com um versículo mais curto

### "Erro de CORS"
- APIs estão rodando em `localhost:3000`
- Não deve haver problema com CORS em next/13+

### Erro no `npm run db:push`
- Turso database URL e token devem estar certos
- Tente: `turso db show sermon-ia --http`
- Verifique permissões

---

## 📝 Próximos Passos

1. ✅ Setup completo
2. ⬜ Customizar estilos/cores
3. ⬜ Integrar real Bible API para textos de versículos
4. ⬜ Adicionar histórico de esboços
5. ⬜ Deploy na Vercel

---

## 🚢 Deploy na Vercel

```bash
vercel deploy
```

Configurar em **Project Settings → Environment Variables**:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
TURSO_CONNECTION_URL=...
TURSO_AUTH_TOKEN=...
ANTHROPIC_API_KEY=...
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

---

## 📞 Support

Dúvidas? Consulte:
- [Firebase Docs](https://firebase.google.com/docs)
- [Turso Docs](https://docs.turso.io)
- [Claude API Docs](https://docs.anthropic.com)
- [Next.js Docs](https://nextjs.org/docs)
