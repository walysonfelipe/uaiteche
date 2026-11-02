// Estado da página e acesso aos elementos.
function elemento(id) {
  return document.getElementById(id);
}
const estado = {
  chamados: [],
  carregado: false,
  ocupado: false,
  erroLista: null,
  selecionado: null,
  modo: "new",
  filtros: { titulo: "", status: "", prioridade: "", categoria: "" },
};
const camposFormulario = [
  "titulo",
  "descricao",
  "categoria",
  "prioridade",
  "status",
];
let ultimoFoco = null;
let confirmandoExclusao = false;

// Aparência das notificações, do carregamento e da confirmação.
if (window.Notiflix) {
  Notiflix.Notify.init({
    position: "right-bottom",
    fontFamily: "DM Sans",
    fontSize: "12px",
    borderRadius: "9px",
    plainText: true,
    timeout: 4500,
    messageMaxLength: 240,
    success: { background: "#536d39" },
    failure: { background: "#af705a" },
  });
  Notiflix.Confirm.init({
    fontFamily: "DM Sans",
    borderRadius: "18px",
    plainText: true,
    titleColor: "#35472b",
    okButtonBackground: "#455b2c",
    okButtonColor: "#ffffff",
    cancelButtonBackground: "#f6f8f1",
    cancelButtonColor: "#62734f",
    messageMaxLength: 240,
    titleMaxLength: 80,
    buttonsMaxLength: 40,
    backOverlayClickToClose: false,
  });
  Notiflix.Loading.init({
    svgColor: "#c9df9a",
    fontFamily: "DM Sans",
    messageColor: "#ecf3e2",
    backgroundColor: "rgba(36, 48, 29, .65)",
  });
}

function anunciar(message) {
  elemento("announcer").textContent = message;
}

function notificar(type, message) {
  anunciar(message);
  if (window.Notiflix) Notiflix.Notify[type](message);
}

function mostrarMensagem(id, message) {
  elemento(id).textContent = message || "";
  elemento(id).hidden = !message;
}

function definirCarregamento(busy, message = "Carregando…") {
  estado.ocupado = busy;
  document.body.setAttribute("aria-busy", String(busy));
  elemento("save-ticket").disabled = busy;
  elemento("edit-ticket").disabled = busy;
  elemento("new-ticket").disabled = busy;
  elemento("ticket-fields").disabled = busy || estado.modo === "view";
  elemento("refresh").disabled = busy || !acessoConfigurado();
  document.querySelectorAll("#ticket-rows button").forEach(function (button) {
    button.disabled = busy;
  });
  if (busy) {
    anunciar(message);
    if (window.Notiflix) Notiflix.Loading.circle(message);
  } else {
    if (window.Notiflix) Notiflix.Loading.remove();
  }
}

function abrirModal(id) {
  if (estado.ocupado || confirmandoExclusao) return;
  ultimoFoco = document.activeElement;
  elemento(id).showModal();
}

function fecharModal(id) {
  if (estado.ocupado) return;
  elemento(id).close();
}

function mostrarAcessoIndisponivel() {
  const message =
    "Seu acesso ainda não está disponível. Se o problema continuar, entre em contato com o suporte da sua empresa.";
  mostrarErroPagina(message);
  anunciar(message);
}

function mostrarErroPagina(message) {
  elemento("page-alert-message").textContent = message;
  elemento("page-alert").hidden = !message;
  const button = elemento("page-alert").querySelector("button");
  button.dataset.action = "retry";
  button.textContent = "Tentar novamente";
}

function tratarAcessoNegado(error) {
  if (error.status !== 401) return;
  estado.chamados = [];
  estado.carregado = false;
  estado.erroLista = error;
  atualizarTela();
  mostrarErroPagina(error.message);
}

// Criação dos elementos da lista. Os dados recebidos são exibidos como texto.
function criarIcone(name, className = "") {
  const node = document.createElement("iconify-icon");
  node.setAttribute("icon", `solar:${name}-linear`);
  node.setAttribute("aria-hidden", "true");
  node.setAttribute("noobserver", "");
  if (className) node.className = className;
  return node;
}

function criarElemento(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function criarBotaoAcao(action, label, iconName, id) {
  const button = criarElemento(
    "button",
    `icon-button ${action === "delete" ? "delete-button" : ""}`,
  );
  button.type = "button";
  button.dataset.action = action;
  button.dataset.id = String(id);
  button.title = label;
  button.setAttribute("aria-label", label);
  button.disabled = estado.ocupado;
  button.append(criarIcone(iconName));
  return button;
}

function criarLinhaChamado(ticket) {
  const row = document.createElement("tr");
  const titleCell = criarElemento("td", "ticket-heading-cell");
  const title = criarElemento("button", "ticket-title-button", ticket.titulo);
  title.type = "button";
  title.dataset.action = "view";
  title.dataset.id = String(ticket.id);
  title.setAttribute("aria-label", `Ver chamado: ${ticket.titulo}`);
  title.disabled = estado.ocupado;
  titleCell.append(
    title,
    criarElemento(
      "span",
      "ticket-id",
      `#${String(ticket.id).padStart(4, "0")}`,
    ),
  );
  const categoryCell = criarElemento("td", "ticket-category-cell");
  const category = criarElemento("span", "category-label");
  category.append(
    criarIcone(iconesCategorias[ticket.categoria]),
    document.createTextNode(categorias[ticket.categoria]),
  );
  categoryCell.append(category);
  const priorityCell = criarElemento("td", "ticket-priority-cell");
  const priority = criarElemento(
    "span",
    `priority-label priority-${ticket.prioridade}`,
  );
  priority.append(
    criarIcone(iconesPrioridades[ticket.prioridade]),
    criarElemento("span", "mobile-only mobile-priority-prefix", "Prioridade:"),
    document.createTextNode(prioridades[ticket.prioridade]),
  );
  priorityCell.append(priority);
  const statusCell = criarElemento("td", "ticket-status-cell");
  const status = criarElemento("span", `status-badge status-${ticket.status}`);
  status.append(
    criarElemento("span", "mini-dot"),
    document.createTextNode(statusChamados[ticket.status]),
  );
  statusCell.append(status);
  const dateCell = criarElemento("td", "date-cell");
  const criacao = criarElemento("div", "date-detail");
  criacao.append(
    criarElemento("span", "date-label", "Criado"),
    criarElemento("span", "date-value", formatarData(ticket.criado_em, true)),
  );
  const atualizacao = criarElemento("div", "date-detail");
  atualizacao.append(
    criarElemento("span", "date-label", "Atualizado"),
    criarElemento(
      "span",
      "date-value",
      formatarData(ticket.atualizado_em, true),
    ),
  );
  dateCell.append(criacao, atualizacao);
  const actionsCell = criarElemento("td", "actions-column");
  const actions = criarElemento("div", "row-actions");
  actions.append(
    criarBotaoAcao(
      "view",
      `Ver detalhes de ${ticket.titulo}`,
      "eye",
      ticket.id,
    ),
    criarBotaoAcao(
      "edit",
      `Editar ${ticket.titulo}`,
      "pen-new-square",
      ticket.id,
    ),
    criarBotaoAcao(
      "delete",
      `Excluir ${ticket.titulo}`,
      "trash-bin-trash",
      ticket.id,
    ),
  );
  const abrir = criarElemento(
    "button",
    "mobile-only mobile-ticket-open",
    "Ver detalhes",
  );
  abrir.type = "button";
  abrir.dataset.action = "view";
  abrir.dataset.id = String(ticket.id);
  abrir.disabled = estado.ocupado;
  abrir.setAttribute("aria-label", `Ver detalhes de ${ticket.titulo}`);
  abrir.append(criarIcone("arrow-right"));
  const opcoes = criarElemento("details", "mobile-only mobile-ticket-options");
  const resumo = criarElemento("summary", "", "Opções");
  resumo.setAttribute("aria-label", `Opções do chamado ${ticket.titulo}`);
  resumo.append(criarIcone("alt-arrow-down"));
  const listaOpcoes = criarElemento("div", "ticket-options-list");
  const editar = criarBotaoAcao(
    "edit",
    `Editar ${ticket.titulo}`,
    "pen-new-square",
    ticket.id,
  );
  editar.className = "ticket-option";
  editar.append(document.createTextNode("Editar chamado"));
  const excluir = criarBotaoAcao(
    "delete",
    `Excluir ${ticket.titulo}`,
    "trash-bin-trash",
    ticket.id,
  );
  excluir.className = "ticket-option delete-button";
  excluir.append(document.createTextNode("Excluir chamado"));
  listaOpcoes.append(editar, excluir);
  opcoes.append(resumo, listaOpcoes);
  actionsCell.append(actions, abrir, opcoes);
  row.append(
    titleCell,
    categoryCell,
    priorityCell,
    statusCell,
    dateCell,
    actionsCell,
  );
  return row;
}

function mostrarEstadoVazio(opcoes) {
  elemento("empty-eyebrow").textContent = opcoes.eyebrow;
  elemento("empty-title").textContent = opcoes.title;
  elemento("empty-description").textContent = opcoes.description;
  elemento("empty-icon").setAttribute(
    "icon",
    "solar:" + opcoes.iconName + "-linear",
  );
  elemento("empty-action").dataset.action = opcoes.action;
  elemento("empty-action").querySelector("span").textContent =
    opcoes.actionLabel;
  elemento("empty-action")
    .querySelector("iconify-icon")
    .setAttribute("icon", "solar:" + opcoes.actionIcon + "-linear");
  elemento("empty-note").hidden = true;
}

// Atualiza a lista, os filtros, os contadores e os estados vazios.
function atualizarTela() {
  const connected = acessoConfigurado();
  const counts = contarChamados(estado.chamados);
  const categoriasContadas = contarCategorias(estado.chamados);
  const filtered = filtrarChamados(estado.chamados, estado.filtros);
  const hasFilters = Boolean(
    estado.filtros.titulo.trim() ||
    estado.filtros.status ||
    estado.filtros.prioridade ||
    estado.filtros.categoria,
  );
  document.querySelectorAll("[data-count]").forEach(function (node) {
    node.textContent = estado.carregado
      ? String(counts[node.dataset.count])
      : "—";
  });
  document.querySelectorAll(".nav-item").forEach(function (button) {
    const active = button.dataset.status === estado.filtros.status;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  for (const botao of document.querySelectorAll("[data-category]")) {
    const ativo = botao.dataset.category === estado.filtros.categoria;
    botao.classList.toggle("is-active", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  }
  for (const contador of document.querySelectorAll("[data-category-count]")) {
    contador.textContent = estado.carregado
      ? String(categoriasContadas[contador.dataset.categoryCount])
      : "—";
  }
  elemento("clear-category").hidden = !estado.filtros.categoria;
  for (const botao of document.querySelectorAll(".stat-card")) {
    botao.setAttribute(
      "aria-pressed",
      String(botao.dataset.status === estado.filtros.status),
    );
  }
  elemento("tickets-title").textContent =
    {
      aberto: "Chamados abertos",
      em_andamento: "Em andamento",
      concluido: "Chamados concluídos",
    }[estado.filtros.status] || "Todos os chamados";
  if (estado.filtros.categoria) {
    elemento("tickets-title").textContent =
      categorias[estado.filtros.categoria];
    if (estado.filtros.status)
      elemento("tickets-title").textContent +=
        " · " + statusChamados[estado.filtros.status];
  }
  elemento("status-filter").value = estado.filtros.status;
  elemento("category-filter").value = estado.filtros.categoria;
  elemento("priority-filter").value = estado.filtros.prioridade;
  elemento("clear-filters").hidden = !hasFilters;
  elemento("filter-summary").hidden = !hasFilters;
  const filtrosAtivos = [];
  if (estado.filtros.categoria)
    filtrosAtivos.push(categorias[estado.filtros.categoria]);
  if (estado.filtros.status)
    filtrosAtivos.push(statusChamados[estado.filtros.status]);
  if (estado.filtros.prioridade)
    filtrosAtivos.push(
      "Prioridade " + prioridades[estado.filtros.prioridade].toLowerCase(),
    );
  if (estado.filtros.titulo.trim())
    filtrosAtivos.push("Busca: " + estado.filtros.titulo.trim());
  elemento("active-filter-tags").replaceChildren();
  for (const texto of filtrosAtivos) {
    const etiqueta = criarElemento("span", "filter-tag", texto);
    etiqueta.title = texto;
    elemento("active-filter-tags").appendChild(etiqueta);
  }
  elemento("list-count").textContent = estado.carregado
    ? String(filtered.length)
    : "—";
  elemento("ticket-rows").replaceChildren();
  for (const chamado of filtered)
    elemento("ticket-rows").appendChild(criarLinhaChamado(chamado));
  elemento("table-wrapper").hidden =
    !filtered.length || !connected || Boolean(estado.erroLista);
  elemento("empty-state").hidden = !elemento("table-wrapper").hidden;

  if (!connected) {
    mostrarEstadoVazio({
      eyebrow: "PRECISA DE AJUDA?",
      title: "Não conseguimos acessar seus chamados",
      description:
        "Tente novamente em instantes. Se o problema continuar,\nentre em contato com o suporte da sua empresa.",
      iconName: "link-round-angle",
      action: "retry",
      actionLabel: "Tentar novamente",
      actionIcon: "refresh",
    });
    elemento("result-summary").textContent =
      "Seus chamados aparecerão aqui quando o acesso estiver disponível.";
  } else if (estado.erroLista) {
    mostrarEstadoVazio({
      eyebrow: "OPA, ALGO ACONTECEU",
      title: "Não conseguimos carregar os chamados",
      description: estado.erroLista.message,
      iconName: "cloud-cross",
      action: "retry",
      actionLabel: "Tentar novamente",
      actionIcon: "refresh",
    });
    elemento("result-summary").textContent = estado.carregado
      ? "A última consulta falhou. Atualize para conferir seus chamados."
      : "Não foi possível consultar seus chamados.";
  } else if (!estado.chamados.length) {
    mostrarEstadoVazio({
      eyebrow: "TUDO PRONTO POR AQUI",
      title: "Vamos abrir seu primeiro chamado?",
      description:
        "Se precisar de suporte, este é o lugar.\nConte o que aconteceu e acompanhe a solução.",
      iconName: "ticket",
      action: "new",
      actionLabel: "Criar meu primeiro chamado",
      actionIcon: "add-circle",
    });
    elemento("result-summary").textContent = "Você ainda não tem chamados.";
  } else if (!filtered.length) {
    mostrarEstadoVazio({
      eyebrow: "TENTE OUTRA COMBINAÇÃO",
      title: "Nenhum chamado por aqui",
      description:
        "Nenhum chamado corresponde aos filtros selecionados.\nAjuste sua pesquisa ou limpe os filtros para ver todos.",
      iconName: "minimalistic-magnifer",
      action: "clear",
      actionLabel: "Limpar filtros",
      actionIcon: "filter",
    });
    elemento("result-summary").textContent =
      `Nenhum resultado entre ${estado.chamados.length} chamados.`;
  } else {
    elemento("result-summary").textContent =
      `Exibindo ${filtered.length} de ${estado.chamados.length} ${estado.chamados.length === 1 ? "chamado" : "chamados"}.`;
  }
}

function limparFiltros() {
  estado.filtros = { titulo: "", status: "", prioridade: "", categoria: "" };
  elemento("search").value = "";
  atualizarTela();
}

async function carregarChamados() {
  if (estado.ocupado) return;
  if (!acessoConfigurado()) return mostrarAcessoIndisponivel();
  definirCarregamento(true, "Consultando seus chamados…");
  mostrarErroPagina("");
  try {
    estado.chamados = await listarChamadosApi();
    estado.carregado = true;
    estado.erroLista = null;
    anunciar("Lista de chamados atualizada.");
  } catch (error) {
    estado.erroLista = error;
    tratarAcessoNegado(error);
    if (error.status !== 401) mostrarErroPagina(error.message);
    notificar("failure", error.message);
  } finally {
    definirCarregamento(false);
    atualizarTela();
  }
}

// Formulário de criação, consulta e edição de chamados.
function limparErrosCampos() {
  camposFormulario.forEach(function (name) {
    mostrarMensagem(`${name}-error`, "");
    elemento(name).removeAttribute("aria-invalid");
  });
}

function mostrarErrosCampos(erros) {
  let primeiroCampo = null;
  for (const nome of camposFormulario) {
    let mensagem = erros[nome];
    if (Array.isArray(mensagem)) mensagem = mensagem.join(" ");
    if (typeof mensagem !== "string" || !mensagem) continue;
    mostrarMensagem(nome + "-error", mensagem);
    elemento(nome).setAttribute("aria-invalid", "true");
    if (!primeiroCampo) primeiroCampo = elemento(nome);
  }
  if (primeiroCampo) primeiroCampo.focus();
}

function atualizarContadores() {
  elemento("title-counter").textContent =
    `${Array.from(elemento("titulo").value).length}/150`;
  elemento("description-counter").textContent =
    `${Array.from(elemento("descricao").value).length}/2000`;
}

function configurarFormulario(modo) {
  estado.modo = modo;
  const novo = modo === "new";
  const consulta = modo === "view";
  let titulo = "Editar chamado";
  let descricao = "Atualize as informações e mantenha tudo em dia.";
  let identificacao = "VAMOS RESOLVER ISSO";
  if (novo) {
    titulo = "Novo chamado";
    descricao = "Conte o que está acontecendo. Os detalhes fazem a diferença.";
  } else {
    identificacao =
      "CHAMADO #" + String(estado.selecionado.id).padStart(4, "0");
    if (consulta) {
      titulo = "Detalhes do chamado";
      descricao = "Cada detalhe do seu pedido de suporte, em um só lugar.";
    }
  }
  elemento("ticket-dialog").classList.toggle("is-viewing", consulta);
  elemento("ticket-dialog-title").textContent = titulo;
  elemento("ticket-dialog-title").appendChild(
    criarElemento("span", "heading-dot", "."),
  );
  elemento("ticket-kicker").textContent = identificacao;
  elemento("ticket-dialog-description").textContent = descricao;
  elemento("ticket-fields").disabled = consulta;
  elemento("status-field").hidden = novo;
  elemento("ticket-metadata").hidden = novo;
  elemento("save-ticket").hidden = consulta;
  elemento("save-ticket").querySelector("span").textContent = novo
    ? "Criar chamado"
    : "Salvar alterações";
  elemento("edit-ticket").hidden = !consulta;
  elemento("required-note").hidden = consulta;
  elemento("descricao").placeholder = consulta
    ? "Nenhuma descrição informada."
    : "O que aconteceu? Quando começou? O que você já tentou?";
  atualizarContadores();
}

function novoChamado() {
  if (estado.ocupado) return;
  if (!acessoConfigurado()) return mostrarAcessoIndisponivel();
  estado.selecionado = null;
  elemento("ticket-form").reset();
  elemento("ticket-form").hidden = false;
  elemento("ticket-loading").hidden = true;
  elemento("save-uncertain").hidden = true;
  mostrarMensagem("ticket-error", "");
  limparErrosCampos();
  configurarFormulario("new");
  abrirModal("ticket-dialog");
  elemento("titulo").focus();
}

async function abrirChamado(id, mode) {
  if (estado.ocupado || confirmandoExclusao) return;
  if (!acessoConfigurado()) return mostrarAcessoIndisponivel();
  estado.selecionado = { id };
  elemento("ticket-form").reset();
  limparErrosCampos();
  mostrarMensagem("ticket-error", "");
  elemento("save-uncertain").hidden = true;
  configurarFormulario(mode);
  elemento("ticket-form").hidden = true;
  elemento("ticket-loading").hidden = false;
  abrirModal("ticket-dialog");
  definirCarregamento(true, "Consultando chamado…");
  try {
    const ticket = await consultarChamadoApi(id);
    estado.selecionado = ticket;
    camposFormulario.forEach(function (field) {
      elemento(field).value = ticket[field] || "";
    });
    elemento("created-at").textContent = formatarData(ticket.criado_em, true);
    elemento("updated-at").textContent = formatarData(
      ticket.atualizado_em,
      true,
    );
    configurarFormulario(mode);
    elemento("ticket-form").hidden = false;
  } catch (error) {
    mostrarMensagem("ticket-error", error.message);
    tratarAcessoNegado(error);
  } finally {
    elemento("ticket-loading").hidden = true;
    definirCarregamento(false);
    if (mode === "edit" && !elemento("ticket-form").hidden)
      elemento("titulo").focus();
  }
}

async function salvarChamado(event) {
  event.preventDefault();
  if (estado.ocupado || estado.modo === "view") return;
  if (!acessoConfigurado()) {
    mostrarMensagem(
      "ticket-error",
      "Não foi possível acessar seus chamados. Tente novamente ou entre em contato com o suporte da sua empresa.",
    );
    return;
  }
  limparErrosCampos();
  mostrarMensagem("ticket-error", "");
  elemento("save-uncertain").hidden = true;
  const editing = estado.modo === "edit";
  // Somente os campos previstos no contrato; status é omitido no POST.
  const data = {
    titulo: elemento("titulo").value.trim(),
    descricao: elemento("descricao").value,
    categoria: elemento("categoria").value,
    prioridade: elemento("prioridade").value,
  };
  if (editing) data.status = elemento("status").value;
  const errors = validarChamado(data, editing);
  if (Object.keys(errors).length) return mostrarErrosCampos(errors);
  definirCarregamento(
    true,
    editing ? "Salvando alterações…" : "Criando seu chamado…",
  );
  let failure;
  try {
    const saved = editing
      ? await atualizarChamadoApi(estado.selecionado.id, data)
      : await criarChamadoApi(data);
    if (editing) {
      for (let i = 0; i < estado.chamados.length; i++) {
        if (String(estado.chamados[i].id) === String(saved.id))
          estado.chamados[i] = saved;
      }
    } else {
      estado.chamados.unshift(saved);
    }
    estado.erroLista = null;
    estado.carregado = true;
    mostrarErroPagina("");
    elemento("ticket-dialog").close();
    const visible = filtrarChamados([saved], estado.filtros).length > 0;
    const message = editing
      ? "Chamado atualizado com sucesso."
      : "Chamado criado com sucesso.";
    notificar(
      "success",
      visible ? message : `${message} Ele está fora dos filtros atuais.`,
    );
  } catch (error) {
    failure = error;
    mostrarMensagem("ticket-error", error.message);
    elemento("save-uncertain").hidden = !error.uncertain;
    tratarAcessoNegado(error);
    notificar("failure", error.message);
  } finally {
    definirCarregamento(false);
    if (failure) mostrarErrosCampos(failure.fields || {});
    atualizarTela();
  }
}

// O Notiflix só executa a exclusão depois da confirmação.
function confirmarExclusao(id) {
  if (estado.ocupado || confirmandoExclusao) return;
  if (!acessoConfigurado()) return mostrarAcessoIndisponivel();
  let chamado = null;
  for (const item of estado.chamados) {
    if (String(item.id) === String(id)) chamado = item;
  }
  if (!chamado) return;
  const focoAnterior = document.activeElement;
  confirmandoExclusao = true;
  const mensagem =
    "O chamado “" +
    chamado.titulo +
    "” será excluído. Esta ação não pode ser desfeita.";
  function confirmar() {
    confirmandoExclusao = false;
    realizarExclusao(id);
  }
  function cancelar() {
    confirmandoExclusao = false;
    if (focoAnterior) focoAnterior.focus();
  }
  if (window.Notiflix) {
    Notiflix.Confirm.show(
      "Excluir chamado?",
      mensagem,
      "Excluir chamado",
      "Cancelar",
      confirmar,
      cancelar,
    );
    personalizarConfirmacaoExclusao(chamado);
    prepararTecladoConfirmacao();
  } else if (window.confirm(mensagem)) {
    confirmar();
  } else {
    cancelar();
  }
}

function personalizarConfirmacaoExclusao(chamado) {
  const caixa = elemento("NotiflixConfirmWrap");
  if (!caixa) return;
  const cabecalho = caixa.querySelector(".notiflix-confirm-head");
  const titulo = cabecalho.querySelector("h5");
  const mensagem = titulo.nextElementSibling;
  const simbolo = criarElemento("span", "confirm-symbol");
  simbolo.append(criarIcone("trash-bin-trash"));
  cabecalho.prepend(simbolo);
  titulo.id = "delete-confirm-title";
  mensagem.id = "delete-confirm-description";
  mensagem.className = "confirm-description";
  const chamadoResumo = criarElemento("div", "confirm-ticket");
  chamadoResumo.append(
    criarElemento(
      "span",
      "",
      `Chamado #${String(chamado.id).padStart(4, "0")}`,
    ),
    criarElemento("strong", "", chamado.titulo),
  );
  mensagem.replaceChildren(
    criarElemento("p", "", "Você está prestes a excluir este chamado."),
    chamadoResumo,
    criarElemento(
      "p",
      "confirm-warning",
      "Esta ação é permanente e não pode ser desfeita.",
    ),
  );
  caixa.setAttribute("aria-labelledby", titulo.id);
  caixa.setAttribute("aria-describedby", mensagem.id);
}

// Teclado: Escape cancela, Tab alterna os botões e Enter confirma a escolha.
function prepararTecladoConfirmacao() {
  const caixa = elemento("NotiflixConfirmWrap");
  if (!caixa) return;
  caixa.setAttribute("role", "dialog");
  caixa.setAttribute("aria-modal", "true");
  caixa.setAttribute("aria-label", "Excluir chamado?");
  const botoes = caixa.querySelectorAll("a, button");
  if (botoes.length < 2) return;
  for (const botao of botoes) {
    botao.setAttribute("role", "button");
    botao.tabIndex = 0;
  }
  botoes[1].focus();
  caixa.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      evento.preventDefault();
      botoes[1].click();
    } else if (evento.key === "Tab") {
      evento.preventDefault();
      if (document.activeElement === botoes[0]) botoes[1].focus();
      else botoes[0].focus();
    } else if (evento.key === "Enter" || evento.key === " ") {
      if (evento.target === botoes[0] || evento.target === botoes[1]) {
        evento.preventDefault();
        evento.target.click();
      }
    }
  });
}

async function realizarExclusao(id) {
  if (estado.ocupado || !acessoConfigurado()) return;
  definirCarregamento(true, "Excluindo chamado…");
  try {
    await excluirChamadoApi(id);
    for (let i = 0; i < estado.chamados.length; i++) {
      if (String(estado.chamados[i].id) === String(id)) {
        estado.chamados.splice(i, 1);
        break;
      }
    }
    mostrarErroPagina("");
    notificar("success", "Chamado excluído com sucesso.");
  } catch (erro) {
    tratarAcessoNegado(erro);
    let mensagem = erro.message;
    if (erro.uncertain)
      mensagem += " Atualize a lista antes de tentar excluir novamente.";
    if (erro.status !== 401) mostrarErroPagina(mensagem);
    notificar("failure", mensagem);
  } finally {
    definirCarregamento(false);
    atualizarTela();
    elemento("tickets-title").tabIndex = -1;
    elemento("tickets-title").focus({ preventScroll: true });
  }
}

// Ações dos botões e eventos dos campos da página.
document.addEventListener("click", function (event) {
  const close = event.target.closest("[data-close]");
  if (close) return fecharModal(close.dataset.close);
  const status = event.target.closest("[data-status]");
  if (status && !confirmandoExclusao) {
    estado.filtros.status = status.dataset.status;
    atualizarTela();
    return;
  }
  const categoria = event.target.closest("[data-category]");
  if (categoria && !confirmandoExclusao) {
    if (estado.filtros.categoria === categoria.dataset.category)
      estado.filtros.categoria = "";
    else estado.filtros.categoria = categoria.dataset.category;
    atualizarTela();
    return;
  }
  const button = event.target.closest("[data-action]");
  if (!button || estado.ocupado || confirmandoExclusao) return;
  const opcoes = button.closest(".mobile-ticket-options");
  if (opcoes) {
    opcoes.open = false;
    opcoes.querySelector("summary").focus({ preventScroll: true });
  }
  switch (button.dataset.action) {
    case "help":
      abrirModal("help-dialog");
      break;
    case "new":
      novoChamado();
      break;
    case "refresh":
    case "retry":
      carregarChamados();
      break;
    case "clear":
      limparFiltros();
      break;
    case "clear-category":
      estado.filtros.categoria = "";
      atualizarTela();
      break;
    case "view":
    case "edit":
      abrirChamado(button.dataset.id, button.dataset.action);
      break;
    case "delete":
      confirmarExclusao(button.dataset.id);
      break;
    case "check-list":
      fecharModal("ticket-dialog");
      carregarChamados();
      break;
    default:
      break;
  }
});

document.querySelectorAll("dialog").forEach(function (dialog) {
  dialog.addEventListener("cancel", function (event) {
    if (estado.ocupado) event.preventDefault();
  });
  dialog.addEventListener("click", function (event) {
    if (event.target !== dialog || estado.ocupado) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("close", function () {
    if (!estado.ocupado && ultimoFoco && ultimoFoco.isConnected)
      ultimoFoco.focus({ preventScroll: true });
  });
});

elemento("ticket-form").addEventListener("submit", salvarChamado);
elemento("edit-ticket").addEventListener("click", function () {
  configurarFormulario("edit");
  elemento("titulo").focus();
});
elemento("search").addEventListener("input", function () {
  estado.filtros.titulo = elemento("search").value;
  atualizarTela();
});
elemento("status-filter").addEventListener("change", function () {
  estado.filtros.status = elemento("status-filter").value;
  atualizarTela();
});
elemento("priority-filter").addEventListener("change", function () {
  estado.filtros.prioridade = elemento("priority-filter").value;
  atualizarTela();
});
elemento("category-filter").addEventListener("change", function () {
  estado.filtros.categoria = elemento("category-filter").value;
  atualizarTela();
});
camposFormulario.forEach(function (name) {
  elemento(name).addEventListener("input", function () {
    mostrarMensagem(`${name}-error`, "");
    elemento(name).removeAttribute("aria-invalid");
    atualizarContadores();
  });
});
elemento("current-year").textContent = new Date().getFullYear();
for (const icone of document.querySelectorAll("iconify-icon"))
  icone.setAttribute("noobserver", "");
atualizarTela();
if (acessoConfigurado()) carregarChamados();
