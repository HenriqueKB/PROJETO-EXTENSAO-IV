import { useState, useEffect } from 'react'

const TelaDiscussao = ({ onIrParaVotacao }) => {
  const [timeLeft, setTimeLeft] = useState(150) // 120 segundos = 2 minutos

  useEffect(() => {
    if (timeLeft <= 0) return

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timerId)
  }, [timeLeft])

  // Formatação rápida para exibir 02:00 em vez de apenas 120s
  const minutos = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const segundos = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="tela-discussao">
      <h1>Fase de Discussão</h1>
      <p>
        Tentem descrever a palavra entre si, 
        deem 3 dicas que tem relação com a palavra e 
        descubram entre si quem é o IMPOSTOR! 
      </p>

      <div className="cronometro">
        <h2>{minutos}:{segundos}</h2>
      </div>

      <button onClick={onIrParaVotacao}>
        Ir para Votação
      </button>
    </div>
  )
}

export default TelaDiscussao