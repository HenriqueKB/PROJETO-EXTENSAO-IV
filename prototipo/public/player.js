const socket = io();

const titulo = document.getElementById("titulo");
const subtitulo = document.getElementById("subtitulo");
const papelBox = document.getElementById("papelBox");
const pistaForm = document.getElementById("pistaForm");
const pistaInput = document.getElementById("pistaInput");
const votoBox = document.getElementById("votoBox");
const votoOpcoes = document.getElementById("votoOpcoes");
const votoStatus = document.getElementById("votoStatus");
const resultadoBox = document.getElementById("resultadoBox");
const playerErro = document.getElementById("playerErro");

const partes = window.location.pathname.split("/").filter(Boolean);
const roomId = partes[1];
const token = partes[3];
let meuLabel = "";
let jaVotei = false;

function mostrarErro(mensagem) {
  playerErro.hidden = !mensagem;
  playerErro.textContent = mensagem || "";
}

function renderPapel(data) {
  papelBox.hidden = false;
  papelBox.className = "papel " + data.tipo;
  if (data.tipo === "impostor") {
    titulo.textContent = "Você é o impostor";
    papelBox.innerHTML = `<p>Não recebeu a palavra.</p><p>Dica: <strong>${data.dica}</strong></p>`;
  } else {
    titulo.textContent = "Você é comum";
    papelBox.innerHTML = `<p>A palavra secreta é</p><p><strong>${data.palavra}</strong></p>`;
  }
  subtitulo.textContent = "Dê uma pista curta em voz alta, sem explicar a palavra.";
  pistaForm.hidden = false;
  votoBox.hidden = true;
  resultadoBox.hidden = true;
}

if (!roomId || !token) {
  titulo.textContent = "Link inválido";
  subtitulo.textContent = "Escaneie um QR Code gerado pelo host.";
} else {
  socket.emit("registerToken", { roomId, token });
}

socket.on("registrado", (data) => {
  meuLabel = data.label;
  titulo.textContent = data.label;
  if (data.fase === "lobby") {
    subtitulo.textContent = "Aguardando o host iniciar a partida…";
  }
});

socket.on("erro", ({ mensagem }) => {
  mostrarErro(mensagem);
  titulo.textContent = "Não foi possível entrar";
});

socket.on("papel", renderPapel);

pistaForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const texto = pistaInput.value.trim();
  if (!texto) return;
  socket.emit("enviarPista", { roomId, texto });
  pistaInput.value = "";
  subtitulo.textContent = "Pista enviada ao monitor do host.";
});

socket.on("iniciarVotacao", ({ jogadores }) => {
  jaVotei = false;
  pistaForm.hidden = true;
  votoBox.hidden = false;
  resultadoBox.hidden = true;
  votoStatus.textContent = "Toque em quem você acha que é o impostor.";
  votoOpcoes.innerHTML = "";
  jogadores
    .filter((j) => j.token !== token)
    .forEach((j) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = j.label;
      btn.onclick = () => {
        if (jaVotei) return;
        socket.emit("votar", { roomId, tokenVotado: j.token });
      };
      votoOpcoes.appendChild(btn);
    });
});

socket.on("votoRegistrado", () => {
  jaVotei = true;
  votoStatus.textContent = "Voto registrado. Aguarde o resultado.";
  votoOpcoes.querySelectorAll("button").forEach((b) => {
    b.disabled = true;
  });
});

socket.on("resultado", (resultado) => {
  votoBox.hidden = true;
  pistaForm.hidden = true;
  resultadoBox.hidden = false;
  const tituloRes = resultado.empate
    ? "Empate — o impostor venceu"
    : resultado.vencedor === "comuns"
      ? "Os comuns venceram"
      : "O impostor venceu";
  const detalhe = (resultado.detalhe || [])
    .map((d) => `<li>${d.de} → ${d.para}</li>`)
    .join("");
  resultadoBox.innerHTML = `
    <h2>${tituloRes}</h2>
    <p>Palavra: <strong>${resultado.palavra}</strong></p>
    <p>Impostor: <strong>${resultado.impostor.label}</strong></p>
    <ul>${detalhe}</ul>
  `;
});

socket.on("reiniciado", () => {
  jaVotei = false;
  papelBox.hidden = true;
  pistaForm.hidden = true;
  votoBox.hidden = true;
  resultadoBox.hidden = true;
  titulo.textContent = meuLabel || "Aguardando";
  subtitulo.textContent = "Nova rodada. Espere o host iniciar.";
});
