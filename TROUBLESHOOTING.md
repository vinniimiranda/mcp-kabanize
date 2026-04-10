# Guia de Diagnóstico - Problemas de Conectividade

## 🔍 Diagnóstico de Problemas de Conectividade

Este guia ajuda a identificar e resolver problemas de conectividade com o Businessmap.

## 🚀 Teste Rápido de Conectividade

### 1. Configurar Variáveis de Ambiente

```bash
# Configure suas credenciais
export BUSINESSMAP_URL=https://your-instance.kanbanize.com
export BUSINESSMAP_APIKEY=your_api_key_here

# Ou execute inline
BUSINESSMAP_URL=https://your-instance.kanbanize.com BUSINESSMAP_APIKEY=your_key node test-connectivity.js
```

### 2. Executar Teste de Conectividade

```bash
npm run test:connectivity
```

Este teste irá:
- ✅ Verificar se as variáveis estão configuradas
- ✅ Testar conexão com o Businessmap
- ✅ Listar boards disponíveis
- ✅ Verificar se o board 411 existe
- ✅ Buscar o card 146526
- ✅ Obter detalhes completos do card

## 🔧 Problemas Comuns e Soluções

### ❌ Erro: "Variáveis de ambiente não configuradas"

**Solução:**
```bash
# Configure as variáveis
export BUSINESSMAP_URL=https://your-instance.kanbanize.com
export BUSINESSMAP_APIKEY=your_api_key

# Verifique se estão configuradas
echo $BUSINESSMAP_URL
echo $BUSINESSMAP_APIKEY
```

### ❌ Erro: "Unauthorized" ou "401"

**Possíveis causas:**
- API key inválida ou expirada
- URL incorreta
- Permissões insuficientes

**Soluções:**
1. **Verificar API Key:**
   ```bash
   # Teste a API key diretamente
   curl -H "apikey: YOUR_API_KEY" https://your-instance.kanbanize.com/api/v2/boards
   ```

2. **Verificar URL:**
   - Certifique-se de que a URL está correta
   - Teste se o site está acessível no navegador
   - Verifique se não há barras extras no final

3. **Verificar Permissões:**
   - A API key precisa ter permissões de leitura
   - Verifique se tem acesso ao board 411

### ❌ Erro: "Network Error" ou "Connection Refused"

**Possíveis causas:**
- Problemas de rede
- Firewall bloqueando
- Businessmap indisponível

**Soluções:**
1. **Testar conectividade básica:**
   ```bash
   ping your-instance.kanbanize.com
   curl -I https://your-instance.kanbanize.com
   ```

2. **Verificar firewall:**
   - Certifique-se de que a porta 443 (HTTPS) está liberada
   - Verifique configurações de proxy se aplicável

### ❌ Erro: "Board 411 not found"

**Possíveis causas:**
- Board ID incorreto
- API key não tem acesso ao board
- Board foi removido ou renomeado

**Soluções:**
1. **Listar todos os boards disponíveis:**
   ```bash
   # O teste de conectividade mostrará todos os boards
   npm run test:connectivity
   ```

2. **Verificar permissões:**
   - Confirme se a API key tem acesso ao board 411
   - Verifique se o board ainda existe

### ❌ Erro: "Card 146526 not found"

**Possíveis causas:**
- Card ID incorreto
- Card foi removido
- Card está em board diferente
- Permissões insuficientes

**Soluções:**
1. **Buscar o card:**
   ```bash
   # O teste de conectividade fará uma busca
   npm run test:connectivity
   ```

2. **Verificar board correto:**
   - Confirme se o card está realmente no board 411
   - Verifique se não foi movido para outro board

## 🛠️ Ferramentas de Diagnóstico

### 1. Teste Manual com cURL

```bash
# Testar listagem de boards
curl -H "apikey: YOUR_API_KEY" \
     https://your-instance.kanbanize.com/api/v2/boards

# Testar busca de cards
curl -H "apikey: YOUR_API_KEY" \
     "https://your-instance.kanbanize.com/api/v2/cards?query=146526"

# Testar card específico
curl -H "apikey: YOUR_API_KEY" \
     https://your-instance.kanbanize.com/api/v2/cards/146526
```

### 2. Verificar Logs do Servidor

```bash
# Executar com logs verbosos
node dist/index.js --verbose

# Em outro terminal, enviar requisições de teste
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "businessmap_list_boards", "arguments": {}}}' | node dist/index.js --verbose
```

### 3. Teste de Conectividade Básica

```bash
# Testar se o site está acessível
curl -I https://your-instance.kanbanize.com

# Testar DNS
nslookup your-instance.kanbanize.com

# Testar ping
ping your-instance.kanbanize.com
```

## 📋 Checklist de Diagnóstico

### ✅ Configuração Básica
- [ ] BUSINESSMAP_URL configurada corretamente
- [ ] BUSINESSMAP_APIKEY configurada e válida
- [ ] URL acessível via navegador
- [ ] API key tem permissões adequadas

### ✅ Conectividade de Rede
- [ ] Site acessível via ping/curl
- [ ] Sem bloqueios de firewall
- [ ] DNS resolvendo corretamente
- [ ] HTTPS funcionando

### ✅ Permissões e Acesso
- [ ] API key válida e ativa
- [ ] Permissões de leitura habilitadas
- [ ] Acesso ao board 411
- [ ] Acesso ao card 146526

### ✅ Funcionalidade do Servidor
- [ ] Servidor MCP inicializando
- [ ] Ferramentas registradas corretamente
- [ ] Protocolo JSON-RPC funcionando
- [ ] Respostas estruturadas corretamente

## 🆘 Ainda com Problemas?

Se os problemas persistirem:

1. **Coletar informações:**
   ```bash
   # Executar teste completo
   npm run test:connectivity > connectivity-log.txt 2>&1
   
   # Verificar logs
   cat connectivity-log.txt
   ```

2. **Verificar versões:**
   ```bash
   node --version
   npm --version
   ```

3. **Reinstalar dependências:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Contatar suporte:**
   - Incluir logs de erro
   - Descrever passos executados
   - Informar versões das ferramentas

## 📞 Recursos Adicionais

- [Documentação da API Businessmap](https://help.kanbanize.com/hc/en-us/articles/360001636134-API-Overview)
- [Guia de Configuração MCP](https://modelcontextprotocol.io/docs/servers/overview)
- [Exemplos de Uso](example-usage.md)
- [Resumo da Migração](MIGRATION_SUMMARY.md) 
