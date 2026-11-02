// A URL e o token são definidos em config.local.js, carregado antes deste arquivo.

function acessoConfigurado() {
  return (
    typeof API_URL === "string" &&
    /^https?:\/\/\S+$/i.test(API_URL.trim()) &&
    typeof API_TOKEN === "string" &&
    /^[a-f0-9]{64}$/i.test(API_TOKEN.trim())
  );
}

// Um erro da API é apenas um objeto com mensagem e informações da resposta.
function criarErroApi(mensagem, status, campos, incerto) {
  return {
    message: mensagem,
    status: status || 0,
    fields: campos || {},
    uncertain: Boolean(incerto),
  };
}

function mensagemHttp(status) {
  const mensagens = {
    400: "Não foi possível enviar as informações. Revise os dados e tente novamente.",
    401: "Não foi possível acessar seus chamados. Tente novamente ou entre em contato com o suporte da sua empresa.",
    404: "Este chamado não foi encontrado ou não está disponível para sua sessão.",
    405: "Não foi possível realizar esta ação. Tente novamente mais tarde.",
    413: "Seu chamado está muito longo. Reduza os textos e tente novamente.",
    415: "Não foi possível enviar seu chamado. Tente novamente.",
    422: "Revise os campos indicados antes de continuar.",
    500: "O serviço está indisponível no momento. Tente novamente mais tarde.",
  };
  return (
    mensagens[status] ||
    "Não foi possível concluir esta ação. Tente novamente mais tarde."
  );
}

function chamadoValido(chamado) {
  if (!chamado || typeof chamado !== "object") return false;
  if (typeof chamado.id !== "number" && typeof chamado.id !== "string")
    return false;
  if (String(chamado.id) === "" || typeof chamado.titulo !== "string")
    return false;
  if (chamado.descricao != null && typeof chamado.descricao !== "string")
    return false;
  if (!["hardware", "software", "rede", "outro"].includes(chamado.categoria))
    return false;
  if (!["baixa", "media", "alta"].includes(chamado.prioridade)) return false;
  return ["aberto", "em_andamento", "concluido"].includes(chamado.status);
}

// Centraliza o fetch para que todas as operações usem o mesmo token e URL.
async function requisicaoApi(metodo, id, dados) {
  if (!acessoConfigurado()) {
    throw criarErroApi(
      "Seu acesso ainda não está disponível. Entre em contato com o suporte da sua empresa.",
      401,
    );
  }

  let url = API_URL.trim().replace(/\/+$/, "");
  if (id != null) url += "/" + encodeURIComponent(id);

  const opcoes = {
    method: metodo,
    headers: {
      Authorization: "Bearer " + API_TOKEN.trim(),
      Accept: "application/json",
    },
    credentials: "omit",
    cache: "no-store",
  };
  const gravacao = metodo !== "GET";

  if (dados !== undefined) {
    opcoes.headers["Content-Type"] = "application/json";
    opcoes.body = JSON.stringify(dados);
    if (new TextEncoder().encode(opcoes.body).byteLength > 16 * 1024) {
      throw criarErroApi(mensagemHttp(413), 413);
    }
  }

  // Interrompe a consulta se o serviço não responder em 20 segundos.
  const controle = new AbortController();
  opcoes.signal = controle.signal;
  const tempoLimite = setTimeout(function () {
    controle.abort();
  }, 20000);

  try {
    let resposta;
    try {
      resposta = await fetch(url, opcoes);
    } catch {
      let mensagem =
        "Não foi possível acessar o serviço. Confira sua conexão e tente novamente.";
      if (controle.signal.aborted)
        mensagem =
          "O serviço demorou para responder. Tente consultar novamente.";
      throw criarErroApi(mensagem, 0, {}, gravacao);
    }

    // Uma exclusão com 204 não tem JSON para ler.
    if (metodo === "DELETE" && resposta.status === 204) return null;

    let conteudo;
    try {
      conteudo = await resposta.json();
    } catch {
      if (!resposta.ok) {
        throw criarErroApi(
          mensagemHttp(resposta.status),
          resposta.status,
          {},
          gravacao && resposta.status >= 500,
        );
      }
      throw criarErroApi(
        "Não foi possível confirmar esta ação. Consulte seus chamados e tente novamente.",
        0,
        {},
        gravacao,
      );
    }

    if (!resposta.ok) {
      let mensagem = mensagemHttp(resposta.status);
      let campos = {};
      if (conteudo && conteudo.erro) {
        if (
          resposta.status === 422 &&
          typeof conteudo.erro.mensagem === "string" &&
          conteudo.erro.mensagem.trim()
        ) {
          mensagem = conteudo.erro.mensagem;
        }
        if (conteudo.erro.campos && typeof conteudo.erro.campos === "object")
          campos = conteudo.erro.campos;
      }
      throw criarErroApi(
        mensagem,
        resposta.status,
        campos,
        gravacao && resposta.status >= 500,
      );
    }

    let valido = false;
    if (
      conteudo &&
      metodo === "GET" &&
      id == null &&
      Array.isArray(conteudo.dados)
    ) {
      valido = conteudo.dados.every(chamadoValido);
    } else if (conteudo) {
      valido = chamadoValido(conteudo.dados);
    }
    let statusEsperado = 200;
    if (metodo === "POST") statusEsperado = 201;
    if (!valido || metodo === "DELETE" || resposta.status !== statusEsperado) {
      throw criarErroApi(
        "Não foi possível confirmar esta ação. Consulte seus chamados e tente novamente.",
        0,
        {},
        gravacao,
      );
    }
    return conteudo.dados;
  } finally {
    clearTimeout(tempoLimite);
  }
}

function listarChamadosApi() {
  return requisicaoApi("GET");
}
function consultarChamadoApi(id) {
  return requisicaoApi("GET", id);
}
function criarChamadoApi(dados) {
  return requisicaoApi("POST", null, dados);
}
function atualizarChamadoApi(id, dados) {
  return requisicaoApi("PUT", id, dados);
}
function excluirChamadoApi(id) {
  return requisicaoApi("DELETE", id);
}
