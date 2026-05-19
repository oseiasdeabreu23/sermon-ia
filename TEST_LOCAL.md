# 🧪 Teste Local na VPS

Guia para testar SermãoIA localmente antes de deploy na Vercel.

## ✅ Ambiente Verificado

- Node.js: v20.18.1 ✅
- npm: v10.8.2 ✅
- OS: Linux (VPS) ✅

## 🚀 3 Opções de Teste

### Opção 1️⃣: Teste Rápido (UI only, sem integração)

**Tempo**: 10 minutos  
**Requisitos**: Node.js instalado

```bash
# 1. Instalar dependências
npm install

# 2. Criar .env.local com valores fake
cp .env.example .env.local

# 3. Rodar dev server
npm run dev
```

**Resultado**: 
- ✅ Interface é renderizada
- ✅ Cliques funcionam
- ❌ Sem autenticação real
- ❌ Sem geração de esboços
- ❌ Sem salvamento no BD

**Acesso**: http://localhost:3000 (via SSH tunnel)

---

### Opção 2️⃣: Teste Completo (com serviços reais)

**Tempo**: 20 minutos  
**Requisitos**: Firebase + Turso + Claude API keys

```bash
# 1. Criar/preencher .env.local com SUAS credenciais
#    (Firebase, Turso, Claude)

# 2. Instalar dependências
npm install

# 3. Setup banco de dados
npm run db:push

# 4. Rodar dev server
npm run dev
```

**Resultado**: 
- ✅ Interface funciona
- ✅ Autenticação real
- ✅ Geração de esboços funciona
- ✅ Salvamento no BD real
- ✅ Exportação PDF funciona

**Acesso**: http://localhost:3000 (via SSH tunnel)

---

### Opção 3️⃣: Teste Integrado + Monitoramento BD

**Tempo**: 25 minutos  
**Requisitos**: Firebase + Turso + Claude API keys

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Monitorar BD em tempo real
npm run db:studio
```

**Resultado**: 
- ✅ Tudo da Opção 2
- ✅ Interface gráfica de BD
- ✅ Ver dados salvando em tempo real
- ✅ Debug de queries

**Acesso**: 
- App: http://localhost:3000
- DB Studio: http://localhost:3000 (outro port)

---

## 🔧 Setup Passo-a-Passo (Opção 2 - Recomendado)

### 1️⃣ Configurar Firebase (5 min)

```bash
# Em outro terminal/máquina:
# 1. Ir em https://console.firebase.google.com
# 2. Criar projeto "SermãoIA-DEV"
# 3. Ativar "Email/Senha" auth
# 4. Copiar credenciais Web
# 5. Adicionar ao .env.local:

cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sermon-ia-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sermon-ia-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sermon-ia-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
EOF
```

### 2️⃣ Configurar Turso (5 min)

```bash
# Em outro terminal:
# 1. Ir em https://turso.io
# 2. Fazer login
# 3. Criar DB: turso db create sermon-ia-dev
# 4. Ver credenciais: turso db show sermon-ia-dev --http
# 5. Adicionar ao .env.local:

cat >> .env.local << 'EOF'
TURSO_CONNECTION_URL=libsql://...
TURSO_AUTH_TOKEN=...
EOF
```

### 3️⃣ Configurar Claude API (2 min)

```bash
# 1. Ir em https://console.anthropic.com
# 2. Gerar API key
# 3. Adicionar ao .env.local:

cat >> .env.local << 'EOF'
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### 4️⃣ Rodar Localmente (3 min)

```bash
# Instalar
npm install

# Setup BD
npm run db:push

# Rodar
npm run dev
```

**Saída esperada**:
```
> sermon-ia@0.1.0 dev
> next dev

  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Environment:  .env.local

✓ Ready in 3.2s
```

---

## 🌐 Acessar via SSH Tunnel

Se está em VPS remota, use SSH tunnel para acessar:

```bash
# Em seu laptop (não na VPS):
ssh -L 3000:localhost:3000 root@SEU_IP_VPS

# Depois abra no navegador:
# http://localhost:3000
```

---

## 🧪 Testar Fluxo Completo

1. **Abrir**: http://localhost:3000
2. **Clicar**: "Criar Conta"
3. **Preencher**: 
   - Nome: "Teste"
   - Email: "test@example.com"
   - Senha: "password123"
4. **Clicar**: "Criar Conta"
5. **Resultado**: Redirecionado para `/novo-esboço` ✅
6. **Selecionar**:
   - Livro: "Mateus"
   - Capítulo: "5"
   - Versículo: "1" (está em cache!)
7. **Preencher**:
   - Tipo: "Expositiva"
   - Título: "As Bem-aventuranças"
8. **Clicar**: "Gerar Esboço com IA"
9. **Aguardar**: ~30-60 segundos ⏳
10. **Resultado**: Ver 7 análises coloridas! 🎨

---

## ✅ Checklist de Teste

- [ ] Node.js instalado
- [ ] npm install executado
- [ ] .env.local preenchido
- [ ] npm run db:push executado (se testando com BD)
- [ ] npm run dev rodando
- [ ] Acesso http://localhost:3000
- [ ] Criar conta com sucesso
- [ ] Formulário novo esboço carrega
- [ ] Seleção bíblica em cascata funciona
- [ ] Gerar esboço processa
- [ ] 7 análises aparecem em cards
- [ ] Exportar PDF funciona
- [ ] Navbar inferior funciona

---

## 🐛 Troubleshooting Local

### "Port 3000 already in use"
```bash
# Matar processo:
lsof -ti:3000 | xargs kill -9

# Ou usar outro port:
npm run dev -- -p 3001
```

### "TURSO_CONNECTION_URL is missing"
```bash
# Verificar .env.local:
cat .env.local | grep TURSO

# Se vazio, preencher novamente
```

### "Firebase project not found"
```bash
# Verificar NEXT_PUBLIC_FIREBASE_PROJECT_ID:
cat .env.local | grep PROJECT_ID

# Comparar com console.firebase.google.com
```

### "Cannot find module"
```bash
# Limpar node_modules e reinstalar:
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Estrutura de Teste

```
Seu Laptop (ou máquina local)
        ↓
    SSH Tunnel
        ↓
    VPS Linux
        ↓
    npm run dev
        ↓
    http://localhost:3000
```

---

## ⏱️ Tempos Estimados

| Atividade | Tempo |
|-----------|-------|
| npm install | 2-3 min |
| Firebase config | 5 min |
| Turso config | 5 min |
| Claude config | 2 min |
| db:push | 1 min |
| Teste UI | 2 min |
| Teste geração | 2 min |
| **Total** | **~20 min** |

---

## 📝 Próximos Passos

Após testar localmente:

1. ✅ Teste local na VPS (você está aqui)
2. → Configure .env.local com credenciais reais
3. → Rode npm run dev e teste tudo
4. → Verifique se tudo funciona
5. → Deploy na Vercel (1 click)

---

## 🎯 Próximo: Deploy Vercel

Depois de testar localmente com sucesso:

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel deploy

# 3. Configurar env vars em dashboard Vercel
# 4. Pronto! Seu app está online
```

---

**Bom teste! 🧪**
