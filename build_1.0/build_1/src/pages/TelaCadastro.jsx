import { useState } from "react"

const TelaCadastro = ({ onIniciarJogo }) => {
  const [jogadores, setJogadores] = useState([])
  const [nomeInput, setNomeInput] = useState("")

  const adicionarJogador = () => {
    if (!nomeInput.trim()) return
    setJogadores([...jogadores, nomeInput])
    setNomeInput("")
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
        } else {
        }
    };
  };

  return (
    <div className="tela-cadastro">
      <h1>Cadastro de Jogadores</h1>

      <div className="input-group">
        <input 
          type="text" 
          value={nomeInput} 
          onChange={(e) => setNomeInput(e.target.value)}
          placeholder="Nome do jogador"
        />

        <button onClick={adicionarJogador}>Adicionar</button>
        <input onKeyDown={handleTeclaPressionada}></input>
      </div>

      <ul>
        {jogadores.map((jogador, index) => (
          <li key={index}>{jogador}</li>
        ))}
      </ul>

      <button onClick={handleComecar} disabled={jogadores.length < 3}>
        Iniciar Partida
      </button>
    </div>
)


export default TelaCadastro