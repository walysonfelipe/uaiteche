// Navegação do celular. O layout de telas maiores usa o menu lateral normal.
const mediaMobile = window.matchMedia("(max-width: 760px)");
let focoAntesDoMenu = null;
const rotulosFiltrosMobile = [
  { id: "category-filter", curto: "Todas" },
  { id: "status-filter", curto: "Todos" },
  { id: "priority-filter", curto: "Todas" },
];
for (const filtro of rotulosFiltrosMobile) {
  filtro.completo = document.getElementById(filtro.id).options[0].textContent;
}

function atualizarFiltrosMobile() {
  let quantidade = 0;
  for (const nome of ["categoria", "status", "prioridade"]) {
    if (estado.filtros[nome]) quantidade++;
  }
  const contador = document.getElementById("mobile-filter-count");
  contador.textContent = quantidade;
  contador.hidden = quantidade === 0;
  document
    .getElementById("mobile-filter-toggle")
    .classList.toggle("is-active", quantidade > 0);
}

function sincronizarLayoutMobile() {
  fecharMenuMobile();
  fecharOpcoesChamadosMobile();
  for (const filtro of rotulosFiltrosMobile) {
    document.getElementById(filtro.id).options[0].textContent =
      mediaMobile.matches ? filtro.curto : filtro.completo;
  }
  atualizarFiltrosMobile();
}

function fecharOpcoesChamadosMobile(alvo) {
  for (const opcoes of document.querySelectorAll(
    ".mobile-ticket-options[open]",
  )) {
    if (!alvo || !opcoes.contains(alvo) || alvo.closest("[data-action]")) {
      opcoes.open = false;
    }
  }
}

function abrirMenuMobile() {
  abrirPainelMobile(false);
}

function abrirPerfilMobile() {
  abrirPainelMobile(true);
}

function abrirPainelMobile(perfil) {
  if (!mediaMobile.matches) return;
  focoAntesDoMenu = document.activeElement;
  const painel = document.getElementById(
    perfil ? "mobile-profile-sheet" : "app-menu",
  );
  painel.inert = false;
  painel.removeAttribute("aria-hidden");
  painel.setAttribute("role", "dialog");
  painel.setAttribute("aria-modal", "true");
  if (!perfil) painel.setAttribute("aria-labelledby", "mobile-menu-title");
  document.getElementById("menu-backdrop").hidden = false;
  document.body.classList.add(
    "mobile-sheet-open",
    perfil ? "mobile-profile-open" : "mobile-menu-open",
  );
  document.querySelector(".main-shell").inert = true;
  document
    .getElementById(perfil ? "mobile-profile-button" : "mobile-menu-button")
    .setAttribute("aria-expanded", "true");
  painel.querySelector(".icon-button").focus();
}

function fecharMenuMobile() {
  const menu = document.getElementById("app-menu");
  const perfil = document.getElementById("mobile-profile-sheet");
  document.body.classList.remove(
    "mobile-sheet-open",
    "mobile-menu-open",
    "mobile-profile-open",
  );
  document.querySelector(".main-shell").inert = false;
  document
    .getElementById("mobile-menu-button")
    .setAttribute("aria-expanded", "false");
  document
    .getElementById("mobile-profile-button")
    .setAttribute("aria-expanded", "false");
  menu.removeAttribute("role");
  menu.removeAttribute("aria-modal");
  menu.removeAttribute("aria-labelledby");
  perfil.inert = true;
  perfil.setAttribute("aria-hidden", "true");
  perfil.removeAttribute("role");
  perfil.removeAttribute("aria-modal");
  menu.inert = mediaMobile.matches;
  if (mediaMobile.matches) menu.setAttribute("aria-hidden", "true");
  else menu.removeAttribute("aria-hidden");
  if (mediaMobile.matches && focoAntesDoMenu)
    focoAntesDoMenu.focus({ preventScroll: true });
  focoAntesDoMenu = null;
  setTimeout(function () {
    if (!document.body.classList.contains("mobile-sheet-open")) {
      document.getElementById("menu-backdrop").hidden = true;
    }
  }, 220);
}

document.addEventListener("click", function (evento) {
  if (!mediaMobile.matches) return;
  fecharOpcoesChamadosMobile(evento.target);
  const botao = evento.target.closest("[data-mobile-action]");
  if (botao) {
    if (botao.dataset.mobileAction === "open-menu") abrirMenuMobile();
    if (botao.dataset.mobileAction === "open-profile") abrirPerfilMobile();
    if (botao.dataset.mobileAction === "close-menu") fecharMenuMobile();
    if (botao.dataset.mobileAction === "home") {
      fecharMenuMobile();
      limparFiltros();
      atualizarFiltrosMobile();
      window.scrollTo(0, 0);
    }
    if (botao.dataset.mobileAction === "filters") {
      const painel = document.getElementById("filter-options");
      const aberto = painel.classList.toggle("is-open");
      botao.setAttribute("aria-expanded", String(aberto));
    }
  }
  const filtro = evento.target.closest(
    "#app-menu [data-status], #app-menu [data-category], #app-menu [data-action='clear-category']",
  );
  if (filtro && document.body.classList.contains("mobile-menu-open")) {
    fecharMenuMobile();
    window.scrollTo(0, 0);
  }
  atualizarFiltrosMobile();
});

document.addEventListener("keydown", function (evento) {
  if (mediaMobile.matches && evento.key === "Escape") {
    const opcoes = document.querySelector(".mobile-ticket-options[open]");
    if (opcoes) {
      evento.preventDefault();
      opcoes.querySelector("summary").focus();
      fecharOpcoesChamadosMobile();
    }
  }
  if (!document.body.classList.contains("mobile-sheet-open")) return;
  if (evento.key === "Escape") {
    evento.preventDefault();
    fecharMenuMobile();
  }
  if (evento.key === "Tab") {
    const painel = document.getElementById(
      document.body.classList.contains("mobile-profile-open")
        ? "mobile-profile-sheet"
        : "app-menu",
    );
    const botoes = [];
    for (const botao of painel.querySelectorAll(
      "a[href], button:not([disabled])",
    )) {
      if (botao.getClientRects().length) botoes.push(botao);
    }
    const primeiro = botoes[0];
    const ultimo = botoes[botoes.length - 1];
    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }
});

document.addEventListener("change", atualizarFiltrosMobile);
mediaMobile.addEventListener("change", sincronizarLayoutMobile);
sincronizarLayoutMobile();
