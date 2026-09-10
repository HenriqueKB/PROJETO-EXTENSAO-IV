import { useState, useEffect } from 'react'

const TelaDiscussao = ({ onIrParaVotacao }) => {
  const [tempo, setTempo] = useState(120) // 2 minutos em segundos

  useEffect(() => {
    // Se o tempo acabou, não precisamos criar um intervalo
    if (tempo <= 0) return

    // Cria um intervalo que roda a cada 1 segundo (1000ms)
    const temporizador = setInterval(() => {
      setTempo((tempoAtual) => tempoAtual - 1)
    }, 1000)

    // Limpeza: interrompe o temporizador quando o componente desmonta ou o tempo muda
    return () => clearInterval(temporizador)
  }, [tempo])

  // Formata os segundos em MM:SS (ex: 120 vira "02:00", 65 vira "01:05")
  const minutos = String(Math.floor(tempo / 60)).padStart(2, '0')
  const segundos = String(tempo % 60).padStart(2, '0')
}