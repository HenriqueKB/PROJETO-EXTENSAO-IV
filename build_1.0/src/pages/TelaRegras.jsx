const TelaRegras = ({ onIrParaCadastro }) => {
  return (
    <div className="tela-regras">
      <h1>Regras do Jogo</h1>

      <div className="lista-regras">
        <ul>
          <li><strong>Objetivo:</strong> Os inocentes devem descobrir o Impostor, enquanto ele tenta se camuflar.</li>
          <li><strong>Funções:</strong> Cada participante verá sua função em segredo no modo <em>hot-seat</em>.</li>
          <li><strong>Dicas:</strong> Os inocentes recebem a palavra secreta; o Impostor recebe apenas uma dica genérica.</li>
          <li><strong>Discussão:</strong> O grupo debate por 2 minutos, onde cada um deve dar uma dica sobre a palavra sorteada, enquanto o impostor tenta acompanhar sem se revelar.</li>
          <li><strong>Votação:</strong> O grupo escolhe o acusado final para então encerrar o jogo e descobrir quem era o impostor.</li>
        </ul>
      </div>

      <button onClick={onIrParaCadastro}>
        Entendi! Ir para Cadastro
      </button>
    </div>
  )
}

export default TelaRegras