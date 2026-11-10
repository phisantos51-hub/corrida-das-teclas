/*
  MODO BRAILLE (dentro do Modo Áudio)
  As teclas F, D, S, J, K e L viram os pontos 1, 2, 3, 4, 5 e 6, como na máquina Perkins.
  A criança aperta as teclas juntas; a letra é registrada quando ela solta todas.
  A tabela de letras e sinais fica em js/braille-tabela.js.
*/
const BRAILLE = (function () {
  "use strict";

  const C = function () { return window.CORRIDA; };
  const $ = function (id) { return document.getElementById(id); };
  const prog = function () { return C().progresso(); };

  const PONTO_DA_TECLA = { KeyF: 1, KeyD: 2, KeyS: 3, KeyJ: 4, KeyK: 5, KeyL: 6 };
  const TECLA_DO_PONTO = { 1: "F", 2: "D", 3: "S", 4: "J", 5: "K", 6: "L" };
  const DEDO_DO_PONTO = {
    1: "o indicador da mão esquerda", 2: "o dedo médio da mão esquerda", 3: "o anelar da mão esquerda",
    4: "o indicador da mão direita", 5: "o dedo médio da mão direita", 6: "o anelar da mão direita"
  };

  /* ---------- Tabela ---------- */
  const PONTOS_DO_CARACTERE = {};
  const SIGNIFICADO = {};
  Object.keys(BRAILLE_TABELA.letras).forEach(function (l) {
    PONTOS_DO_CARACTERE[l] = BRAILLE_TABELA.letras[l];
    SIGNIFICADO[BRAILLE_TABELA.letras[l]] = { tipo: "letra", ch: l };
  });
  Object.keys(BRAILLE_TABELA.especiais).forEach(function (l) {
    PONTOS_DO_CARACTERE[l] = BRAILLE_TABELA.especiais[l];
    SIGNIFICADO[BRAILLE_TABELA.especiais[l]] = { tipo: "letra", ch: l };
  });
  BRAILLE_TABELA.sinais.forEach(function (s) {
    if (!SIGNIFICADO[s.pontos]) SIGNIFICADO[s.pontos] = { tipo: "sinal", nome: s.nome, simbolo: s.simbolo };
  });

  function nomeLetra(ch, falado) { return TECLADO.nomeCaractere(ch, falado); }
  // "ponto 1", "pontos 1 e 2", "pontos 1, 2 e 4"
  function descrever(pontos) {
    const p = pontos.split("");
    if (p.length === 0) return "nenhum ponto";
    if (p.length === 1) return "ponto " + p[0];
    return "pontos " + p.slice(0, -1).join(", ") + " e " + p[p.length - 1];
  }
  // "o ponto 1" / "os pontos 1 e 2"
  function comArtigo(pontos) { return (pontos.length === 1 ? "o " : "os ") + descrever(pontos); }
  // "Ponto 1 forma" / "Pontos 1 e 2 formam"
  function formam(pontos) { return TECLADO.maiusc(descrever(pontos)) + (pontos.length === 1 ? " forma" : " formam"); }
  // "a letra bê", "a vírgula"... ou null se não forma nada conhecido.
  function significado(pontos, falado) {
    const s = SIGNIFICADO[pontos];
    if (!s) return null;
    if (s.tipo === "letra") return "a letra " + nomeLetra(s.ch, falado);
    return (/^(vírgula)$/.test(s.nome) ? "a " : "o ") + s.nome;
  }
  function diferenca(a, b) { return a.split("").filter(function (x) { return b.indexOf(x) < 0; }).join(""); }
  function faltasESobras(apertou, alvo) {
    const falta = diferenca(alvo, apertou);
    const sobra = diferenca(apertou, alvo);
    let t = "";
    if (falta) t += (falta.length === 1 ? "Faltou o " : "Faltaram os ") + descrever(falta) + ". ";
    if (sobra) t += (sobra.length === 1 ? "Sobrou o " : "Sobraram os ") + descrever(sobra) + ". ";
    return t;
  }
  function paraPontos(conjunto) {
    return Array.from(conjunto).sort().join("");
  }

  /* ---------- Teclas apertadas juntas ---------- */
  const acorde = { apertadas: new Set(), juntas: new Set(), maximo: 0 };
  function limparAcorde() { acorde.apertadas.clear(); acorde.juntas.clear(); acorde.maximo = 0; atualizarTeclas(); }
  window.addEventListener("blur", limparAcorde);

  // keydown: devolve true se a tecla é um ponto.
  function apertou(e) {
    const p = PONTO_DA_TECLA[e.code];
    if (!p) return false;
    acorde.apertadas.add(p);
    acorde.juntas.add(p);
    acorde.maximo = Math.max(acorde.maximo, acorde.apertadas.size);
    atualizarTeclas();
    return true;
  }
  // keyup: quando todas as teclas foram soltas, devolve os pontos ("124"); senão null.
  function soltou(e) {
    const p = PONTO_DA_TECLA[e.code];
    if (!p) return null;
    acorde.apertadas.delete(p);
    atualizarTeclas();
    if (acorde.apertadas.size > 0 || acorde.juntas.size === 0) return null;
    const pontos = paraPontos(acorde.juntas);
    const maximo = acorde.maximo;
    acorde.juntas.clear();
    acorde.maximo = 0;
    return { pontos: pontos, maximo: maximo };
  }

  /* ---------- Desenho: seis teclas e cela ---------- */
  let painelAtual = null;
  function criarPainel(destino) {
    const painel = C().el("div", "painel-braille");
    painel.setAttribute("aria-hidden", "true");
    const teclas = C().el("div", "teclas-braille");
    [3, 2, 1, "|", 4, 5, 6].forEach(function (p) {
      if (p === "|") { teclas.append(C().el("span", "separador-maos")); return; }
      const t = C().el("span", "tecla-ponto");
      t.dataset.p = p;
      t.append(C().el("span", "letra-tecla", TECLA_DO_PONTO[p]), C().el("span", "numero-ponto", "ponto " + p));
      teclas.append(t);
    });
    const bloco = C().el("div", "bloco-cela");
    const cela = C().el("div", "cela-braille");
    [1, 4, 2, 5, 3, 6].forEach(function (p) {
      const d = C().el("span", "ponto-cela", String(p));
      d.dataset.p = p;
      cela.append(d);
    });
    const legenda = C().el("div", "legenda-cela");
    const titulo = C().el("p", "titulo-cela", "");
    legenda.append(titulo,
      C().el("p", "", "⚫ pontos da letra"),
      C().el("p", "", "🟡 teclas apertadas"));
    bloco.append(cela, legenda);
    painel.append(teclas, bloco);
    destino.append(painel);
    painelAtual = { teclas: teclas, cela: cela, titulo: titulo, alvo: "" };
    atualizarTeclas();
    return painelAtual;
  }
  // Mostra na cela os pontos da letra pedida (alvo) e o título.
  function mostrarAlvo(pontos, titulo) {
    if (!painelAtual) return;
    painelAtual.alvo = pontos || "";
    painelAtual.titulo.textContent = titulo || "";
    atualizarTeclas();
  }
  function atualizarTeclas(ultimos) {
    if (!painelAtual) return;
    const apertados = ultimos || paraPontos(acorde.juntas.size ? acorde.juntas : acorde.apertadas);
    painelAtual.teclas.querySelectorAll(".tecla-ponto").forEach(function (t) {
      t.classList.toggle("apertada", acorde.apertadas.has(Number(t.dataset.p)));
    });
    painelAtual.cela.querySelectorAll(".ponto-cela").forEach(function (d) {
      d.classList.toggle("do-alvo", painelAtual.alvo.indexOf(d.dataset.p) >= 0);
      d.classList.toggle("apertado", apertados.indexOf(d.dataset.p) >= 0);
    });
  }
  function mostrarCela(sim) { document.body.classList.toggle("mostrar-cela", !!sim); }

  /* ---------- Atividades: partes comuns ---------- */
  function preparar(titulo, comTeclado) {
    limparAcorde();
    C().prepararTelaJogo(titulo, "");
    $("telaJogo").classList.toggle("modo-braille", !comTeclado);
    $("telaJogo").classList.toggle("ponte-braille", !!comTeclado);
    $("areaJogo").className = "area-jogo area-corrida area-braille";
  }
  function painelTexto(rotulo) {
    const painel = C().el("div", "painel-texto");
    painel.append(C().el("p", "rotulo-digite", rotulo));
    const texto = C().el("p", "texto-alvo texto-gigante");
    const sub = C().el("p", "proximo");
    painel.append(texto, sub);
    $("areaJogo").append(painel);
    return { texto: texto, sub: sub };
  }
  function desenharPalavra(destino, chars, pos) {
    destino.textContent = "";
    destino.className = "texto-alvo " + (chars.length === 1 ? "texto-gigante" : chars.length <= 8 ? "texto-grande" : "texto-medio");
    chars.forEach(function (c, i) {
      const s = C().el("span", "ch " + (i < pos ? "feito" : i === pos ? "atual" : "falta"), c === " " ? "␣" : c);
      if (c === " ") s.classList.add("ch-espaco");
      destino.append(s);
    });
  }
  function falar(texto, instrucao) { VOZ.falar(texto, instrucao); }
  function mensagem(t, tipo) { C().mensagem(t, tipo); }
  function teclaNaoPonto(e) {
    return !PONTO_DA_TECLA[e.code] && e.key !== " " && e.key !== "Backspace" && e.key !== "Enter" && e.key.length === 1;
  }
  const AVISO_SO_PONTOS = "No Modo Braille, use só as teclas F, D, S, J, K e L. A barra de espaço repete o que eu falei.";

  /* ================= TESTE DO TECLADO ================= */
  function iniciarTeste(depois) {
    preparar("⠿ Modo Braille · Teste do teclado");
    const t = painelTexto("Teste do teclado");
    t.texto.textContent = "F D S J K L";
    t.sub.textContent = "Aperte as seis teclas juntas e depois solte.";
    criarPainel($("areaJogo"));
    mostrarAlvo("123456", "Todas as teclas");
    const instrucao = "Coloque três dedos de cada mão nas teclas. Na mão esquerda: F, D e S. Na mão direita: J, K e L. Aperte as seis teclas juntas e depois solte.";
    const j = { tipo: "braille-teste", tentativas: 0, terminado: false };
    j.aoVoltar = abrirMenu;
    j.tecla = function (e) {
      if (j.terminado) return;
      if (apertou(e)) return;
      if (e.key === " " || teclaNaoPonto(e)) VOZ.repetir();
    };
    j.teclaSolta = function (e) {
      if (j.terminado) return;
      const r = soltou(e);
      if (!r) return;
      atualizarTeclas(r.pontos);
      if (r.pontos.length === 6) {
        j.terminado = true;
        const p = prog();
        p.brailleTeclado = "ok";
        p.brailleTecladoInfo = "";
        C().salvar();
        C().tocar("certo");
        mensagem("✅ O teclado registrou as seis teclas juntas.", "boa");
        seguir("Muito bem! O teclado registrou as seis teclas juntas.");
        return;
      }
      j.tentativas++;
      C().tocar("errado");
      if (j.tentativas < 3) {
        mensagem("Registrei só " + descrever(r.pontos) + ". Tente de novo, com as seis teclas juntas.", "ops");
        falar(textoParaVoz("Registrei só " + descrever(r.pontos) + ". Tente de novo: aperte as seis teclas juntas, F, D, S, J, K e L, e depois solte."), textoParaVoz(instrucao));
        return;
      }
      j.terminado = true;
      const faltaram = diferenca("123456", r.pontos).split("").map(function (p) { return TECLA_DO_PONTO[p]; }).join(", ");
      const info = "Este teclado não registrou as seis teclas juntas (registrou " + r.pontos.length + " de 6; não registrou: " + faltaram + ").";
      const p = prog();
      p.brailleTeclado = "falhou";
      p.brailleTecladoInfo = info + " Algumas letras podem não funcionar. Experimente um teclado USB externo.";
      C().salvar();
      mensagem("⚠️ " + p.brailleTecladoInfo, "ops");
      seguir("Atenção: este teclado não registrou as seis teclas juntas. Avise o professor. Vamos continuar mesmo assim.");
    };
    function seguir(fala) {
      setTimeout(function () {
        if (C().estado.jogo !== j) return;
        if (!prog().brailleApresentacao) iniciarApresentacao(fala);
        else abrirMenu(fala);
      }, 600);
    }
    C().estado.jogo = j;
    falar(textoParaVoz("Modo Braille! Primeiro, vamos testar o teclado. " + instrucao), textoParaVoz(instrucao));
  }

  /* ================= APRESENTAÇÃO DOS PONTOS ================= */
  const APRESENTACAO = [
    { pontos: "1", texto: "Na mão esquerda, o indicador fica no F, a tecla com tracinho. O F é o ponto 1. Aperte o F e solte." },
    { pontos: "2", texto: "O dedo médio da mão esquerda fica no D. O D é o ponto 2. Aperte o D e solte." },
    { pontos: "3", texto: "O anelar da mão esquerda fica no S. O S é o ponto 3. Aperte o S e solte." },
    { pontos: "4", texto: "Na mão direita, o indicador fica no J, a outra tecla com tracinho. O J é o ponto 4. Aperte o J e solte." },
    { pontos: "5", texto: "O dedo médio da mão direita fica no K. O K é o ponto 5. Aperte o K e solte." },
    { pontos: "6", texto: "O anelar da mão direita fica no L. O L é o ponto 6. Aperte o L e solte." },
    { pontos: "12", texto: "Agora junte dois pontos: aperte o F e o D ao mesmo tempo, pontos 1 e 2, e depois solte." }
  ];
  function textoParaVoz(t) {
    return t.replace(/\b([FDSJKL])\b/g, function (m, l) { return TECLADO.nomeCaractere(l, true); });
  }
  function iniciarApresentacao(prefixo) {
    preparar("⠿ Modo Braille · Apresentação dos pontos");
    const t = painelTexto("Apresentação dos pontos");
    criarPainel($("areaJogo"));
    const j = { tipo: "braille-apresentacao", passo: 0, terminado: false };
    j.aoVoltar = abrirMenu;
    function instrucao() { return textoParaVoz(APRESENTACAO[j.passo].texto); }
    function mostrar() {
      const p = APRESENTACAO[j.passo];
      t.texto.textContent = p.pontos.split("").map(function (n) { return TECLA_DO_PONTO[n]; }).join(" + ");
      t.texto.className = "texto-alvo texto-gigante";
      t.sub.textContent = "Passo " + (j.passo + 1) + " de " + APRESENTACAO.length + ": " + p.texto;
      mostrarAlvo(p.pontos, descrever(p.pontos));
    }
    j.tecla = function (e) {
      if (j.terminado) return;
      if (apertou(e)) return;
      if (e.key === " " || teclaNaoPonto(e)) VOZ.repetir();
    };
    j.teclaSolta = function (e) {
      if (j.terminado) return;
      const r = soltou(e);
      if (!r) return;
      atualizarTeclas(r.pontos);
      const alvo = APRESENTACAO[j.passo].pontos;
      if (r.pontos === alvo) {
        C().tocar("certo");
        let confirma = alvo.length === 1 ? "Isso é o ponto " + alvo + "!" : "Isso! Pontos 1 e 2 formam a letra " + nomeLetra("B", true) + ".";
        mensagem(alvo.length === 1 ? "Isso é o ponto " + alvo + "!" : "Isso! Pontos 1 e 2 formam a letra B.", "boa");
        j.passo++;
        if (j.passo < APRESENTACAO.length) { mostrar(); falar(confirma + " " + instrucao(), instrucao()); return; }
        j.terminado = true;
        prog().brailleApresentacao = true;
        C().salvar();
        C().tocar("fim");
        abrirMenu(confirma + " Você já conhece os seis pontos!");
        return;
      }
      C().tocar("errado");
      let fala;
      if (r.pontos.length === 1) {
        fala = "Isso foi o ponto " + r.pontos + ", a tecla " + TECLADO.nomeCaractere(TECLA_DO_PONTO[r.pontos], true) + ". ";
      } else {
        fala = "Você apertou os " + descrever(r.pontos) + ". ";
      }
      if (alvo.length === 1) {
        fala += "O ponto " + alvo + " é a tecla " + TECLADO.nomeCaractere(TECLA_DO_PONTO[alvo], true) + ", com " + DEDO_DO_PONTO[alvo] + ". Tente de novo.";
      } else {
        fala += faltasESobras(r.pontos, alvo) + "Aperte juntos o " + TECLADO.nomeCaractere("F", true) + " e o " + TECLADO.nomeCaractere("D", true) + ".";
      }
      mensagem("Quase! Você apertou " + descrever(r.pontos) + ". " + (alvo.length === 1 ? "O ponto " + alvo + " é a tecla " + TECLA_DO_PONTO[alvo] + "." : faltasESobras(r.pontos, alvo)), "ops");
      falar(fala, instrucao());
    };
    C().estado.jogo = j;
    mostrar();
    const intro = "Na máquina braille do computador, seis teclas viram os seis pontos da cela. Mão esquerda: F é o ponto 1, D é o ponto 2, S é o ponto 3. Mão direita: J é o ponto 4, K é o ponto 5, L é o ponto 6. Para formar uma letra, aperte as teclas juntas e depois solte.";
    falar((prefixo ? prefixo + " " : "") + textoParaVoz(intro) + " " + instrucao(), instrucao());
  }

  /* ================= CORRIDA BRAILLE ================= */
  function normalizarNome(t) {
    return String(t || "").toUpperCase().trim().replace(/\s+/g, " ");
  }
  function fasesBraille() {
    const palavras = (typeof PALAVRAS_BRAILLE !== "undefined" && PALAVRAS_BRAILLE.length) ? PALAVRAS_BRAILLE : ["SOL", "PATO", "BOLA"];
    const fases = [
      { id: 0, nome: "Letras de A a J", itens: "ABCDEFGHIJ".split(""), quantidade: 10 },
      { id: 1, nome: "Letras de K a T", itens: "KLMNOPQRST".split(""), quantidade: 10 },
      { id: 2, nome: "Letras de U a Z", itens: "UVWXYZ".split(""), quantidade: 8 },
      { id: 3, nome: "Palavras curtas", itens: palavras.map(normalizarNome), quantidade: 5 }
    ];
    const nome = normalizarNome(prog().brailleNome);
    if (nome) fases.push({ id: "nome", nome: "Meu nome: " + nome, itens: [nome], quantidade: 2, semBloqueio: true });
    fases.push({ id: 4, nome: "Ç e letras com acento", itens: Object.keys(BRAILLE_TABELA.especiais), quantidade: 10 });
    return fases;
  }
  function chaveFase(f) { return "braille-" + f.id; }
  function liberadaBraille(fases, pos) {
    const f = fases[pos];
    if (prog().liberado || f.semBloqueio || pos === 0) return true;
    for (let i = pos - 1; i >= 0; i--) {
      if (!fases[i].semBloqueio) return (prog().estrelas[chaveFase(fases[i])] || 0) >= 2;
    }
    return true;
  }

  function iniciarCorrida(posFase) {
    const fases = fasesBraille();
    const fase = fases[posFase];
    const itens = C().sortear(fase.itens, fase.quantidade);
    preparar("⠿ Corrida Braille · " + fase.nome);
    const t = painelTexto("Forme com os pontos:");
    const pista = C().el("div", "pista sem-guia");
    pista.setAttribute("aria-hidden", "true");
    const faixaVazia = C().el("div", "faixa faixa-guia");
    const faixa = C().el("div", "faixa faixa-jogador");
    const carro = C().el("div", "carro carro-jogador");
    carro.innerHTML = C().svgCarro("#ef4444") + '<span class="balao-ops">Ops!</span>';
    faixa.append(carro);
    pista.append(C().el("div", "largada"), faixaVazia, faixa, C().el("div", "chegada"));
    $("areaJogo").append(pista);
    criarPainel($("areaJogo"));

    const total = itens.reduce(function (s, i) { return s + i.length; }, 0);
    const j = { tipo: "braille-corrida", item: 0, pos: 0, base: 0, est: C().novasEstatisticas(), terminado: false, errosLetra: 0 };
    j.aoVoltar = abrirMenu;
    function atual() { return itens[j.item][j.pos]; }
    function nomeAlvo(falado) {
      const c = atual();
      return c === " " ? "a barra de espaço" : "a letra " + nomeLetra(c, falado);
    }
    function instrucao() {
      const item = itens[j.item];
      if (item.length === 1) return "Forme " + nomeAlvo(true) + ".";
      const fala = /^[A-ZÀ-Ú ]+$/.test(item) ? item.toLowerCase() : item;
      return "Escreva " + fala + ". " + (j.pos === 0 ? "Primeiro, " : "Agora, ") + nomeAlvo(true) + ".";
    }
    function mostrar() {
      const item = itens[j.item];
      desenharPalavra(t.texto, item.split(""), j.pos);
      const c = atual();
      const pontos = c === " " ? "" : PONTOS_DO_CARACTERE[c];
      t.sub.textContent = c === " " ? "Aperte a barra de espaço." : "Pontos da letra " + c + ": " + descrever(pontos).replace(/^pontos? /, "");
      t.sub.classList.add("so-com-cela");
      $("contador").textContent = (item.length === 1 ? "Letra " : "Palavra ") + (j.item + 1) + " de " + itens.length;
      mostrarAlvo(pontos, c === " " ? "Espaço" : "Letra " + c);
      carro.style.setProperty("--p", Math.min(1, (j.base + j.pos) / total));
    }
    function acertou(eco) {
      C().registrar(j.est, atual(), true);
      C().tocar("certo");
      j.errosLetra = 0;
      carro.classList.remove("ops");
      j.pos++;
      if (j.pos < itens[j.item].length) {
        mensagem(eco.texto, "boa");
        mostrar();
        falar(eco.fala + ". Agora, " + nomeAlvo(true) + ".", instrucao());
        return;
      }
      j.base += itens[j.item].length;
      j.item++;
      j.pos = 0;
      if (j.item >= itens.length) { carro.style.setProperty("--p", 1); terminar(); return; }
      const elogio = C().aleatorio(C().ELOGIOS);
      mensagem(eco.texto + " " + elogio, "boa");
      mostrar();
      falar(eco.fala + ". " + elogio + " " + instrucao(), instrucao());
    }
    function errou(pontos) {
      const c = atual();
      C().registrar(j.est, c, false);
      C().tocar("errado");
      carro.classList.remove("ops"); void carro.offsetWidth; carro.classList.add("ops");
      j.errosLetra++;
      const alvo = PONTOS_DO_CARACTERE[c];
      const sigF = significado(pontos, true), sigT = significado(pontos, false);
      const verbo = pontos.length === 1 ? ", que forma " : ", que formam ";
      const fala = "Você apertou " + comArtigo(pontos) + (sigF ? verbo + sigF : (pontos.length === 1 ? ", que não forma letra" : ", que não formam letra")) + ". " +
        TECLADO.maiusc(nomeAlvo(true)) + " tem " + comArtigo(alvo) + ". " + faltasESobras(pontos, alvo) + "Tente de novo.";
      const texto = "Quase! Você apertou " + comArtigo(pontos) + (sigT ? " (" + sigT + ")" : " (não forma letra)") + ". " +
        TECLADO.maiusc(nomeAlvo(false)) + " tem " + comArtigo(alvo) + ". " + faltasESobras(pontos, alvo);
      mensagem(texto, "ops");
      falar(fala, instrucao());
    }
    function terminar() {
      j.terminado = true;
      const tot = j.est.acertos + j.est.erros;
      const prec = tot ? j.est.acertos / tot : 1;
      const estrelas = C().estrelasPorPrecisao(prec);
      const p = prog();
      const chave = chaveFase(fase);
      const proxPos = posFase + 1 < fases.length ? posFase + 1 : null;
      const antes = proxPos !== null && liberadaBraille(fases, proxPos);
      p.estrelas[chave] = Math.max(p.estrelas[chave] || 0, estrelas);
      C().salvar();
      const depois = proxPos !== null && liberadaBraille(fases, proxPos);
      const lista = C().analisar(j.est);
      C().tocar("fim");
      C().mostrarResultado({
        titulo: "Chegada! 🏁", estrelas: estrelas,
        numeros: "Você acertou " + Math.round(prec * 100) + "% das letras em braille.",
        boas: lista.boas, treino: lista.treino,
        tituloBoas: "Letras campeãs", tituloTreino: "Vamos treinar mais",
        extra: (!antes && depois) ? "🔓 Nova fase liberada!" : (proxPos !== null && !depois ? "Ganhe 2 estrelas para liberar a próxima fase." : ""),
        proxima: depois ? function () { menu.fase = proxPos; iniciarCorrida(proxPos); } : null,
        deNovo: function () { iniciarCorrida(posFase); }
      });
    }
    j.tecla = function (e) {
      if (j.terminado) return;
      if (apertou(e)) return;
      if (e.key === " ") {
        if (acorde.apertadas.size) return;
        if (atual() === " ") acertou({ texto: "Espaço!", fala: "espaço" });
        else VOZ.repetir();
        return;
      }
      if (e.key === "Backspace") {
        if (j.pos > 0) {
          j.pos--;
          const c = atual();
          mostrar();
          mensagem("Apaguei " + (c === " " ? "o espaço" : "o " + c) + ".", "info");
          falar("Apaguei " + (c === " " ? "o espaço" : "o " + nomeLetra(c, true)) + ". " + instrucao(), instrucao());
        } else {
          falar("Não há nada para apagar. " + instrucao(), instrucao());
        }
        return;
      }
      if (e.key === "Enter") { VOZ.repetir(); return; }
      if (teclaNaoPonto(e)) { mensagem(AVISO_SO_PONTOS, "info"); falar(textoParaVoz(AVISO_SO_PONTOS), instrucao()); }
    };
    j.teclaSolta = function (e) {
      if (j.terminado) return;
      const r = soltou(e);
      if (!r) return;
      atualizarTeclas(r.pontos);
      const c = atual();
      if (c === " ") { errou(r.pontos); return; }
      if (r.pontos === PONTOS_DO_CARACTERE[c]) {
        acertou({ texto: c + ", " + descrever(r.pontos) + ".", fala: nomeLetra(c, true) + ", " + descrever(r.pontos) });
      } else errou(r.pontos);
    };
    C().estado.jogo = j;
    mostrar();
    falar("Corrida Braille! " + fase.nome + ". A cada letra certa, o carrinho anda. " + instrucao(), instrucao());
  }

  /* ================= PONTE: DOS PONTOS PARA O TECLADO ================= */
  function iniciarPonte() {
    preparar("⠿ Ponte: dos pontos para o teclado", true);
    const letras = C().sortear(Object.keys(BRAILLE_TABELA.letras), 10);
    const t = painelTexto("Que letra é essa? Digite no teclado comum:");
    criarPainel($("areaJogo"));
    $("areaJogo").querySelector(".painel-braille").classList.add("so-cela");
    $("areaJogo").classList.add("area-ponte");
    const j = { tipo: "braille-ponte", i: 0, est: C().novasEstatisticas(), terminado: false, bloqueadoAte: 0 };
    j.aoVoltar = abrirMenu;
    function letra() { return letras[j.i]; }
    function pontos() { return PONTOS_DO_CARACTERE[letra()]; }
    function instrucao() { return TECLADO.maiusc(descrever(pontos())) + ". Que letra é essa? Digite a letra no teclado comum."; }
    function mostrar() {
      t.texto.textContent = TECLADO.maiusc(descrever(pontos()));
      t.texto.className = "texto-alvo texto-medio";
      t.sub.textContent = "Resposta (para o professor): " + letra();
      t.sub.classList.add("so-com-cela");
      $("contador").textContent = "Letra " + (j.i + 1) + " de " + letras.length;
      mostrarAlvo(pontos(), "Pontos pedidos");
      C().destacar(null);
    }
    j.tecla = function (e) {
      if (j.terminado || performance.now() < j.bloqueadoAte) return;
      if (e.key === " ") { VOZ.repetir(); return; }
      let k = e.key;
      if (e.code === "Semicolon") k = "Ç";
      if (!k || k.length !== 1 || k.toLowerCase() === k.toUpperCase()) return;
      k = k.toUpperCase();
      const L = letra();
      if (k === L) {
        C().registrar(j.est, L, true);
        C().tocar("certo");
        TECLADO.piscar($("teclado"), e.code, "certa");
        const fala = "Isso! " + formam(pontos()) + " a letra " + nomeLetra(L, true) + ".";
        mensagem("Isso! " + formam(pontos()) + " a letra " + L + ".", "boa");
        j.i++;
        if (j.i >= letras.length) { terminar(); return; }
        mostrar();
        falar(fala + " " + instrucao(), instrucao());
        return;
      }
      C().registrar(j.est, L, false);
      C().tocar("errado");
      TECLADO.piscar($("teclado"), e.code, "errada");
      j.bloqueadoAte = performance.now() + 300;
      const pk = PONTOS_DO_CARACTERE[k];
      const passo = { code: "Key" + L, shift: false };
      C().destacar(passo);
      const fala = "Você digitou " + nomeLetra(k, true) + (pk ? ", que em braille tem " + comArtigo(pk) : "") + ". " +
        formam(pontos()) + " a letra " + nomeLetra(L, true) + ". " + TECLADO.dica(passo, e.code, true, L);
      mensagem("Quase! Você digitou " + k + (pk ? " (" + descrever(pk) + ")" : "") + ". " + formam(pontos()) + " a letra " + L + ". " + TECLADO.dica(passo, e.code, false, L), "ops");
      falar(fala, instrucao());
    };
    function terminar() {
      j.terminado = true;
      const tot = j.est.acertos + j.est.erros;
      const prec = tot ? j.est.acertos / tot : 1;
      const estrelas = C().estrelasPorPrecisao(prec);
      prog().estrelas["braille-ponte"] = Math.max(prog().estrelas["braille-ponte"] || 0, estrelas);
      C().salvar();
      const lista = C().analisar(j.est);
      C().tocar("fim");
      C().mostrarResultado({
        titulo: "Fim da ponte! 🌉", estrelas: estrelas,
        numeros: "Você acertou " + Math.round(prec * 100) + "% das letras.",
        boas: lista.boas, treino: lista.treino,
        tituloBoas: "Letras campeãs", tituloTreino: "Vamos treinar mais",
        deNovo: function () { iniciarPonte(); }
      });
    }
    C().estado.jogo = j;
    mostrar();
    falar("Ponte entre o braille e o teclado! Eu falo os pontos de uma letra, e você digita essa letra no teclado comum, na tecla de sempre. " + instrucao(), instrucao());
  }

  /* ================= TREINO LIVRE ================= */
  function iniciarLivre() {
    preparar("⠿ Treino livre braille");
    const t = painelTexto("Forme qualquer combinação. O jogo diz o que ela forma.");
    t.texto.className = "texto-alvo texto-medio texto-livre";
    t.sub.textContent = "Espaço: espaço. Backspace: apaga. Enter: lê o que você escreveu.";
    criarPainel($("areaJogo"));
    mostrarAlvo("", "Última combinação");
    const j = { tipo: "braille-livre", texto: [], terminado: false };
    j.aoVoltar = abrirMenu;
    const instrucao = "Treino livre. Forme qualquer combinação de pontos e solte. Espaço faz espaço, Backspace apaga, Enter lê o que você escreveu, Esc volta ao menu.";
    function mostrar() { t.texto.textContent = j.texto.join("") || "…"; }
    function lerTexto() {
      const s = j.texto.join("").trim();
      if (!s) return "Você ainda não escreveu nada.";
      return "Você escreveu: " + (/^[A-ZÀ-ÚÇ ]+$/.test(s) ? s.toLowerCase() : s.split("").map(function (c) { return c === " " ? "espaço" : nomeLetra(c, true); }).join(", ")) + ".";
    }
    j.tecla = function (e) {
      if (apertou(e)) return;
      if (e.key === " ") {
        if (acorde.apertadas.size) return;
        j.texto.push(" "); mostrar(); falar("espaço", instrucao); return;
      }
      if (e.key === "Backspace") {
        const c = j.texto.pop();
        mostrar();
        if (c === undefined) falar("Não há nada para apagar.", instrucao);
        else falar("Apaguei " + (c === " " ? "o espaço" : "o " + nomeLetra(c, true)) + ".", instrucao);
        return;
      }
      if (e.key === "Enter") { falar(lerTexto(), instrucao); return; }
      if (teclaNaoPonto(e)) { mensagem(AVISO_SO_PONTOS, "info"); falar(textoParaVoz(AVISO_SO_PONTOS), instrucao); }
    };
    j.teclaSolta = function (e) {
      const r = soltou(e);
      if (!r) return;
      mostrarAlvo("", "Última combinação");
      atualizarTeclas(r.pontos);
      const s = SIGNIFICADO[r.pontos];
      let fala, texto;
      if (s && s.tipo === "letra") {
        j.texto.push(s.ch);
        C().tocar("certo");
        fala = TECLADO.maiusc(descrever(r.pontos)) + ": letra " + nomeLetra(s.ch, true) + ".";
        texto = TECLADO.maiusc(descrever(r.pontos)) + ": letra " + s.ch + ".";
      } else if (s) {
        if (s.simbolo) j.texto.push(s.simbolo);
        C().tocar("acento");
        fala = TECLADO.maiusc(descrever(r.pontos)) + ": " + s.nome + ".";
        texto = fala;
      } else {
        C().tocar("errado");
        fala = TECLADO.maiusc(descrever(r.pontos)) + ": essa combinação não forma letra.";
        texto = fala;
      }
      mostrar();
      mensagem(texto, s ? "boa" : "info");
      falar(fala, instrucao);
    };
    C().estado.jogo = j;
    mostrar();
    falar(instrucao, instrucao);
  }

  /* ================= MENU DO MODO BRAILLE ================= */
  const menu = { indice: 0, fase: null };
  function fasesLiberadas() {
    const fases = fasesBraille();
    return fases.map(function (f, i) { return i; }).filter(function (i) { return liberadaBraille(fases, i); });
  }
  function itensMenu() {
    const fases = fasesBraille();
    const livres = fasesLiberadas();
    if (menu.fase === null || livres.indexOf(menu.fase) < 0) {
      const semNome = livres.filter(function (i) { return !fases[i].semBloqueio; });
      menu.fase = semNome.length ? semNome[semNome.length - 1] : livres[0];
    }
    return [
      { id: "corrida", texto: "Corrida Braille, fase " + (menu.fase + 1) + ": " + fases[menu.fase].nome, ajuda: "Use as setas para os lados para trocar de fase." },
      { id: "apresentacao", texto: "Apresentação: conhecer os seis pontos" },
      { id: "ponte", texto: "Ponte: dos pontos para o teclado comum" },
      { id: "livre", texto: "Treino livre" },
      { id: "teste", texto: "Testar o teclado" },
      { id: "voltar", texto: "Voltar ao menu do Modo Áudio" }
    ];
  }
  function desenharMenu() {
    const lista = $("menuBraille");
    lista.textContent = "";
    itensMenu().forEach(function (item, i) {
      const li = C().el("li");
      const b = C().el("button", "item-audio" + (i === menu.indice ? " selecionado" : ""), item.texto);
      b.type = "button";
      b.tabIndex = -1;
      b.addEventListener("click", function () { menu.indice = i; escolher(); });
      li.append(b);
      lista.append(li);
    });
    const aviso = $("avisoTecladoBraille");
    const p = prog();
    aviso.hidden = p.brailleTeclado !== "falhou";
    aviso.textContent = "⚠️ Teste do teclado: " + (p.brailleTecladoInfo || "");
  }
  function falarItem(prefixo) {
    const item = itensMenu()[menu.indice];
    falar((prefixo ? prefixo + " " : "") + item.texto + ". " + (item.ajuda ? item.ajuda + " " : "") + "Aperte Enter para escolher.",
      item.texto + ". Aperte Enter para escolher. Setas para cima e para baixo mudam a opção.");
  }
  function abrirMenu(prefixo) {
    C().pararJogo();
    limparAcorde();
    C().mostrarTela("braille");
    $("telaBraille").focus();
    desenharMenu();
    falarItem((typeof prefixo === "string" && prefixo ? prefixo + " " : "") + "Menu do Modo Braille. Use as setas para cima e para baixo.");
  }
  function escolher() {
    const item = itensMenu()[menu.indice];
    if (item.id === "corrida") iniciarCorrida(menu.fase);
    else if (item.id === "apresentacao") iniciarApresentacao();
    else if (item.id === "ponte") iniciarPonte();
    else if (item.id === "livre") iniciarLivre();
    else if (item.id === "teste") iniciarTeste();
    else if (item.id === "voltar") C().abrirMenuAudio();
  }
  function teclaMenu(e) {
    const itens = itensMenu();
    const n = itens.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      menu.indice = (menu.indice + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
      desenharMenu(); falarItem(); return;
    }
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && itens[menu.indice].id === "corrida") {
      e.preventDefault();
      const livres = fasesLiberadas();
      const pos = livres.indexOf(menu.fase) + (e.key === "ArrowRight" ? 1 : -1);
      if (pos < 0 || pos >= livres.length) {
        falar(pos < 0 ? "Essa é a primeira fase." : "Essa é a última fase liberada.");
        return;
      }
      menu.fase = livres[pos];
      desenharMenu(); falarItem(); return;
    }
    if (e.key === "Enter") { e.preventDefault(); escolher(); return; }
    if (e.key === " ") { e.preventDefault(); VOZ.repetir(); }
  }

  // Entrada pelo menu do Modo Áudio.
  function abrir() {
    menu.indice = 0;
    const p = prog();
    if (!p.brailleTeclado) iniciarTeste();
    else if (!p.brailleApresentacao) iniciarApresentacao("Modo Braille!");
    else abrirMenu("Modo Braille!");
  }

  /* ================= ÁREA DO PROFESSOR ================= */
  function nomeValido(nome) {
    return nome.split("").every(function (c) { return c === " " || PONTOS_DO_CARACTERE[c]; });
  }
  function preencherProfessor() {
    $("nomeBraille").value = prog().brailleNome || "";
    $("chkCela").checked = !!prog().mostrarCela;
    $("avisoBraille").textContent = "";
  }
  $("btnProfessor").addEventListener("click", preencherProfessor);
  function salvarNome() {
    const nome = normalizarNome($("nomeBraille").value);
    if (nome && !nomeValido(nome)) {
      $("avisoBraille").textContent = "Use só letras (pode ter acento e Ç) e espaço.";
      return;
    }
    prog().brailleNome = nome;
    C().salvar();
    $("nomeBraille").value = nome;
    $("avisoBraille").textContent = nome
      ? "Nome salvo: " + nome + ". A fase \"Meu nome\" aparece na Corrida Braille."
      : "Nome apagado. A fase \"Meu nome\" não aparece mais.";
  }
  $("btnSalvarNome").addEventListener("click", salvarNome);
  $("nomeBraille").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); salvarNome(); } });
  $("chkCela").addEventListener("change", function () {
    prog().mostrarCela = this.checked;
    C().salvar();
    mostrarCela(this.checked);
    $("avisoBraille").textContent = this.checked ? "A cela braille vai aparecer na tela no Modo Braille." : "A cela braille não aparece mais na tela.";
  });
  mostrarCela(prog().mostrarCela);

  return {
    abrir: abrir,
    teclaMenu: teclaMenu,
    // usados nos testes e no REVISAR-BRAILLE.md
    pontosDe: function (c) { return PONTOS_DO_CARACTERE[c]; },
    significado: significado,
    descrever: descrever
  };
})();
