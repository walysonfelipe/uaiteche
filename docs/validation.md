# Validação da primeira implementação

Data: 02/11/2026.

A interface foi validada com respostas simuladas no navegador e testes locais das regras de negócio e do cliente HTTP. Não foram feitas gravações na API real. Os dados usados nos testes não são incluídos na aplicação.

## Testes automatizados locais

Comando, a partir da raiz do projeto:

```sh
node --test tests/core.test.cjs
```

Resultado atual: **26 testes aprovados**.

Cobertura: URL e autenticação com token configurado no arquivo, coleção e identificadores, POST com `201`, PUT, DELETE com `204` sem leitura de JSON, token ausente ou malformado sem envio de requisição, erros HTTP, erros por campo, falha de rede, respostas malformadas, limite de 16 KiB em bytes, filtros combinados, contagem, limites de campos e apresentação de datas sem atribuir fuso.

Node.js é necessário apenas para executar esses testes; a aplicação não precisa de instalação de pacotes ou build.

## Teste inicial da interface no navegador

Este registro corresponde à primeira versão, que solicitava o token pela interface. O fluxo de configuração foi substituído pela constante `API_TOKEN` em `js/api.js`, conforme a atualização abaixo.

Executado no Google Chrome com Playwright, com interceptação das requisições à API. Os CDNs reais de Tailwind CSS, Iconify e Notiflix foram carregados normalmente. A aplicação foi servida por HTTP local.

| Cenário                                      | Resultado                                                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Estado inicial sem token                     | Não faz requisições e apresenta ação para conectar.                                                        |
| Token com formato inválido                   | Exibe validação antes de qualquer requisição.                                                              |
| Conexão recusada com `401`                   | Mantém o diálogo aberto e informa como revisar o acesso.                                                   |
| Conexão aceita                               | Carrega os registros e atualiza os contadores.                                                             |
| Persistência do token                        | Não usa `localStorage` ou `sessionStorage`; limpa o campo após conectar.                                   |
| Busca por título e filtros combinados        | Ignora caixa e espaços externos; aplica status e prioridade conjuntamente.                                 |
| Nenhum resultado                             | Mostra estado próprio e permite limpar os filtros.                                                         |
| Novo chamado                                 | Valida os campos, aceita descrição vazia e omite status no POST.                                           |
| Clique repetido no envio                     | Envia somente uma requisição enquanto a operação está pendente.                                            |
| Detalhes                                     | Faz consulta individual, apresenta datas e mantém os campos somente para leitura.                          |
| Edição                                       | Envia exatamente os cinco campos editáveis.                                                                |
| Validação `422`                              | Associa o erro ao campo e preserva os dados digitados.                                                     |
| Exclusão cancelada                           | Não envia DELETE; Escape também cancela a confirmação.                                                     |
| Exclusão confirmada                          | Remove o item após `204`, sem tentar interpretar JSON vazio.                                               |
| Chamado indisponível (`404`)                 | Informa o erro sem habilitar edição de dados não carregados.                                               |
| Falha na listagem (`500`) ou JSON inesperado | Distingue erro de lista vazia e permite tentar novamente.                                                  |
| Falha de rede após envio                     | Preserva o formulário e oferece consulta à lista antes de repetir a gravação.                              |
| Conteúdo com HTML no título                  | Renderiza como texto, sem executar elementos ou scripts.                                                   |
| Coleção vazia                                | Exibe convite para criar o primeiro chamado e contadores com zero.                                         |
| Sessão expirada (`401`)                      | Remove o acesso e os registros exibidos; permite reconectar.                                               |
| Encerrar sessão                              | Limpa token e registros da memória da interface.                                                           |
| Desktop e celular                            | Sem transbordamento horizontal da página em 1440 px e 390 px; formulário utilizável e fechável com Escape. |

Resultado: **19 requisições à API simulada, nenhum erro de execução JavaScript e nenhuma falha de carregamento dos recursos externos**. As telas foram inspecionadas visualmente. No celular, a lista usa cartões com as ações de consulta, edição e exclusão visíveis.

## Atualização: token configurado em `js/api.js`

O formulário de token e as ações de conectar e encerrar sessão foram removidos. A configuração agora é feita uma vez na constante `API_TOKEN`; a aplicação consulta os chamados automaticamente a cada abertura ou recarregamento da página.

O cliente valida o formato do token antes de fazer requisições. Um erro `401` limpa os registros exibidos e informa um problema de acesso, com orientação para procurar o suporte, sem solicitar credenciais pela interface. As instruções de configuração de `API_TOKEN` ficam no README. Os 22 testes automatizados foram atualizados para essa configuração.

Verificado no Chrome com API simulada: ausência de formulário de credencial, carregamento automático com Bearer, configuração ausente ou malformada sem requisições, erro `401` e nova tentativa. Nenhum erro de execução JavaScript.

Após a revisão dos textos para o usuário final, os 22 testes foram executados novamente e aprovados. A ajuda passou a orientar abertura e acompanhamento de chamados; referências ao professor, configuração de credenciais, caminhos de arquivos e detalhes HTTP foram retiradas das mensagens da interface.

## Atualização: menu e filtros por categoria

A barra lateral foi reorganizada com grupos de chamados e categorias, contadores alinhados, ajuda compacta e indicação de acesso. Os filtros de categoria do menu e da lista ficam sincronizados e são combinados com status, prioridade e busca. A lista exibe os filtros ativos e permite remover somente a categoria ou limpar todos os critérios.

Verificação: **24 testes automatizados aprovados** e ciclo de chamados no Chrome com **18 requisições à API simulada**, sem erros de execução JavaScript. Foram conferidos seleção e remoção das quatro categorias, sincronização dos controles, interseção dos quatro filtros, contadores da coleção completa e limpeza parcial e total, sem requisições adicionais à API.

As telas foram inspecionadas em larguras de **1440, 1024, 390 e 320 pixels**, incluindo acesso às categorias e à ajuda com altura de 600 pixels. Não houve transbordamento horizontal da página ou corte dos controles do menu.

## Atualização: configuração local fora do Git

A URL e o token existentes foram transferidos para `js/config.local.js`, ignorado pelo Git e carregado antes de `js/api.js`. O arquivo `js/config.example.js` contém somente as constantes com valores vazios. O cliente verifica se a configuração está presente antes de enviar requisições.

Resultado: **26 testes automatizados aprovados**, incluindo configuração ausente e URL inválida. O Git confirmou a regra de exclusão do arquivo local. O `.gitignore` controla o versionamento; a configuração do frontend continua acessível pelo navegador.

## Integração real pendente

A simplificação dos arquivos JavaScript preservou os comportamentos verificados: os **22 testes automatizados passaram** e uma nova execução no Chrome realizou **18 requisições à API simulada**, cobrindo carregamento automático, criação, consulta, edição, exclusão, filtros, falhas e uso pelo teclado. Nenhum erro de execução JavaScript ou falha de carregamento dos recursos externos foi registrado.

Para concluir a validação com o serviço fornecido pelo professor, ainda é necessário:

- Conferir `API_URL` e `API_TOKEN` no arquivo `js/config.local.js` e confirmar a autenticação.
- Confirmar CORS na origem usada para servir a página.
- Executar o ciclo de criação, consulta, edição e exclusão de um chamado de teste autorizado.
- Confirmar a aceitação de descrição vazia como string e o formato das datas retornadas.

O frontend utiliza a rota de criação padronizada no PRD: `POST /api/central-chamados/chamados`.
