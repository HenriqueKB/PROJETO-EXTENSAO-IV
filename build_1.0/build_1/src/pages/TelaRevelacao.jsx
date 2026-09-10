import { useState } from 'react'

const TelaRevelacao = ({ jogadores, impostor, palavraSecreta, onProximaEtapa }) => {
  // 1. ESTADOS LOCAIS (apenas para controlar a navegação desta tela)
  const [indexAtual, setIndexAtual] = useState(0)
  const [revelado, setRevelado] = useState(false)

  // Descobre qual o nome do jogador da vez baseado no índice
  const jogadorDaVez = jogadores[indexAtual]

  // Verifica se o jogador da vez é o impostor
  const ehOImpostor = jogadorDaVez === impostor

    setRevelado(false)
  // ... lógica dos botões de avançar e revelar
}