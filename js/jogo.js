/*
  CORRIDA DAS TECLAS: funcionamento do jogo
  (As palavras ficam em js/palavras.js; o teclado em js/teclado.js; voz e sons em js/som.js.)
*/
(function () {
  "use strict";

  const CHAVE = "corrida-das-teclas-v1";
  // seg: segundos por tecla do carro-guia (Corrida). subida: segundos para o balão atravessar a tela.
  const VELOCIDADES = {
    lenta: { seg: 2.6, subida: 24, nome: "lenta" },
    media: { seg: 1.7, subida: 15, nome: "média" },
    rapida: { seg: 1.1, subida: 9, nome: "rápida" }
  };
  const ELOGIOS = ["Muito bem!", "Isso!", "Boa!", "Show!", "Mandou bem!", "Que legal!"];

  // [ENTER] nas listas vira a tecla Enter.
  ANOS.forEach(function (a) {
    a.fases.forEach(function (f) {
      f.itens = f.itens.map(function (i) { return String(i).replace(/\[ENTER\]/gi, "\n"); });
    });
  });
  const DITADO_LISTA = (typeof DITADO !== "undefined" && DITADO.length) ? DITADO : ["SOL", "PATO", "BOLA"];

  const $ = function (id) { return document.getElementById(id); };

  /* ================= PROGRESSO (salvo neste computador) ================= */
  function padrao() { return { estrelas: {}, liberado: false, aulaFeita: false, vozJogo: true, ano: 1 }; }
  function carregar() {
    try {
      const d = JSON.parse(localStorage.getItem(CHAVE));
      if (d && typeof d === "object") return Object.assign(padrao(), d);
    } catch (e) { /* sem armazenamento */ }
    return padrao();
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(progresso)); } catch (e) { /* sem armazenamento */ }
  }
  let progresso = carregar();

  const estado = {
    tela: "inicio",
    ano: [1, 2, 3].indexOf(progresso.ano) >= 0 ? progresso.ano : 1,
    modo: "corrida",
    vel: "lenta",
    som: false,
    audio: false,
    jogo: null,
    janela: null,
    focoAntes: null,
    menuAudio: { indice: 0, fase: null },
    esperandoAudio: false
  };

  function obterAno(n) { return ANOS.find(function (a) { return a.ano === n; }) || ANOS[0]; }
  function fasesDoModo(ano, modo) {
    return obterAno(ano).fases
      .map(function (f, i) { return { fase: f, indice: i }; })
      .filter(function (x) { return modo !== "baloes" || x.fase.baloes !== false; });
  }
  function chaveEstrela(modo, ano, i) { return modo + "-" + ano + "-" + i; }
  function estrelasDe(modo, ano, i) { return progresso.estrelas[chaveEstrela(modo, ano, i)] || 0; }
  function melhorEstrela(ano, i) { return Math.max(estrelasDe("corrida", ano, i), estrelasDe("baloes", ano, i)); }
  function liberada(ano, modo, indice) {
    if (progresso.liberado) return true;
    const lista = fasesDoModo(ano, modo);
    const pos = lista.findIndex(function (x) { return x.indice === indice; });
    if (pos <= 0) return true;
    return melhorEstrela(ano, lista[pos - 1].indice) >= 2;
  }
  function proximaFase(ano, modo, indice) {
    const lista = fasesDoModo(ano, modo);
    const pos = lista.findIndex(function (x) { return x.indice === indice; });
    return pos >= 0 && pos < lista.length - 1 ? lista[pos + 1].indice : null;
  }

  /* ================= UTILIDADES ================= */
  function sortear(itens, quantidade) {
    const saida = [];
    let monte = [];
    while (saida.length < quantidade && itens.length) {
      if (!monte.length) {
        monte = itens.slice();
        for (let i = monte.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = monte[i]; monte[i] = monte[j]; monte[j] = t;
        }
        if (saida.length && monte.length > 1 && monte[monte.length - 1] === saida[saida.length - 1]) monte.reverse();
      }
      saida.push(monte.pop());
    }
    return saida;
  }
  function aleatorio(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function tocar(tipo) { if (estado.som || estado.audio) SONS.tocar(tipo); }
  function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }
  // Texto com letras marcadas: "Aperte o {F}" -> tela "Aperte o F", voz "Aperte o éfe".
  function paraTela(t) { return t.replace(/\{(.)\}/g, "$1"); }
  function paraVoz(t) { return t.replace(/\{(.)\}/g, function (m, c) { return TECLADO.nomeCaractere(c, true); }); }

  /* ================= DIGITAÇÃO (comum a todos os modos) ================= */
  function criarAlvo(texto, conferir) {
    return { texto: texto, chars: Array.from(texto), pos: 0, passo: 0, conferir: !!conferir, mortoSolto: false };
  }
  function passoAtual(alvo) {
    if (!alvo || alvo.pos >= alvo.chars.length) return null;
    const ps = TECLADO.passos(alvo.chars[alvo.pos], alvo.conferir);
    return ps[Math.min(alvo.passo, ps.length - 1)];
  }
  function totalPassos(texto, conferir) {
    return Array.from(texto).reduce(function (s, c) { return s + TECLADO.passos(c, conferir).length; }, 0);
  }
  function iguais(a, b, conferir) { return conferir ? a === b : a.toLowerCase() === b.toLowerCase(); }

  const MODIFICADORAS = ["Shift", "Control", "Alt", "AltGraph", "Meta", "CapsLock", "OS", "Fn", "FnLock",
    "NumLock", "ScrollLock", "ContextMenu", "Hyper", "Super", "Symbol"];
  function lerTecla(e) {
    const k = e.key;
    if (!k || MODIFICADORAS.indexOf(k) >= 0) return null;
    if (e.metaKey || (e.ctrlKey && !e.altKey)) return null; // atalhos do computador
    if (k === "Dead") return { morto: true, code: e.code, acento: TECLADO.acentoPorCode(e.code, e.shiftKey) };
    if (k === "Enter") return { ch: "\n", code: "Enter" };
    if (k === " " || k === "Spacebar") return { ch: " ", code: "Space" };
    if (k.length === 1) return { ch: k, code: e.code };
    return { outra: true, code: e.code };
  }

  // Confere a tecla apertada. Devolve {tipo: "ignorar" | "acento" | "certo" | "errado", ...}
  function avaliar(alvo, e) {
    const t = lerTecla(e);
    if (!t || t.outra) return { tipo: "ignorar" };
    const c = alvo.chars[alvo.pos];
    const ps = TECLADO.passos(c, alvo.conferir);
    const p = ps[alvo.passo] || ps[0];

    let acento = null;
    if (t.morto) acento = t.acento;
    else if (["´", "`", "~", "^"].indexOf(t.ch) >= 0) acento = TECLADO.acentoPorSimbolo(t.ch);
    else if (p.acento && t.code === TECLADO.ACENTOS[p.acento].code && "[{'\"".indexOf(t.ch) >= 0) {
      // Computador configurado com outro teclado: a tecla do acento vale como acento.
      acento = TECLADO.acentoPorCode(t.code, e.shiftKey);
    }
    if (t.morto || acento) {
      if (p.acento && acento === p.acento) {
        alvo.passo++;
        return { tipo: "acento", code: t.code, acento: acento };
      }
      if (t.morto) alvo.mortoSolto = true;
      alvo.passo = 0;
      return { tipo: "errado", code: t.code, alvoChar: c, passo: ps[0], passos: ps };
    }

    let ch = t.ch;
    if (t.code === "Semicolon" && ch === ";") ch = e.shiftKey ? "Ç" : "ç"; // computador sem o teclado ABNT2 configurado
    if (alvo.passo > 0 && ps[0].acento) ch = TECLADO.compor(ps[0].acento, ch);
    if (alvo.mortoSolto) {
      // Um acento apertado por engano pode "grudar" na letra seguinte. Desconsidera o acento.
      alvo.mortoSolto = false;
      const comp = TECLADO.COMPOSTAS[ch.toLowerCase()];
      if (comp && !TECLADO.COMPOSTAS[c.toLowerCase()]) ch = ch === ch.toLowerCase() ? comp[1] : comp[1].toUpperCase();
    }

    if (iguais(ch, c, alvo.conferir)) {
      alvo.pos++;
      alvo.passo = 0;
      return { tipo: "certo", code: t.code, ch: c, fim: alvo.pos >= alvo.chars.length };
    }
    const r = { tipo: "errado", code: t.code, alvoChar: c, passo: ps[0], passos: ps };
    if (!p.acento && t.code === p.code && alvo.conferir && ch.toLowerCase() === c.toLowerCase()) {
      r.caso = c !== c.toLowerCase() ? "maiuscula" : "minuscula";
    }
    if (ps[0].acento && ps[1] && t.code === ps[1].code) r.faltaAcento = true;
    alvo.passo = 0;
    return r;
  }

  // "o éfe", "a barra de espaço", "o acento agudo e depois o á"...
  function proximaTecla(alvo, falado) {
    const c = alvo.chars[alvo.pos];
    if (c === undefined) return "";
    const ps = TECLADO.passos(c, alvo.conferir);
    if (ps[0].acento) {
      const vogal = TECLADO.COMPOSTAS[c.toLowerCase()][1];
      const nomeVogal = "o " + TECLADO.nomeCaractere(vogal, falado) + (ps[1].shift ? " maiúsculo, segurando o Shift" : "");
      if (alvo.passo === 0) {
        const ac = TECLADO.ACENTOS[ps[0].acento];
        return "o " + ac.nome + (ac.shift ? ", segurando o Shift," : "") + " e depois " + nomeVogal;
      }
      return nomeVogal;
    }
    let t = TECLADO.artigoCaractere(c) + " " + TECLADO.nomeCaractere(c, falado);
    if (ps[0].shift && c.toLowerCase() !== c.toUpperCase()) t += " maiúsculo, segurando o Shift";
    return t;
  }

  function textoErro(r, falado) {
    let t = "";
    if (r.caso === "maiuscula") t = "Essa letra é maiúscula. ";
    else if (r.caso === "minuscula") t = "Essa letra é minúscula. Solte o Shift e veja se o Caps Lock está desligado. ";
    else if (r.faltaAcento) t = "Essa letra tem acento. ";
    else if (r.code && TECLADO.nome(r.code) !== "outra tecla") t = "Você apertou " + TECLADO.comArtigo(r.code, falado) + ". ";
    return t + TECLADO.dica(r.passo, r.code, falado, r.alvoChar);
  }

  function falaItem(item) {
    if (item.length === 1) return TECLADO.nomeCaractere(item, true);
    const partes = item.split(/[ \n]/).filter(Boolean);
    const soLetras = partes.every(function (p) { return p.length > 1; }) && item.indexOf("\n") < 0;
    if (soLetras) return item.toLowerCase();
    return Array.from(item).map(function (c) { return TECLADO.nomeCaractere(c, true); }).join(", ");
  }

  /* ---------- estatísticas ---------- */
  function novasEstatisticas() { return { acertos: 0, erros: 0, teclas: {} }; }
  function registrar(est, ch, certo) {
    const k = ch.toLowerCase();
    if (!est.teclas[k]) est.teclas[k] = { a: 0, e: 0 };
    if (certo) { est.teclas[k].a++; est.acertos++; } else { est.teclas[k].e++; est.erros++; }
  }
  function analisar(est) {
    const ks = Object.keys(est.teclas).map(function (k) { return { k: k, a: est.teclas[k].a, e: est.teclas[k].e }; });
    let boas = ks.filter(function (x) { return x.a > 0 && x.e === 0; }).sort(function (x, y) { return y.a - x.a; }).slice(0, 4);
    if (!boas.length) boas = ks.filter(function (x) { return x.a > x.e; }).sort(function (x, y) { return (y.a - y.e) - (x.a - x.e); }).slice(0, 3);
    const treino = ks.filter(function (x) { return x.e > 0; }).sort(function (x, y) { return y.e - x.e; }).slice(0, 4);
    return { boas: boas.map(function (x) { return x.k; }), treino: treino.map(function (x) { return x.k; }) };
  }
  function estrelasPorPrecisao(prec) { return prec >= 0.9 ? 3 : prec >= 0.75 ? 2 : 1; }

  /* ================= TELA DO JOGO: partes comuns ================= */
  const telaJogo = $("telaJogo");
  const tecladoEl = $("teclado");
  const maosEl = $("maos");
  TECLADO.desenhar(tecladoEl);
  TECLADO.desenharMaos(maosEl);

  function destacar(alvo) { TECLADO.destacar(tecladoEl, maosEl, passoAtual(alvo)); }
  let temporizadorMensagem = null;
  function mensagem(texto, tipo) {
    const m = $("mensagem");
    m.textContent = texto || "";
    m.className = "mensagem" + (tipo ? " mensagem-" + tipo : "");
    clearTimeout(temporizadorMensagem);
  }
  function verificarCaps(e, conferir) {
    if (!e.getModifierState) return;
    $("avisoCaps").hidden = !(conferir && e.getModifierState("CapsLock"));
  }

  function desenharTexto(destino, alvo, opcoes) {
    opcoes = opcoes || {};
    destino.textContent = "";
    const n = alvo.chars.length;
    destino.className = "texto-alvo " + (n === 1 ? "texto-gigante" : n <= 8 ? "texto-grande" : "texto-medio");
    alvo.chars.forEach(function (c, i) {
      const s = el("span", "ch " + (i < alvo.pos ? "feito" : i === alvo.pos ? "atual" : "falta"));
      if (opcoes.esconder && i >= alvo.pos) s.textContent = "_";
      else if (c === " ") { s.classList.add("ch-espaco"); s.textContent = "␣"; }
      else if (c === "\n") { s.classList.add("ch-enter"); s.textContent = "⏎ Enter"; }
      else s.textContent = c;
      if (i === alvo.pos && alvo.passo > 0) s.classList.add("meio-acento");
      destino.append(s);
    });
  }

  function svgCarro(cor) {
    return '<svg viewBox="0 0 120 62" aria-hidden="true">' +
      '<path d="M30 26 L43 9 H79 L94 26 Z" fill="' + cor + '" stroke="#111" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="6" y="24" width="108" height="24" rx="11" fill="' + cor + '" stroke="#111" stroke-width="3"/>' +
      '<path d="M47 13 H60 V25 H38 Z" fill="#dbeafe" stroke="#111" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M64 13 H77 L87 25 H64 Z" fill="#dbeafe" stroke="#111" stroke-width="2" stroke-linejoin="round"/>' +
      '<rect x="104" y="30" width="9" height="7" rx="2" fill="#fde047" stroke="#111" stroke-width="1.5"/>' +
      '<circle cx="31" cy="49" r="11" fill="#111"/><circle cx="31" cy="49" r="4.5" fill="#d1d5db"/>' +
      '<circle cx="90" cy="49" r="11" fill="#111"/><circle cx="90" cy="49" r="4.5" fill="#d1d5db"/></svg>';
  }

  function prepararTelaJogo(info, contador) {
    fecharJanela(true);
    $("infoFase").textContent = info;
    $("contador").textContent = contador || "";
    $("areaJogo").textContent = "";
    $("areaJogo").removeAttribute("aria-hidden");
    $("avisoCaps").hidden = true;
    telaJogo.classList.remove("modo-braille", "ponte-braille");
    mensagem("");
    mostrarTela("jogo");
    telaJogo.focus();
  }

  function pararJogo() {
    if (estado.jogo && estado.jogo.parar) estado.jogo.parar();
    estado.jogo = null;
    VOZ.calar();
  }

  /* ================= MODO CORRIDA ================= */
  function iniciarCorrida(ano, indice) {
    pararJogo();
    const anoObj = obterAno(ano);
    const fase = anoObj.fases[indice];
    const conferir = anoObj.conferirMaiusculas;
    const itens = sortear(fase.itens, fase.quantidade || 10);
    const j = {
      tipo: "corrida", ano: ano, indice: indice, fase: fase, conferir: conferir, itens: itens, item: 0,
      alvo: criarAlvo(itens[0], conferir), base: 0,
      total: itens.reduce(function (s, i) { return s + totalPassos(i, conferir); }, 0),
      guia: 0, guiaChegou: false, est: novasEstatisticas(), bloqueadoAte: 0, terminado: false, metadeAvisada: false
    };
    estado.jogo = j;
    prepararTelaJogo(anoObj.titulo + " · Corrida · Fase " + (indice + 1) + ": " + fase.nome, "");

    const area = $("areaJogo");
    area.className = "area-jogo area-corrida";
    const painel = el("div", "painel-texto");
    painel.append(el("p", "rotulo-digite", "Digite:"));
    const texto = el("p", "texto-alvo"); texto.id = "textoAlvo";
    const prox = el("p", "proximo"); prox.id = "proximo";
    painel.append(texto, prox);

    const pista = el("div", "pista" + (estado.audio ? " sem-guia" : ""));
    pista.setAttribute("aria-hidden", "true");
    const faixaGuia = el("div", "faixa faixa-guia");
    const guia = el("div", "carro carro-guia"); guia.id = "carroGuia";
    guia.innerHTML = svgCarro("#60a5fa") + '<span class="placa-carro">guia</span>';
    faixaGuia.append(guia);
    const faixa = el("div", "faixa faixa-jogador");
    const carro = el("div", "carro carro-jogador"); carro.id = "carroJogador";
    carro.innerHTML = svgCarro("#ef4444") + '<span class="balao-ops">Ops!</span>';
    faixa.append(carro);
    pista.append(el("div", "largada"), faixaGuia, faixa, el("div", "chegada"));
    area.append(painel, pista);

    j.mostrar = function () {
      desenharTexto(texto, j.alvo);
      const seguinte = j.itens[j.item + 1];
      prox.textContent = seguinte !== undefined ? "Depois: " + seguinte.replace(/\n/g, "⏎") : "Última! 🏁";
      $("contador").textContent = (j.itens[0].length === 1 ? "Letra " : "Item ") + (j.item + 1) + " de " + j.itens.length;
      destacar(j.alvo);
      const feitos = j.base + totalPassos(j.alvo.chars.slice(0, j.alvo.pos).join(""), j.conferir) + j.alvo.passo;
      carro.style.setProperty("--p", Math.min(1, feitos / j.total));
    };
    j.instrucao = function () {
      const item = j.itens[j.item];
      if (item.length === 1) return "Aperte " + proximaTecla(j.alvo, true) + ".";
      const comeco = j.alvo.pos === 0 && j.alvo.passo === 0 ? "Comece com " : "Agora, ";
      return "Escreva " + falaItem(item) + ". " + comeco + proximaTecla(j.alvo, true) + ".";
    };
    j.quadro = function (dt) {
      if (estado.audio || j.terminado) return;
      j.guia = Math.min(1, j.guia + dt / (j.total * VELOCIDADES[estado.vel].seg));
      guia.style.setProperty("--p", j.guia);
      if (j.guia >= 1 && !j.guiaChegou) {
        j.guiaChegou = true;
        mensagem("O carro-guia já chegou. Continue, você também vai chegar!", "info");
      }
    };
    j.tecla = function (e) {
      if (j.terminado) return;
      if (performance.now() < j.bloqueadoAte) return;
      verificarCaps(e, j.conferir);
      const passo = passoAtual(j.alvo);
      if (estado.audio && e.key === " " && passo && passo.code !== "Space") { VOZ.repetir(); return; }
      const r = avaliar(j.alvo, e);
      if (r.tipo === "ignorar") return;
      if (r.tipo === "acento") {
        tocar("acento");
        TECLADO.piscar(tecladoEl, r.code, "certa");
        mensagem("Agora aperte " + proximaTecla(j.alvo, false) + ".", "boa");
        j.mostrar();
        if (estado.audio) VOZ.falar(TECLADO.ACENTOS[r.acento].nome + ". Agora, " + proximaTecla(j.alvo, true) + ".", j.instrucao());
        return;
      }
      if (r.tipo === "errado") {
        registrar(j.est, r.alvoChar, false);
        tocar("errado");
        TECLADO.piscar(tecladoEl, r.code, "errada");
        carro.classList.remove("ops"); void carro.offsetWidth; carro.classList.add("ops");
        j.bloqueadoAte = performance.now() + 300;
        mensagem("Quase! " + textoErro(r, false), "ops");
        j.mostrar();
        if (estado.audio) VOZ.falar(textoErro(r, true), j.instrucao());
        return;
      }
      // certo
      registrar(j.est, r.ch, true);
      tocar("certo");
      TECLADO.piscar(tecladoEl, r.code, "certa");
      carro.classList.remove("ops");
      const eco = TECLADO.nomeCaractere(r.ch, true);
      if (!r.fim) {
        mensagem("");
        j.mostrar();
        if (estado.audio) VOZ.falar(eco + ". Agora, " + proximaTecla(j.alvo, true) + ".", j.instrucao());
        return;
      }
      j.base += totalPassos(j.itens[j.item], j.conferir);
      j.item++;
      if (j.item >= j.itens.length) { desenharTexto(texto, j.alvo); carro.style.setProperty("--p", 1); destacar(null); terminarCorrida(j); return; }
      j.alvo = criarAlvo(j.itens[j.item], j.conferir);
      mensagem(aleatorio(ELOGIOS), "boa");
      j.mostrar();
      if (estado.audio) {
        let fala = eco + ". " + aleatorio(ELOGIOS) + " ";
        if (!j.metadeAvisada && j.item >= j.itens.length / 2) { j.metadeAvisada = true; fala += "Metade da corrida! "; }
        VOZ.falar(fala + j.instrucao(), j.instrucao());
      }
    };
    j.mostrar();
    if (estado.audio) {
      VOZ.falar("Corrida! Fase " + (indice + 1) + ": " + fase.nome + ". A cada tecla certa, o carrinho anda. " + j.instrucao(), j.instrucao());
    }
  }

  function terminarCorrida(j) {
    j.terminado = true;
    const total = j.est.acertos + j.est.erros;
    const prec = total ? j.est.acertos / total : 1;
    const estrelas = estrelasPorPrecisao(prec);
    const extra = (!estado.audio && !j.guiaChegou) ? "🏆 Você chegou antes do carro-guia!" : "";
    concluirFase(j, "corrida", estrelas, {
      numeros: "Você acertou " + Math.round(prec * 100) + "% das teclas (" + j.est.acertos + " acertos e " + j.est.erros + (j.est.erros === 1 ? " tentativa a mais)." : " tentativas a mais)."),
      extra: extra
    });
  }

  /* ================= MODO BALÕES ================= */
  const CORES_BALOES = ["#fca5a5", "#fde047", "#86efac", "#7dd3fc", "#f9a8d4", "#fdba74", "#c4b5fd"];

  function iniciarBaloes(ano, indice) {
    pararJogo();
    const anoObj = obterAno(ano);
    const fase = anoObj.fases[indice];
    const conferir = anoObj.conferirMaiusculas;
    const itens = sortear(fase.itens.filter(function (i) { return i.indexOf("\n") < 0; }), Math.min(fase.quantidade || 10, 10));
    const j = {
      tipo: "baloes", ano: ano, indice: indice, fase: fase, conferir: conferir,
      fila: itens.slice(), total: itens.length, ativos: [], estourados: 0, escaparam: 0,
      espera: 0, corIndice: 0, est: novasEstatisticas(), terminado: false, bloqueadoAte: 0
    };
    estado.jogo = j;
    prepararTelaJogo(anoObj.titulo + " · Balões · Fase " + (indice + 1) + ": " + fase.nome, "");
    const area = $("areaJogo");
    area.className = "area-jogo area-baloes";
    area.setAttribute("aria-hidden", "true");
    const ceu = el("div", "ceu");
    area.append(ceu);

    function atualizarContador() {
      $("contador").textContent = "🎈 Estourados: " + j.estourados + " de " + j.total;
    }
    function ativo() { return j.ativos[0] || null; }
    function marcarAtivo() {
      j.ativos.forEach(function (b, i) { b.el.classList.toggle("ativo", i === 0); });
      const a = ativo();
      if (a) { desenharTexto(a.textoEl, a.alvo); destacar(a.alvo); } else destacar(null);
    }
    function criarBalao() {
      const texto = j.fila.shift();
      const b = { alvo: criarAlvo(texto, j.conferir), y: 0 };
      b.el = el("div", "balao");
      b.el.style.setProperty("--cor", CORES_BALOES[j.corIndice++ % CORES_BALOES.length]);
      b.textoEl = el("span", "texto-alvo");
      b.el.append(el("span", "seta-balao", "Digite!"), b.textoEl);
      ceu.append(b.el);
      desenharTexto(b.textoEl, b.alvo);
      const largura = ceu.clientWidth;
      const larguraBalao = b.el.offsetWidth;
      b.altura = b.el.offsetHeight;
      // Escolhe uma coluna longe dos balões que acabaram de sair.
      const colunas = Math.max(2, Math.floor((largura - 48) / (larguraBalao + 30)));
      const ocupadas = j.ativos.filter(function (o) { return o.y < o.altura * 1.6; }).map(function (o) { return o.coluna; });
      const livres = [];
      for (let c = 0; c < colunas; c++) if (ocupadas.indexOf(c) < 0) livres.push(c);
      b.coluna = livres.length ? aleatorio(livres) : Math.floor(Math.random() * colunas);
      const margem = 24;
      const passo = (largura - larguraBalao - 2 * margem) / Math.max(1, colunas - 1);
      b.el.style.left = Math.max(margem, Math.min(largura - larguraBalao - margem, margem + b.coluna * passo)) + "px";
      b.y = -b.altura;
      b.el.style.transform = "translateY(" + (-b.y) + "px)";
      j.ativos.push(b);
      marcarAtivo();
    }
    function remover(b) {
      const i = j.ativos.indexOf(b);
      if (i >= 0) j.ativos.splice(i, 1);
    }
    function estourar(b) {
      remover(b);
      j.estourados++;
      b.el.classList.add("estourado");
      b.el.textContent = "";
      b.el.append(el("span", "pow", "POW!"));
      setTimeout(function () { b.el.remove(); }, 600);
      atualizarContador();
      marcarAtivo();
    }
    function escapar(b) {
      remover(b);
      j.escaparam++;
      b.el.remove();
      mensagem("Um balão voou! Tudo bem, vamos para o próximo.", "info");
      marcarAtivo();
    }
    j.quadro = function (dt) {
      if (j.terminado) return;
      const altura = ceu.clientHeight;
      const subida = VELOCIDADES[estado.vel].subida;
      j.espera -= dt;
      const maximo = estado.vel === "lenta" ? 2 : 3;
      if (j.fila.length && (j.ativos.length === 0 || (j.espera <= 0 && j.ativos.length < maximo))) {
        criarBalao();
        j.espera = subida / 2.4;
      }
      j.ativos.slice().forEach(function (b) {
        b.y += dt * (altura + b.altura) / subida;
        b.el.style.transform = "translateY(" + (-b.y) + "px)";
        if (b.y > altura) escapar(b);
      });
      if (!j.fila.length && !j.ativos.length) terminarBaloes(j);
    };
    j.tecla = function (e) {
      if (j.terminado) return;
      if (performance.now() < j.bloqueadoAte) return;
      verificarCaps(e, j.conferir);
      const b = ativo();
      if (!b) return;
      const r = avaliar(b.alvo, e);
      if (r.tipo === "ignorar") return;
      if (r.tipo === "acento") {
        tocar("acento");
        TECLADO.piscar(tecladoEl, r.code, "certa");
        mensagem("Agora aperte " + proximaTecla(b.alvo, false) + ".", "boa");
        marcarAtivo();
        return;
      }
      if (r.tipo === "errado") {
        registrar(j.est, r.alvoChar, false);
        tocar("errado");
        TECLADO.piscar(tecladoEl, r.code, "errada");
        b.el.classList.remove("balanca"); void b.el.offsetWidth; b.el.classList.add("balanca");
        j.bloqueadoAte = performance.now() + 250;
        mensagem("Quase! " + textoErro(r, false), "ops");
        marcarAtivo();
        return;
      }
      registrar(j.est, r.ch, true);
      TECLADO.piscar(tecladoEl, r.code, "certa");
      if (r.fim) {
        tocar("estouro");
        mensagem(aleatorio(ELOGIOS), "boa");
        estourar(b);
      } else {
        tocar("certo");
        mensagem("");
        marcarAtivo();
      }
    };
    j.parar = function () { ceu.textContent = ""; };
    atualizarContador();
    destacar(null);
    mensagem("Os balões vão subir. Digite o que está escrito no balão marcado!", "info");
  }

  function terminarBaloes(j) {
    j.terminado = true;
    const total = j.est.acertos + j.est.erros;
    const prec = total ? j.est.acertos / total : 1;
    const razao = j.total ? j.estourados / j.total : 0;
    let estrelas = razao >= 0.9 ? 3 : razao >= 0.6 ? 2 : 1;
    if (prec < 0.7) estrelas = Math.max(1, estrelas - 1);
    concluirFase(j, "baloes", estrelas, {
      titulo: "Fim dos balões! 🎈",
      numeros: "Você estourou " + j.estourados + " de " + j.total + " balões e acertou " + Math.round(prec * 100) + "% das teclas.",
      extra: j.escaparam ? "Os balões que voaram vão voltar na próxima vez. 😉" : "🏆 Nenhum balão escapou!"
    });
  }

  /* ================= FIM DE FASE E RESULTADO ================= */
  function concluirFase(j, modo, estrelas, textos) {
    const prox = proximaFase(j.ano, modo, j.indice);
    const antes = prox !== null && liberada(j.ano, modo, prox);
    const chave = chaveEstrela(modo, j.ano, j.indice);
    progresso.estrelas[chave] = Math.max(progresso.estrelas[chave] || 0, estrelas);
    salvar();
    const depois = prox !== null && liberada(j.ano, modo, prox);
    let extra = textos.extra || "";
    if (!antes && depois) extra += (extra ? " " : "") + "🔓 Nova fase liberada!";
    if (prox !== null && !depois) extra += (extra ? " " : "") + "Ganhe 2 estrelas para liberar a próxima fase.";
    const lista = analisar(j.est);
    tocar("fim");
    mostrarResultado({
      titulo: textos.titulo || "Chegada! 🏁",
      estrelas: estrelas,
      numeros: textos.numeros,
      boas: lista.boas, treino: lista.treino, extra: extra,
      proxima: depois ? function () { iniciarFase(j.ano, modo, prox); } : null,
      deNovo: function () { iniciarFase(j.ano, modo, j.indice); }
    });
  }

  const FRASES_ESTRELAS = ["", "Boa corrida! Treinando, você vai longe!", "Muito bem! Você está aprendendo depressa!", "Incrível! Você é fera no teclado!"];

  function chips(destino, teclas, vazio) {
    destino.textContent = "";
    if (!teclas.length) { destino.textContent = vazio; return; }
    teclas.forEach(function (k) { destino.append(el("span", "chip-tecla", TECLADO.nomeCaractere(k, false))); });
  }
  function nomesFalados(teclas) { return teclas.map(function (k) { return TECLADO.nomeCaractere(k, true); }).join(", "); }

  let acoesResultado = {};
  function mostrarResultado(r) {
    $("tituloResultado").textContent = r.titulo;
    const est = $("estrelas");
    est.textContent = "";
    est.setAttribute("aria-label", r.estrelas + " de 3 estrelas");
    for (let i = 1; i <= 3; i++) est.append(el("span", i <= r.estrelas ? "estrela cheia" : "estrela vazia", "★"));
    $("resultadoFrase").textContent = r.frase || FRASES_ESTRELAS[r.estrelas];
    $("resultadoNumeros").textContent = r.numeros || "";
    const listas = document.querySelector(".listas-teclas");
    listas.hidden = !r.boas;
    const tituloBoas = r.tituloBoas || "Teclas campeãs";
    const tituloTreino = r.tituloTreino || "Vamos treinar mais";
    document.querySelector(".lista-boa h3").innerHTML = '<span aria-hidden="true">🏆</span> ' + tituloBoas;
    document.querySelector(".lista-treino h3").innerHTML = '<span aria-hidden="true">💪</span> ' + tituloTreino;
    if (r.boas) {
      chips($("teclasBoas"), r.boas, "Continue treinando!");
      chips($("teclasTreino"), r.treino, "Você não errou nenhuma tecla! 🎉");
    }
    $("resultadoExtra").textContent = r.extra || "";
    $("btnProxima").hidden = !r.proxima;
    $("btnDeNovo").hidden = !r.deNovo;
    acoesResultado = r;
    abrirJanela("janelaResultado", r.proxima ? "btnProxima" : r.deNovo ? "btnDeNovo" : "btnMenu");
    if (estado.audio) {
      let fala = r.titulo.replace(/[^\p{L}\p{N}!.,: ]/gu, "") + " Você ganhou " + r.estrelas + (r.estrelas === 1 ? " estrela. " : " estrelas. ") + (r.frase || FRASES_ESTRELAS[r.estrelas]) + " ";
      if (r.boas && r.boas.length) fala += tituloBoas + ": " + nomesFalados(r.boas) + ". ";
      if (r.treino && r.treino.length) fala += tituloTreino + ": " + nomesFalados(r.treino) + ". ";
      if (r.extra && /liberada/.test(r.extra)) fala += "Nova fase liberada! ";
      const opcoes = r.proxima ? "Aperte Enter para a próxima fase, ou Esc para voltar ao menu."
        : r.deNovo ? "Aperte Enter para jogar de novo, ou Esc para voltar ao menu." : "Aperte Enter ou Esc para voltar ao menu.";
      VOZ.falar(fala + opcoes, opcoes);
    }
  }

  /* ================= AULA DAS MÃOS ================= */
  const AULA = [
    { ch: "f", texto: "Passe os dedos pela fileira do meio do teclado e procure uma tecla com um tracinho em relevo, do lado esquerdo. É o {F}! Coloque o dedo indicador da mão esquerda nele e aperte o {F}.", certo: "Isso! Esse é o {F}, a tecla com tracinho da mão esquerda." },
    { ch: "j", texto: "Agora procure a outra tecla com tracinho, do lado direito. É o {J}! Coloque o dedo indicador da mão direita nele e aperte o {J}.", certo: "Muito bem! Esse é o {J}, a tecla com tracinho da mão direita." },
    { ch: "d", texto: "Deixe os indicadores no {F} e no {J}. O dedo médio da mão esquerda fica no {D}, logo à esquerda do {F}. Aperte o {D}.", certo: "Isso! Esse é o {D}." },
    { ch: "s", texto: "O anelar da mão esquerda fica no {S}, logo à esquerda do {D}. Aperte o {S}.", certo: "Certo! Esse é o {S}." },
    { ch: "a", texto: "O mindinho da mão esquerda fica no {A}, logo à esquerda do {S}. Aperte o {A}.", certo: "Muito bem! Esse é o {A}." },
    { ch: "k", texto: "Agora a mão direita. O dedo médio fica no {K}, logo à direita do {J}. Aperte o {K}.", certo: "Isso! Esse é o {K}." },
    { ch: "l", texto: "O anelar da mão direita fica no {L}, logo à direita do {K}. Aperte o {L}.", certo: "Certo! Esse é o {L}." },
    { ch: "ç", texto: "O mindinho da mão direita fica no {Ç}, logo à direita do {L}. Aperte o {Ç}.", certo: "Muito bem! Esse é o {Ç}." },
    { ch: "g", texto: "O indicador da mão esquerda também alcança o {G}, logo à direita do {F}. Estique o dedo, aperte o {G} e volte para o {F}.", certo: "Isso! Esse é o {G}. Volte o dedo para o {F}." },
    { ch: "h", texto: "O indicador da mão direita alcança o {H}, logo à esquerda do {J}. Estique o dedo, aperte o {H} e volte para o {J}.", certo: "Muito bem! Esse é o {H}. Volte o dedo para o {J}." },
    { ch: " ", texto: "Embaixo de todas as teclas fica a barra de espaço, uma tecla bem comprida. Aperte a barra de espaço com o polegar.", certo: "Isso! Essa é a barra de espaço." },
    { ch: "\n", texto: "Do lado direito, na fileira do meio, depois do {Ç} e de mais duas teclas, fica o Enter, uma tecla grande. Estique o mindinho da mão direita e aperte o Enter.", certo: "Muito bem! Esse é o Enter." },
    { ch: "f", texto: "Volte os indicadores para os tracinhos. Aperte o {F} de novo.", certo: "Certo!" },
    { ch: "j", texto: "E agora o {J}.", certo: "Certo!" }
  ];

  function iniciarAula(introducao) {
    pararJogo();
    const j = { tipo: "aula", passo: 0, alvo: null, est: novasEstatisticas(), bloqueadoAte: 0, terminado: false };
    estado.jogo = j;
    prepararTelaJogo("✋ Aula das mãos", "");
    const area = $("areaJogo");
    area.className = "area-jogo area-aula";
    const painel = el("div", "painel-aula");
    const passoEl = el("p", "passo-aula");
    const textoEl = el("p", "texto-aula");
    const alvoEl = el("p", "texto-alvo texto-gigante");
    painel.append(passoEl, textoEl, alvoEl);
    area.append(painel);

    j.instrucao = function () { return paraVoz(AULA[j.passo].texto); };
    j.mostrar = function () {
      const p = AULA[j.passo];
      passoEl.textContent = "Passo " + (j.passo + 1) + " de " + AULA.length;
      textoEl.textContent = paraTela(p.texto);
      desenharTexto(alvoEl, j.alvo);
      alvoEl.className = "texto-alvo texto-gigante";
      destacar(j.alvo);
      $("contador").textContent = "";
    };
    function comecarPasso(prefixo) {
      j.alvo = criarAlvo(AULA[j.passo].ch.toUpperCase(), false);
      j.mostrar();
      if (estado.audio) VOZ.falar((prefixo ? prefixo + " " : "") + j.instrucao(), j.instrucao());
    }
    j.tecla = function (e) {
      if (j.terminado || performance.now() < j.bloqueadoAte) return;
      const passo = passoAtual(j.alvo);
      if (estado.audio && e.key === " " && passo && passo.code !== "Space") { VOZ.repetir(); return; }
      const r = avaliar(j.alvo, e);
      if (r.tipo === "ignorar") return;
      if (r.tipo !== "certo") {
        registrar(j.est, j.alvo.chars[0], false);
        tocar("errado");
        TECLADO.piscar(tecladoEl, r.code, "errada");
        j.bloqueadoAte = performance.now() + 300;
        mensagem("Quase! " + textoErro(r, false), "ops");
        if (estado.audio) VOZ.falar(textoErro(r, true), j.instrucao());
        return;
      }
      registrar(j.est, r.ch, true);
      tocar("certo");
      TECLADO.piscar(tecladoEl, r.code, "certa");
      const elogio = AULA[j.passo].certo;
      mensagem(paraTela(elogio), "boa");
      j.passo++;
      if (j.passo < AULA.length) { comecarPasso(paraVoz(elogio)); return; }
      j.terminado = true;
      progresso.aulaFeita = true;
      salvar();
      tocar("fim");
      const final = "Parabéns! Você aprendeu onde ficam as mãos. Sempre que se perder, procure os tracinhos do {F} e do {J}.";
      if (estado.audio) {
        abrirMenuAudio(paraVoz(final));
      } else {
        mostrarResultado({
          titulo: "Aula completa! ✋", estrelas: 3, frase: paraTela(final),
          numeros: "Agora você já pode jogar a Corrida e os Balões.",
          deNovo: function () { iniciarAula(); }
        });
      }
    };
    comecarPasso(introducao || "Aula das mãos!");
  }

  /* ================= DITADO (Modo Áudio) ================= */
  function iniciarDitado() {
    pararJogo();
    const palavras = sortear(DITADO_LISTA, 6);
    const j = {
      tipo: "ditado", palavras: palavras, i: 0, alvo: criarAlvo(palavras[0], false), errosChar: 0,
      est: novasEstatisticas(), terminado: false, bloqueadoAte: 0, ano: 1, indice: -1
    };
    estado.jogo = j;
    prepararTelaJogo("🎧 Ditado", "");
    const area = $("areaJogo");
    area.className = "area-jogo area-corrida";
    const painel = el("div", "painel-texto");
    painel.append(el("p", "rotulo-digite", "Escreva a palavra que você ouvir:"));
    const texto = el("p", "texto-alvo");
    const prof = el("p", "proximo");
    painel.append(texto, prof);
    area.append(painel);

    function palavra() { return j.palavras[j.i].toLowerCase(); }
    function jaEscreveu() {
      const feitas = j.alvo.chars.slice(0, j.alvo.pos);
      return feitas.length ? " Você já escreveu: " + feitas.map(function (c) { return TECLADO.nomeCaractere(c, true); }).join(", ") + "." : "";
    }
    j.instrucao = function () { return "Escreva: " + palavra() + "." + jaEscreveu(); };
    j.mostrar = function () {
      desenharTexto(texto, j.alvo, { esconder: true });
      prof.textContent = "Palavra (para o professor): " + j.palavras[j.i];
      $("contador").textContent = "Palavra " + (j.i + 1) + " de " + j.palavras.length;
      destacar(j.alvo);
    };
    j.tecla = function (e) {
      if (j.terminado || performance.now() < j.bloqueadoAte) return;
      if (e.key === " ") { VOZ.falar("A palavra é " + palavra() + "." + jaEscreveu(), j.instrucao()); return; }
      const r = avaliar(j.alvo, e);
      if (r.tipo === "ignorar") return;
      if (r.tipo !== "certo") {
        registrar(j.est, r.alvoChar || j.alvo.chars[j.alvo.pos], false);
        tocar("errado");
        TECLADO.piscar(tecladoEl, r.code, "errada");
        j.bloqueadoAte = performance.now() + 300;
        j.errosChar++;
        let fala = r.code && TECLADO.nome(r.code) !== "outra tecla" ? "Você apertou " + TECLADO.comArtigo(r.code, true) + ". " : "";
        if (j.errosChar === 1) fala += "Não é essa. Escute de novo: " + palavra() + "." + jaEscreveu();
        else fala += "A letra que vem agora é " + proximaTecla(j.alvo, true) + ". " + TECLADO.dica(r.passo, r.code, true, r.alvoChar);
        mensagem("Quase! " + (j.errosChar === 1 ? "Escute de novo." : textoErro(r, false)), "ops");
        VOZ.falar(fala, j.instrucao());
        return;
      }
      registrar(j.est, r.ch, true);
      tocar("certo");
      TECLADO.piscar(tecladoEl, r.code, "certa");
      j.errosChar = 0;
      const eco = TECLADO.nomeCaractere(r.ch, true);
      if (!r.fim) { j.mostrar(); VOZ.falar(eco + ".", j.instrucao()); return; }
      const feita = palavra();
      j.i++;
      if (j.i >= j.palavras.length) {
        j.mostrar();
        j.terminado = true;
        const total = j.est.acertos + j.est.erros;
        const prec = total ? j.est.acertos / total : 1;
        const lista = analisar(j.est);
        tocar("fim");
        mostrarResultado({
          titulo: "Fim do ditado! 📝", estrelas: estrelasPorPrecisao(prec),
          numeros: "Você escreveu " + j.palavras.length + " palavras e acertou " + Math.round(prec * 100) + "% das teclas.",
          boas: lista.boas, treino: lista.treino,
          deNovo: function () { iniciarDitado(); }
        });
        return;
      }
      j.alvo = criarAlvo(j.palavras[j.i], false);
      mensagem(aleatorio(ELOGIOS), "boa");
      j.mostrar();
      VOZ.falar(eco + ". " + aleatorio(ELOGIOS) + " Você escreveu " + feita + ". Agora escreva: " + palavra() + ".", j.instrucao());
    };
    j.mostrar();
    VOZ.falar("Ditado! Eu falo uma palavra e você escreve. A barra de espaço repete a palavra. " + j.instrucao(), j.instrucao());
  }

  /* ================= TELAS ================= */
  const TELAS = { inicio: "telaInicio", fases: "telaFases", jogo: "telaJogo", audio: "telaAudio", braille: "telaBraille" };
  function mostrarTela(nome) {
    Object.keys(TELAS).forEach(function (k) { $(TELAS[k]).hidden = k !== nome; });
    estado.tela = nome;
    $("btnVoltar").hidden = nome === "inicio" || (estado.audio && nome === "audio");
    $("btnPausa").hidden = nome !== "jogo";
    document.body.dataset.tela = nome;
  }

  function iniciarFase(ano, modo, indice) {
    if (modo === "baloes") iniciarBaloes(ano, indice);
    else iniciarCorrida(ano, indice);
  }

  function irInicio() {
    pararJogo();
    fecharJanela(true);
    if (estado.audio) { abrirMenuAudio(); return; }
    mostrarTela("inicio");
    atualizarInicio();
    const b = document.querySelector('.botao-ano[aria-pressed="true"]');
    if (b) b.focus();
  }

  function atualizarInicio() {
    document.querySelectorAll(".botao-ano").forEach(function (b) {
      b.setAttribute("aria-pressed", String(Number(b.dataset.ano) === estado.ano));
    });
    atualizarBotaoVoz();
  }

  function abrirFases(modo) {
    pararJogo();
    fecharJanela(true);
    estado.modo = modo;
    const anoObj = obterAno(estado.ano);
    $("tituloFases").textContent = anoObj.titulo + " · " + (modo === "baloes" ? "🎈 Balões" : "🏁 Corrida");
    const lista = $("listaFases");
    lista.textContent = "";
    fasesDoModo(estado.ano, modo).forEach(function (x, pos) {
      const li = el("li");
      const livre = liberada(estado.ano, modo, x.indice);
      const b = el("button", "cartao-fase" + (livre ? "" : " bloqueada"));
      b.type = "button";
      const est = estrelasDe(modo, estado.ano, x.indice);
      b.append(el("span", "numero-fase", String(x.indice + 1)));
      b.append(el("span", "icone-fase", livre ? x.fase.icone : "🔒"));
      b.append(el("span", "nome-fase", x.fase.nome));
      const amostra = x.fase.itens.slice(0, 5).map(function (i) { return i.replace(/\n/g, "⏎"); }).join("  ");
      b.append(el("span", "amostra-fase", amostra));
      const estrelas = el("span", "estrelas-fase");
      for (let i = 1; i <= 3; i++) estrelas.append(el("span", i <= est ? "estrela cheia" : "estrela vazia", "★"));
      b.append(estrelas);
      if (!livre) {
        b.disabled = true;
        b.append(el("span", "so-leitor", " Bloqueada: ganhe 2 estrelas na fase anterior."));
      } else {
        b.append(el("span", "so-leitor", " " + est + " de 3 estrelas."));
        b.addEventListener("click", function () { iniciarFase(estado.ano, modo, x.indice); });
      }
      li.append(b);
      lista.append(li);
      if (pos === 0) b.dataset.primeiro = "1";
    });
    mostrarTela("fases");
    // Foco na última fase liberada.
    const livres = lista.querySelectorAll(".cartao-fase:not(.bloqueada)");
    if (livres.length) livres[livres.length - 1].focus();
  }

  function voltar() {
    // Atividades do Modo Braille voltam para o menu do Modo Braille.
    if (estado.jogo && estado.jogo.aoVoltar) {
      const aoVoltar = estado.jogo.aoVoltar;
      pararJogo(); fecharJanela(true); aoVoltar(); return;
    }
    if (estado.tela === "braille") { abrirMenuAudio(); return; }
    if (estado.audio) {
      if (estado.tela === "audio") { abrirMenuAudio(); return; }
      pararJogo(); fecharJanela(true); abrirMenuAudio(); return;
    }
    if (estado.tela === "jogo") {
      const j = estado.jogo;
      if (j && (j.tipo === "corrida" || j.tipo === "baloes")) { abrirFases(j.tipo); return; }
      irInicio(); return;
    }
    irInicio();
  }

  /* ================= JANELAS ================= */
  function abrirJanela(id, focoId) {
    if (estado.janela && estado.janela !== id) $(estado.janela).hidden = true;
    if (!estado.janela) estado.focoAntes = document.activeElement;
    estado.janela = id;
    $(id).hidden = false;
    $("app").inert = true;
    const alvo = focoId ? $(focoId) : $(id).querySelector("input, button:not([hidden])");
    if (alvo) alvo.focus();
  }
  function fecharJanela(semFoco) {
    if (!estado.janela) return;
    $(estado.janela).hidden = true;
    estado.janela = null;
    $("app").inert = false;
    if (semFoco) return;
    if (estado.tela === "jogo") telaJogo.focus();
    else if (estado.tela === "audio") $("telaAudio").focus();
    else if (estado.focoAntes && document.contains(estado.focoAntes)) estado.focoAntes.focus();
  }
  document.querySelectorAll("[data-fechar]").forEach(function (b) {
    b.addEventListener("click", function () { fecharJanela(); });
  });
  // Clique fora da caixa fecha "Como jogar".
  $("janelaComoJogar").addEventListener("click", function (e) { if (e.target === this) fecharJanela(); });

  $("btnComoJogar").addEventListener("click", function () { abrirJanela("janelaComoJogar"); });
  $("btnPausa").addEventListener("click", function () { abrirJanela("janelaPausa", "btnContinuar"); });
  $("btnContinuar").addEventListener("click", function () { fecharJanela(); });
  $("btnSairPausa").addEventListener("click", function () { fecharJanela(true); voltar(); });
  $("btnProxima").addEventListener("click", function () { fecharJanela(true); if (acoesResultado.proxima) acoesResultado.proxima(); });
  $("btnDeNovo").addEventListener("click", function () { fecharJanela(true); if (acoesResultado.deNovo) acoesResultado.deNovo(); });
  $("btnMenu").addEventListener("click", function () { fecharJanela(true); voltar(); });

  /* ================= BARRA DE CIMA ================= */
  $("btnVoltar").addEventListener("click", voltar);

  function definirVelocidade(v) {
    estado.vel = v;
    document.querySelectorAll(".botao-vel").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.vel === v));
    });
  }
  document.querySelectorAll(".botao-vel").forEach(function (b) {
    b.addEventListener("click", function (e) {
      definirVelocidade(b.dataset.vel);
      if (estado.tela === "jogo" && e.detail > 0) telaJogo.focus();
    });
  });

  $("btnSom").addEventListener("click", function (e) {
    estado.som = !estado.som;
    this.setAttribute("aria-pressed", String(estado.som));
    this.innerHTML = estado.som ? '<span aria-hidden="true">🔊</span> Som: ligado' : '<span aria-hidden="true">🔇</span> Som: desligado';
    if (estado.som) SONS.tocar("certo");
    if (estado.tela === "jogo" && e.detail > 0) telaJogo.focus();
  });

  /* ================= TELA INICIAL ================= */
  document.querySelectorAll(".botao-ano").forEach(function (b) {
    b.addEventListener("click", function () {
      estado.ano = Number(b.dataset.ano);
      progresso.ano = estado.ano;
      salvar();
      atualizarInicio();
    });
  });
  document.querySelectorAll(".cartao-modo").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.dataset.modo === "aula") iniciarAula();
      else abrirFases(b.dataset.modo);
    });
  });
  $("btnAudio").addEventListener("click", function () { alternarAudio(); });

  function atualizarBotaoVoz() {
    const b = $("btnVozJogo");
    b.setAttribute("aria-pressed", String(progresso.vozJogo));
    b.textContent = progresso.vozJogo ? "Voz do jogo: ligada" : "Voz do jogo: desligada (usar NVDA ou Narrador)";
  }
  function alternarVozJogo() {
    progresso.vozJogo = !progresso.vozJogo;
    salvar();
    VOZ.usarVozPropria(progresso.vozJogo);
    atualizarBotaoVoz();
  }
  $("btnVozJogo").addEventListener("click", function () {
    alternarVozJogo();
    if (estado.audio) VOZ.falar(progresso.vozJogo ? "Voz do jogo ligada." : "Voz do jogo desligada. Agora quem fala é o leitor de tela.");
  });

  /* ================= MODO ÁUDIO ================= */
  function alternarAudio() {
    if (estado.audio) desativarAudio(); else ativarAudio();
  }
  function ativarAudio() {
    estado.esperandoAudio = false;
    document.body.classList.remove("esperando-audio");
    const esperando = $("avisoEsperando");
    if (esperando) esperando.remove();
    pararJogo();
    fecharJanela(true);
    estado.audio = true;
    document.body.classList.add("modo-audio");
    $("faixaAudio").hidden = false;
    VOZ.usarVozPropria(progresso.vozJogo);
    estado.menuAudio.fase = null;
    const aviso = $("avisoVoz");
    if (progresso.vozJogo && (!VOZ.disponivel() || !VOZ.temVozPortugues())) {
      aviso.hidden = false;
      aviso.textContent = "Atenção: não encontrei uma voz em português neste computador. Instale a voz \"Português (Brasil)\" nas configurações de fala do Windows, ou desligue a voz do jogo e use o NVDA.";
    } else aviso.hidden = true;
    if (!progresso.aulaFeita) {
      iniciarAula("Modo áudio ligado! A barra de espaço repete o que eu falei. Esc volta ao menu. Vamos começar com a aula das mãos.");
    } else {
      abrirMenuAudio("Modo áudio ligado!");
    }
  }
  function desativarAudio() {
    pararJogo();
    estado.audio = false;
    document.body.classList.remove("modo-audio");
    $("faixaAudio").hidden = true;
    irInicio();
    VOZ.falar("Modo áudio desligado.");
  }

  function fasesAudio() { return fasesDoModo(1, "corrida").filter(function (x) { return liberada(1, "corrida", x.indice); }); }
  function itensMenuAudio() {
    const fases = fasesAudio();
    if (estado.menuAudio.fase === null || !fases.some(function (x) { return x.indice === estado.menuAudio.fase; })) {
      estado.menuAudio.fase = fases[fases.length - 1].indice;
    }
    const fase = obterAno(1).fases[estado.menuAudio.fase];
    return [
      { id: "corrida", texto: "Corrida, fase " + (estado.menuAudio.fase + 1) + ": " + fase.nome, ajuda: "Use as setas para os lados para trocar de fase." },
      { id: "ditado", texto: "Ditado: eu falo uma palavra e você escreve" },
      { id: "braille", texto: "Modo Braille: escrever com as teclas F, D, S, J, K e L" },
      { id: "aula", texto: "Aula das mãos: encontrar as teclas com tracinho" },
      { id: "voz", texto: progresso.vozJogo ? "Voz do jogo: ligada. Enter desliga, para usar o NVDA" : "Voz do jogo: desligada. Enter liga" },
      { id: "sair", texto: "Sair do Modo Áudio" }
    ];
  }
  function desenharMenuAudio() {
    const lista = $("menuAudio");
    lista.textContent = "";
    itensMenuAudio().forEach(function (item, i) {
      const li = el("li");
      const b = el("button", "item-audio" + (i === estado.menuAudio.indice ? " selecionado" : ""), item.texto);
      b.type = "button";
      b.tabIndex = -1;
      b.addEventListener("click", function () { estado.menuAudio.indice = i; escolherMenuAudio(); });
      li.append(b);
      lista.append(li);
    });
  }
  function falarItemMenu(prefixo) {
    const item = itensMenuAudio()[estado.menuAudio.indice];
    const t = (prefixo ? prefixo + " " : "") + item.texto + ". " + (item.ajuda ? item.ajuda + " " : "") + "Aperte Enter para escolher.";
    VOZ.falar(t, item.texto + ". Aperte Enter para escolher. Setas para cima e para baixo mudam a opção.");
  }
  function abrirMenuAudio(prefixo) {
    pararJogo();
    fecharJanela(true);
    mostrarTela("audio");
    $("telaAudio").focus();
    desenharMenuAudio();
    falarItemMenu((prefixo ? prefixo + " " : "") + "Menu do modo áudio. Use as setas para cima e para baixo.");
  }
  function escolherMenuAudio() {
    const item = itensMenuAudio()[estado.menuAudio.indice];
    if (item.id === "corrida") iniciarCorrida(1, estado.menuAudio.fase);
    else if (item.id === "ditado") iniciarDitado();
    else if (item.id === "braille") { if (typeof BRAILLE !== "undefined") BRAILLE.abrir(); }
    else if (item.id === "aula") iniciarAula();
    else if (item.id === "voz") {
      alternarVozJogo();
      desenharMenuAudio();
      VOZ.falar(progresso.vozJogo ? "Voz do jogo ligada." : "Voz do jogo desligada. Agora quem fala é o leitor de tela.");
    } else if (item.id === "sair") desativarAudio();
  }
  function teclaMenuAudio(e) {
    const n = itensMenuAudio().length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      estado.menuAudio.indice = (estado.menuAudio.indice + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
      desenharMenuAudio(); falarItemMenu(); return;
    }
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && itensMenuAudio()[estado.menuAudio.indice].id === "corrida") {
      e.preventDefault();
      const fases = fasesAudio().map(function (x) { return x.indice; });
      let pos = fases.indexOf(estado.menuAudio.fase) + (e.key === "ArrowRight" ? 1 : -1);
      if (pos < 0 || pos >= fases.length) {
        VOZ.falar(pos < 0 ? "Essa é a primeira fase." : "Essa é a última fase liberada.");
        return;
      }
      estado.menuAudio.fase = fases[pos];
      desenharMenuAudio(); falarItemMenu(); return;
    }
    if (e.key === "Enter") { e.preventDefault(); escolherMenuAudio(); return; }
    if (e.key === " ") { e.preventDefault(); VOZ.repetir(); return; }
  }

  /* ================= ÁREA DO PROFESSOR ================= */
  let respostaCerta = 0;
  function novaPergunta() {
    const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7);
    respostaCerta = a + b;
    $("perguntaSoma").textContent = "Quanto é " + a + " + " + b + "?";
    $("respostaSoma").value = "";
  }
  function atualizarProfessor() {
    $("estadoLiberado").textContent = progresso.liberado
      ? "✅ Todas as fases estão liberadas neste computador."
      : "As fases são liberadas aos poucos, conforme as crianças ganham estrelas.";
    $("btnLiberar").hidden = progresso.liberado;
  }
  $("btnProfessor").addEventListener("click", function () {
    novaPergunta();
    $("erroSoma").textContent = "";
    $("formSoma").hidden = false;
    $("opcoesProfessor").hidden = true;
    $("confirmarApagar").hidden = true;
    $("avisoProfessor").textContent = "";
    abrirJanela("janelaProfessor", "respostaSoma");
  });
  $("formSoma").addEventListener("submit", function (e) {
    e.preventDefault();
    if (parseInt($("respostaSoma").value, 10) === respostaCerta) {
      $("formSoma").hidden = true;
      $("opcoesProfessor").hidden = false;
      atualizarProfessor();
      ($("btnLiberar").hidden ? $("btnApagar") : $("btnLiberar")).focus();
    } else {
      novaPergunta();
      $("erroSoma").textContent = "Resposta errada. Tente esta outra conta.";
      $("respostaSoma").focus();
    }
  });
  $("btnLiberar").addEventListener("click", function () {
    progresso.liberado = true;
    salvar();
    atualizarProfessor();
    $("avisoProfessor").textContent = "Pronto! Todas as fases foram liberadas.";
    $("btnApagar").focus();
  });
  $("btnApagar").addEventListener("click", function () {
    $("confirmarApagar").hidden = false;
    $("btnApagarNao").focus();
  });
  $("btnApagarNao").addEventListener("click", function () {
    $("confirmarApagar").hidden = true;
    $("btnApagar").focus();
  });
  $("btnApagarSim").addEventListener("click", function () {
    const guardar = { vozJogo: progresso.vozJogo, brailleNome: progresso.brailleNome, mostrarCela: progresso.mostrarCela };
    progresso = padrao();
    Object.assign(progresso, guardar);
    salvar();
    estado.ano = 1;
    $("confirmarApagar").hidden = true;
    atualizarProfessor();
    $("avisoProfessor").textContent = "Progresso apagado. O jogo começa do zero neste computador.";
    $("btnLiberar").focus();
    if (estado.tela === "fases") abrirFases(estado.modo);
    atualizarInicio();
  });

  /* ================= TECLADO FÍSICO ================= */
  document.addEventListener("keydown", function (e) {
    if (e.key === "F1") {
      e.preventDefault();
      alternarAudio();
      return;
    }
    if (estado.esperandoAudio && !estado.janela) {
      e.preventDefault();
      ativarAudio();
      return;
    }
    if (estado.janela) {
      if (estado.janela === "janelaResultado" && estado.audio) {
        if (e.key === " ") { e.preventDefault(); VOZ.repetir(); return; }
        if (e.key === "Enter") {
          e.preventDefault();
          const r = acoesResultado;
          fecharJanela(true);
          if (r.proxima) r.proxima(); else if (r.deNovo) r.deNovo(); else abrirMenuAudio();
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (estado.janela === "janelaResultado" || estado.janela === "janelaPausa") { fecharJanela(true); voltar(); }
        else fecharJanela();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (estado.tela !== "inicio" || estado.audio) voltar();
      return;
    }
    if (estado.tela === "audio") { teclaMenuAudio(e); return; }
    if (estado.tela === "braille") { if (typeof BRAILLE !== "undefined") BRAILLE.teclaMenu(e); return; }
    if (estado.tela === "jogo" && estado.jogo && estado.jogo.tecla) {
      // Enter e espaço num botão da barra (acessado com Tab) continuam funcionando como botão.
      const t = e.target;
      if (t && t.tagName === "BUTTON" && t !== telaJogo && (e.key === "Enter" || e.key === " ")) return;
      if (e.repeat) { e.preventDefault(); return; }
      if (e.key === "Tab") return;
      if (e.key !== "Dead" && !(e.ctrlKey && !e.altKey) && !e.metaKey) e.preventDefault();
      estado.jogo.tecla(e);
    }
  });
  // Evita que o espaço "aperte" um botão em foco quando o jogo usa a tecla.
  document.addEventListener("keyup", function (e) {
    // Modo Braille: a letra é registrada quando todas as teclas são soltas.
    if (estado.tela === "jogo" && estado.jogo && estado.jogo.teclaSolta && !estado.janela) {
      e.preventDefault();
      estado.jogo.teclaSolta(e);
      return;
    }
    if (e.key === " " && (estado.tela === "jogo" || estado.tela === "audio" || estado.tela === "braille" || (estado.audio && estado.janela === "janelaResultado"))) {
      const t = e.target;
      if (!(t && t.tagName === "BUTTON" && estado.tela === "jogo" && !estado.audio)) e.preventDefault();
    }
  });

  // Animação (carro-guia e balões). Para sozinha com o jogo pausado ou a aba escondida.
  let ultimo = 0;
  function laco(t) {
    const dt = ultimo ? Math.min(0.1, (t - ultimo) / 1000) : 0;
    ultimo = t;
    if (estado.jogo && estado.jogo.quadro && !estado.janela && !document.hidden && estado.tela === "jogo") {
      estado.jogo.quadro(dt);
    }
    requestAnimationFrame(laco);
  }
  requestAnimationFrame(laco);

  // Se o aluno sair da aba durante os balões, o jogo pausa.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && estado.tela === "jogo" && estado.jogo && estado.jogo.tipo === "baloes" && !estado.janela) {
      abrirJanela("janelaPausa", "btnContinuar");
    }
  });

  /* ================= LIGAÇÃO COM O MODO BRAILLE (js/braille.js) ================= */
  window.CORRIDA = {
    estado: estado,
    progresso: function () { return progresso; },
    salvar: salvar, el: el, sortear: sortear, aleatorio: aleatorio, tocar: tocar, mensagem: mensagem,
    prepararTelaJogo: prepararTelaJogo, pararJogo: pararJogo, mostrarTela: mostrarTela,
    mostrarResultado: mostrarResultado, abrirMenuAudio: abrirMenuAudio, svgCarro: svgCarro,
    novasEstatisticas: novasEstatisticas, registrar: registrar, analisar: analisar,
    estrelasPorPrecisao: estrelasPorPrecisao, ELOGIOS: ELOGIOS,
    destacar: function (passo) { TECLADO.destacar(tecladoEl, maosEl, passo); }
  };

  /* ================= INÍCIO ================= */
  VOZ.usarVozPropria(progresso.vozJogo);
  definirVelocidade("lenta");
  mostrarTela("inicio");
  atualizarInicio();

  // Endereço terminado em ?audio: qualquer tecla liga o Modo Áudio.
  if (/audio/i.test(location.search)) {
    estado.esperandoAudio = true;
    document.body.classList.add("esperando-audio");
    const aviso = el("p", "aviso-esperando", "🎧 Aperte qualquer tecla para começar o Modo Áudio.");
    aviso.id = "avisoEsperando";
    $("telaInicio").prepend(aviso);
    document.addEventListener("click", function primeiroClique(e) {
      if (estado.esperandoAudio && e.target && e.target.id === "avisoEsperando") ativarAudio();
    });
  }

  // Guarda os arquivos para o jogo abrir mesmo sem internet.
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () { /* sem cache offline */ });
  }
})();
