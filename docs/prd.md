# PRD — Central de Chamados de Suporte Técnico

**Versão:** 1.0  
**Data:** 02/11/2026  
**Status:** requisitos consolidados para orientar a implementação da atividade.

## 1. Fontes e interpretação

Este documento consolida os requisitos de [context.md](./context.md), o contrato de integração de [contrato.pdf](./contrato.pdf) e as definições técnicas do responsável pelo projeto. Não representa uma aplicação implementada nem uma integração já validada.

Referências utilizadas:

- **C:** contexto da atividade, objetivo, funcionalidades esperadas e campos do chamado.
- **A1:** contrato da API, página 1: URL, autenticação, rotas, listagem e consulta individual.
- **A2:** contrato da API, página 2: criação, atualização, exclusão, valores aceitos, validações e erros.
- **D:** definições do responsável pelo projeto: usar somente HTML, CSS e JavaScript puro, com Tailwind CSS, Solar Icons e Notiflix via CDN.

Os requisitos obrigatórios abaixo derivam dessas fontes. Decisões de interface, critérios complementares de qualidade e pontos que dependem de confirmação estão identificados separadamente.

## 2. Problema e objetivo

Uma empresa precisa organizar as solicitações de suporte técnico. O usuário deve conseguir registrar uma necessidade, acompanhar seu andamento e manter seus chamados atualizados em uma interface web.

O objetivo da atividade é desenvolver individualmente o **frontend somente em HTML, CSS e JavaScript puro**, com **Tailwind CSS, Solar Icons e Notiflix via CDN**, consumindo a API REST fornecida pelo professor por meio de `fetch`. A entrega deve demonstrar envio e interpretação de JSON, tratamento de respostas HTTP e apresentação dos chamados do usuário autenticado. [C, D]

O produto será considerado funcional quando o usuário conseguir realizar o ciclo completo de cadastro, consulta, edição e exclusão, além de localizar chamados por status, prioridade e título, com retorno claro sobre carregamento, sucesso e falha.

## 3. Público e responsabilidades

| Papel | Necessidade ou responsabilidade |
| --- | --- |
| Usuário autenticado | Registrar, consultar e gerenciar os próprios chamados. |
| Estudante | Desenvolver a interface e sua integração com a API. |
| Professor / responsável pela API | Disponibilizar a API e informar o token de acesso do usuário. |

O contrato não define perfis administrativos ou de atendente. O escopo contempla somente os recursos disponíveis para o usuário autenticado. [C, A1]

## 4. Escopo da entrega

### 4.1. Obrigatório

- Consumir a API com `fetch` e enviar o token em todas as requisições.
- Listar e consultar os chamados do usuário autenticado.
- Criar chamados com título, descrição, categoria e prioridade.
- Editar título, descrição, categoria, prioridade e status.
- Excluir chamados mediante confirmação.
- Filtrar a lista por status e por prioridade.
- Pesquisar chamados pelo título.
- Apresentar mensagens de carregamento, sucesso e erro.
- Organizar a interface em HTML, CSS e JavaScript puro, com Tailwind CSS, Solar Icons e Notiflix carregados via CDN, conforme a seção 4.3. [D]

### 4.2. Fora do escopo desta atividade

Não estão previstos nas fontes: desenvolvimento de backend ou banco de dados, cadastro de usuários, login com senha, recuperação de acesso, painel administrativo, atribuição de técnicos, comentários, anexos, relatórios, notificações por e-mail, SLA ou atualização em tempo real.

Embora o contexto permita bibliotecas visuais opcionais, este projeto adota obrigatoriamente Tailwind CSS, Solar Icons e Notiflix via CDN. Não utilizar frameworks de aplicação, como React, Vue ou Angular, nem substituir a stack definida por Bootstrap, Materialize, Bulma, Semantic UI ou SweetAlert2. [C, D]

### 4.3. Stack e carregamento das dependências [D]

A aplicação deve funcionar como frontend estático, com arquivos HTML, CSS e JavaScript executados diretamente no navegador, sem exigir instalação de pacotes, bundler, transpilações ou etapa de build. A lógica, os eventos, a manipulação do DOM e as requisições com `fetch` devem ser implementados em JavaScript puro.

| Tecnologia | Uso obrigatório | Carregamento |
| --- | --- | --- |
| HTML | Estrutura semântica, formulários e conteúdo. | Arquivos locais `.html`. |
| CSS e Tailwind CSS | Estilização e responsividade com classes utilitárias; CSS próprio para ajustes necessários. | CSS local e Tailwind CSS via CDN. |
| JavaScript puro | Integração com a API, validação, filtros, eventos e atualização da interface. | Arquivos locais `.js`. |
| Solar Icons | Ícones da interface, usando a coleção `solar` pelo componente web do Iconify. | Iconify via CDN, com ícones identificados por `solar:...`. |
| Notiflix | Notificações de sucesso e erro, indicadores de carregamento e confirmação de exclusão. | CDN obrigatório informado abaixo. |

Scripts de referência para inclusão no HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/notiflix@3/dist/notiflix-aio-3.2.8.min.js" defer></script>
```

Referências de integração: [Tailwind CSS via CDN](https://tailwindcss.com/docs/installation/play-cdn), [componente web do Iconify](https://iconify.design/docs/iconify-icon/) e [coleção Solar Icons](https://icon-sets.iconify.design/solar/).

Os scripts próprios que utilizarem Iconify ou Notiflix devem ser carregados após essas dependências, respeitando a ordem de execução. A confirmação de exclusão deve executar `DELETE` somente após a confirmação do usuário no Notiflix. As mensagens de validação por campo e os estados de lista vazia devem permanecer visíveis na própria interface. Ícones devem acompanhar rótulos ou possuir nome acessível quando usados isoladamente.

## 5. Jornadas e organização da interface

A organização a seguir é uma **proposta de produto**; as fontes não exigem páginas ou componentes específicos.

| Área | Conteúdo e ações |
| --- | --- |
| Acesso à API | Disponibilização do token fornecido pelo professor e orientação em caso de credencial inválida. Não pressupõe endpoint de login. |
| Meus chamados | Lista, pesquisa por título, filtros por status e prioridade, ação de novo chamado e acesso aos detalhes. |
| Novo chamado | Formulário com título, descrição, categoria e prioridade; ações de salvar e cancelar. |
| Detalhes / edição | Consulta de um chamado e edição dos cinco campos editáveis, incluindo status. |
| Confirmação de exclusão | Identificação do chamado e ações explícitas de confirmar ou cancelar. |

As áreas podem ser implementadas em uma única página, com seções ou modais.

Fluxos esperados:

1. Com um token disponível, o usuário acessa a lista e recebe os próprios chamados ou uma mensagem de lista vazia.
2. Ao criar um chamado válido, recebe confirmação e consegue localizar o registro criado.
3. Ao abrir um chamado, visualiza seus dados atuais, pode alterá-los e confirmar a atualização.
4. Ao solicitar exclusão, confirma a ação antes de qualquer requisição de remoção.
5. Ao pesquisar ou aplicar filtros, visualiza os resultados correspondentes e pode limpar os critérios.

## 6. Requisitos funcionais e critérios de aceite

Todos os requisitos desta seção são necessários à entrega. Os comportamentos adicionais definidos para tornar os critérios verificáveis estão indicados como decisões de produto.

### RF-01 — Autenticar as requisições [A1, A2]

- Toda requisição deve enviar `Authorization: Bearer <token>`.
- O token é fornecido pelo professor e possui 64 caracteres hexadecimais.
- A aplicação deve usar o mesmo mecanismo de autenticação nas cinco operações da API.
- Uma resposta `401` deve gerar uma mensagem clara sobre o problema de autenticação, sem apresentar a operação como concluída.

**Decisão de implementação:** permitir disponibilizar ou informar o token sem versionar a credencial real no repositório. Não existe fluxo de obtenção de token documentado na API.

### RF-02 — Listar chamados [C, A1]

- Consultar a coleção via `GET` e ler o array de `dados`.
- Exibir somente os registros retornados pela API para o token utilizado.
- Preservar a ordem recebida: criação mais recente primeiro.
- Tratar `{"dados": []}` como sucesso sem registros.
- Disponibilizar ações para consultar, editar e excluir um chamado.

**Decisão de produto:** apresentar na lista, no mínimo, título, categoria, prioridade e status; distinguir lista vazia de falha de carregamento e de pesquisa sem resultados.

### RF-03 — Criar chamado [C, A2]

- Disponibilizar formulário com título, descrição, categoria e prioridade.
- Validar os limites e valores descritos na seção 7 antes do envio.
- Enviar um objeto JSON via `POST`, com `Content-Type: application/json`.
- Omitir `status` no cadastro para que a API atribua `aberto`.
- Reconhecer `201` como sucesso e utilizar o chamado retornado em `dados` ou recarregar a lista.
- Exibir confirmação e atualizar a interface somente após sucesso da API.

**Decisão de produto:** categoria e prioridade terão seleção explícita de um valor válido; a descrição poderá ficar vazia. Não incluir seleção de status no cadastro.

### RF-04 — Consultar um chamado [C, A1]

- Consultar `GET` com o identificador do chamado e ler o objeto em `dados`.
- Apresentar título, descrição, categoria, prioridade e status do registro recebido.
- Tratar `404` como chamado não encontrado ou indisponível para o usuário atual.

**Decisão de produto:** exibir também identificador e datas de criação e atualização; representar descrição vazia de forma compreensível.

### RF-05 — Editar chamado [C, A2]

- Preencher o formulário com os dados do chamado consultado.
- Permitir alterar título, descrição, categoria, prioridade e status.
- Enviar os **cinco campos editáveis** via `PUT`, inclusive os que não foram alterados, pois a operação substitui esses campos.
- Não enviar `id`, `criado_em`, `atualizado_em` ou outros campos não previstos no corpo editável.
- Reconhecer `200` e o registro em `dados` como sucesso; atualizar os dados exibidos.
- Em caso de `404`, informar a indisponibilidade do registro sem tentar criá-lo automaticamente.

O contrato não estabelece uma sequência obrigatória de transições de status. A interface permitirá escolher qualquer um dos três valores aceitos, sem inventar restrições adicionais.

### RF-06 — Excluir chamado com confirmação [C, A2]

- Solicitar confirmação antes de executar `DELETE`.
- Cancelar a confirmação não deve enviar a requisição.
- Após confirmação, enviar a requisição com o identificador correto.
- Reconhecer `204` como sucesso e remover o item da interface ou recarregar a lista.
- **Não chamar `response.json()` em uma resposta `204`**, pois não existe corpo.
- Tratar `404` quando o chamado já tiver sido excluído ou estiver indisponível.

### RF-07 — Filtrar por status e prioridade [C]

- Oferecer filtros para os três status e para as três prioridades aceitas pela API.
- Permitir remover cada filtro para voltar a considerar todos os valores.
- Mostrar mensagem quando nenhum chamado corresponder aos critérios.

**Decisão de produto:** aplicar status e prioridade conjuntamente, com lógica de interseção: o registro precisa atender a todos os critérios ativos.

### RF-08 — Pesquisar por título [C]

- Disponibilizar pesquisa sobre o campo `titulo`.
- Limpar a pesquisa deve restaurar os resultados dos demais filtros ativos.

**Decisão de produto:** pesquisar por trecho do título, ignorar diferenças entre maiúsculas e minúsculas e espaços nas extremidades do termo. Combinar a pesquisa com os filtros de status e prioridade.

**Decisão de integração para RF-07 e RF-08:** realizar filtros e pesquisa no frontend sobre o array recebido. O contrato não documenta parâmetros de busca, filtros ou paginação; não pressupor que a API os aceite.

### RF-09 — Comunicar o estado das operações [C, A2]

- Apresentar carregamento durante consultas e operações de gravação.
- Apresentar confirmação após criação, edição e exclusão bem-sucedidas.
- Apresentar mensagens de falha de rede, autenticação, validação e erro HTTP.
- Interpretar `erro.mensagem` e, quando presente, associar `erro.campos` aos campos do formulário.
- Não apresentar sucesso em resposta HTTP de erro.

**Decisões de produto:** desabilitar o envio enquanto a operação estiver pendente, preservar os dados digitados em falhas e oferecer uma forma de tentar novamente. Uma falha de rede após envio não comprova que a gravação falhou; permitir consultar a lista antes de repetir a operação.

## 7. Dados e regras de negócio

| Campo | Regra | Criação | Edição |
| --- | --- | --- | --- |
| `titulo` | Obrigatório, entre 1 e 150 caracteres. | Enviar. | Enviar. |
| `descricao` | Opcional, até 2000 caracteres. | Pode ficar vazia. | Enviar o campo, mesmo sem alteração. |
| `categoria` | `hardware`, `software`, `rede` ou `outro`. | Selecionar e enviar valor válido. | Enviar valor válido. |
| `prioridade` | `baixa`, `media` ou `alta`. | Selecionar e enviar valor válido. | Enviar valor válido. |
| `status` | `aberto`, `em_andamento` ou `concluido`. | Omitir; a API assume `aberto`. | Enviar valor válido. |
| `id` | Identificador retornado pela API. | Não enviar no corpo. | Usar na URL, não no corpo. |
| `criado_em` | Data de criação retornada pela API. | Não enviar. | Não editar nem enviar. |
| `atualizado_em` | Data de atualização retornada pela API. | Não enviar. | Não editar nem enviar. |

Regras adicionais:

- A interface pode exibir “Média”, “Em andamento” e “Concluído”, mas deve enviar `media`, `em_andamento` e `concluido`. [C, A2]
- Campos desconhecidos são rejeitados; os corpos devem conter somente os campos previstos para a operação. [A2]
- O corpo da requisição deve respeitar o limite de **16 KiB**; limites de caracteres não equivalem a limites de bytes. [A2]
- A API limita as operações ao usuário autenticado. Um identificador inexistente ou pertencente a outro usuário resulta em `404` nas operações de consulta e manutenção do registro, conforme descrito no contrato. [A1, A2]
- **Decisão de produto:** rejeitar título composto apenas por espaços. A descrição vazia será representada inicialmente como string vazia no envio; confirmar esse comportamento na integração, pois o contrato não especifica a representação de ausência nem o uso de `null`.

## 8. Contrato de integração

### 8.1. URL e autenticação

A URL completa da coleção informada na primeira página é:

```js
const API_URL = "<URL informada no contrato>";
```

| Operação | Método | URL | Sucesso | Corpo de resposta |
| --- | --- | --- | --- | --- |
| Listar | `GET` | `API_URL` | `200` | `{"dados": [...]}` |
| Consultar | `GET` | `API_URL + "/" + id` | `200` | `{"dados": {...}}` |
| Criar | `POST` | `API_URL` | `201` | Registro criado em `dados`; cabeçalho `Location` com a URL. |
| Editar | `PUT` | `API_URL + "/" + id` | `200` | Registro atualizado em `dados`. |
| Excluir | `DELETE` | `API_URL + "/" + id` | `204` | Sem corpo. |

Todas as requisições devem conter `Authorization: Bearer <token>`. `POST` e `PUT` também devem conter `Content-Type: application/json`. Todas as respostas com corpo usam `application/json; charset=utf-8`. [A1, A2]

**Padrão de rotas:** todas as operações usam a coleção `/api/central-chamados/chamados`, incluindo a criação via `POST /api/central-chamados/chamados`. As operações sobre um chamado específico acrescentam `/{id}` à URL da coleção.

### 8.2. Exemplos de corpos de requisição

Criação:

```json
{
  "titulo": "Computador não liga",
  "descricao": "O computador do laboratório não inicia.",
  "categoria": "hardware",
  "prioridade": "alta"
}
```

Edição completa dos campos editáveis:

```json
{
  "titulo": "Computador não liga",
  "descricao": "Falha persiste após verificar a alimentação.",
  "categoria": "hardware",
  "prioridade": "alta",
  "status": "em_andamento"
}
```

### 8.3. Tratamento de erros

Formato documentado:

```json
{
  "erro": {
    "mensagem": "Verifique os dados do chamado.",
    "campos": {
      "titulo": "Informe um título com 1 a 150 caracteres."
    }
  }
}
```

| HTTP | Significado no contrato | Comportamento esperado da interface |
| --- | --- | --- |
| `400` | JSON inválido ou corpo que não seja objeto JSON. | Informar falha no envio e permitir correção da integração. |
| `401` | Token ausente, malformado ou não cadastrado. | Informar problema de autenticação e orientar a revisão do token. |
| `404` | Rota ou chamado inexistente, incluindo chamado de outro usuário. | Informar indisponibilidade; se aplicável, permitir voltar à lista e atualizá-la. |
| `405` | Método não aceito; `Allow` informa os métodos permitidos. | Informar falha na operação; revisar o método utilizado na integração. |
| `413` | Corpo acima de 16 KiB. | Informar que o conteúdo excede o limite aceito. |
| `415` | `POST`/`PUT` sem o tipo de conteúdo exigido. | Informar falha no envio; corrigir o cabeçalho da integração. |
| `422` | Campo obrigatório, valor ou campo desconhecido inválido. | Exibir a mensagem e os erros associados aos campos, quando disponíveis. |
| `500` | Falha interna; detalhes ficam no log do servidor. | Informar indisponibilidade e permitir nova tentativa, sem expor detalhes internos. |

A camada de integração deve verificar o status HTTP: uma promessa de `fetch` resolvida pode conter uma resposta de erro. Falhas de rede ou respostas sem o formato esperado devem receber uma mensagem compreensível. A interface deve encerrar o estado de carregamento em sucesso e falha. Esses comportamentos são critérios de implementação derivados do objetivo de tratar respostas HTTP. [C]

## 9. Critérios complementares de qualidade

Os itens abaixo são recomendações de implementação para tornar a interface organizada e utilizável; as fontes não determinam métricas de desempenho, navegadores mínimos ou certificações de acessibilidade.

- **Usabilidade:** usar rótulos em português, indicar campos obrigatórios e distinguir visualmente ações de salvar, cancelar e excluir.
- **Responsividade:** manter formulários, filtros e ações utilizáveis em telas de celular e computador.
- **Acessibilidade básica:** associar rótulos aos campos, permitir uso por teclado, manter foco compreensível e não depender somente de cores para comunicar status e erros.
- **Integridade visual:** atualizar a interface após confirmação da API; manter os critérios ativos ao recalcular a lista após alterações.
- **Segurança no frontend:** renderizar conteúdo dos chamados como texto, evitar execução de HTML inserido pelo usuário e não exibir ou registrar o token em mensagens de diagnóstico.
- **Manutenção:** centralizar URL e envio do token e separar responsabilidades de integração, validação, filtros e apresentação.
- **Credencial:** preferir uso do token em memória durante a sessão; caso outra persistência seja necessária, documentar a escolha. As fontes não exigem armazenamento persistente.

## 10. Validação da entrega

Os cenários abaixo formam um roteiro de aceite. Podem ser verificados manualmente; este PRD não impõe uma ferramenta de testes.

| Cenário | Resultado esperado | Requisitos |
| --- | --- | --- |
| Abrir a aplicação com token válido. | Consultar e apresentar os chamados desse usuário, na ordem recebida. | RF-01, RF-02 |
| Consultar usuário sem chamados. | Exibir estado vazio, sem mensagem de falha. | RF-02, RF-09 |
| Criar chamado válido com descrição vazia. | Receber `201`, mostrar sucesso e apresentar o chamado como aberto. Confirmar representação de descrição vazia na integração. | RF-03 |
| Enviar título vazio ou somente espaços; exceder 150 caracteres no título ou 2000 na descrição. | Mostrar validação e impedir o envio inválido. | RF-03, RF-05 |
| Abrir e editar um chamado, inclusive seu status. | Consultar o detalhe, enviar os cinco campos editáveis e refletir a resposta `200`. | RF-04, RF-05 |
| Cancelar a exclusão. | Manter o chamado e não enviar `DELETE`. | RF-06 |
| Confirmar a exclusão. | Receber `204`, atualizar a lista e não tentar interpretar JSON vazio. | RF-06 |
| Filtrar separadamente e combinar status, prioridade e trecho do título. | Mostrar somente registros que atendem a todos os critérios; limpar critérios restaura os resultados correspondentes. | RF-07, RF-08 |
| Buscar termo sem resultados. | Exibir mensagem específica e permitir limpar a busca. | RF-08, RF-09 |
| Receber `401`, `404` ou `422`. | Mostrar mensagem apropriada, incluindo erros por campo quando existentes. | RF-01, RF-04, RF-05, RF-06, RF-09 |
| Simular falha de rede ou `500`. | Encerrar carregamento, preservar dados digitados e permitir recuperação. | RF-09 |
| Repetir clique em salvar enquanto a operação está pendente. | Bloquear novos envios até finalizar a operação atual. | RF-09 |
| Inspecionar as requisições. | Confirmar `fetch`, token, métodos, JSON e cabeçalhos corretos; nenhum campo desconhecido enviado. | RF-01 a RF-06 |

Respostas difíceis de provocar, como `405`, `413` e `415`, podem ser verificadas com simulação controlada. O uso de simulações deve ser distinguido da validação da integração real.

Checklist de conclusão:

- [ ] Frontend estático desenvolvido somente em HTML, CSS e JavaScript puro com uso de `fetch`, sem exigir instalação de pacotes ou build.
- [ ] Tailwind CSS e Solar Icons via Iconify carregados por CDN e utilizados na interface.
- [ ] Notiflix carregado pelo CDN especificado e utilizado para notificações, carregamento e confirmação de exclusão.
- [ ] Token configurável e enviado em todas as operações.
- [ ] Listagem, consulta, criação, edição e exclusão funcionando com a API fornecida.
- [ ] Filtros de status e prioridade e pesquisa por título funcionando.
- [ ] Campos, valores, limites e envio completo no `PUT` respeitados.
- [ ] Estados de carregamento, sucesso, erro e ausência de resultados implementados.
- [ ] Exclusão com confirmação e tratamento de `204` sem leitura de JSON.
- [ ] Cenários de aceite executados, com registro de eventuais limitações.
- [ ] Instruções locais de execução e configuração documentadas, sem token real versionado.

O último item é uma recomendação de entrega para facilitar a avaliação, não uma exigência expressa nas fontes.

## 11. Dependências e pontos a confirmar

| Ponto | Situação e encaminhamento |
| --- | --- |
| Token do usuário | Deve ser fornecido pelo professor; não consta nos arquivos analisados. Necessário para validar a integração real. |
| Descrição vazia | O campo é opcional, mas o contrato não esclarece ausência, string vazia ou `null`. Confirmar o envio de string vazia e o formato retornado. |
| Acesso pelo navegador | CORS e suporte à origem local não são descritos. Validar a partir da origem usada para executar o frontend. |
| Datas | Os exemplos não contêm indicação de fuso horário. Não presumir conversão de fuso sem confirmação. |
| Busca e filtros | Não há parâmetros documentados; a decisão inicial é processar os registros recebidos no frontend. |
| Prazo e avaliação | As fontes não informam prazo, pesos de avaliação, hospedagem obrigatória ou formato de submissão. Confirmar nas orientações da disciplina. |

## 12. Sequência sugerida de implementação

1. Preparar os arquivos HTML, CSS e JavaScript puro, carregar Tailwind CSS, Solar Icons e Notiflix via CDN e configurar a URL da API e o mecanismo de disponibilização do token.
2. Implementar a camada de `fetch`, tratamento de JSON, erros HTTP e resposta `204`.
3. Entregar listagem, estados vazio/carregando/erro e consulta individual.
4. Implementar criação e edição com validação dos campos.
5. Implementar exclusão com confirmação.
6. Adicionar filtros combinados e pesquisa por título.
7. Revisar usabilidade, executar o roteiro de aceite e documentar a execução.

Essa sequência é uma proposta de organização do trabalho e não estabelece prazos adicionais para a atividade.
