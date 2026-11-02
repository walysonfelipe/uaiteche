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

## Abertura animada

Verificado no Chrome com API simulada: logo e letras com loop de 1,5 segundo, menu com ciclo de 6 segundos, central sem interação durante a abertura e dados carregados em segundo plano. Na primeira visita, a liberação ocorreu após 30.032 ms; na próxima atualização, após 10.009 ms. O contador e a barra de progresso se ajustaram à duração de cada visita. Uma nova aba manteve os 10 segundos; limpar o indicador de primeira visita no `localStorage` restaurou os 30 segundos. O layout foi conferido em 320 pixels e a preferência de movimento reduzido foi respeitada. Nenhum erro de execução JavaScript foi registrado.

## Layout mobile e preservação do desktop

Verificado no Chrome com Playwright e API simulada. Os **26 testes automatizados passaram**. A implementação mobile foi dividida em navegação, cabeçalho/resumo/filtros e cartões/formulários; os estilos adicionais são aplicados somente até 760 pixels.

- Desktop em 1440 pixels: comparação das posições e dimensões do menu, cabeçalho, resumo, painel e filtros com e sem os elementos exclusivos do celular, sem mudanças na geometria.
- Celular em 320, 360, 390, 430 e 760 pixels: barra inferior visível, cartões com criação e atualização, filtros combinados recolhíveis e ausência de transbordamento horizontal.
- Menu: quatro categorias com ícones, perfil Felipe Maciel / Proprietário no rodapé, foco contido, fechamento por botão, fundo, Escape e seleção de filtro. Em 320 × 568 pixels, o perfil permaneceu inteiramente visível e as categorias puderam rolar.
- Cabeçalho mobile: logo com três camadas do SVG e oito letras animadas em loop, oculta no desktop e sem animação com a preferência de movimento reduzido.
- Formulário em tela cheia: criação, consulta, edição, preservação dos dados após erro `422`, atualização das datas, cancelamento e confirmação de exclusão. O retorno ao desktop não deixou o conteúdo bloqueado.

Nenhum erro de execução JavaScript registrado. As telas de cartões, menu e formulário foram inspecionadas visualmente. As operações usaram dados fictícios; não foram gravados registros na API real.

## Atualização: quatro opções e bottom sheets no mobile

A barra inferior passou a ter Chamados, Novo chamado, Filtros e Perfil. Filtros abre um bottom sheet pela parte inferior, com cantos arredondados e opções em duas colunas. Perfil abre um painel próprio com Felipe Maciel, Proprietário, e a ação Ver meus chamados. O menu lateral do desktop mantém sua apresentação.

Verificado no Chrome com API simulada: quatro botões na barra, filtros sincronizados, painéis contidos na tela, foco contido, retorno do foco ao fechar, fechamento por botão/fundo/Escape e uso em 320 × 568, 390 × 844 e 760 × 850 pixels. A troca para desktop com o perfil aberto ocultou o painel e liberou a página. O fluxo de criação, consulta, edição, erro `422` e exclusão continuou funcionando. Nenhum erro JavaScript foi registrado. As telas dos dois painéis foram inspecionadas visualmente. A troca final do rótulo Menu para Filtros foi conferida no HTML e afeta somente os controles mobile.

## Atualização: leitura dos cartões no celular

Os cartões mobile passaram a apresentar número e status no topo, título em destaque, categoria e prioridade identificadas na mesma linha, datas em linhas próprias e a ação principal Ver detalhes no rodapé. As ações Editar chamado e Excluir chamado ficam em Opções, com texto e ícone. A tabela e os botões do desktop foram preservados.

Verificado no Chrome com API simulada: ordem visual dos elementos, leitura das duas datas, acesso aos detalhes, edição, erro `422`, cancelamento e confirmação de exclusão, abertura de uma opção por vez e fechamento por Escape/clique externo. Os cartões foram conferidos de 320 a 760 pixels sem transbordamento horizontal. As telas com opções fechadas e abertas foram inspecionadas visualmente. Uma conferência adicional confirmou o retorno do foco a Opções ao fechar a edição ou cancelar a exclusão, sem enviar gravações. Nenhum erro JavaScript foi registrado.

## Ajuste da pausa entre animações da logo

Verificado no Chrome: menu e cabeçalho usam ciclos de 3 segundos, preservando os tempos originais dos movimentos do SVG e das letras. Os keyframes foram redistribuídos para reduzir apenas a pausa entre repetições. A abertura mantém seu loop rápido de 1,5 segundo. Conferidos os estados de início, pico e fim dos movimentos e a preferência de movimento reduzido.

## Confirmação de exclusão na paleta do site

A confirmação do Notiflix passou a usar fundo branco, verde oliva, tipografia e bordas coerentes com os demais diálogos. O número e o título do chamado aparecem em uma área própria; o aviso de exclusão permanente permanece visível. Cancelar fica à esquerda e Excluir chamado à direita. O conteúdo se adapta a telas pequenas e títulos longos.

Verificado no Chrome com API simulada em 1440, 390 e 320 × 568 pixels: cores, dimensões, ordem dos botões, texto de até 150 caracteres, ausência de transbordamento, foco inicial em Cancelar e navegação por Tab/Shift+Tab. Escape, espaço e o botão Cancelar não enviaram DELETE. Confirmar enviou exatamente um DELETE e atualizou a lista após `204`. Nenhum erro JavaScript registrado; as telas foram inspecionadas visualmente.

## Apresentação unificada da página

A barra superior e o breadcrumb foram removidos. A apresentação agora reúne a saudação Olá, Felipe Maciel, com o nome em verde de destaque, o contexto da página e as ações Ajuda/Novo chamado. No mobile, a logo animada integra a apresentação e a abertura de chamados continua na barra inferior.

Verificado no Chrome com API simulada de 320 a 1920 pixels: saudação legível sem cortes, nome destacado, ausência de transbordamento horizontal e apenas um botão Ajuda. Conferidos abertura/fechamento da ajuda e do formulário, retorno do foco, filtros por categoria e painel do perfil. As telas desktop e mobile foram inspecionadas visualmente. Nenhuma requisição de escrita ou erro JavaScript registrado.

## Apresentação própria para celular

O topo mobile foi reorganizado com logo menor, ajuda sem caixa ao redor do ícone, Olá em tamanho discreto, nome destacado na linha seguinte e o texto Abra e acompanhe seus chamados. A área de toque da ajuda mantém pelo menos 44 × 44 pixels. O desktop conserva a saudação e o contexto completos.

Conferido no Chrome de 320 a 1920 pixels, com API simulada: alternância correta dos textos e estilos mobile/desktop, saudação sem cortes, ausência de transbordamento, ajuda, abertura de chamado, filtros e perfil acessíveis. As telas de 390 e 320 pixels foram inspecionadas visualmente. Nenhuma escrita na API ou erro JavaScript registrado.

## Ilustração animada dos estados vazios

A linha pontilhada e os pontos giram juntos em uma órbita de 12 segundos. O cartão central flutua, o ícone respira, o halo pulsa e o selo balança em ciclos coordenados de 4,8 segundos. As animações usam CSS, sem alterar o espaço da ilustração ou mover o texto.

Verificado no Chrome com coleção vazia simulada: movimento da órbita, centro, selo e halo, continuidade dos ciclos e posição estável do texto. Conferidos desktop e celulares de 390 e 320 pixels, sem transbordamento. A preferência de movimento reduzido desativou todas as animações da ilustração. Nenhum erro JavaScript ou requisição de escrita registrado.

## Integração real pendente

A simplificação dos arquivos JavaScript preservou os comportamentos verificados: os **22 testes automatizados passaram** e uma nova execução no Chrome realizou **18 requisições à API simulada**, cobrindo carregamento automático, criação, consulta, edição, exclusão, filtros, falhas e uso pelo teclado. Nenhum erro de execução JavaScript ou falha de carregamento dos recursos externos foi registrado.

Para concluir a validação com o serviço fornecido pelo professor, ainda é necessário:

- Conferir `API_URL` e `API_TOKEN` no arquivo `js/config.local.js` e confirmar a autenticação.
- Confirmar CORS na origem usada para servir a página.
- Executar o ciclo de criação, consulta, edição e exclusão de um chamado de teste autorizado.
- Confirmar a aceitação de descrição vazia como string e o formato das datas retornadas.

O frontend utiliza a rota de criação padronizada no PRD: `POST /api/central-chamados/chamados`.
