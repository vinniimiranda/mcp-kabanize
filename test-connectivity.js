#!/usr/bin/env node

const { spawn } = require('child_process');

// Função para enviar mensagem JSON-RPC para o servidor
function sendRpcMessage(serverProcess, message) {
  return new Promise((resolve, reject) => {
    let response = '';
    
    serverProcess.stdout.on('data', (data) => {
      response += data.toString();
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

async function testBusinessmapConnectivity() {
  console.log('🔍 Testando conectividade com Businessmap...\n');
  
  // Verificar se as variáveis de ambiente estão configuradas
  const businessmapUrl = process.env.BUSINESSMAP_URL;
  const businessmapApikey = process.env.BUSINESSMAP_APIKEY;
  
  if (!businessmapUrl || !businessmapApikey) {
    console.log('❌ Variáveis de ambiente não configuradas!');
    console.log('Por favor, configure:');
    console.log('  export BUSINESSMAP_URL=https://your-instance.kanbanize.com');
    console.log('  export BUSINESSMAP_APIKEY=your_api_key');
    console.log('\nOu execute com as variáveis inline:');
    console.log('  BUSINESSMAP_URL=https://your-instance.kanbanize.com BUSINESSMAP_APIKEY=your_key node test-connectivity.js');
    return;
  }
  
  console.log(`📡 URL: ${businessmapUrl}`);
  console.log(`🔑 API Key: ${businessmapApikey.substring(0, 8)}...`);
  console.log('');
  
  // Iniciar o servidor
  const serverProcess = spawn('node', ['dist/index.js', '--verbose'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      BUSINESSMAP_URL: businessmapUrl,
      BUSINESSMAP_APIKEY: businessmapApikey
    }
  });
  
  try {
    // Aguardar um pouco para o servidor inicializar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Teste 1: Initialize
    console.log('1️⃣ Inicializando servidor MCP...');
    const initResponse = await sendRpcMessage(serverProcess, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'connectivity-test',
          version: '1.0.0'
        }
      }
    });
    
    if (initResponse.result) {
      console.log('✅ Servidor inicializado com sucesso');
    } else {
      console.log('❌ Falha na inicialização:', initResponse.error);
      return;
    }
    
    // Teste 2: Listar boards
    console.log('\n2️⃣ Testando listagem de boards...');
    const boardsResponse = await sendRpcMessage(serverProcess, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'businessmap_list_boards',
        arguments: {}
      }
    });
    
    if (boardsResponse.result) {
      console.log('✅ Conexão com Businessmap estabelecida!');
      const boardsData = JSON.parse(boardsResponse.result.content[0].text);
      console.log(`   Boards encontrados: ${boardsData.length}`);
      
      // Verificar se o board 411 existe
      const board411 = boardsData.find(board => board.board_id == 411);
      if (board411) {
        console.log(`   ✅ Board 411 encontrado: "${board411.name}"`);
      } else {
        console.log(`   ⚠️  Board 411 não encontrado na lista`);
        console.log('   Boards disponíveis:');
        boardsData.slice(0, 5).forEach(board => {
          console.log(`     - Board ${board.board_id}: ${board.name}`);
        });
        if (boardsData.length > 5) {
          console.log(`     ... e mais ${boardsData.length - 5} boards`);
        }
      }
    } else {
      console.log('❌ Falha na conexão com Businessmap');
      console.log('   Erro:', boardsResponse.error?.message || 'Erro desconhecido');
      console.log('\n🔧 Possíveis soluções:');
      console.log('   - Verifique se a URL está correta');
      console.log('   - Confirme se a API key é válida');
      console.log('   - Teste a conectividade de rede');
      console.log('   - Verifique se o Businessmap está acessível');
      return;
    }
    
    // Teste 3: Obter detalhes do board 411
    console.log('\n3️⃣ Obtendo detalhes do board 411...');
    const boardResponse = await sendRpcMessage(serverProcess, {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'businessmap_get_board',
        arguments: {
          board_id: '411'
        }
      }
    });
    
    if (boardResponse.result) {
      const boardData = JSON.parse(boardResponse.result.content[0].text);
      console.log('✅ Detalhes do board 411 obtidos');
      console.log(`   Nome: ${boardData.name}`);
      console.log(`   ID: ${boardData.board_id}`);
      console.log(`   Descrição: ${boardData.description || 'N/A'}`);
    } else {
      console.log('❌ Falha ao obter detalhes do board 411');
      console.log('   Erro:', boardResponse.error?.message || 'Erro desconhecido');
    }
    
    // Teste 4: Buscar o card 146526
    console.log('\n4️⃣ Buscando card 146526...');
    const searchResponse = await sendRpcMessage(serverProcess, {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'businessmap_search',
        arguments: {
          query: '146526',
          board_ids: '411',
          max_results: 10
        }
      }
    });
    
    if (searchResponse.result) {
      const searchData = JSON.parse(searchResponse.result.content[0].text);
      console.log('✅ Busca realizada com sucesso');
      console.log(`   Cards encontrados: ${searchData.length}`);
      
      if (searchData.length > 0) {
        searchData.forEach(card => {
          console.log(`   - Card ${card.card_id}: ${card.title}`);
        });
      } else {
        console.log('   ⚠️  Nenhum card encontrado com o ID 146526');
      }
    } else {
      console.log('❌ Falha na busca');
      console.log('   Erro:', searchResponse.error?.message || 'Erro desconhecido');
    }
    
    // Teste 5: Obter card específico 146526
    console.log('\n5️⃣ Obtendo card 146526 diretamente...');
    const cardResponse = await sendRpcMessage(serverProcess, {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'businessmap_get_card',
        arguments: {
          card_id: '146526'
        }
      }
    });
    
    if (cardResponse.result) {
      const cardData = JSON.parse(cardResponse.result.content[0].text);
      console.log('✅ Card 146526 obtido com sucesso!');
      console.log(`   Título: ${cardData.title}`);
      console.log(`   ID: ${cardData.card_id}`);
      console.log(`   Board: ${cardData.board_id}`);
      console.log(`   Status: ${cardData.status || 'N/A'}`);
      console.log(`   Descrição: ${cardData.description ? cardData.description.substring(0, 100) + '...' : 'N/A'}`);
      
      if (cardData.assignees && cardData.assignees.length > 0) {
        console.log(`   Assignees: ${cardData.assignees.map(a => a.name).join(', ')}`);
      }
      
      console.log('\n🎉 Conectividade com Businessmap funcionando perfeitamente!');
    } else {
      console.log('❌ Falha ao obter card 146526');
      console.log('   Erro:', cardResponse.error?.message || 'Erro desconhecido');
      console.log('\n🔧 Possíveis causas:');
      console.log('   - Card 146526 não existe');
      console.log('   - Permissões insuficientes para acessar o card');
      console.log('   - Card está em um board diferente');
    }
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  } finally {
    // Encerrar o servidor
    serverProcess.kill();
  }
}

// Executar testes
testBusinessmapConnectivity().catch(console.error); 
