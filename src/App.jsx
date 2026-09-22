import { useState } from 'react'
import './App.css'

// 1. IMPORTAR A NOVA TELA DE REGRAS
import TelaRegras from './pages/TelaRegras'
import TelaCadastro from './pages/TelaCadastro'
import TelaRevelacao from './pages/TelaRevelacao'
import TelaDiscussao from './pages/TelaDiscussao'
import TelaVotacao from './pages/TelaVotacao'
import palavrasData from './data/palavras.json'

function App() {
  const [jogadores, setJogadores] = useState([])
  // 2. MUDAR A ETAPA INICIAL PARA 'REGRAS'
  const [etapa, setEtapa] = useState('REGRAS') 
  const [categoria, setCategoria] = useState('')
  const [palavraSecreta, setPalavraSecreta] = useState('')
  const [dicaImpostor, setDicaImpostor] = useState('')
  const [impostor, setImpostor] = useState(null)

  const handleIniciarJogo = (listaDeJogadores) => {
    setJogadores(listaDeJogadores)
    const indiceSorteado = Math.floor(Math.random() * listaDeJogadores.length)
    setImpostor(listaDeJogadores[indiceSorteado])

    // Sorteia uma categoria e, dentro dela, uma palavra + dica
    const categoriaSorteada = palavrasData[Math.floor(Math.random() * palavrasData.length)]
    const itemSorteado = categoriaSorteada.itens[Math.floor(Math.random() * categoriaSorteada.itens.length)]

    setCategoria(categoriaSorteada.categoria)
    setPalavraSecreta(itemSorteado.palavra)
    setDicaImpostor(itemSorteado.dica)
    setEtapa('REVELACAO')
  }

  return (
    <div className="app-container">
      {/* 3. ADICIONAR A RENDERIZAÇÃO DA TELA DE REGRAS */}
      {etapa === 'REGRAS' && (
        <TelaRegras onIrParaCadastro={() => setEtapa('CADASTRO')} />
      )}

      {etapa === 'CADASTRO' && (
        <TelaCadastro onIniciarJogo={handleIniciarJogo} />
      )}

      {etapa === 'REVELACAO' && (
        <TelaRevelacao 
          jogadores={jogadores} 
          impostor={impostor} 
          categoria={categoria}
          palavraSecreta={palavraSecreta}
          dicaImpostor={dicaImpostor}
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