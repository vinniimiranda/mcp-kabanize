# MCP Businessmap Server

Um servidor MCP (Model Context Protocol) para integração com a API do Businessmap (Kanbanize).

## Funcionalidades

### Cards
- **businessmap_search**: Buscar cards no Businessmap
- **businessmap_get_card**: Obter detalhes de um card específico
- **businessmap_create_card**: Criar um novo card
- **businessmap_update_card**: Atualizar um card existente
- **businessmap_delete_card**: Excluir um card
- **businessmap_add_comment**: Adicionar comentário a um card

### Boards
- **businessmap_list_boards**: Listar quadros disponíveis
- **businessmap_get_board**: Obter detalhes de um quadro específico
- **businessmap_get_board_lanes**: Obter lanes de um quadro específico
- **businessmap_get_board_columns**: Obter colunas de um quadro específico
- **businessmap_get_board_workflows**: Obter workflows de um quadro específico
- **businessmap_get_board_structure**: Obter estrutura completa de um quadro

## Nova Funcionalidade: businessmap_get_board_structure

A tool `businessmap_get_board_structure` permite recuperar a estrutura completa de um board, incluindo:

- **Informações básicas do board**: ID, nome, descrição, versão, etc.
- **Workflows**: Configuração completa dos workflows do board
- **Lanes**: Todas as lanes disponíveis com suas configurações
- **Columns**: Todas as colunas com suas propriedades e configurações
- **Child Columns**: Relacionamentos entre colunas pai e filho
- **Checklist Items**: Itens de checklist associados às colunas
- **Configurações avançadas**: Limites, fórmulas, ordenação, etc.

### Uso

```json
{
  "name": "businessmap_get_board_structure",
  "arguments": {
    "board_id": "1090"
  }
}
```

### Resposta

A resposta inclui toda a estrutura do board conforme a API do Businessmap:

```json
{
  "data": {
    "version": "1.0",
    "workspace_id": 727,
    "board_id": 1090,
    "name": "Simple board",
    "workflows": { ... },
    "lanes": { ... },
    "columns": { ... },
    "child_columns": { ... },
    "column_checklist_items": { ... },
    "cell_card_orderings": { ... },
    "cell_limits": { ... },
    "merged_areas": { ... },
    "revision": 27
  }
}
```

### Tipos TypeScript

Foram criadas interfaces TypeScript completas para tipagem da estrutura:

- `BoardStructure`: Estrutura completa do board
- `WorkflowStructure`: Configuração de workflow
- `LaneStructure`: Configuração de lane
- `ColumnStructure`: Configuração de coluna
- `ChecklistItemStructure`: Item de checklist
- `MergedAreaStructure`: Área mesclada

## Características

- ✅ **SDK Oficial MCP**: Usa a SDK oficial do Model Context Protocol
- ✅ Protocolo MCP padrão implementado
- ✅ Suporte a transporte STDIO (padrão MCP)
- ✅ Modo somente leitura para segurança
- ✅ Filtros de quadros configuráveis
- ✅ Tratamento de erros robusto
- ✅ Logging detalhado
- ✅ Tipagem TypeScript completa

## Ferramentas Disponíveis

### Cards
- `businessmap_search` - Buscar cards por texto
- `businessmap_get_card` - Obter detalhes de um card específico
- `businessmap_create_card` - Criar novo card
- `businessmap_update_card` - Atualizar card existente
- `businessmap_delete_card` - Excluir card
- `businessmap_add_comment` - Adicionar comentário a um card

### Quadros
- `businessmap_list_boards` - Listar quadros disponíveis
- `businessmap_get_board` - Obter detalhes de um quadro específico

## Instalação

```bash
npm install
npm run build
```

## Configuração

### Variáveis de Ambiente

```bash
# Obrigatórias
BUSINESSMAP_URL=https://your-instance.kanbanize.com
BUSINESSMAP_APIKEY=YOUR_API_KEY

# Opcionais
BUSINESSMAP_BOARDS_FILTER=1,2,3  # IDs dos quadros permitidos
READ_ONLY_MODE=true              # Modo somente leitura
```

### Argumentos de Linha de Comando

```bash
# Básico
node dist/index.js --businessmap-url=https://your-instance.kanbanize.com --businessmap-apikey=YOUR_API_KEY

# Com opções
node dist/index.js \
  --businessmap-url=https://your-instance.kanbanize.com \
  --businessmap-apikey=YOUR_API_KEY \
  --businessmap-boards-filter=1,2,3 \
  --read-only \
  --verbose \
  --transport=stdio
```

## Uso

### Modo STDIO (Padrão MCP)

```bash
node dist/index.js --transport=stdio
```

### Modo STDIO (Recomendado)

```bash
node dist/index.js --transport=stdio
```

> **Nota**: O transporte SSE foi removido na versão atual. Use o transporte STDIO que é o padrão do protocolo MCP.

## Integração com Clientes MCP

### Configuração do Cliente

Adicione ao seu arquivo de configuração MCP:

```json
{
  "mcpServers": {
    "businessmap": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "BUSINESSMAP_URL": "https://your-instance.kanbanize.com",
        "BUSINESSMAP_APIKEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### Exemplo de Uso com Claude Desktop

1. Configure o servidor no arquivo `claude_desktop_config.json`
2. Reinicie o Claude Desktop
3. Use as ferramentas disponíveis através do protocolo MCP

## Desenvolvimento

```bash
# Modo desenvolvimento
npm run dev

# Build
npm run build

# Executar build
npm start
```

## Mudanças na Versão Atual

Esta versão foi refatorada para usar a **SDK oficial do MCP**, oferecendo:

- **Melhor compatibilidade** com o protocolo MCP
- **Tipagem TypeScript** mais robusta
- **Tratamento de erros** aprimorado
- **Código mais limpo** e manutenível
- **Compatibilidade total** com a API anterior

Veja `example-usage.md` para exemplos detalhados de uso.

## Segurança

- Use sempre HTTPS para a URL do Businessmap
- Configure filtros de quadros para limitar acesso
- Use modo somente leitura quando apropriado
- Mantenha suas chaves de API seguras

## Troubleshooting

### Erro de Conexão
- Verifique se a URL do Businessmap está correta
- Confirme se a chave de API é válida
- Teste a conectividade de rede

### Erro de Permissão
- Verifique se a chave de API tem permissões adequadas
- Confirme se os quadros estão acessíveis

### Logs Detalhados
Use a flag `--verbose` para obter logs detalhados:

```bash
node dist/index.js --verbose
```

## Licença

MIT License - veja o arquivo LICENSE para detalhes. 
