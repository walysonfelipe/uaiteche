// Rótulos usados na interface. Os valores enviados à API continuam sem acentos.
const categorias = {
  hardware: "Hardware",
  software: "Software",
  rede: "Rede",
  outro: "Outro",
};
const prioridades = { baixa: "Baixa", media: "Média", alta: "Alta" };
const statusChamados = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};
const iconesCategorias = {
  hardware: "monitor",
  software: "code-square",
  rede: "wi-fi-router",
  outro: "box",
};
const iconesPrioridades = {
  alta: "double-alt-arrow-up",
  media: "alt-arrow-up",
  baixa: "alt-arrow-down",
};

function filtrarChamados(chamados, filtros) {
  if (!filtros) filtros = {};
  const busca = (filtros.titulo || "").trim().toLowerCase();
  const resultado = [];

  for (const chamado of chamados) {
    if (filtros.categoria && chamado.categoria !== filtros.categoria) continue;
    if (filtros.status && chamado.status !== filtros.status) continue;
    if (filtros.prioridade && chamado.prioridade !== filtros.prioridade)
      continue;
    if (busca && !chamado.titulo.toLowerCase().includes(busca)) continue;
    resultado.push(chamado);
  }
  return resultado;
}

function contarChamados(chamados) {
  const contagem = {
    total: chamados.length,
    aberto: 0,
    em_andamento: 0,
    concluido: 0,
  };
  for (const chamado of chamados) contagem[chamado.status]++;
  return contagem;
}

function contarCategorias(chamados) {
  const contagem = { hardware: 0, software: 0, rede: 0, outro: 0 };
  for (const chamado of chamados) contagem[chamado.categoria]++;
  return contagem;
}

function validarChamado(dados, editando) {
  const erros = {};
  const titulo = dados.titulo || "";
  const descricao = dados.descricao || "";

  if (!titulo.trim() || Array.from(titulo).length > 150) {
    erros.titulo = "Informe um título com 1 a 150 caracteres, além de espaços.";
  }
  if (Array.from(descricao).length > 2000)
    erros.descricao = "A descrição deve ter no máximo 2000 caracteres.";
  if (!Object.keys(categorias).includes(dados.categoria))
    erros.categoria = "Selecione uma categoria válida.";
  if (!Object.keys(prioridades).includes(dados.prioridade))
    erros.prioridade = "Selecione uma prioridade válida.";
  if (editando && !Object.keys(statusChamados).includes(dados.status))
    erros.status = "Selecione um status válido.";
  return erros;
}

function formatarData(valor, mostrarHora) {
  if (typeof valor !== "string") return "Não informado";
  const partes = valor.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/,
  );
  if (!partes) return "Não informado";

  // Preserva a data e a hora recebidas, sem atribuir um fuso à API.
  let data = partes[3] + "/" + partes[2] + "/" + partes[1];
  if (mostrarHora && partes[4]) data += " às " + partes[4] + ":" + partes[5];
  return data;
}
