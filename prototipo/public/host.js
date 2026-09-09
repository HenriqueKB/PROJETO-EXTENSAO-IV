const socket = io();

const setup = document.getElementById("setup");
const lobby = document.getElementById("lobby");
const vagasInput = document.getElementById("vagasInput");
const criarSalaBtn = document.getElementById("criarSalaBtn");
const addVagaBtn = document.getElementById("addVagaBtn");
const iniciarBtn = document.getElementById("iniciarBtn");
const votarBtn = document.getElementById("votarBtn");
const encerrarVotoBtn = document.getElementById("encerrarVotoBtn");
const reiniciarBtn = document.getElementById("reiniciarBtn");
const qrGrid = document.getElementById("qrGrid");
const metaSala = document.getElementById("metaSala");
const roomIdLabel = document.getElementById("roomIdLabel");
const faseLabel = document.getElementById("faseLabel");
const conexoesLabel = document.getElementById("conexoesLabel");
const setupErro = document.getElementById("setupErro");
const hostErro = document.getElementById("hostErro");
const instrucao = document.getElementById("instrucao");
const pistasBox = document.getElementById("pistasBox");
const listaPistas = document.getElementById("listaPistas");
const resultadoBox = document.getElementById("resultadoBox");

let roomId = null;
let sala = null;

const FASES = {
  lobby: "Lobby",
  pistas: "Pistas orais",
  votacao: "Votação",
  resultado: "Resultado",
};

function mostrarErro(el, mensagem) {
  if (!mensagem) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  el.hidden = false;
  el.textContent = mensagem;
}

function atualizarBotoes(fase, connected) {
  const noLobby = fase === "lobby";
  addVagaBtn.hidden = !noLobby;
  iniciarBtn.hidden = !noLobby;
  iniciarBtn.disabled = connected < 3;
  votarBtn.hidden = fase !== "pistas";
  encerrarVotoBtn.hidden = fase !== "votacao";
  reiniciarBtn.hidden = fase !== "resultado";
}

function renderQrs(vagas) {
  qrGrid.innerHTML = "";
  vagas.forEach((vaga) => {
    const card = document.createElement("article");
    card.className = "qr-card" + (vaga.connected ? " ocupada" : "");
    const joinUrl = vaga.joinUrl || `${window.location.origin}/sala/${roomId}/join/${vaga.token}`;
    card.innerHTML = `
      <h3>${vaga.label}</h3>
      <div class="qr-target" data-token="${vaga.token}"></div>
      <span class="status">${vaga.connected ? "Conectado" : "Aguardando"}</span>
      <button type="button" class="remover" data-token="${vaga.token}">Remover</button>
    `;
    qrGrid.appendChild(card);
    const target = card.querySelector(".qr-target");
    // eslint-disable-next-line no-new
    new QRCode(target, {
      text: joinUrl,
      width: 132,
      height: 132,
      correctLevel: QRCode.CorrectLevel.M,
    });
    const remover = card.querySelector(".remover");
    remover.hidden = sala.fase !== "lobby" || vaga.connected;
    remover.onclick = () => alterarVaga("remover", vaga.token);
  });
}

function aplicarSala(data) {
  sala = data;
  roomId = data.roomId;
  setup.hidden = true;
  lobby.hidden = false;
  metaSala.hidden = false;
  roomIdLabel.textContent = data.roomId;
  faseLabel.textContent = FASES[data.fase] || data.fase;
  conexoesLabel.textContent = `${data.connected}/${data.total} conectados`;
  atualizarBotoes(data.fase, data.connected);
  renderQrs(data.vagas);
  instrucao.textContent =
    data.fase === "pistas"
      ? "Cada jogador dá uma pista curta em voz alta. Não mostre os celulares."
      : data.fase === "votacao"
        ? "Votação aberta nos celulares. Aguarde ou encerre quando quiser."
        : "Peça para cada pessoa escanear um QR diferente. O papel secreto aparece só no celular.";
}

async function criarSala() {
  mostrarErro(setupErro, "");
  const vagas = Number(vagasInput.value) || 6;
  const res = await fetch(`/criar-sala?vagas=${encodeURIComponent(vagas)}`);
  const data = await res.json();
  if (!res.ok) {
    mostrarErro(setupErro, data.erro || "Não foi possível criar a sala.");
    return;
  }
  sessionStorage.setItem("roomId", data.roomId);
  socket.emit("registerHost", { roomId: data.roomId });
  aplicarSala(data);
}

socket.on("connect", () => {
  if (roomId) socket.emit("registerHost", { roomId });
});

async function alterarVaga(acao, token) {
  mostrarErro(hostErro, "");
  const res = await fetch(`/sala/${roomId}/vagas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acao, token }),
  });
  const data = await res.json();
  if (!res.ok) {
    mostrarErro(hostErro, data.erro || "Não foi possível alterar a vaga.");
    return;
  }
  aplicarSala(data);
}

function renderResultado(resultado) {
  resultadoBox.hidden = false;
  const titulo = resultado.empate
    ? "Empate na votação — o impostor vence"
    : resultado.vencedor === "comuns"
      ? "Os comuns venceram"
      : "O impostor venceu";
  const votos = Object.entries(resultado.votos || {})
    .map(([nome, n]) => `<li>${nome}: ${n} voto(s)</li>`)
    .join("");
  const detalhe = (resultado.detalhe || [])
    .map((d) => `<li>${d.de} → ${d.para}</li>`)
    .join("");
  resultadoBox.innerHTML = `
    <h2>${titulo}</h2>
    <p>Palavra: <strong>${resultado.palavra}</strong> (${resultado.categoria})</p>
    <p>Impostor: <strong>${resultado.impostor.label}</strong></p>
    ${resultado.eliminado ? `<p>Eliminado: <strong>${resultado.eliminado.label}</strong></p>` : "<p>Ninguém foi eliminado.</p>"}
    <h3>Placar</h3>
    <ul>${votos || "<li>Nenhum voto</li>"}</ul>
    <h3>Quem votou em quem</h3>
    <ul>${detalhe || "<li>—</li>"}</ul>
  `;
}

criarSalaBtn.onclick = () => {
  criarSala().catch((err) => mostrarErro(setupErro, err.message));
};

addVagaBtn.onclick = () => alterarVaga("adicionar");

iniciarBtn.onclick = () => {
  mostrarErro(hostErro, "");
  socket.emit("iniciarPartida", { roomId });
};

votarBtn.onclick = () => socket.emit("iniciarVotacao", { roomId });
encerrarVotoBtn.onclick = () => socket.emit("encerrarVotacao", { roomId });
reiniciarBtn.onclick = () => {
  resultadoBox.hidden = true;
  listaPistas.innerHTML = "";
  pistasBox.hidden = true;
  socket.emit("reiniciar", { roomId });
};

socket.on("status", (status) => {
  if (!sala) return;
  sala.fase = status.fase;
  sala.connected = status.connected;
  sala.total = status.total;
  sala.vagas = sala.vagas.map((vaga) => {
    const atual = status.vagas.find((x) => x.token === vaga.token);
    return atual ? { ...vaga, connected: atual.connected, label: atual.label } : vaga;
  });
  const novos = status.vagas.filter((x) => !sala.vagas.some((v) => v.token === x.token));
  if (novos.length) {
    fetch(`/sala/${roomId}`)
      .then((r) => r.json())
      .then(aplicarSala);
    return;
  }
  sala.vagas = sala.vagas.filter((v) => status.vagas.some((x) => x.token === v.token));
  aplicarSala(sala);
});

socket.on("erro", ({ mensagem }) => mostrarErro(hostErro, mensagem));

socket.on("partidaIniciada", () => {
  pistasBox.hidden = false;
});

socket.on("pista", ({ label, texto }) => {
  pistasBox.hidden = false;
  const li = document.createElement("li");
  li.textContent = `${label}: ${texto}`;
  listaPistas.appendChild(li);
});

socket.on("resultado", renderResultado);

socket.on("reiniciado", () => {
  resultadoBox.hidden = true;
  listaPistas.innerHTML = "";
});

(async function restaurarSala() {
  const saved = sessionStorage.getItem("roomId");
  if (!saved) return;
  const res = await fetch(`/sala/${saved}`);
  if (!res.ok) {
    sessionStorage.removeItem("roomId");
    return;
  }
  const data = await res.json();
  socket.emit("registerHost", { roomId: data.roomId });
  aplicarSala(data);
})();
