import { useState } from 'react'

const TelaRevelacao = ({ jogadores, impostor, palavraSecreta, onProximaEtapa }) => {
  // 1. ESTADOS LOCAIS (apenas para controlar a navegação desta tela)
  const [indexAtual, setIndexAtual] = useState(0)
  const [revelado, setRevelado] = useState(false)


  // 2. Funções pra checar o estado dos jogadores

  // Descobre qual o nome do jogador da vez baseado no índice
    const jogadorDaVez = jogadores[indexAtual]

  // Verifica se o jogador da vez é o impostor
    const ehOImpostor = jogadorDaVez === impostor

 // Verifica se já está no último jogador da vez
    const ehOUltimoJogador = indexAtual === jogadores.length - 1

  // Lógica dos botões de avançar e revelar 
    const handleRevelar = () => {
        setRevelado(true)
    }

    const handleProximo = () => {
        setRevelado(false)

        if (indexAtual === jogadores.length - 1) {
           onProximaEtapa() // Avanca o jogo

        } else {
            setIndexAtual(indexAtual + 1) // Passa a posição pro próximo
        }
        }
};
