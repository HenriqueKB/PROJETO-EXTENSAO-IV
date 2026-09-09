# PROJETO-EXTENSAO-IV

Protótipo do nosso jogo, feito para a equipe melhor entender o projeto

## Rodar localmente

```bash
npm install
npm start
```

No seu PC, abra:

- `http://localhost:3000/host`
- ou `http://localhost:3000/`

O servidor escuta em `0.0.0.0`. Celulares na **mesma rede Wi-Fi** devem usar o IP local impresso no terminal, por exemplo `http://192.168.x.x:3000/host`. Os QR Codes já usam esse endereço quando o host abre a página em `localhost`.

## Arquivos

| Caminho | Função |
| --- | --- |
| `server.js` | Express + Socket.io: salas, tokens, sorteio, votação |
| `palavras.js` | Lista de palavras e categorias |
| `public/host.html` / `host.js` | Interface do host (QRs, status, iniciar, votar) |
| `public/player.html` / `player.js` | Interface do jogador (papel e voto) |
| `public/qrcode.min.js` | Geração dos QR Codes no monitor |
| `public/style.css` | Estilos das telas |

## Rotas HTTP

- `GET /` ou `GET /host` → tela do host
- `GET /criar-sala?vagas=6` → `{ roomId, tokens, vagas }`
- `GET /sala/:roomId/join/:token` → tela do jogador
- `POST /sala/:roomId/vagas` → `{ acao: "adicionar" }` ou `{ acao: "remover", token }`

## Eventos Socket.io

- Jogador → `registerToken` `{ roomId, token }` → `registrado` ou `erro`
- Host → `iniciarPartida` `{ roomId }` → cada jogador recebe `papel`
  - `{ tipo: "comum", palavra }`
  - `{ tipo: "impostor", dica: "Categoria: ..." }`
- Host → `iniciarVotacao` / `encerrarVotacao` / `reiniciar`
- Jogador → `votar` `{ roomId, tokenVotado }` → `resultado` para host e jogadores
- Servidor → `status` `{ connected, total, vagas, fase }` para o host
