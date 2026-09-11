import { useState } from "react"

const TelaVotacao = ({ jogadores, impostor, onReiniciarJogo }) => {
  // Estado para guardar quem o grupo escolheu como suspeito
  const [suspeitoEscolhido, setSuspeitoEscolhido] = useState(null)

  const handleVotar = (nomeDoJogador) => {
    setSuspeitoEscolhido(nomeDoJogador)
  }

  return (
    <div className="tela-votacao">
      <h1>Quem é o Impostor?</h1>

      {!suspeitoEscolhido ? (
        <div className="lista-jogadores">
          {jogadores.map((jogador, index) => (
            <button key={index} onClick={() => handleVotar(jogador)}>
              {jogador}
            </button>
          ))}
        </div>
      ) : (
        <div className="resultado">
          <h2>O grupo votou em: {suspeitoEscolhido}</h2>

          {suspeitoEscolhido === impostor ? (
            <h3 style={{ color: 'green' }}>O grupo ACERTOU! O Impostor era {impostor}!</h3>
          ) : (
            <h3 style={{ color: 'red' }}>O grupo ERROU! {suspeitoEscolhido} era inocente. O Impostor era {impostor}!</h3>
          )}

          <button onClick={onReiniciarJogo}>Jogar Novamente</button>
        </div>
      )}
    </div>
  )
}

export default TelaVotacao