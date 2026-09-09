const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const palavras = require("./palavras");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let jogadores = [];
let palavraAtual = null;
let impostor = null;

io.on("connection", (socket) => {
  console.log("Novo jogador conectado:", socket.id);
  jogadores.push(socket.id);

  socket.on("iniciarPartida", () => {
    palavraAtual = palavras[Math.floor(Math.random() * palavras.length)];
    impostor = jogadores[Math.floor(Math.random() * jogadores.length)];

    jogadores.forEach((id) => {
      if (id === impostor) {
        io.to(id).emit("papel", { tipo: "impostor", dica: "Categoria: Ciência" });
      } else {
        io.to(id).emit("papel", { tipo: "comum", palavra: palavraAtual });
      }
    });
  });

  socket.on("disconnect", () => {
    jogadores = jogadores.filter((id) => id !== socket.id);
  });
});

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
