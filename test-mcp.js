#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Configuração de teste
const config = {
  businessmapUrl: process.env.BUSINESSMAP_URL || 'https://test.kanbanize.com',
  businessmapApikey: process.env.BUSINESSMAP_APIKEY || 'test-key',
  transport: 'stdio'
};

console.log('🧪 Testando servidor MCP Businessmap...');
console.log(`URL: ${config.businessmapUrl}`);
console.log(`Transport: ${config.transport}`);

// Iniciar o servidor MCP
const serverProcess = spawn('node', [
  path.join(__dirname, 'dist', 'index.js'),
  '--transport', config.transport,
  '--businessmap-url', config.businessmapUrl,
  '--businessmap-apikey', config.businessmapApikey,
  '--verbose'
], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverReady = false;
let testResults = [];

// Capturar saída do servidor
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 Server output:', output.trim());
  
  // Verificar se o servidor está pronto
  if (output.includes('MCP Businessmap server ready')) {
    serverReady = true;
    console.log('✅ Servidor MCP pronto!');
    runTests();
  }
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  console.log('⚠️  Server stderr:', output.trim());
  
  // Verificar se o servidor está pronto (stderr também)
  if (output.includes('MCP Businessmap server ready')) {
    serverReady = true;
    console.log('✅ Servidor MCP pronto!');
    runTests();
  }
});

// Função para executar testes
function runTests() {
  console.log('\n🔍 Executando testes MCP...');
  
  // Teste 1: Initialize
  const initializeRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  
  console.log('\n📝 Teste 1: Initialize');
  serverProcess.stdin.write(JSON.stringify(initializeRequest) + '\n');
  
  // Teste 2: List Tools
  setTimeout(() => {
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };
    
    console.log('\n📝 Teste 2: List Tools');
    serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    
    // Finalizar testes após 3 segundos
    setTimeout(() => {
      console.log('\n✅ Testes concluídos!');
      console.log('📊 Resultados dos testes:');
      testResults.forEach((result, index) => {
        console.log(`  Teste ${index + 1}: ${result.success ? '✅' : '❌'} ${result.name}`);
        if (!result.success) {
          console.log(`    Erro: ${result.error}`);
        }
      });
      
      // Encerrar o servidor
      serverProcess.kill();
      process.exit(0);
    }, 3000);
    
  }, 1000);
}

// Capturar respostas do servidor
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  
  try {
    // Tentar parsear como JSON
    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        const response = JSON.parse(line);
        
        if (response.id === 1) {
          testResults.push({
            name: 'Initialize',
            success: response.result && response.result.protocolVersion,
            error: response.error ? response.error.message : null
          });
          console.log('✅ Initialize response:', JSON.stringify(response.result, null, 2));
        } else if (response.id === 2) {
          testResults.push({
            name: 'List Tools',
            success: response.result && response.result.tools,
            error: response.error ? response.error.message : null
          });
          console.log('✅ List Tools response:', JSON.stringify(response.result, null, 2));
        }
      }
    }
  } catch (error) {
    // Ignorar erros de parsing
  }
});

// Capturar respostas do stderr também
serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  
  try {
    // Tentar parsear como JSON
    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        const response = JSON.parse(line);
        
        if (response.id === 1) {
          testResults.push({
            name: 'Initialize',
            success: response.result && response.result.protocolVersion,
            error: response.error ? response.error.message : null
          });
          console.log('✅ Initialize response:', JSON.stringify(response.result, null, 2));
        } else if (response.id === 2) {
          testResults.push({
            name: 'List Tools',
            success: response.result && response.result.tools,
            error: response.error ? response.error.message : null
          });
          console.log('✅ List Tools response:', JSON.stringify(response.result, null, 2));
        }
      }
    }
  } catch (error) {
    // Ignorar erros de parsing
  }
});

// Tratar erros do servidor
serverProcess.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error.message);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`\n🏁 Servidor encerrado com código: ${code}`);
});

// Timeout de segurança
setTimeout(() => {
  console.log('⏰ Timeout - encerrando testes');
  serverProcess.kill();
  process.exit(1);
}, 10000); 
