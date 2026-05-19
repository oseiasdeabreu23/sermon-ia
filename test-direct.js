#!/usr/bin/env node

/**
 * 🧪 Test Direct Flow - SermãoIA (sem Firebase)
 *
 * Testa direto via API sem precisar de Firebase:
 * 1. Chama API de geração com um token mockado
 * 2. Verifica resposta
 * 3. Mostra dados salvos no BD
 */

const http = require('http');

const API_BASE = 'http://localhost:3000/api';

console.log('🧪 Teste Direto - SermãoIA (sem Firebase)\n');

// Helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

// Mock token (Firebase Admin precisa estar configurado pra validar)
const MOCK_TOKEN = 'mock-token-' + Date.now();

async function testAPI() {
  console.log('1️⃣ Chamando API /api/esboço/gerar com mock token...');
  console.log(`   Token: ${MOCK_TOKEN}\n`);

  const body = {
    livro: 'Mateus',
    capitulo: 5,
    versiculo: 1,
    tipo: 'expositiva',
    titulo: 'As Bem-aventuranças',
    publicoAlvo: 'Comunidade geral',
    jobId: `job-${Date.now()}`,
  };

  try {
    const res = await makeRequest(`${API_BASE}/esboço/gerar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKEN}`,
      },
      body,
    });

    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(res.data, null, 2));

    if (res.status === 500) {
      console.log('\n⚠️  Erro 500 - Verificando possíveis causas:\n');

      // Verificar logs
      console.log('📋 Possíveis causas:');
      console.log('   1. Firebase Admin não está configurado');
      console.log('   2. Variáveis de ambiente faltando');
      console.log('   3. Turso BD não conectado');
      console.log('   4. Claude API falhou\n');

      console.log('📝 Próximos passos:');
      console.log('   1. Verificar logs do dev server');
      console.log('   2. Configurar FIREBASE_PRIVATE_KEY se necessário');
      console.log('   3. Testar via interface Web em http://localhost:3001\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAPI();
