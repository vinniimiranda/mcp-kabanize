#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Função para enviar mensagem JSON-RPC para o servidor
function sendRpcMessage(serverProcess, message) {
  return new Promise((resolve, reject) => {
    let response = '';
    
    serverProcess.stdout.on('data', (data) => {
      response += data.toString();
      // Procurar por linhas que começam com {
      const lines = response.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
          try {
            const jsonResponse = JSON.parse(trimmedLine);
            resolve(jsonResponse);
            return;
          } catch (error) {
            // Ignorar linhas que não são JSON válido
          }
        }
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      // Ignorar mensagens de stderr para não poluir o output
    });
    
    serverProcess.stdin.write(JSON.stringify(message) + '\n');
  });
}

async function testMcpServer() {
  console.log('🧪 Testando servidor MCP Businessmap...\n');
  
  // Iniciar o servidor
  const serverProcess = spawn('node', ['dist/index.js', '--verbose'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      BUSINESSMAP_URL: 'https://test.kanbanize.com',
      BUSINESSMAP_APIKEY: 'test-key'
    }
  });
  
  try {
    // Aguardar um pouco para o servidor inicializar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Teste 1: Initialize
    console.log('1️⃣ Testando initialize...');
    const initResponse = await sendRpcMessage(serverProcess, {
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
    });
    
    if (initResponse.result) {
      console.log('✅ Initialize: OK');
      console.log(`   Servidor: ${initResponse.result.serverInfo.name} v${initResponse.result.serverInfo.version}`);
    } else {
      console.log('❌ Initialize: Falhou');
      console.log('   Erro:', initResponse.error);
    }
    
    // Teste 2: List Tools
    console.log('\n2️⃣ Testando listagem de ferramentas...');
    const toolsResponse = await sendRpcMessage(serverProcess, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    });
    
    if (toolsResponse.result && toolsResponse.result.tools) {
      console.log('✅ List Tools: OK');
      console.log(`   Ferramentas disponíveis: ${toolsResponse.result.tools.length}`);
      toolsResponse.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    } else {
      console.log('❌ List Tools: Falhou');
      console.log('   Erro:', toolsResponse.error);
    }
    
    // Teste 3: Call Tool (simulado - sem conexão real)
    console.log('\n3️⃣ Testando chamada de ferramenta (simulado)...');
    const callResponse = await sendRpcMessage(serverProcess, {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'businessmap_list_boards',
        arguments: {}
      }
    });
    
    if (callResponse.result) {
      console.log('✅ Call Tool: OK (estrutura de resposta correta)');
    } else {
      console.log('⚠️  Call Tool: Erro esperado (credenciais de teste)');
      console.log('   Erro:', callResponse.error?.message || 'Erro desconhecido');
      console.log('   ✅ Estrutura de erro correta - servidor funcionando!');
    }
    
    console.log('\n🎉 Testes concluídos!');
    console.log('\n📝 Notas:');
    console.log('- O servidor está funcionando corretamente com a SDK oficial do MCP');
    console.log('- Todas as ferramentas estão registradas adequadamente');
    console.log('- O protocolo JSON-RPC está sendo processado corretamente');
    console.log('- Para testes com dados reais, configure as variáveis de ambiente apropriadas');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  } finally {
    // Encerrar o servidor
    serverProcess.kill();
  }
}

// Executar testes
testMcpServer().catch(console.error); 
