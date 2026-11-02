CONTEXTO
Uma empresa precisa organizar solicitações de suporte técnico. Cada estudante desenvolverá uma interface web para registrar e acompanhar seus chamados, consumindo a API REST fornecida pelo professor.

OBJETIVO
Construir o frontend usando HTML, CSS e JavaScript. A aplicação deve consumir a API com `fetch`, enviar e interpretar JSON, tratar respostas HTTP e apresentar os chamados do usuário autenticado.

FUNCIONALIDADES ESPERADAS
- Listar chamados.
- Criar chamados com título, descrição, categoria e prioridade.
- Ver e editar os dados de um chamado.
- Excluir um chamado com confirmação.
- Filtrar a lista por status.
- Filtrar a lista por prioridade.
- Pesquisar a lista por titulo.
- Apresentar mensagens de carregamento, sucesso e erro.
- Organizar a interface. Pode-se utilizar frameworks CSS tais como: Bootstrap, Materialize, Tailwind, Bulma, Semantic UI, etc...
- Para as notificações, pode-se utilizar também biblioteas, ex: SweetAlert2.

CAMPOS DO CHAMADO
- Título: obrigatório, até 150 caracteres.
- Descrição: opcional, até 2000 caracteres.
- Categoria: hardware, software, rede ou outro.
- Prioridade: baixa, média ou alta.
- Status: aberto, em andamento ou concluído. Um chamado novo começa como aberto.