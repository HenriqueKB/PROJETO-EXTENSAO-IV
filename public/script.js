const socket = io();

document.getElementById("start").onclick = () => {
  socket.emit("iniciarPartida");
};

socket.on("papel", (data) => {
  const papelDiv = document.getElementById("papel");
  if (data.tipo === "impostor") {
    papelDiv.innerHTML = `<p>Você é o <b>IMPOSTOR</b>! Sua dica: ${data.dica}</p>`;
  } else {
    papelDiv.innerHTML = `<p>Você é <b>COMUM</b>. Palavra: ${data.palavra}</p>`;
  }
});

// Gera QR Code com link da sala
new QRCode(document.getElementById("qrcode"), window.location.href);
