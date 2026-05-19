# 🛠️ Guia de Desenvolvimento - SermãoIA

## Estrutura do Projeto

```
sermon-ia/
├── src/
│  ├── app/
│  │  ├── (auth)/             # Rotas públicas (login, register)
│  │  ├── (app)/              # Rotas protegidas (requer autenticação)
│  │  └── api/                # API routes (Next.js)
│  ├── components/            # Componentes React (futuro)
│  ├── lib/
│  │  ├── firebase.ts         # Config Firebase cliente
│  │  ├── firebase-client.ts  # Utilitários para fetch com auth
│  │  ├── db.ts               # Drizzle + Turso
│  │  ├── claude.ts           # Integração com Claude API
│  │  ├── bible-service.ts    # Busca de versículos bíblicos
│  │  └── biblia-data.ts      # Dados dos 66 livros
│  └── types/
│     └── index.ts            # TypeScript types
├── db/
│  ├── schema.ts              # Drizzle schema
│  └── migrations/            # (auto-gerado)
└── public/
   └── manifest.json          # PWA metadata
```

## Stack Principal

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 + React 18 + TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Turso (LibSQL) + Drizzle ORM |
| Auth | Firebase Auth (cliente) + Token Verification (servidor) |
| AI | Claude API (Anthropic) |
| Hosting | Vercel (production) |

## Fluxo de Dados

```
1. Cliente → Firebase Auth → Token ID
2. Cliente → Envia token + dados → Next.js API
3. API → Verifica token → Busca user no Turso
4. API → Chama Claude API → Gera 7 análises
5. API → Salva no Turso → Retorna esbocoId
6. Cliente → Busca esboço completo com GET /api/esboço/[id]
7. Cliente → Renderiza em cards coloridos
```

## Rotas Principais

### Públicas (sem autenticação)
- `GET /` - Splash page com login/registro
- `POST /auth/login` - Firebase login
- `POST /auth/register` - Firebase register

### Protegidas (requer token Firebase)
- `GET /novo-esboço` - Formulário novo esboço
- `POST /api/esboço/gerar` - Gera com Claude (requer Bearer token)
- `GET /api/esboço/[id]` - Busca esboço (requer Bearer token)
- `GET /esboço/[id]` - Visualiza esboço

## Como Rodar Localmente

### 1. Setup Inicial
```bash
# Instalar
npm install

# Configurar .env.local (ver SETUP.md)
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Setup banco de dados
npm run db:push

# Iniciar dev server
npm run dev
```

### 2. Testar Fluxo Completo

**Terminal 1**: Dev server
```bash
npm run dev
# Abrir http://localhost:3000
```

**Em outro terminal**: Monitorar BD (opcional)
```bash
npm run db:studio
# Abrir http://localhost:3000 (interface Drizzle)
```

### 3. Criar Conta e Testar
1. Clique "Criar Conta"
2. Preencha nome, email, senha
3. Será redirecionado para `/novo-esboço`
4. Selecione Mateus, cap 5, vers 1
5. Tipo: Expositiva
6. Título: "As Bem-aventuranças"
7. Clique "Gerar Esboço com IA"
8. Aguarde ~40 segundos
9. Veja o resultado com 7 análises coloridas

## Arquitetura de Autenticação

### Cliente (Frontend)
```typescript
// src/lib/firebase-client.ts
export async function fetchWithAuth(url: string, options: RequestInit) {
  const token = await auth.currentUser?.getIdToken();
  // Envia: Authorization: Bearer <token>
}
```

### Servidor (API)
```typescript
// src/app/api/esboço/gerar/route.ts
const idToken = authHeader.substring(7); // Remove "Bearer "
const decodedToken = await firebaseAuth.verifyIdToken(idToken);
// Token válido, processa requisição
```

## Como Adicionar Nova Feature

### Exemplo: Nova Página "Meus Esboços"

1. Criar arquivo
   ```bash
   touch src/app/\(app\)/meus-esboços/page.tsx
   ```

2. Adicionar componente
   ```typescript
   'use client';
   import { useAuth } from '@/hooks/useAuth';
   
   export default function MeusEsbocosPage() {
     // Buscar esboços do usuário
   }
   ```

3. Adicionar à navbar
   ```typescript
   // src/app/(app)/layout.tsx
   { href: '/meus-esboços', icon: '📝', label: 'Meus' }
   ```

4. Rodar localmente e testar

## Debugging

### 1. Verificar Token Firebase
```javascript
// No console do navegador
const user = await auth.currentUser.getIdToken();
console.log(user);
```

### 2. Verificar Requisição à API
```javascript
// Network tab do DevTools
// Header Authorization: Bearer eyJhbGciOi...
```

### 3. Logs de Servidor
```bash
# npm run dev mostra logs
# Procure por: [api/esboço/gerar]
```

### 4. Inspecionar Banco de Dados
```bash
npm run db:studio
# Abra no navegador, veja users e esbocos
```

## Variáveis de Ambiente

```env
# Públicas (visíveis no cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Privadas (apenas servidor)
TURSO_CONNECTION_URL=libsql://...
TURSO_AUTH_TOKEN=...
ANTHROPIC_API_KEY=sk-ant-...
FIREBASE_CLIENT_EMAIL=... (opcional)
FIREBASE_PRIVATE_KEY=... (opcional)
```

## Performance Tips

1. **Banco de Dados**: Queries via Drizzle são type-safe, mas use `.limit()` em lists
2. **Claude API**: Cache é ~30s por requisição. Use versões de texto curtas
3. **Frontend**: Componentes são `'use client'` apenas onde necessário
4. **Images**: PWA manifest define ícones - adicionar em `/public`

## Testes Manuais

### Checklist de Deploy
- [ ] Login funciona
- [ ] Registro salva no BD
- [ ] Novo esboço carrega form
- [ ] Seleção bíblica em cascata
- [ ] Claude gera em <60s
- [ ] Visualização mostra 7 análises
- [ ] PDF exporta corretamente
- [ ] Navbar navega entre abas
- [ ] Logout funciona
- [ ] Responsividade em mobile

## Troubleshooting Desenvolvimento

### "TURSO_CONNECTION_URL is missing"
```bash
# Verificar .env.local
cat .env.local | grep TURSO

# Reiniciar
npm run dev
```

### "Firebase project not found"
```bash
# Verificar NEXT_PUBLIC_FIREBASE_PROJECT_ID
# Ir a console.firebase.google.com e copiar project ID correto
```

### "Erro ao gerar esboço"
```bash
# Verificar ANTHROPIC_API_KEY
# Ir a console.anthropic.com/account/billing
# Verificar se tem quota disponível

# Tentar com versículo mais curto
```

### "Erro de CORS"
```bash
# Não deve haver CORS em Next.js 14
# Se tiver, é porque está chamando API de outro domínio
# Solução: usar getServerSideProps ou API route
```

## Próximas Features (Roadmap)

### v2
- [ ] Histórico de esboços (GET /api/esboço/user/{userId})
- [ ] Edição de esboços
- [ ] Bíblia integrada (GET /api/biblia/livro/cap)

### v3
- [ ] Harpa cristã
- [ ] Dicionário teológico
- [ ] Pesquisa avançada

### v4
- [ ] Compartilhamento via link
- [ ] Temas claro/escuro
- [ ] Comentários colaborativos

## Links Úteis

- [Firebase Docs](https://firebase.google.com/docs)
- [Turso Docs](https://docs.turso.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Claude API](https://docs.anthropic.com)
- [Next.js 14](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

## Suporte

Dúvidas no desenvolvimento? Checklist:

1. ✅ `.env.local` configurado corretamente?
2. ✅ `npm run db:push` executado?
3. ✅ Dev server rodando (`npm run dev`)?
4. ✅ Firebase project criado e ativo?
5. ✅ Claude API key válida?
6. ✅ Turso DB connection testada?

Se ainda não funcionar, leia os logs do servidor!
