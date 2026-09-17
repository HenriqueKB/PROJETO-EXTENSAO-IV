const TelaRegras = ({ onIrParaCadastro }) => {
  return (
    <div className="tela-regras">
      <h1>Regras do Jogo</h1>

      <div className="lista-regras">
        <ul>
          <li><strong>Objetivo:</strong> Os inocentes devem descobrir o Impostor, enquanto ele tenta se camuflar.</li>
          <li><strong>Funções:</strong> Cada participante verá sua função em segredo no modo <em>hot-seat</em>.</li>
          <li><strong>Dicas:</strong> Os inocentes recebem a palavra secreta; o Impostor recebe apenas uma dica genérica.</li>
          <li><strong>Discussão:</strong> O grupo debate por 2 minutos para fazer perguntas e pegar blefes.</li>
          <li><strong>Votação:</strong> O grupo escolhe o acusado final para revelar o vencedor.</li>
        </ul>
      </div>

      <button onClick={onIrParaCadastro}>
        Entendi! Ir para Cadastro
      </button>
    </div>
  )
}

export default TelaRegras