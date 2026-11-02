// Primeira visita: 30 segundos. Nas próximas visitas: 10 segundos.
function iniciarAbertura() {
  let duracao = 30000;
  try {
    if (localStorage.getItem("uaiteche-abertura-vista") === "sim") {
      duracao = 10000;
    }
    localStorage.setItem("uaiteche-abertura-vista", "sim");
  } catch {
    // A abertura continua funcionando se o navegador bloquear o armazenamento.
  }
  const inicio = Date.now();
  const abertura = document.getElementById("splash-screen");
  const progresso = document.getElementById("splash-progress");
  const barra = document.getElementById("splash-progress-fill");
  const contador = document.getElementById("splash-countdown");
  contador.textContent = duracao / 1000;
  progresso.setAttribute("aria-valuemax", duracao / 1000);

  function atualizarProgresso() {
    const decorrido = Math.min(Date.now() - inicio, duracao);
    contador.textContent = Math.ceil((duracao - decorrido) / 1000);
    progresso.setAttribute("aria-valuenow", Math.floor(decorrido / 1000));
    barra.style.transform = "scaleX(" + decorrido / duracao + ")";
  }

  const intervalo = setInterval(atualizarProgresso, 250);

  setTimeout(function () {
    clearInterval(intervalo);
    atualizarProgresso();
    abertura.hidden = true;
    document.querySelector(".app-shell").inert = false;
    document.body.classList.remove("is-opening");
    document.getElementById("announcer").textContent =
      "Sua central de suporte está disponível.";
  }, duracao);
}

iniciarAbertura();
