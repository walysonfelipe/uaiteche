const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");

const ticket = {
  id: 1,
  titulo: "Computador não liga",
  descricao: "",
  categoria: "hardware",
  prioridade: "alta",
  status: "aberto",
};
const token = "a".repeat(64);
const base = "https://api.exemplo.test/chamados";

function load(
  script,
  globals = {},
  configuredToken = token,
  configuredUrl = base,
) {
  const context = vm.createContext({
    window: {},
    TextEncoder,
    AbortController,
    setTimeout,
    clearTimeout,
    ...globals,
  });
  const source = readFileSync(join(__dirname, "..", "js", script), "utf8");
  if (script === "api.js" && configuredToken !== null) {
    vm.runInContext(
      `const API_URL = ${JSON.stringify(configuredUrl)}; const API_TOKEN = ${JSON.stringify(configuredToken)};`,
      context,
    );
  }
  vm.runInContext(source, context);
  return context;
}

// Normaliza objetos provenientes de outro contexto JavaScript para as asserções.
const plain = (value) => JSON.parse(JSON.stringify(value));

function client(response) {
  const requests = [];
  const api = load("api.js", {
    fetch: async (url, options) => {
      requests.push({ url, ...options });
      if (response instanceof Error) throw response;
      return response;
    },
  });
  return { api, requests };
}

function jsonResponse(status, payload) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => payload,
  };
}

test("GET usa a coleção, autenticação Bearer e preserva a ordem da API", async () => {
  const data = [{ ...ticket, id: 3 }, ticket];
  const { api, requests } = client(jsonResponse(200, { dados: data }));
  assert.deepEqual(await api.listarChamadosApi(), data);
  assert.equal(requests[0].url, base);
  assert.equal(requests[0].headers.Authorization, `Bearer ${token}`);
  assert.equal(requests[0].credentials, "omit");
  assert.equal(requests[0].headers["Content-Type"], undefined);
});

test("consulta e atualização usam o identificador codificado na mesma coleção", async () => {
  const { api, requests } = client(jsonResponse(200, { dados: ticket }));
  await api.consultarChamadoApi("a/b");
  assert.equal(requests[0].url, `${base}/a%2Fb`);
  const data = {
    titulo: ticket.titulo,
    descricao: "",
    categoria: "hardware",
    prioridade: "alta",
    status: "concluido",
  };
  await api.atualizarChamadoApi(1, data);
  assert.equal(requests[1].method, "PUT");
  assert.deepEqual(JSON.parse(requests[1].body), data);
});

test("POST reconhece 201 e envia JSON sem adicionar campos", async () => {
  const data = {
    titulo: ticket.titulo,
    descricao: "",
    categoria: "hardware",
    prioridade: "alta",
  };
  const { api, requests } = client(jsonResponse(201, { dados: ticket }));
  assert.deepEqual(await api.criarChamadoApi(data), ticket);
  assert.equal(requests[0].method, "POST");
  assert.equal(requests[0].headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(requests[0].body), data);
});

test("DELETE 204 não tenta ler JSON", async () => {
  let reads = 0;
  const { api, requests } = client({
    status: 204,
    ok: true,
    json: () => {
      reads++;
      throw new Error("Não há corpo");
    },
  });
  assert.equal(await api.excluirChamadoApi(1), null);
  assert.equal(reads, 0);
  assert.equal(requests[0].method, "DELETE");
  assert.equal(requests[0].url, `${base}/1`);
});

test("sem token configurado nenhuma chamada é enviada", async () => {
  let requests = 0;
  const api = load(
    "api.js",
    {
      fetch: async () => {
        requests++;
      },
    },
    "",
  );
  assert.equal(api.acessoConfigurado(), false);
  await assert.rejects(
    api.listarChamadosApi(),
    (error) => error.status === 401,
  );
  assert.equal(requests, 0);
});

test("token com formato inválido é rejeitado antes da requisição", async () => {
  let requests = 0;
  const api = load(
    "api.js",
    {
      fetch: async () => {
        requests++;
      },
    },
    "token-invalido",
  );
  assert.equal(api.acessoConfigurado(), false);
  await assert.rejects(
    api.listarChamadosApi(),
    (error) => error.status === 401 && error.message.includes("acesso"),
  );
  assert.equal(requests, 0);
});

test("arquivo de configuração ausente não interrompe a aplicação", async () => {
  let requests = 0;
  const api = load(
    "api.js",
    {
      fetch: async () => {
        requests++;
      },
    },
    null,
  );
  assert.equal(api.acessoConfigurado(), false);
  await assert.rejects(
    api.listarChamadosApi(),
    (error) => error.status === 401,
  );
  assert.equal(requests, 0);
});

test("URL ausente ou inválida não envia requisições", async () => {
  for (const url of ["", "endereco-invalido", "javascript:alert(1)"]) {
    let requests = 0;
    const api = load(
      "api.js",
      {
        fetch: async () => {
          requests++;
        },
      },
      token,
      url,
    );
    assert.equal(api.acessoConfigurado(), false);
    await assert.rejects(
      api.listarChamadosApi(),
      (error) => error.status === 401,
    );
    assert.equal(requests, 0);
  }
});

test("422 preserva mensagem e erros de campo", async () => {
  const fields = { titulo: "Título inválido." };
  const { api } = client(
    jsonResponse(422, {
      erro: { mensagem: "Revise seus dados.", campos: fields },
    }),
  );
  await assert.rejects(
    api.criarChamadoApi({}),
    (error) =>
      error.status === 422 &&
      error.message === "Revise seus dados." &&
      error.fields === fields &&
      !error.uncertain,
  );
});

for (const status of [400, 401, 404, 405, 413, 415, 500]) {
  test(`HTTP ${status} com corpo não JSON continua sendo erro HTTP`, async () => {
    const { api } = client({
      status,
      ok: false,
      json: async () => {
        throw new SyntaxError("HTML");
      },
    });
    await assert.rejects(
      api.listarChamadosApi(),
      (error) => error.status === status && !error.uncertain,
    );
  });
}

test("falha de rede na escrita informa resultado incerto; leitura não", async () => {
  const { api } = client(new TypeError("Failed to fetch"));
  await assert.rejects(
    api.criarChamadoApi({}),
    (error) => error.uncertain === true,
  );
  await assert.rejects(
    api.listarChamadosApi(),
    (error) => error.uncertain === false,
  );
});

test("sucesso com formato ou status inesperado não vira confirmação de gravação", async () => {
  for (const response of [
    jsonResponse(200, { dados: ticket }),
    jsonResponse(201, { dados: [] }),
    jsonResponse(201, { dados: {} }),
  ]) {
    const { api } = client(response);
    await assert.rejects(
      api.criarChamadoApi({}),
      (error) => error.uncertain === true,
    );
  }
});

test("listagem rejeita envelope ou registro inválido e aceita coleção vazia", async () => {
  for (const data of [
    { dados: {} },
    { dados: [null] },
    { dados: [{ ...ticket, status: "desconhecido" }] },
  ]) {
    const { api } = client(jsonResponse(200, data));
    await assert.rejects(api.listarChamadosApi());
  }
  const { api } = client(jsonResponse(200, { dados: [] }));
  assert.deepEqual(await api.listarChamadosApi(), []);
});

test("limite de 16 KiB é verificado em bytes antes da requisição", async () => {
  const { api, requests } = client(jsonResponse(201, { dados: ticket }));
  await assert.rejects(
    api.criarChamadoApi({ descricao: "ç".repeat(9000) }),
    (error) => error.status === 413 && !error.uncertain,
  );
  assert.equal(requests.length, 0);
});

test("filtros combinam título, status e prioridade sem alterar os registros", () => {
  const regras = load("tickets.js");
  const rows = [
    ticket,
    { ...ticket, id: 2, status: "concluido" },
    { ...ticket, id: 3, prioridade: "baixa" },
  ];
  assert.deepEqual(
    plain(
      regras.filtrarChamados(rows, {
        titulo: "  COMPUTADOR  ",
        status: "aberto",
        prioridade: "alta",
      }),
    ),
    [ticket],
  );
  assert.equal(
    regras.filtrarChamados(rows, { titulo: "inexistente" }).length,
    0,
  );
  assert.equal(rows.length, 3);
  assert.deepEqual(plain(regras.filtrarChamados(rows)), rows);
});

test("contagem inclui todos os status e coleção vazia", () => {
  const regras = load("tickets.js");
  assert.deepEqual(
    plain(regras.contarChamados([ticket, { ...ticket, status: "concluido" }])),
    { total: 2, aberto: 1, em_andamento: 0, concluido: 1 },
  );
  assert.deepEqual(plain(regras.contarChamados([])), {
    total: 0,
    aberto: 0,
    em_andamento: 0,
    concluido: 0,
  });
});

test("categoria combina com busca, status e prioridade e pode ser removida", () => {
  const regras = load("tickets.js");
  const rows = [
    ticket,
    { ...ticket, id: 2, categoria: "software" },
    { ...ticket, id: 3, categoria: "rede", status: "concluido" },
    { ...ticket, id: 4, categoria: "outro", prioridade: "baixa" },
  ];
  for (const categoria of ["hardware", "software", "rede", "outro"]) {
    const resultado = regras.filtrarChamados(rows, { categoria });
    assert.equal(resultado.length, 1);
    assert.equal(resultado[0].categoria, categoria);
  }
  const filtros = {
    titulo: " COMPUTADOR ",
    status: "aberto",
    prioridade: "alta",
    categoria: "software",
  };
  assert.equal(regras.filtrarChamados(rows, filtros)[0].id, 2);
  assert.equal(
    regras.filtrarChamados(rows, { ...filtros, categoria: "rede" }).length,
    0,
  );
  assert.equal(
    regras.filtrarChamados(rows, { ...filtros, categoria: "" }).length,
    2,
  );
  assert.deepEqual(plain(regras.filtrarChamados(rows)), rows);
});

test("contadores de categorias consideram a coleção completa e o estado vazio", () => {
  const regras = load("tickets.js");
  assert.deepEqual(
    plain(
      regras.contarCategorias([
        ticket,
        ticket,
        { ...ticket, categoria: "rede" },
      ]),
    ),
    { hardware: 2, software: 0, rede: 1, outro: 0 },
  );
  assert.deepEqual(plain(regras.contarCategorias([])), {
    hardware: 0,
    software: 0,
    rede: 0,
    outro: 0,
  });
});

test("validação respeita limites, enums, descrição vazia e campos de edição", () => {
  const regras = load("tickets.js");
  assert.deepEqual(plain(regras.validarChamado(ticket)), {});
  assert.deepEqual(
    plain(
      regras.validarChamado(
        { ...ticket, titulo: "a".repeat(150), descricao: "ç".repeat(2000) },
        true,
      ),
    ),
    {},
  );
  const invalid = regras.validarChamado(
    {
      ...ticket,
      titulo: " ",
      descricao: "a".repeat(2001),
      categoria: "toString",
      prioridade: "",
      status: "inexistente",
    },
    true,
  );
  assert.deepEqual(Object.keys(invalid).sort(), [
    "categoria",
    "descricao",
    "prioridade",
    "status",
    "titulo",
  ]);
  assert.ok(
    regras.validarChamado({ ...ticket, titulo: "a".repeat(151) }).titulo,
  );
  assert.equal(
    regras.validarChamado({ ...ticket, status: undefined }).status,
    undefined,
  );
});

test("datas sem fuso preservam componentes e ausência é compreensível", () => {
  const regras = load("tickets.js");
  assert.equal(
    regras.formatarData("2026-11-01 10:30:00", true),
    "01/11/2026 às 10:30",
  );
  assert.equal(regras.formatarData("2026-11-01T10:30:00Z"), "01/11/2026");
  assert.equal(regras.formatarData(null), "Não informado");
  assert.equal(regras.formatarData("inválido"), "Não informado");
});
