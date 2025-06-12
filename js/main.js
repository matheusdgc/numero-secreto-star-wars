const mainContainer = document.getElementById('conteudo');

const configTemas = {
    padrao: {
        id: 'tema-padrao',
        nome: 'Padrão',
        musica: './assets/sounds/star-wars-theme.mp3',
        video: 'video-tema-padrao'
    },
    jedi: {
        id: 'tema-jedi',
        nome: 'Jedi',
        musica: './assets/sounds/dagobah-ambience.mp3',
        video: 'video-tema-jedi'
    },
    sith: {
        id: 'tema-sith',
        nome: 'Sith',
        musica: './assets/sounds/darth-vader-breathing.mp3',
        video: 'video-tema-sith'
    }
};

const temas = {
    padrao: configTemas.padrao.id,
    jedi: configTemas.jedi.id,
    sith: configTemas.sith.id
};

const gameState = {
    playerName: '',
    theme: temas.padrao,
    audioInitialized: false
};

const tentativasMax = 1;
const numeroMin = 1;
const numeroMax = 50;

const frases = {
    yoda: [
        'Treinar mais você deve',
        'A força não está com você',
        'Sempre em movimento o futuro está',
        'Desaprender o que aprendeu você deve',
        'Decepcionado estou com você',
        'A chave para o sucesso a paciência será',
        'A mente do aprendiz aberta deve estar',
    ],
    vader: [
        'A força é fraca em você',
        'Você não é digno de ser um Sith',
        'A escuridão é o seu destino',
        'Sua falta de fé é perturbadora',
        'Você falhará, jovem acólito',
        'A ira é o caminho para o lado sombrio',
        'Você não conhece o poder do lado sombrio'
    ]
};

const sonsPersonagens = {
    yoda: {
        vitoria: new Audio('./assets/sounds/yoda-good.mp3'),
        derrota: new Audio('./assets/sounds/yoda-lose.mp3')
    },
    vader: {
        vitoria: new Audio('./assets/sounds/vader-good.mp3'),
        derrota: new Audio('./assets/sounds/vader-lose.mp3')
    }
};

Object.values(sonsPersonagens).forEach(personagem => {
    Object.values(personagem).forEach(som => {
        som.volume = 0.5;
    });
});

let audioAmbiente = null;
let temaAtualAudio = '';

function telaInicialHTML() {
    return `
        <div class="tela-inicial">
            <div id="background">
                <h1 id="titulo">Seu teste começa</h1>
            </div>
            
            <div class="campo-form">
                <label for="nome-inicial" class="label">Diga-me seu nome, jovem aprendiz:</label>
                <br>
                <input type="text" id="nome-inicial" placeholder="Digite seu nome" required autofocus>
            </div>

            <div class="escolha-tema">
                <h3 class="label">Escolha seu destino:</h3>
                <div class="opcoes-tema">
                    <div class="tema" id="tema-jedi" data-tema="${temas.jedi}">
                        <img src="./assets/images/yoda-tela-inicial.gif" alt="Tema Jedi">
                        <p>Caminho Jedi</p>
                    </div>
                    <div class="tema" id="tema-sith" data-tema="${temas.sith}">
                        <img src="./assets/images/darth-vader-tela-inicial.gif" alt="Tema Sith">
                        <p>Caminho Sith</p>
                    </div>
                </div>
            </div>
            <br>
            <div class="botoes">
                <button id="btn-iniciar-jogo" type="button" disabled>iniciar Teste</button>
            </div>

            <div id="btn-player" style="position:fixed; left:24px; bottom:24px; z-index:1000;">
                <button id="btn-audio" style="font-size:0.1rem; border-radius:50%; padding:0.5rem;">
                    <img src="./assets/images/icon-sound.png" alt="Play Sound">
                </button>
            </div>
        </div>
    `;
}

function telaJogoHTML(tema, nomeJogador) {
    const isJedi = tema === temas.jedi;
    const titulo = isJedi ? 'Teste Jedi' : 'Teste Sith';
    const pergunta = isJedi 
        ? `Entre 1 e ${numeroMax} em que número pensando estou, jovem Padawan ${nomeJogador}?`
        : `Diga-me, entre 1 e ${numeroMax}, em que número estou pensando, acólito ${nomeJogador}?`;
    const container = isJedi ? 'yoda-container' : 'darthVader-container';

    return `
        <div id="background">
            <h1 id="titulo">${titulo}</h1>
        </div>
        <div id="jogo">
            <form id="form-chute">
                <div class="campo-form">
                    <label for="chute">${pergunta}</label>
                    <br>
                    <input type="number" id="chute" min="${numeroMin}" max="${numeroMax}" required autofocus>
                </div>
                <div class="botoes">
                    <button type="submit">usar a Força</button>
                    <button id="btn-reiniciar" type="button">Recomeçar</button>
                </div>
            </form>
        </div>
        <br>
        <div id="mensagem"></div>
        <div id="${container}"></div>
        <div id="btn-player" style="position:fixed; left:24px; bottom:24px; z-index:1000;">
            <button id="btn-audio" style="font-size:0.1rem; border-radius:50%; padding:0.5rem;">
                <img src="./assets/images/icon-sound.png" alt="Play Sound">
            </button>
        </div>
    `;
}

class SistemaAudio {
    static async tocarMusicaTema(tema) {
        try {
            const config = Object.values(configTemas).find(t => t.id === tema) || configTemas.padrao;
            const caminho = config.musica;
            
            if (temaAtualAudio === caminho && audioAmbiente && !audioAmbiente.paused) {
                return;
            }
            
            if (audioAmbiente) {
                audioAmbiente.pause();
                audioAmbiente.currentTime = 0;
            }
            
            audioAmbiente = new Audio(caminho);
            audioAmbiente.loop = true;
            audioAmbiente.volume = 0.3;
            
            await audioAmbiente.play();
            temaAtualAudio = caminho;
            gameState.audioInitialized = true;
            
        } catch (error) {
            console.log('Erro ao reproduzir áudio:', error.message);
            if (audioAmbiente) {
                audioAmbiente.volume = 0.1;
                try {
                    await audioAmbiente.play();
                } catch {
                    console.log('Áudio bloqueado pelo navegador');
                }
            }
        }
    }

    static pararTodosOsSons() {
        if (audioAmbiente) {
            audioAmbiente.pause();
            audioAmbiente.currentTime = 0;
        }
        
        Object.values(sonsPersonagens).forEach(personagem => {
            Object.values(personagem).forEach(som => {
                som.pause();
                som.currentTime = 0;
            });
        });
    }

    static async tocarSomPersonagem(tipo, resultado) {
        try {
            const personagem = tipo === temas.jedi ? sonsPersonagens.yoda : sonsPersonagens.vader;
            const som = personagem[resultado];
            
            if (som && audioAmbiente) {
                audioAmbiente.volume = 0.1;
                await som.play();
            }
        } catch (error) {
            console.log(`Erro ao reproduzir som ${resultado}:`, error);
        }
    }
}

function configurarBotaoAudio() {
    const btnAudio = document.getElementById('btn-audio');
    if (!btnAudio || !audioAmbiente) return;
    
    const novoBtnAudio = btnAudio.cloneNode(true);
    btnAudio.parentNode.replaceChild(novoBtnAudio, btnAudio);
    
    novoBtnAudio.innerHTML = audioAmbiente.paused
        ? '<img src="./assets/images/icon-sound.png" alt="Play">'
        : '<img src="./assets/images/icon-no-sound.png" alt="Pause">';
    
    novoBtnAudio.addEventListener('click', async () => {
        try {
            if (audioAmbiente.paused) {
                await audioAmbiente.play();
                novoBtnAudio.innerHTML = '<img src="./assets/images/icon-no-sound.png" alt="Pause">';
            } else {
                audioAmbiente.pause();
                novoBtnAudio.innerHTML = '<img src="./assets/images/icon-sound.png" alt="Play">';
            }
        } catch (error) {
            console.log('Erro ao controlar áudio:', error);
        }
    });
}

function setBodyTheme(theme) {
    document.body.className = '';
    document.body.classList.add(theme);
    setVideoBackground(theme);
}

function setVideoBackground(theme) {
    document.body.classList.remove('video-loaded');
    
    document.querySelectorAll('.background-video').forEach(video => {
        video.classList.remove('active');
        video.pause();
    });
    
    const config = Object.values(configTemas).find(t => t.id === theme);
    if (!config) return;
    
    const videoAtivo = document.getElementById(config.video);
    if (videoAtivo) {
        videoAtivo.classList.add('active');
        videoAtivo.play()
            .then(() => document.body.classList.add('video-loaded'))
            .catch(error => console.log('Autoplay bloqueado:', error.message));
    }
}

function telaInicial() {
    setBodyTheme(gameState.theme);
    mainContainer.innerHTML = telaInicialHTML();
    
    inicializarEventListenersTelaInicial();
    
    SistemaAudio.tocarMusicaTema(temas.padrao);
    setTimeout(configurarBotaoAudio, 100);
}

function inicializarEventListenersTelaInicial() {
    const btnIniciar = document.getElementById('btn-iniciar-jogo');
    const nomeInput = document.getElementById('nome-inicial');
    const temasElementos = document.querySelectorAll('.tema');
    
    btnIniciar.disabled = true;
    
    temasElementos.forEach(tema => {
        tema.addEventListener('click', () => {
            document.querySelectorAll('.tema.selecionado').forEach(el => 
                el.classList.remove('selecionado')
            );
            
            if (gameState.theme === tema.dataset.tema) {
                gameState.theme = temas.padrao;
            } else {
                tema.classList.add('selecionado');
                gameState.theme = tema.dataset.tema;
            }
            
            setBodyTheme(gameState.theme);
            btnIniciar.disabled = !(gameState.theme === temas.jedi || gameState.theme === temas.sith);
            
            SistemaAudio.tocarMusicaTema(gameState.theme);
            setTimeout(configurarBotaoAudio, 100);
        });
    });
    
    btnIniciar.addEventListener('click', () => {
        const nome = nomeInput.value.trim();
        if (!nome) {
            alert("Seu nome, dizer você deve!");
            return;
        }
        
        if (!(gameState.theme === temas.jedi || gameState.theme === temas.sith)) {
            alert("Escolha um tema para iniciar o jogo!");
            return;
        }
        
        gameState.playerName = nome;
        telaJogo();
    });
}

function telaJogo() {
    setBodyTheme(gameState.theme);
    mainContainer.innerHTML = telaJogoHTML(gameState.theme, gameState.playerName);
    
    SistemaAudio.tocarMusicaTema(gameState.theme);
    setTimeout(configurarBotaoAudio, 100);
    
    iniciarJogo();
}

function iniciarJogo() {
    const form = document.getElementById('form-chute');
    const chuteInput = document.getElementById('chute');
    const mensagem = document.getElementById('mensagem');
    const btnReset = document.getElementById('btn-reiniciar');
    
    const isJedi = gameState.theme === temas.jedi;
    const container = document.getElementById(isJedi ? 'yoda-container' : 'darthVader-container');
    
    const personagens = inicializarPersonagens(isJedi, container);
    
    let numeroSecreto = gerarNumero();
    let tentativas = 1;
    let jogoFinalizado = false;
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (jogoFinalizado) return;
        
        const chute = parseInt(chuteInput.value);
        
        if (!validarChute(chute)) {
            mostrarMensagem(
                isJedi ? "Um número válido, você deve dizer." 
                       : "Dê um número válido, ou sofra as consequências.",
                'red',
                mensagem
            );
            return;
        }
        
        await processarChute(chute, numeroSecreto, tentativas, isJedi, personagens, container, mensagem);
        
        if (chute === numeroSecreto || tentativas >= tentativasMax) {
            jogoFinalizado = true;
            desabilitarControles(form, chuteInput);
        } else {
            tentativas++;
            chuteInput.value = '';
            chuteInput.focus();
        }
    });
    
    btnReset.addEventListener('click', () => {
        SistemaAudio.pararTodosOsSons();
        telaInicial();
    });
}

function inicializarPersonagens(isJedi, container) {
    const personagens = {
        normal: document.createElement('img'),
        smile: document.createElement('img'),
        lose: document.createElement('img')
    };
    
    if (isJedi) {
        personagens.normal.src = './assets/images/yoda.png';
        personagens.smile.src = './assets/images/yoda-smile.png';
        personagens.lose.src = './assets/images/yoda-lose.png';
        mostrarYoda(personagens.normal, container);
    } else {
        personagens.normal.src = './assets/images/darth-vader.png';
        personagens.smile.src = './assets/images/darth-vader-win.png';
        personagens.lose.src = './assets/images/darth-vader-lose.png';
        mostrarVader(personagens.normal, container);
    }
    
    return personagens;
}

function validarChute(chute) {
    return !isNaN(chute) && chute >= numeroMin && chute <= numeroMax;
}

async function processarChute(chute, numeroSecreto, tentativas, isJedi, personagens, container, mensagem) {
    if (chute === numeroSecreto) {
        
        mostrarMensagem(
            isJedi ? `Parabéns, ${gameState.playerName}! Verdadeiro Jedi você é!`
                   : `Muito bem, ${gameState.playerName}... O lado sombrio reconhece sua vitória!`,
            'chartreuse',
            mensagem
        );
        
        if (isJedi) {
            mostrarYodaSmile(personagens.normal, personagens.smile, container);
            await SistemaAudio.tocarSomPersonagem(temas.jedi, 'vitoria');
        } else {
            mostrarVaderSmile(personagens.normal, personagens.smile, container);
            await SistemaAudio.tocarSomPersonagem(temas.sith, 'vitoria');
        }
        
    } else if (tentativas >= tentativasMax) {
       
        mostrarMensagem(
            isJedi ? `Falhou no teste, ${gameState.playerName}. Recomeçar, o seu caminho é...`
                   : `Você falhou, ${gameState.playerName}. O lado sombrio não perdoa.`,
            'crimson',
            mensagem
        );
        
        if (isJedi) {
            mostrarYodaLose(personagens.lose, container);
            await SistemaAudio.tocarSomPersonagem(temas.jedi, 'derrota');
        } else {
            mostrarVaderLose(personagens.lose, container);
            await SistemaAudio.tocarSomPersonagem(temas.sith, 'derrota');
        }
        
    } else {
        
        const frasesPersonagem = isJedi ? frases.yoda : frases.vader;
        const fraseAleatoria = frasesPersonagem[Math.floor(Math.random() * frasesPersonagem.length)];
        
        const dica = chute > numeroSecreto 
            ? `MENOR que ${chute} o número secreto é`
            : `MAIOR que ${chute} o número secreto é`;
            
        mostrarMensagem(
            isJedi ? `${dica}. ${fraseAleatoria}`
                   : `${dica}. ${fraseAleatoria}`,
            'white',
            mensagem
        );
    }
}

function gerarNumero() {
    const numero = Math.floor(Math.random() * numeroMax) + 1;
    console.log('Número secreto gerado:', numero);
    return numero;
}

function mostrarMensagem(texto, cor, elemento) {
    elemento.textContent = texto;
    elemento.style.color = cor;
}

function desabilitarControles(form, input) {
    input.disabled = true;
    form.querySelector('button[type="submit"]').disabled = true;
}

function mostrarYoda(yoda, container) {
    container.innerHTML = '';
    Object.assign(yoda.style, {
        width: '25%',
        position: 'fixed',
        right: '2%',
        top: '70%',
        transform: 'translateY(-50%)',
        opacity: '1'
    });
    container.appendChild(yoda);
}

function mostrarYodaSmile(yoda, yodaSmile, container) {
    if (container.contains(yoda)) {
        yoda.style.opacity = 0;
        setTimeout(() => {
            if (yoda.parentNode) container.removeChild(yoda);
            Object.assign(yodaSmile.style, {
                width: '25%',
                position: 'fixed',
                right: '2%',
                top: '70%',
                transform: 'translateY(-50%)',
                opacity: '0'
            });
            container.appendChild(yodaSmile);
            setTimeout(() => { yodaSmile.style.opacity = 1; }, 10);
        }, 100);
    }
}

function mostrarYodaLose(yodaLose, container) {
    container.innerHTML = '';
    Object.assign(yodaLose.style, {
        width: '38%',
        position: 'fixed',
        right: '1%',
        top: '79%',
        transform: 'translateY(-50%)',
        opacity: '0'
    });
    container.appendChild(yodaLose);
    setTimeout(() => { yodaLose.style.opacity = 1; }, 50);
}

function mostrarVader(vader, container) {
    container.innerHTML = '';
    Object.assign(vader.style, {
        width: '30%',
        position: 'fixed',
        right: '2%',
        top: '70%',
        transform: 'translateY(-50%)',
        opacity: '0'
    });
    container.appendChild(vader);
    setTimeout(() => { vader.style.opacity = 1; }, 50);
}

function mostrarVaderSmile(vader, vaderSmile, container) {
    if (container.contains(vader)) {
        vader.style.opacity = 0;
        setTimeout(() => {
            if (vader.parentNode) container.removeChild(vader);
            Object.assign(vaderSmile.style, {
                width: '45%',
                position: 'fixed',
                right: '2%',
                top: '70%',
                transform: 'translateY(-50%)',
                opacity: '0'
            });
            container.appendChild(vaderSmile);
            setTimeout(() => { 
                vaderSmile.style.opacity = 1;
                vaderSmile.style.filter = 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.8))';
            }, 10);
        }, 100);
    }
}

function mostrarVaderLose(vaderLose, container) {
    container.innerHTML = '';
    Object.assign(vaderLose.style, {
        width: '38%',
        position: 'fixed',
        right: '0%',
        top: '70%',
        transform: 'translateY(-50%)',
        opacity: '0'
    });
    container.appendChild(vaderLose);
    setTimeout(() => { 
        vaderLose.style.opacity = 1;
        vaderLose.style.filter = 'grayscale(50%) drop-shadow(0 0 15px rgba(255, 0, 0, 0.3))';
    }, 50);
}

window.addEventListener('DOMContentLoaded', telaInicial);