#!/bin/bash

# 🧪 Script de Teste Local - SermãoIA
# Automatiza o processo de setup e teste

set -e  # Exit on error

echo "🎯 SermãoIA - Teste Local"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}1. Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não instalado"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
echo ""

# Check npm
echo -e "${BLUE}2. Verificando npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo "❌ npm não instalado"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"
echo ""

# Check .env.local
echo -e "${BLUE}3. Verificando .env.local...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local não encontrado${NC}"
    echo "   Copie de .env.example:"
    echo "   $ cp .env.example .env.local"
    echo "   $ vim .env.local  # Edite com suas credenciais"
    exit 1
fi

# Check if .env.local has required variables
REQUIRED_VARS=(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "TURSO_CONNECTION_URL"
    "TURSO_AUTH_TOKEN"
    "ANTHROPIC_API_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" .env.local; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Variáveis faltando no .env.local:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Edite .env.local e presencha todas as variáveis"
    exit 1
fi

echo -e "${GREEN}✅ .env.local configurado${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}4. Instalando dependências...${NC}"
if [ ! -d "node_modules" ]; then
    echo "   Rodando: npm install"
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
else
    echo -e "${GREEN}✅ node_modules já existe${NC}"
fi
echo ""

# Database setup
echo -e "${BLUE}5. Configurando banco de dados...${NC}"
echo "   Rodando: npm run db:push"
npm run db:push > /dev/null 2>&1
echo -e "${GREEN}✅ Banco de dados pronto${NC}"
echo ""

# Build check
echo -e "${BLUE}6. Verificando build...${NC}"
echo "   Rodando: next build (validação)"
npm run build > /dev/null 2>&1
echo -e "${GREEN}✅ Build validado${NC}"
echo ""

# Summary
echo -e "${GREEN}=========================="
echo "✅ Tudo pronto para teste!"
echo "==========================${NC}"
echo ""
echo "Para rodar o servidor:"
echo "  $ npm run dev"
echo ""
echo "Acesse em:"
echo "  http://localhost:3000"
echo ""
echo "Via SSH tunnel (se em VPS):"
echo "  ssh -L 3000:localhost:3000 root@SEU_IP_VPS"
echo ""
