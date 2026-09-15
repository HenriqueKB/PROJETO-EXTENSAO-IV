import { useState } from 'react'
import './App.css'

//Import das páginas do jogo
import TelaCadastro from './pages/TelaCadastro'
import TelaRevelacao from './pages/TelaRevelacao'
import TelaDiscussao from './pages/TelaDiscussao'
import TelaVotacao from './pages/TelaVotacao'

//Import das palavras do JSON
import dadosPalavras from './data/palavras.json'

function App() {
  //ESTADOS GLOBAIS DO JOGO
  const [jogadores, setJogadores] = useState([])
  const [etapa, setEtapa] = useState('CADASTRO') // Etapas em sequencia: 'CADASTRO' | 'REVELACAO' | 'DISCUSSAO' | 'VOTACAO'
  const [categoria, setCategoria] = useState('')
  const [palavraSecreta, setPalavraSecreta] = useState('')
  const [impostor, setImpostor] = useState(null)

  //FUNÇÃO PARA INICIAR O JOGO E SORTEAR PALAVRA / o IMPOSTOR
  const handleIniciarJogo = (listaDeJogadores) => {
    // Validação de segurança para garantir que existam jogadores
    if (!listaDeJogadores || listaDeJogadores.length === 0) return;

    setJogadores(listaDeJogadores)

    // a)Sortear o Impostor aleatoriamente entre os jogadores cadastrados
    const indiceImpostor = Math.floor(Math.random() * listaDeJogadores.length)
    setImpostor(listaDeJogadores[indiceImpostor])

    // b) Sortear categoria e Palavra secreta diretamente do palavras.json
    if (dadosPalavras && dadosPalavras.length > 0) {
      // 1. Sortear uma categoria aleatória
      const indiceCategoria = Math.floor(Math.random() * dadosPalavras.length)
      const itemCategoria = dadosPalavras[indiceCategoria]

      // 2. Sortear uma palavra dentro da categoria sorteada
      const indicePalavra = Math.floor(Math.random() * itemCategoria.palavras.length)
      const palavraSorteada = itemCategoria.palavras[indicePalavra]

      // Guardar nos estados globais
      setCategoria(itemCategoria.categoria)
      setPalavraSecreta(palavraSorteada)
    }

    //c)avançar para a tela de revelação
    setEtapa('REVELACAO')
  }

  // 3.função de reiniciar o jogo, um /clear
  const handleReiniciarJogo = () => {
    setCategoria('')
    setPalavraSecreta('')
    setImpostor(null)
    setEtapa('CADASTRO')
  }

  // 4. RENDERIZAÇÃO DA TELA ATUAL
  //se a etapa for definida como 1, renderiza 1
  return (
    <div className="app-container">
      {etapa === 'CADASTRO' && (
        <TelaCadastro onIniciarJogo={handleIniciarJogo} />
      )}

      {etapa === 'REVELACAO' && (
        <TelaRevelacao 
          jogadores={jogadores} 
          impostor={impostor} 
          categoria={categoria}
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
          palavraSecreta={palavraSecreta}
          onReiniciarJogo={handleReiniciarJogo}
        />
      )}
    </div>
  )
}

//saida
export default App

