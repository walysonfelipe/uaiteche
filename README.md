# UaiTeche · Central de Chamados

Frontend estático para registrar e acompanhar chamados de suporte técnico, conforme o [PRD](docs/prd.md).

## Executar

Na raiz do projeto:

```sh
python3 -m http.server 5500 --bind 127.0.0.1
```

Acesse [http://localhost:5500](http://localhost:5500). Também é possível usar o Live Server do VS Code. Não é necessário instalar pacotes nem executar build.

É necessário acesso à internet para carregar as fontes, os ícones, Tailwind CSS e Notiflix pelos CDNs, além de consumir a API.

## Conectar à API

1. Crie o arquivo de configuração local a partir do exemplo:

   ```sh
   cp -n js/config.example.js js/config.local.js
   ```

2. Abra `js/config.local.js` e preencha `API_URL` com a URL completa da coleção de chamados e `API_TOKEN` com seu token de 64 caracteres hexadecimais, sem o prefixo `Bearer`:

   ```js
   const API_URL = ""; // URL completa da coleção de chamados
   const API_TOKEN = ""; // Token de acesso, sem "Bearer"
   ```

3. Salve o arquivo e abra ou recarregue a página. A aplicação carrega os chamados automaticamente, sem solicitar o token pela interface.
4. Crie, consulte, edite e exclua os registros pela interface.

A URL e o token ficam em `js/config.local.js`, que é ignorado pelo Git. Apenas `js/config.example.js`, com os dois valores vazios, deve ser versionado. Não é usado armazenamento em cookies, `localStorage` ou `sessionStorage`. Se a API recusar o acesso, revise a configuração local e recarregue a página. O `.gitignore` evita o versionamento; como qualquer JavaScript do frontend, o arquivo continua acessível ao navegador.

Todas as operações usam `API_URL`, definida na configuração local. As operações individuais acrescentam `/{id}`. Todas enviam `Authorization: Bearer <token>`; POST e PUT enviam JSON. Exclusões com resposta `204` não são interpretadas como JSON.

## Stack

- HTML, CSS e JavaScript puro, sem framework ou bundler.
- Tailwind CSS 4 via CDN, com CSS próprio para a identidade visual.
- Solar Icons via componente web do Iconify, carregado por CDN.
- Notiflix via `https://cdn.jsdelivr.net/npm/notiflix@3/dist/notiflix-aio-3.2.8.min.js` para notificações, carregamento e confirmação de exclusão.

## Organização

```text
index.html          Estrutura da interface e dos diálogos
css/styles.css      Estilos e layouts responsivos
js/api.js           Cliente HTTP, autenticação e tratamento das respostas
js/config.example.js Exemplo de configuração com valores vazios
js/config.local.js  URL e token locais (ignorado pelo Git)
js/tickets.js       Validação, filtros, contagem e apresentação de datas
js/app.js           Estado da página, DOM e ações do usuário
assets/favicon.svg  Ícone da aplicação
docs/               Contexto, contrato da API e PRD
```

Filtros de categoria, status, prioridade e título são combinados no navegador. A categoria pode ser selecionada no menu lateral ou no seletor da lista; os dois controles ficam sincronizados. Selecionar novamente a categoria no menu remove esse filtro. Os filtros ativos aparecem acima dos resultados e podem ser limpos juntos. As contagens do resumo e das categorias consideram a lista completa. A ordem dos registros recebida da API é preservada. A criação omite status; a edição envia os cinco campos editáveis. As datas são exibidas sem atribuir um fuso ausente no contrato.

O JavaScript usa funções comuns, arrays e objetos simples, com as ações principais nomeadas em português. Não há classes próprias, herança ou módulos autoexecutáveis. Os arquivos são carregados em ordem no HTML: `config.local.js` define a URL e o token, `api.js` faz as requisições, `tickets.js` contém as regras dos chamados e `app.js` conecta essas funções aos elementos da página. A exclusão usa diretamente os callbacks de confirmação e cancelamento do Notiflix.

## Validação

Execute os testes de integração HTTP simulada e das regras locais com Node.js 20 ou superior:

```sh
node --test tests/core.test.cjs
```

Node.js é usado somente para essas verificações de desenvolvimento. O frontend é servido diretamente, sem dependências de runtime ou build locais.

Os cenários de aceite estão no PRD. A integração real exige um token válido e que a API permita, por CORS, a origem usada para servir o frontend. Falhas de rede após operações de escrita podem deixar o resultado incerto; a interface oferece consulta à lista antes de repetir o envio.

As verificações com API simulada e suas limitações são registradas em [docs/validation.md](docs/validation.md).

## Créditos

[Solar Icons](https://icon-sets.iconify.design/solar/) por 480 Design, licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Fontes DM Sans e Manrope servidas pelo Google Fonts.
