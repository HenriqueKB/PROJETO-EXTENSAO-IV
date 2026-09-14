import { useState } from 'react'

const TelaVotacao = ({ jogadores, impostor, onReiniciarJogo }) => {
  const [suspeitoEscolhido, setSuspeitoEscolhido] = useState(null)

  return (
    <div className="tela-votacao">
      <h1>Fase de Votação</h1>

      {!suspeitoEscolhido ? (
        <div className="lista-jogadores">
          <p>Selecione o jogador acusado pelo grupo:</p>
          {jogadores.map((jogador, index) => (
            <button key={index} onClick={() => setSuspeitoEscolhido(jogador)}>
              {jogador}
            </button>
          ))}
        </div>
      ) : (
        <div className="resultado">
          <h2>O acusado foi: <strong>{suspeitoEscolhido}</strong></h2>

          {suspeitoEscolhido === impostor ? (
            <h3 style={{ color: 'green' }}>🎉 Vitória dos Inocentes! {impostor} era o Impostor.</h3>
          ) : (
            <h3 style={{ color: 'red' }}>🚨 O Impostor Venceu! {suspeitoEscolhido} era inocente. O Impostor era {impostor}.</h3>
          )}

          <button onClick={onReiniciarJogo}>Jogar Novamente</button>
        </div>
      )}
    </div>
  )
}

export default TelaVotacao