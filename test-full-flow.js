#!/usr/bin/env node

/**
 * 🧪 Test Full Flow - SermãoIA
 *
 * Testa o fluxo completo:
 * 1. Criar conta Firebase
 * 2. Login e obter token
 * 3. Chamar API de geração de esboço
 * 4. Verificar resultado no BD
 */

const http = require('http');
const https = require('https');

// Configurações
const API_BASE = 'http://localhost:3001/api';
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const EMAIL = `test-${Date.now()}@example.com`;
const PASSWORD = 'Test123456!';

console.log('🧪 Iniciando teste completo do SermãoIA...\n');

// Helper para fazer requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
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

// 1️⃣ Criar conta Firebase
async function createAccount() {
  console.log('1️⃣ Criando conta Firebase...');
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;

  try {
    const res = await makeRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: EMAIL,
        password: PASSWORD,
        returnSecureToken: true,
      }
    });

    if (res.status !== 200) {
      throw new Error(`Firebase error: ${JSON.stringify(res.data)}`);
    }

    console.log(`   ✅ Conta criada: ${EMAIL}`);
    return {
      idToken: res.data.idToken,
      uid: res.data.localId,
    };
  } catch (error) {
    console.error(`   ❌ Erro ao criar conta:`, error.message);
    throw error;
  }
}

// 2️⃣ Gerar esboço
async function generateEsboço(idToken) {
  console.log('\n2️⃣ Gerando esboço...');

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
        'Authorization': `Bearer ${idToken}`,
      },
      body,
    });

    if (res.status !== 200) {
      throw new Error(`API error: ${JSON.stringify(res.data)}`);
    }

    console.log(`   ✅ Esboço gerado com sucesso!`);
    console.log(`   ID: ${res.data.esbocoId}`);
    console.log(`   Status: ${res.data.status}`);

    return res.data.esbocoId;
  } catch (error) {
    console.error(`   ❌ Erro ao gerar esboço:`, error.message);
    throw error;
  }
}

// 3️⃣ Buscar esboço
async function fetchEsboço(esbocoId, idToken) {
  console.log('\n3️⃣ Buscando esboço do BD...');

  try {
    const res = await makeRequest(`${API_BASE}/esboço/${esbocoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (res.status !== 200) {
      throw new Error(`API error: ${JSON.stringify(res.data)}`);
    }

    console.log(`   ✅ Esboço encontrado!`);
    console.log(`   Livro: ${res.data.livro} ${res.data.capitulo}:${res.data.versiculo}`);
    console.log(`   Título: ${res.data.titulo}`);
    console.log(`   Tipo: ${res.data.tipo}`);

    // Verificar conteúdo
    if (res.data.conteudoJson) {
      const conteudo = typeof res.data.conteudoJson === 'string'
        ? JSON.parse(res.data.conteudoJson)
        : res.data.conteudoJson;

      console.log('\n   📚 7 Análises:');
      if (conteudo.fundacao) console.log('      ✓ Fundação');
      if (conteudo.analise) console.log('      ✓ Análise');
      if (conteudo.aplicacao) console.log('      ✓ Aplicação');

      return conteudo;
    }
  } catch (error) {
    console.error(`   ❌ Erro ao buscar esboço:`, error.message);
    throw error;
  }
}

// Main
(async () => {
  try {
    console.log('━'.repeat(60));
    console.log('  🧪 TESTE COMPLETO DO FLUXO - SermãoIA');
    console.log('━'.repeat(60) + '\n');

    // 1. Criar conta
    const { idToken, uid } = await createAccount();

    // 2. Gerar esboço
    const esbocoId = await generateEsboço(idToken);

    // 3. Buscar esboço
    const conteudo = await fetchEsboço(esbocoId, idToken);

    console.log('\n' + '━'.repeat(60));
    console.log('✅ TESTE COMPLETO COM SUCESSO!');
    console.log('━'.repeat(60));
    console.log('\n📊 Resumo:');
    console.log(`   Email: ${EMAIL}`);
    console.log(`   UID: ${uid}`);
    console.log(`   Esboço ID: ${esbocoId}`);
    console.log(`   Status: Completo`);
    console.log('\n🎨 Próximos passos:');
    console.log(`   1. Abra: http://localhost:3001`);
    console.log(`   2. Login com: ${EMAIL} / ${PASSWORD}`);
    console.log(`   3. Veja o esboço gerado!`);
    console.log(`   4. Monitore em: https://local.drizzle.studio\n`);

  } catch (error) {
    console.log('\n' + '━'.repeat(60));
    console.log('❌ TESTE FALHOU');
    console.log('━'.repeat(60));
    console.error('\nErro:', error.message);
    process.exit(1);
  }
})();
