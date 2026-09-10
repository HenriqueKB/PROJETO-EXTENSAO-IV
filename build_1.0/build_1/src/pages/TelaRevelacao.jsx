import { useState } from 'react'

const TelaRevelacao = ({ jogadores, impostor, palavraSecreta, onProximaEtapa, dicaImpostor }) => {
  // 1. ESTADOS LOCAIS
  const [indexAtual, setIndexAtual] = useState(0)
  const [revelado, setRevelado] = useState(false)

  // 2. VARIÁVEIS CALCULADAS
  const jogadorDaVez = jogadores[indexAtual]
  const ehOImpostor = jogadorDaVez === impostor
  const ehOUltimoJogador = indexAtual === jogadores.length - 1

  // 3. HANDLERS
  const handleRevelar = () => {
    setRevelado(true)
  }

  const handleProximo = () => {
    setRevelado(false)

    if (indexAtual === jogadores.length - 1) {
      onProximaEtapa()
    } else {
      setIndexAtual(indexAtual + 1)
    }
  } // <-- AJUSTE 1: Removida a chave extra que estava aqui!

  // <-- AJUSTE 2: Adicionado o return que faltava para desenhar a tela
  return (
    <div className="tela-revelacao">
      <h1>Fase de Revelação</h1>

      {!revelado ? (
        <div>
          <h2>Passe para: <strong>{jogadorDaVez}</strong></h2>
          <button onClick={handleRevelar}>Ver Minha Função</button>
        </div>
      ) : (
        <div>
          <h2>Jogador: {jogadorDaVez}</h2>
          
          {ehOImpostor ? (
        <>
            <h3>Você é o IMPOSTOR!</h3>

            <p>Sua dica é: {dicaImpostor}</p>
        </>
            // Colocar a dica aqui!
          ) : (
            <h3>A palavra secreta é: {palavraSecreta}</h3>
            
          )}

          <button onClick={handleProximo}>
            {ehOUltimoJogador ? "Iniciar Discussão" : "Esconder e Passar"}
          </button>
        </div>
      )}
    </div>
  )
}

export default TelaRevelacao