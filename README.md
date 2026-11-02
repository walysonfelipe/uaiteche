# UaiTeche · Central de Chamados

Central web para **abrir, acompanhar e resolver chamados de suporte técnico**. É um frontend estático em HTML, CSS e JavaScript puro que consome uma API REST de chamados, conforme o [PRD](docs/prd.md).

<p align="center">
  <img src="https://github.com/walysonfelipe/uaiteche/blob/main/assets/uaiteche-promo-leve.gif?raw=true" alt="Demonstração da UaiTeche: painel de chamados, filtros, criação, edição e exclusão" width="720" />
</p>

<p align="center"><em>Menos imprevistos. Mais soluções.</em></p>

> A demonstração foi gravada no navegador com Playwright e uma API simulada. Nenhum dado real foi criado, alterado ou excluído.

---

## Sumário

- [O que foi feito](#o-que-foi-feito)
- [Funcionalidades](#funcionalidades)
- [Como executar](#como-executar)
- [Conectar à API](#conectar-à-api)
- [Stack](#stack)
- [Organização do código](#organização-do-código)
- [Decisões de implementação](#decisões-de-implementação)
- [Experiência no celular](#experiência-no-celular)
- [Validação](#validação)
- [Créditos](#créditos)

---

## O que foi feito

O projeto entrega o ciclo completo de um chamado de suporte, pensado para o usuário autenticado:

1. **Abrir:** um formulário curto, com validação antes do envio, registra o problema.
2. **Acompanhar:** um painel mostra quantos chamados estão abertos, em andamento e concluídos. Filtros combinados ajudam a localizar qualquer registro.
3. **Atualizar:** é possível consultar os detalhes e editar título, descrição, categoria, prioridade e status.
4. **Excluir:** a remoção pede confirmação explícita, porque não pode ser desfeita.

O projeto inclui ainda:

- identidade visual própria, com logo animada e tela de abertura;
- layout dedicado para celular;
- tratamento de erros da API com mensagens claras;
- testes automatizados das regras e do cliente HTTP.

Não é preciso instalar dependências nem executar build.

## Funcionalidades

| Área | O que o usuário pode fazer |
| --- | --- |
| **Painel** | Ver o total de chamados e a contagem por status; clicar em um card para filtrar a lista |
| **Lista** | Ver título, número, categoria, prioridade, status e datas de criação e atualização |
| **Busca e filtros** | Buscar pelo título e filtrar por categoria, status e prioridade, tudo combinado no navegador; os filtros ativos aparecem em etiquetas e podem ser limpos juntos |
| **Categorias** | Filtrar por Hardware, Software, Rede ou Outro pelo menu lateral, sincronizado com o seletor da lista; clicar de novo na mesma categoria remove o filtro |
| **Novo chamado** | Preencher título (até 150 caracteres), descrição opcional (até 2000), categoria e prioridade, com contadores e erros por campo |
| **Detalhes e edição** | Consultar um chamado e passar para a edição no mesmo diálogo, ou editar direto pela lista |
| **Exclusão** | Confirmar a exclusão em um diálogo que mostra o chamado afetado; Esc cancela, Tab alterna os botões e Enter confirma |
| **Estados da tela** | Carregamento, lista vazia, nenhum resultado nos filtros, erro de conexão, acesso indisponível e resultado incerto após falha de rede |
| **Ajuda** | Ver um guia rápido de como abrir e acompanhar chamados |

## Como executar

Na raiz do projeto:

```sh
python3 -m http.server 5500 --bind 127.0.0.1
```

Acesse [http://localhost:5500](http://localhost:5500). Também é possível usar o Live Server do VS Code.

É necessário acesso à internet para carregar as fontes, os ícones, o Tailwind CSS e o Notiflix pelos CDNs, além de consumir a API.

### Tela de abertura

- **Duração:** a logo animada aparece por 30 segundos na primeira visita e por 10 segundos nas visitas e atualizações seguintes. A primeira visita fica registrada no `localStorage`; limpar os dados do site volta a mostrar a abertura de 30 segundos.
- **Animação da logo:** na abertura, o loop é rápido, de 1,5 segundo. No menu lateral e no cabeçalho do celular, o ciclo dura 3 segundos, com a mesma velocidade de movimento e uma pausa menor entre as repetições.
- **Carregamento:** os chamados carregam em segundo plano, e a interface é liberada sozinha ao fim da abertura.
- **Movimento reduzido:** com essa preferência ativa no sistema, as animações são desligadas, mas os tempos de abertura continuam os mesmos.

## Conectar à API

1. Crie o arquivo de configuração local a partir do exemplo:

   ```sh
   cp -n js/config.example.js js/config.local.js
   ```

2. Abra `js/config.local.js` e preencha:
   - `API_URL`: a URL completa da coleção de chamados.
   - `API_TOKEN`: o seu token de 64 caracteres hexadecimais, sem o prefixo `Bearer`.

   ```js
   const API_URL = ""; // URL completa da coleção de chamados
   const API_TOKEN = ""; // Token de acesso, sem "Bearer"
   ```

3. Salve o arquivo e abra ou recarregue a página. Os chamados carregam automaticamente, sem pedir o token na interface.

### Contrato utilizado

| Operação | Método | Rota | Resposta esperada |
| --- | --- | --- | --- |
| Listar chamados | `GET` | `API_URL` | `200` com `{ dados: [...] }` |
| Consultar chamado | `GET` | `API_URL/{id}` | `200` com `{ dados: {...} }` |
| Criar chamado | `POST` | `API_URL` | `201`; o status é omitido no envio |
| Atualizar chamado | `PUT` | `API_URL/{id}` | `200`; envia os cinco campos editáveis |
| Excluir chamado | `DELETE` | `API_URL/{id}` | `204`, sem leitura de JSON |

Todas as requisições enviam `Authorization: Bearer <token>`. `POST` e `PUT` enviam JSON.

O cliente também:

- valida a estrutura de cada resposta;
- traduz os erros `400`, `401`, `404`, `405`, `413`, `415`, `422` e `500` em mensagens amigáveis;
- mostra erros por campo vindos da API;
- interrompe consultas que passam de 20 segundos;
- bloqueia envios acima de 16 KiB.

### Segurança da configuração

- `js/config.local.js` é ignorado pelo Git. Só `js/config.example.js`, com os valores vazios, deve ser versionado.
- A URL e o token não ficam em cookies, `localStorage` ou `sessionStorage`. O `localStorage` guarda apenas o indicador de primeira visita da abertura.
- Como todo JavaScript de frontend, o arquivo de configuração continua acessível a quem usa o navegador.
- Se a API recusar o acesso, revise a configuração local e recarregue a página.

## Stack

- **HTML, CSS e JavaScript puro**, sem framework nem bundler.
- **Tailwind CSS 4** via CDN, junto com CSS próprio para a identidade visual.
- **Solar Icons** pelo componente web do Iconify, via CDN.
- **Notiflix** (`notiflix-aio-3.2.8`) via CDN, para notificações, carregamento e confirmação de exclusão.
- **Fontes:** DM Sans e Manrope, pelo Google Fonts.

## Organização do código

```text
index.html                    Estrutura da interface e dos diálogos
css/styles.css                Estilos e layouts responsivos
css/mobile.css                Barra inferior e bottom sheets do celular (até 760px)
css/mobile-content.css        Apresentação, filtros, cartões e formulários do celular
js/config.example.js          Exemplo de configuração com valores vazios
js/config.local.js            URL e token locais (ignorado pelo Git)
js/api.js                     Cliente HTTP, autenticação e tratamento das respostas
js/tickets.js                 Validação, filtros, contagem e apresentação de datas
js/app.js                     Estado da página, DOM e ações do usuário
js/abertura.js                Abertura de 30 ou 10 segundos e contador de progresso
js/mobile.js                  Navegação mobile, foco do menu e filtros recolhíveis
assets/favicon.svg            Ícone da aplicação
assets/uaiteche-promo-leve.gif Demonstração em GIF (30 s, 640px)
docs/                         Contexto, contrato da API, PRD e validação
tests/core.test.cjs           Testes das regras e do cliente HTTP
```

Os scripts são carregados em ordem no HTML:

1. `config.local.js` define a URL e o token.
2. `api.js` faz as requisições.
3. `tickets.js` reúne as regras dos chamados.
4. `app.js` conecta essas funções aos elementos da página.
5. `mobile.js` complementa a navegação no celular.

## Decisões de implementação

- **Código simples e legível:** funções comuns, arrays e objetos simples, com as ações principais nomeadas em português. Não há classes próprias, herança nem módulos autoexecutáveis.
- **Filtros no navegador:** categoria, status, prioridade e título são combinados no cliente, sem novas requisições. As contagens do resumo e das categorias sempre consideram a lista completa.
- **Fidelidade aos dados:** a ordem dos registros recebida da API é mantida. As datas aparecem sem atribuir um fuso que o contrato não informa.
- **Segurança na exibição:** os dados recebidos são inseridos como texto (`textContent`), nunca como HTML.
- **Escritas incertas:** se a rede falhar depois de um envio, a interface avisa que o resultado é incerto e oferece consultar a lista antes de repetir a ação.
- **Exclusão:** usa diretamente os callbacks de confirmação e de cancelamento do Notiflix.
- **Acessibilidade:** os diálogos são nativos (`<dialog>`) e o foco volta ao ponto de origem ao fechar. Há anúncios para leitores de tela e botões com rótulos descritivos.

## Experiência no celular

Até 760 pixels, a interface muda para um layout próprio. As folhas de estilo mobile só se aplicam nessa faixa, então o layout de telas maiores não muda.

- **Barra inferior** com quatro opções: Chamados, Novo chamado, Filtros e Perfil.
- **Filtros** sobem pelo rodapé como um bottom sheet, com status e categorias com ícones em duas colunas.
- **Perfil** abre um painel separado com Felipe Maciel, Proprietário, e um atalho para os chamados. O botão mostra o avatar FM e o primeiro nome.
- **Cartões de chamado** mostram número e status no topo, título em destaque, categoria e prioridade agrupadas, datas em linhas separadas e a ação Ver detalhes. Editar e Excluir ficam no menu Opções.
- **Formulários** ocupam a tela inteira.
- **Apresentação compacta:** a logo fica menor e a ajuda vira um ícone com área de toque de 44 pixels. A saudação separa "Olá" do nome, e o texto de apoio passa a ser "Abra e acompanhe seus chamados".

No desktop, a página começa com a saudação "Olá, Felipe Maciel", com o nome em verde, e com as ações Ajuda e Novo chamado. Não há barra de cabeçalho nem breadcrumb separados.

## Validação

Os testes de integração HTTP simulada e das regras locais rodam com Node.js 20 ou superior:

```sh
node --test tests/core.test.cjs
```

Resultado atual: **26 testes aprovados**. Eles cobrem:

- autenticação e montagem das URLs;
- os códigos `201` e `204`;
- erros HTTP e erros por campo;
- falha de rede e respostas malformadas;
- o limite de 16 KiB;
- filtros, contagens, limites dos campos e formatação de datas.

O Node.js só é necessário para esses testes. O frontend é servido diretamente, sem dependências de runtime nem build.

Os cenários de aceite estão no [PRD](docs/prd.md). A integração real exige um token válido e que a API permita, por CORS, a origem usada para servir o frontend. As verificações com API simulada e suas limitações estão em [docs/validation.md](docs/validation.md).

## Créditos

- [Solar Icons](https://icon-sets.iconify.design/solar/) por 480 Design, licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Fontes DM Sans e Manrope servidas pelo Google Fonts.
