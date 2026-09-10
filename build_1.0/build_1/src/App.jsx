import { useState } from 'react'
import './App.css'

// Import das suas páginas
import TelaCadastro from './pages/TelaCadastro'
import TelaRevelacao from './pages/TelaRevelacao'
import TelaDiscussao from './pages/TelaDiscussao'
import TelaVotacao from './pages/TelaVotacao'

function App() {
  // 1. ESTADOS GLOBAIS DO JOGO
  const [jogadores, setJogadores] = useState([])
  const [etapa, setEtapa] = useState('CADASTRO') // Controla qual tela é exibida: 'CADASTRO' | 'REVELACAO' | 'DISCUSSAO' | 'VOTACAO'
  const [palavraSecreta, setPalavraSecreta] = useState('')
  const [impostor, setImpostor] = useState(null)

  // 2. FUNÇÕES DE TRANSIÇÃO DE ETAPA
  const handleIniciarJogo = (listaDeJogadores) => {
    setJogadores(listaDeJogadores)

    // Lógica rápida para sortear o impostor
    const indiceSorteado = Math.floor(Math.random() * listaDeJogadores.length)
    setImpostor(listaDeJogadores[indiceSorteado])

    // Exemplo de palavra sorteada (depois isso virá do seu palavras.json)
    setPalavraSecreta('Computador')

    // Avança para a próxima tela
    setEtapa('REVELACAO')
  }

  // 3. RENDERIZAÇÃO DA TELA ATUAL
  return (
    <div className="app-container">
      {etapa === 'CADASTRO' && (
        <TelaCadastro onIniciarJogo={handleIniciarJogo} />
      )}

      {etapa === 'REVELACAO' && (
        <TelaRevelacao 
          jogadores={jogadores} 
          impostor={impostor} 
          palavraSecreta={palavraSecreta}
          onProximaEtapa={() => setEtapa('DISCUSSAO')} 
        />
      )}

      {etapa === 'DISCUSSAO' && (
        <TelaDiscussao 
          onIrParaVotacao={() => setEtapa('VOTACAO')} 
        />
      )}

      {etapa === 'VOTACAO' && (
        <TelaVotacao 
          jogadores={jogadores}
          impostor={impostor}
          onReiniciarJogo={() => setEtapa('CADASTRO')}
        />
      )}
    </div>
  )
}

export default App