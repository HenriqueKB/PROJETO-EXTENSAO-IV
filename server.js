const crypto = require("crypto");
const os = require("os");
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const palavras = require("./palavras");

const PORT = Number(process.env.PORT) || 3000;
const MIN_VAGAS = 3;
const MAX_VAGAS = 12;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/** @type {Record<string, Room>} */
const rooms = {};

/**
 * @typedef {object} TokenState
 * @property {string|null} socketId
 * @property {boolean} connected
 * @property {number} seat
 * @property {string} label
 */

/**
 * @typedef {object} Room
 * @property {Record<string, TokenState>} tokens
 * @property {string|null} palavra
 * @property {string|null} categoria
 * @property {string|null} impostorToken
 * @property {'lobby'|'pistas'|'votacao'|'resultado'} fase
 * @property {string|null} hostSocketId
 * @property {Record<string, string>} votos token -> tokenVotado
 * @property {object|null} ultimoResultado
 * @property {number} nextSeat
 */

function gerarRoomId() {
  return crypto.randomBytes(3).toString("hex");
}

function gerarToken() {
  return crypto.randomUUID();
}

function enderecoLan() {
  const ifaces = os.networkInterfaces();
  for (const lista of Object.values(ifaces)) {
    if (!lista) continue;
    for (const iface of lista) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

function basePublica(req) {
  const hostHeader = req.get("host") || `localhost:${PORT}`;
  if (hostHeader.startsWith("localhost") || hostHeader.startsWith("127.0.0.1")) {
    return `http://${enderecoLan()}:${PORT}`;
  }
  const proto = req.protocol || "http";
  return `${proto}://${hostHeader}`;
}

function salaOu404(res, roomId) {
  const room = rooms[roomId];
  if (!room) {
    res.status(404).json({ erro: "Sala não encontrada." });
    return null;
  }
  return room;
}

function tokensOrdenados(room) {
  return Object.entries(room.tokens).sort((a, b) => a[1].seat - b[1].seat);
}

function criarVaga(room) {
  const token = gerarToken();
  const seat = room.nextSeat++;
  room.tokens[token] = {
    socketId: null,
    connected: false,
    seat,
    label: `Jogador ${seat}`,
  };
  return token;
}

function payloadSala(room, roomId, baseUrl) {
  const vagas = tokensOrdenados(room).map(([token, info]) => ({
    token,
    seat: info.seat,
    label: info.label,
    connected: info.connected,
    joinUrl: `${baseUrl}/sala/${roomId}/join/${token}`,
  }));
  const connected = vagas.filter((v) => v.connected).length;
  return {
    roomId,
    tokens: vagas.map((v) => v.token),
    vagas,
    connected,
    total: vagas.length,
    fase: room.fase,
    resultado: room.ultimoResultado,
  };
}

function emitirStatus(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  const vagas = tokensOrdenados(room).map(([token, info]) => ({
    token,
    seat: info.seat,
    label: info.label,
    connected: info.connected,
  }));
  const connected = vagas.filter((v) => v.connected).length;
  const payload = {
    connected,
    total: vagas.length,
    vagas,
    fase: room.fase,
    votosRecebidos: Object.keys(room.votos).length,
  };
  io.to(`host:${roomId}`).emit("status", payload);
  io.to(`sala:${roomId}`).emit("status", payload);
}

function jogadoresConectados(room) {
  return tokensOrdenados(room).filter(([, info]) => info.connected);
}

function escolherAleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function resetarRodada(room) {
  room.palavra = null;
  room.categoria = null;
  room.impostorToken = null;
  room.votos = {};
  room.ultimoResultado = null;
  room.fase = "lobby";
}

function apurarVotos(roomId) {
  const room = rooms[roomId];
  if (!room || room.fase !== "votacao") return;

  const contagem = {};
  const detalhe = [];
  for (const [deToken, paraToken] of Object.entries(room.votos)) {
    contagem[paraToken] = (contagem[paraToken] || 0) + 1;
    const de = room.tokens[deToken];
    const para = room.tokens[paraToken];
    detalhe.push({
      de: de ? de.label : deToken,
      para: para ? para.label : paraToken,
    });
  }

  let eliminadoToken = null;
  let maxVotos = 0;
  let empate = false;
  for (const [token, n] of Object.entries(contagem)) {
    if (n > maxVotos) {
      maxVotos = n;
      eliminadoToken = token;
      empate = false;
    } else if (n === maxVotos) {
      empate = true;
    }
  }

  if (empate || !eliminadoToken) {
    eliminadoToken = null;
  }

  const impostor = room.tokens[room.impostorToken];
  const comunsVencem = eliminadoToken === room.impostorToken;
  const resultado = {
    empate: Boolean(empate || !eliminadoToken),
    eliminado: eliminadoToken
      ? { token: eliminadoToken, label: room.tokens[eliminadoToken].label }
      : null,
    votos: Object.fromEntries(
      Object.entries(contagem).map(([token, n]) => [
        room.tokens[token] ? room.tokens[token].label : token,
        n,
      ])
    ),
    detalhe,
    impostor: {
      token: room.impostorToken,
      label: impostor ? impostor.label : "—",
    },
    palavra: room.palavra,
    categoria: room.categoria,
    vencedor: comunsVencem ? "comuns" : "impostor",
  };

  room.fase = "resultado";
  room.ultimoResultado = resultado;
  io.to(`host:${roomId}`).emit("resultado", resultado);
  io.to(`sala:${roomId}`).emit("resultado", resultado);
  emitirStatus(roomId);
}

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "host.html"));
});

app.get("/host", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "host.html"));
});

app.get("/sala/:roomId/join/:token", (req, res) => {
  const { roomId, token } = req.params;
  const room = rooms[roomId];
  if (!room || !room.tokens[token]) {
    res.status(404).sendFile(path.join(__dirname, "public", "player.html"));
    return;
  }
  res.sendFile(path.join(__dirname, "public", "player.html"));
});

app.get("/criar-sala", (req, res) => {
  const vagas = Math.min(
    MAX_VAGAS,
    Math.max(MIN_VAGAS, Number(req.query.vagas) || 6)
  );
  const roomId = gerarRoomId();
  /** @type {Room} */
  const room = {
    tokens: {},
    palavra: null,
    categoria: null,
    impostorToken: null,
    fase: "lobby",
    hostSocketId: null,
    votos: {},
    ultimoResultado: null,
    nextSeat: 1,
  };
  for (let i = 0; i < vagas; i += 1) {
    criarVaga(room);
  }
  rooms[roomId] = room;
  res.json(payloadSala(room, roomId, basePublica(req)));
});

app.get("/sala/:roomId", (req, res) => {
  const room = salaOu404(res, req.params.roomId);
  if (!room) return;
  res.json(payloadSala(room, req.params.roomId, basePublica(req)));
});

app.post("/sala/:roomId/vagas", (req, res) => {
  const room = salaOu404(res, req.params.roomId);
  if (!room) return;
  if (room.fase !== "lobby") {
    res.status(409).json({ erro: "Só é possível alterar vagas no lobby." });
    return;
  }

  const acao = req.body && req.body.acao;
  if (acao === "adicionar") {
    const total = Object.keys(room.tokens).length;
    if (total >= MAX_VAGAS) {
      res.status(400).json({ erro: `Máximo de ${MAX_VAGAS} vagas.` });
      return;
    }
    criarVaga(room);
  } else if (acao === "remover") {
    const token = req.body.token;
    const total = Object.keys(room.tokens).length;
    if (total <= MIN_VAGAS) {
      res.status(400).json({ erro: `Mínimo de ${MIN_VAGAS} vagas.` });
      return;
    }
    if (!token || !room.tokens[token]) {
      res.status(400).json({ erro: "Vaga inválida." });
      return;
    }
    if (room.tokens[token].connected) {
      res.status(400).json({ erro: "Não é possível remover uma vaga ocupada." });
      return;
    }
    delete room.tokens[token];
  } else {
    res.status(400).json({ erro: "Ação inválida." });
    return;
  }

  emitirStatus(req.params.roomId);
  res.json(payloadSala(room, req.params.roomId, basePublica(req)));
});

io.on("connection", (socket) => {
  socket.on("registerHost", ({ roomId } = {}) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("erro", { mensagem: "Sala não encontrada." });
      return;
    }
    if (room.hostSocketId && room.hostSocketId !== socket.id) {
      const anterior = io.sockets.sockets.get(room.hostSocketId);
      if (anterior) anterior.leave(`host:${roomId}`);
    }
    room.hostSocketId = socket.id;
    socket.data.role = "host";
    socket.data.roomId = roomId;
    socket.join(`host:${roomId}`);
    emitirStatus(roomId);
  });

  socket.on("registerToken", ({ roomId, token } = {}) => {
    const room = rooms[roomId];
    if (!room || !room.tokens[token]) {
      socket.emit("erro", { mensagem: "Token ou sala inválidos." });
      return;
    }

    const vaga = room.tokens[token];
    if (vaga.socketId && vaga.socketId !== socket.id) {
      const anterior = io.sockets.sockets.get(vaga.socketId);
      if (anterior) {
        anterior.emit("erro", { mensagem: "Esta vaga foi usada em outro aparelho." });
        anterior.disconnect(true);
      }
    }

    vaga.socketId = socket.id;
    vaga.connected = true;
    socket.data.role = "player";
    socket.data.roomId = roomId;
    socket.data.token = token;
    socket.join(`sala:${roomId}`);

    socket.emit("registrado", {
      roomId,
      token,
      label: vaga.label,
      fase: room.fase,
    });
    emitirStatus(roomId);

    if (room.fase === "pistas" || room.fase === "votacao") {
      if (token === room.impostorToken) {
        socket.emit("papel", {
          tipo: "impostor",
          dica: `Categoria: ${room.categoria}`,
        });
      } else {
        socket.emit("papel", { tipo: "comum", palavra: room.palavra });
      }
    }
    if (room.fase === "votacao") {
      socket.emit("iniciarVotacao", {
        jogadores: jogadoresConectados(room).map(([t, info]) => ({
          token: t,
          label: info.label,
        })),
      });
    }
    if (room.fase === "resultado" && room.ultimoResultado) {
      socket.emit("resultado", room.ultimoResultado);
    }
  });

  socket.on("iniciarPartida", ({ roomId } = {}) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("erro", { mensagem: "Sala não encontrada." });
      return;
    }
    if (socket.id !== room.hostSocketId) {
      socket.emit("erro", { mensagem: "Apenas o host inicia a partida." });
      return;
    }
    const conectados = jogadoresConectados(room);
    if (conectados.length < MIN_VAGAS) {
      socket.emit("erro", {
        mensagem: `É preciso ao menos ${MIN_VAGAS} jogadores conectados.`,
      });
      return;
    }

    const item = escolherAleatorio(palavras);
    room.palavra = item.palavra;
    room.categoria = item.categoria;
    room.impostorToken = escolherAleatorio(conectados)[0];
    room.votos = {};
    room.ultimoResultado = null;
    room.fase = "pistas";

    for (const [token, info] of conectados) {
      if (!info.socketId) continue;
      if (token === room.impostorToken) {
        io.to(info.socketId).emit("papel", {
          tipo: "impostor",
          dica: `Categoria: ${room.categoria}`,
        });
      } else {
        io.to(info.socketId).emit("papel", {
          tipo: "comum",
          palavra: room.palavra,
        });
      }
    }

    io.to(`host:${roomId}`).emit("partidaIniciada", {
      conectados: conectados.length,
    });
    emitirStatus(roomId);
  });

  socket.on("enviarPista", ({ roomId, texto } = {}) => {
    const room = rooms[roomId];
    const token = socket.data.token;
    if (!room || !token || !room.tokens[token]) return;
    if (room.fase !== "pistas") return;
    const t = String(texto || "").trim().slice(0, 80);
    if (!t) return;
    io.to(`host:${roomId}`).emit("pista", {
      label: room.tokens[token].label,
      texto: t,
    });
  });

  socket.on("iniciarVotacao", ({ roomId } = {}) => {
    const room = rooms[roomId];
    if (!room || socket.id !== room.hostSocketId) {
      socket.emit("erro", { mensagem: "Apenas o host abre a votação." });
      return;
    }
    if (room.fase !== "pistas") {
      socket.emit("erro", { mensagem: "A votação só abre após as pistas." });
      return;
    }
    room.fase = "votacao";
    room.votos = {};
    const jogadores = jogadoresConectados(room).map(([token, info]) => ({
      token,
      label: info.label,
    }));
    io.to(`sala:${roomId}`).emit("iniciarVotacao", { jogadores });
    io.to(`host:${roomId}`).emit("iniciarVotacao", { jogadores });
    emitirStatus(roomId);
  });

  socket.on("votar", ({ roomId, tokenVotado } = {}) => {
    const room = rooms[roomId];
    const token = socket.data.token;
    if (!room || room.fase !== "votacao") {
      socket.emit("erro", { mensagem: "A votação não está aberta." });
      return;
    }
    if (!token || !room.tokens[token]) {
      socket.emit("erro", { mensagem: "Jogador não registrado." });
      return;
    }
    if (!room.tokens[tokenVotado] || tokenVotado === token) {
      socket.emit("erro", { mensagem: "Voto inválido." });
      return;
    }
    if (room.votos[token]) {
      socket.emit("erro", { mensagem: "Você já votou." });
      return;
    }

    room.votos[token] = tokenVotado;
    socket.emit("votoRegistrado", { ok: true });
    emitirStatus(roomId);

    const conectados = jogadoresConectados(room).map(([t]) => t);
    const todosVotaram = conectados.every((t) => room.votos[t]);
    if (todosVotaram) {
      apurarVotos(roomId);
    }
  });

  socket.on("encerrarVotacao", ({ roomId } = {}) => {
    const room = rooms[roomId];
    if (!room || socket.id !== room.hostSocketId) return;
    if (room.fase !== "votacao") return;
    apurarVotos(roomId);
  });

  socket.on("reiniciar", ({ roomId } = {}) => {
    const room = rooms[roomId];
    if (!room || socket.id !== room.hostSocketId) {
      socket.emit("erro", { mensagem: "Apenas o host reinicia a partida." });
      return;
    }
    resetarRodada(room);
    io.to(`sala:${roomId}`).emit("reiniciado", { fase: "lobby" });
    io.to(`host:${roomId}`).emit("reiniciado", { fase: "lobby" });
    emitirStatus(roomId);
  });

  socket.on("disconnect", () => {
    const { roomId, token, role } = socket.data || {};
    const room = rooms[roomId];
    if (!room) return;
    if (role === "host" && room.hostSocketId === socket.id) {
      room.hostSocketId = null;
    }
    if (role === "player" && token && room.tokens[token] && room.tokens[token].socketId === socket.id) {
      room.tokens[token].connected = false;
      room.tokens[token].socketId = null;
      emitirStatus(roomId);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor em http://localhost:${PORT}/host`);
  console.log(`Na rede local: http://${enderecoLan()}:${PORT}/host`);
});
