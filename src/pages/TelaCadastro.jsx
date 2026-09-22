import { useState } from "react"

const TelaCadastro = ({ onIniciarJogo }) => {
  const [jogadores, setJogadores] = useState([])
  const [nomeInput, setNomeInput] = useState("")

  const adicionarJogador = () => {
    if (!nomeInput.trim()) return
    setJogadores([...jogadores, nomeInput])
    setNomeInput("")
  }

const removerJogador = (indexParaRemover) => {
  // O filter gera uma nova lista com todos os itens CUJO ÍNDICE for diferente do selecionado
  const listaFiltrada = jogadores.filter((_, indexAtual) => indexAtual !== indexParaRemover)
  
  // Atualiza o estado do React com a nova lista
  setJogadores(listaFiltrada)
}
  const handleComecar = () => {
    if (jogadores.length < 3) {
      alert("Adicione pelo menos 3 jogadores!")
      return
    }
    // Envia a lista para o App.jsx e avança para a próxima tela
    onIniciarJogo(jogadores) 
  }


    const handleTeclaPressionada = (evento) => {
        if (evento.key === 'Enter') {
          return adicionarJogador()
        }
    };

  return (
    <div className="tela-cadastro">
       <h1><span className="piscar1">WHO</span><span className="fill-text2">POSTOR</span></h1>
      <h2>Cadastro de Jogadores</h2>

      <div className="input-group">
        <input 
          type="text" 
          value={nomeInput} 
          onChange={(e) => setNomeInput(e.target.value)} 
          onKeyDown = {handleTeclaPressionada}
          placeholder="Nome do jogador"
        />

        <button onClick={adicionarJogador}>Adicionar</button>
        
      </div>

      <ul className="remover-jogador">
        {jogadores.map((jogador, index) => (
          <li key={index}>
          {jogador}
      <button onClick={() => removerJogador(index)}>
        Remover
      </button>
    </li>
  ))}
</ul>
      
      <button className="botao-iniciar" onClick={handleComecar} disabled={jogadores.length < 3}>
        Iniciar Partida
      </button>
    </div>
)

};
export default TelaCadastro