import { useRef, useState } from 'react';

const TelaRegras = ({ onIrParaCadastro }) => {
  const audioRef = useRef(null);
  const [tocando, setTocando] = useState(false);
  const [fechando, setFechando] = useState(false);
  const [origem, setOrigem] = useState({ x: '50%', y: '50%' });

  const alternarAudio = () => {
    if (tocando) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setTocando(!tocando);
  }

  const iniciarTransicao = (e) => {
    setOrigem({ x: `${e.clientX}px`, y: `${e.clientY}px` });
    setFechando(true);
    setTimeout(() => {
      onIrParaCadastro();
    }, 800);
  }

  return (
    <div className="tela-regras">
      <h1>WHO<span className="fill-text">POSTOR</span></h1>
      <p className="subtitulo">Um de vocês é o <span className="tarja">impostor</span>.</p>

      <div className="lista-regras">
        <ul>
          <li><strong>Objetivo:</strong> Os inocentes devem descobrir o Impostor, enquanto ele tenta se camuflar.</li>
          <li><strong>Funções:</strong> Cada participante verá sua função em segredo no modo <em>hot-seat</em>.</li>
          <li><strong>Dicas:</strong> Os inocentes recebem a palavra secreta; o Impostor recebe apenas uma dica genérica.</li>
          <li><strong>Discussão:</strong> O grupo debate por 2 minutos, onde cada um deve dar uma dica sobre a palavra sorteada, enquanto o impostor tenta acompanhar sem se revelar.</li>
          <li><strong>Votação:</strong> O grupo escolhe o acusado final para então encerrar o jogo e descobrir quem era o impostor.</li>
        </ul>
      </div>

      <button onClick={iniciarTransicao}>
        Iniciar investigação
      </button>

      <img src="public/imgs/a55f4b38343887.575ea9067bd4e.gif" alt="Gif" className="gif-topo" />

      <div className="disco" onClick={alternarAudio}>
        <img
          src="public/imgs/disco.png"
          alt="Disco de vinil"
          className={tocando ? 'girando' : ''}
        />
        <audio ref={audioRef}>
          <source src="public/imgs/Sarah - Jesse Harlin (youtube).mp3" />
        </audio>
      </div>

      <div
        className={`transicao-circulo ${fechando ? 'fechando' : ''}`}
        style={{ '--origem-x': origem.x, '--origem-y': origem.y }}
      />
    </div>
  )
}

export default TelaRegras