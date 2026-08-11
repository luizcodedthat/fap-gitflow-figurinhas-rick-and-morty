const state = {
  figurinhas: [],
  totalPersonagens: 826,
  abrindo: false,
};

async function carregarTotalPersonagens() {
  try {
    const resposta = await fetch("https://rickandmortyapi.com/api/character");
    const dados = await resposta.json();
    state.totalPersonagens = dados.info.count;
  } catch (erro) {
    console.error("Não foi possível carregar o total de personagens:", erro);
  }
  m.redraw();
}

function gerarIdsAleatorios(quantidade, max) {
  const ids = [];
  for (let i = 0; i < quantidade; i++) {
    ids.push(Math.floor(Math.random() * max) + 1);
  }
  return ids;
}

async function abrirPacote() {
  if (state.abrindo) return;
  state.abrindo = true;
  m.redraw();

  const ids = gerarIdsAleatorios(5, state.totalPersonagens);

  try {
    const resposta = await fetch(
      `https://rickandmortyapi.com/api/character/${ids.join(",")}`
    );
    const dados = await resposta.json();
    const personagens = Array.isArray(dados) ? dados : [dados];

    const novasFigurinhas = personagens.map((p) => ({
      chave: `${p.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      id: p.id,
      nome: p.name,
      imagem: p.image,
      status: p.status,
      especie: p.species,
      rotacao: Math.floor(Math.random() * 8) - 4,
      nova: true,
    }));

    setTimeout(() => {
      state.figurinhas = [...novasFigurinhas, ...state.figurinhas];
      state.abrindo = false;
      m.redraw();

      setTimeout(() => {
        novasFigurinhas.forEach((f) => (f.nova = false));
        m.redraw();
      }, 700);
    }, 900);
  } catch (erro) {
    console.error("Erro ao abrir pacote:", erro);
    state.abrindo = false;
    m.redraw();
  }
}

function classeStatus(status) {
  if (status === "Alive") return "status-viva";
  if (status === "Dead") return "status-morta";
  return "status-desconhecida";
}

const Figurinha = {
  view: (vnode) => {
    const f = vnode.attrs.figurinha;
    return m(
      "div.figurinha",
      { style: { transform: `rotate(${f.rotacao}deg)` } },
      m("div.figurinha-cartao" + (f.nova ? ".revelando" : ""), [
        m("img", { src: f.imagem, alt: f.nome }),
        m("h3", f.nome),
        m(
          "span.badge." + classeStatus(f.status),
          `${f.status} · ${f.especie}`
        ),
      ])
    );
  },
};

const App = {
  oninit: carregarTotalPersonagens,
  view: () =>
    m("main", [
      m("header", [
        m("span.selo", "★ RICK AND MORTY ★"),
        m("h1", "Álbum de Figurinhas"),
        m(
          "p.subtitulo",
          "Abra pacotes e monte sua coleção de personagens!"
        ),
      ]),
      m("section.controles", [
        m(
          "button.botao-pacote",
          { onclick: abrirPacote, disabled: state.abrindo },
          state.abrindo
            ? "Abrindo pacote..."
            : "Abrir pacote aleatório de figurinhas"
        ),
      ]),
      state.abrindo && m("div.pacote-animando", m("div.pacote", "���")),
      m("section.colecao", [
        m("h2", `Sua coleção (${state.figurinhas.length})`),
        state.figurinhas.length === 0 && !state.abrindo
          ? m(
              "div.slot-vazio",
              "Sua coleção está vazia. Abra um pacote para colar suas primeiras figurinhas aqui!"
            )
          : m(
              "div.grid-figurinhas",
              state.figurinhas.map((f) =>
                m(Figurinha, { key: f.chave, figurinha: f })
              )
            ),
      ]),
    ]),
};

m.mount(document.getElementById("app"), App);
