# Tarefas Gerenciamento

Este é um projeto simples para gerenciamento de tarefas com diferentes prioridades (Alta, Média, Baixa). As tarefas podem ser criadas, editadas, iniciadas e concluídas. As tarefas em execução e concluídas são destacadas com cores específicas (verde e amarelo).

## Funcionalidades

- **Adicionar Tarefa**: O usuário pode adicionar uma tarefa com prioridade e descrição.
- **Editar Tarefa**: O usuário pode editar o nome da tarefa.
- **Iniciar Tarefa**: Ao iniciar uma tarefa, ela é destacada com uma cor amarela suave.
- **Exluir Tarefa**: Depois de criar uma tarefa, e possivel exclui-la.
- **Concluir Tarefa**: Quando a tarefa é concluída, ela é destacada com uma cor verde suave.
- **Organização por Prioridade**: Tarefas são separadas por suas prioridades (Alta, Média, Baixa).

## Como Usar

1. **Adicionar Tarefa**: Selecione a prioridade e insira o nome da tarefa.
2. **Editar Tarefa**: Clique no ícone de editar para modificar o nome da tarefa e a prioridade.
3. **Excluir tarefa**: Clique no icone de lixeira para apagar uma tarefa
4. **Iniciar Tarefa**: Clique no ícone de play para iniciar a tarefa.
5. **Concluir Tarefa**: Clique no ícone de check para concluir a tarefa.

## Tecnologias Utilizadas

- **HTML**: Para estruturar as páginas.
- **CSS**: Para o estilo e layout.
- **JavaScript**: Para a lógica de funcionamento das tarefas, incluindo ações de adicionar, editar, iniciar e concluir.
- **JSON Server**: Para criar uma API falsa e simular o armazenamento de dados em um arquivo `data.json`.

## Instruções de Execução

1. Clone este repositório em sua máquina.
2. Inicie o servidor do JSON Server para simular um backend na raiz do projeto.

```bash
    json-server --watch data.json --port 3000
```
3. Abra o arquivo `index.html` no navegador para executar o projeto.
