# PROJETO-EXTENSAO-IV

Protótipo de **jogo de dedução social** para feiras acadêmicas. Roda em um único computador (host): o monitor mostra QR Codes; cada celular recebe um papel secreto (comum ou impostor). Não usa banco de dados — salas, tokens e votos ficam em memória.

## Como jogar

1. O host cria a sala no PC e escolhe o número de vagas (3 a 12).
2. Cada vaga vira um QR Code com um token único.
3. Os jogadores escaneiam um QR cada um e aguardam no celular.
4. Ao iniciar, o servidor sorteia uma palavra e um impostor.
   - **Comuns** veem a palavra.
   - **Impostor** vê só uma dica de categoria.
5. Todos dão pistas curtas **em voz alta** (há envio de texto opcional ao host).
6. O host abre a votação; cada celular escolhe um suspeito.
7. O sistema revela se o impostor foi eliminado, a palavra e quem votou em quem.
8. O host pode iniciar uma nova rodada com os mesmos tokens.

## Rodar localmente

```bash
npm install
npm start
```

No PC do laboratório, abra:

- `http://localhost:3000/host`
- ou `http://localhost:3000/`

O servidor escuta em `0.0.0.0`. Celulares na **mesma rede Wi-Fi** devem usar o IP local impresso no terminal, por exemplo `http://192.168.x.x:3000/host`. Os QR Codes já usam esse endereço quando o host abre a página em `localhost`.

Reiniciar o processo apaga as salas (esperado para uso em feira).

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
