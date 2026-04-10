# MCP Businessmap Server - Exemplo de Uso

Este servidor MCP foi refatorado para usar a SDK oficial do Model Context Protocol.

## Instalação

```bash
npm install
npm run build
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
BUSINESSMAP_URL=https://your-instance.kanbanize.com
BUSINESSMAP_APIKEY=your_api_key_here
BUSINESSMAP_BOARDS_FILTER=board1,board2,board3
READ_ONLY_MODE=false
```

### Argumentos da Linha de Comando

```bash
# Uso básico
node dist/index.js

# Com argumentos
node dist/index.js \
  --businessmap-url=https://your-instance.kanbanize.com \
  --businessmap-apikey=your_api_key \
  --verbose

# Modo somente leitura
node dist/index.js --read-only

# Filtrar boards específicos
node dist/index.js --businessmap-boards-filter=board1,board2
```

## Ferramentas Disponíveis

### 1. businessmap_search
Busca por cards no Businessmap.

**Parâmetros:**
- `query` (obrigatório): Texto para buscar
- `board_ids` (opcional): Lista de IDs de boards separados por vírgula
- `max_results` (opcional): Número máximo de resultados (padrão: 50)

### 2. businessmap_get_card
Obtém um card específico por ID.

**Parâmetros:**
- `card_id` (obrigatório): ID do card

### 3. businessmap_create_card
Cria um novo card.

**Parâmetros:**
- `board_id` (obrigatório): ID do board
- `workflow_id` (obrigatório): ID do workflow
- `lane_id` (obrigatório): ID da lane
- `column_id` (obrigatório): ID da coluna
- `title` (obrigatório): Título do card
- `description` (opcional): Descrição do card
- `priority` (opcional): Prioridade do card
- `assignee_ids` (opcional): Lista de IDs de assignees separados por vírgula

### 4. businessmap_update_card
Atualiza um card existente.

**Parâmetros:**
- `card_id` (obrigatório): ID do card
- `title` (opcional): Novo título
- `description` (opcional): Nova descrição
- `column_id` (opcional): Nova coluna
- `lane_id` (opcional): Nova lane
- `priority` (opcional): Nova prioridade
- `assignee_ids` (opcional): Novos assignees

### 5. businessmap_delete_card
Remove um card.

**Parâmetros:**
- `card_id` (obrigatório): ID do card

### 6. businessmap_add_comment
Adiciona um comentário a um card.

**Parâmetros:**
- `card_id` (obrigatório): ID do card
- `text` (obrigatório): Texto do comentário

### 7. businessmap_list_boards
Lista todos os boards disponíveis.

**Parâmetros:** Nenhum

### 8. businessmap_get_board
Obtém detalhes de um board específico.

**Parâmetros:**
- `board_id` (obrigatório): ID do board

## Integração com Clientes MCP

### Claude Desktop

Adicione ao arquivo de configuração do Claude:

```json
{
  "mcpServers": {
    "businessmap": {
      "command": "node",
      "args": ["/path/to/your/mcp-businessmap/dist/index.js"],
      "env": {
        "BUSINESSMAP_URL": "https://your-instance.kanbanize.com",
        "BUSINESSMAP_APIKEY": "your_api_key"
      }
    }
  }
}
```

### Outros Clientes MCP

O servidor suporta o protocolo MCP padrão via STDIO, então pode ser integrado com qualquer cliente MCP compatível.

## Modo Somente Leitura

Para usar em modo somente leitura (útil para ambientes de produção ou auditoria):

```bash
node dist/index.js --read-only
```

Ou via variável de ambiente:

```env
READ_ONLY_MODE=true
```

## Logs Verbosos

Para ativar logs detalhados:

```bash
node dist/index.js --verbose
```

## Diferenças da Versão Anterior

1. **SDK Oficial**: Agora usa a SDK oficial do MCP em vez de implementação manual
2. **Tipagem Melhorada**: Melhor suporte a TypeScript com tipagem adequada
3. **Tratamento de Erros**: Tratamento de erros mais robusto
4. **Compatibilidade**: Mantém total compatibilidade com a API anterior
5. **Manutenibilidade**: Código mais limpo e fácil de manter

## Troubleshooting

### Erro de Conexão
- Verifique se a URL do Businessmap está correta
- Confirme se a API key é válida
- Teste a conectividade de rede

### Erro de Permissão
- Verifique se a API key tem as permissões necessárias
- Use o modo somente leitura se necessário

### Erro de Compilação
- Execute `npm install` para instalar dependências
- Verifique se o TypeScript está instalado: `npm install -g typescript` 
