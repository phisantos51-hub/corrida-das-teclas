/*
  TECLADO BRASILEIRO (ABNT2)
  Desenho do teclado, dedo de cada tecla, nomes das teclas (para a tela e para a voz)
  e as dicas do tipo "O L fica logo à direita do K".
*/
const TECLADO = (function () {
  // [código da tecla, rótulo principal, rótulo de cima (com Shift), largura]
  const LINHAS = [
    [["Backquote", "'", "\""], ["Digit1", "1", "!"], ["Digit2", "2", "@"], ["Digit3", "3", "#"],
     ["Digit4", "4", "$"], ["Digit5", "5", "%"], ["Digit6", "6", "¨"], ["Digit7", "7", "&"],
     ["Digit8", "8", "*"], ["Digit9", "9", "("], ["Digit0", "0", ")"], ["Minus", "-", "_"],
     ["Equal", "=", "+"], ["Backspace", "Apagar", "", 2]],
    [["Tab", "Tab", "", 1.5], ["KeyQ", "Q"], ["KeyW", "W"], ["KeyE", "E"], ["KeyR", "R"],
     ["KeyT", "T"], ["KeyY", "Y"], ["KeyU", "U"], ["KeyI", "I"], ["KeyO", "O"], ["KeyP", "P"],
     ["BracketLeft", "´", "`"], ["BracketRight", "[", "{"], ["Enter", "", "", 1.5]],
    [["CapsLock", "Caps Lock", "", 1.75], ["KeyA", "A"], ["KeyS", "S"], ["KeyD", "D"],
     ["KeyF", "F"], ["KeyG", "G"], ["KeyH", "H"], ["KeyJ", "J"], ["KeyK", "K"], ["KeyL", "L"],
     ["Semicolon", "Ç"], ["Quote", "~", "^"], ["Backslash", "]", "}"], ["Enter", "Enter", "", 1.25]],
    [["ShiftLeft", "Shift", "", 1.25], ["IntlBackslash", "\\", "|"], ["KeyZ", "Z"], ["KeyX", "X"],
     ["KeyC", "C"], ["KeyV", "V"], ["KeyB", "B"], ["KeyN", "N"], ["KeyM", "M"], ["Comma", ",", "<"],
     ["Period", ".", ">"], ["Slash", ";", ":"], ["IntlRo", "/", "?"], ["ShiftRight", "Shift", "", 1.75]],
    [["ControlLeft", "Ctrl", "", 1.5], ["AltLeft", "Alt", "", 1.5], ["Space", "Espaço", "", 8],
     ["AltRight", "Alt Gr", "", 1.5], ["ControlRight", "Ctrl", "", 1.5]]
  ];

  // Dedo de cada tecla (digitação com os dez dedos).
  const DEDO_DAS_TECLAS = {
    "mindinho-e": ["Backquote", "Digit1", "Tab", "KeyQ", "CapsLock", "KeyA", "ShiftLeft", "IntlBackslash", "KeyZ", "ControlLeft"],
    "anelar-e": ["Digit2", "KeyW", "KeyS", "KeyX"],
    "medio-e": ["Digit3", "KeyE", "KeyD", "KeyC"],
    "indicador-e": ["Digit4", "Digit5", "KeyR", "KeyT", "KeyF", "KeyG", "KeyV", "KeyB"],
    "polegar": ["Space", "AltLeft", "AltRight"],
    "indicador-d": ["Digit6", "Digit7", "KeyY", "KeyU", "KeyH", "KeyJ", "KeyN", "KeyM"],
    "medio-d": ["Digit8", "KeyI", "KeyK", "Comma"],
    "anelar-d": ["Digit9", "KeyO", "KeyL", "Period"],
    "mindinho-d": ["Digit0", "Minus", "Equal", "Backspace", "KeyP", "BracketLeft", "BracketRight",
                   "Semicolon", "Quote", "Backslash", "Enter", "Slash", "IntlRo", "ShiftRight", "ControlRight"]
  };

  const DEDOS = {
    "mindinho-e": { nome: "mindinho", mao: "esquerda", tipo: "mindinho" },
    "anelar-e": { nome: "anelar", mao: "esquerda", tipo: "anelar" },
    "medio-e": { nome: "dedo médio", mao: "esquerda", tipo: "medio" },
    "indicador-e": { nome: "indicador", mao: "esquerda", tipo: "indicador" },
    "polegar": { nome: "polegar", mao: "", tipo: "polegar" },
    "indicador-d": { nome: "indicador", mao: "direita", tipo: "indicador" },
    "medio-d": { nome: "dedo médio", mao: "direita", tipo: "medio" },
    "anelar-d": { nome: "anelar", mao: "direita", tipo: "anelar" },
    "mindinho-d": { nome: "mindinho", mao: "direita", tipo: "mindinho" }
  };

  const DEDO = {};
  Object.keys(DEDO_DAS_TECLAS).forEach(function (d) {
    DEDO_DAS_TECLAS[d].forEach(function (c) { DEDO[c] = d; });
  });

  // Posição (linha e coluna) de cada tecla, para as dicas.
  const POS = {};
  LINHAS.forEach(function (linha, l) {
    linha.forEach(function (t, c) { if (!POS[t[0]] || t[0] !== "Enter") POS[t[0]] = { linha: l, col: c }; });
  });

  // Caractere -> tecla
  const TECLA_DO_CARACTERE = { " ": ["Space", false], "\n": ["Enter", false], "ç": ["Semicolon", false],
    ".": ["Period", false], ",": ["Comma", false], ";": ["Slash", false], ":": ["Slash", true],
    "/": ["IntlRo", false], "?": ["IntlRo", true], "-": ["Minus", false], "!": ["Digit1", true],
    "'": ["Backquote", false], "\"": ["Backquote", true] };
  "abcdefghijklmnopqrstuvwxyz".split("").forEach(function (l) {
    TECLA_DO_CARACTERE[l] = ["Key" + l.toUpperCase(), false];
  });
  "0123456789".split("").forEach(function (n) { TECLA_DO_CARACTERE[n] = ["Digit" + n, false]; });

  const ACENTOS = {
    agudo: { code: "BracketLeft", shift: false, simbolo: "´", nome: "acento agudo" },
    grave: { code: "BracketLeft", shift: true, simbolo: "`", nome: "acento grave" },
    til: { code: "Quote", shift: false, simbolo: "~", nome: "til" },
    circunflexo: { code: "Quote", shift: true, simbolo: "^", nome: "acento circunflexo" }
  };

  const COMPOSTAS = {
    "á": ["agudo", "a"], "é": ["agudo", "e"], "í": ["agudo", "i"], "ó": ["agudo", "o"], "ú": ["agudo", "u"],
    "à": ["grave", "a"], "ã": ["til", "a"], "õ": ["til", "o"],
    "â": ["circunflexo", "a"], "ê": ["circunflexo", "e"], "ô": ["circunflexo", "o"]
  };

  function acentoPorCode(code, shift) {
    for (const nome in ACENTOS) {
      if (ACENTOS[nome].code === code && ACENTOS[nome].shift === !!shift) return nome;
    }
    return null;
  }

  function acentoPorSimbolo(s) {
    for (const nome in ACENTOS) if (ACENTOS[nome].simbolo === s) return nome;
    return null;
  }

  // Junta acento + vogal ("agudo" + "a" = "á"). Se não combinar, devolve a letra como veio.
  function compor(acento, letra) {
    const minuscula = letra.toLowerCase();
    for (const c in COMPOSTAS) {
      if (COMPOSTAS[c][0] === acento && COMPOSTAS[c][1] === minuscula) {
        return letra === minuscula ? c : c.toUpperCase();
      }
    }
    return letra;
  }

  function ehLetra(c) { return c.toLowerCase() !== c.toUpperCase(); }

  // Teclas que a criança aperta para escrever um caractere, na ordem.
  // Ex.: "á" -> [acento agudo] e depois [A]; "O" (com conferência de maiúsculas) -> [Shift + O].
  function passos(caractere, conferirMaiusculas) {
    const minuscula = caractere.toLowerCase();
    const maiuscula = ehLetra(caractere) && caractere !== minuscula;
    const comShift = !!conferirMaiusculas && maiuscula;
    if (COMPOSTAS[minuscula]) {
      const acento = COMPOSTAS[minuscula][0];
      const vogal = COMPOSTAS[minuscula][1];
      return [
        { code: ACENTOS[acento].code, shift: ACENTOS[acento].shift, acento: acento },
        { code: TECLA_DO_CARACTERE[vogal][0], shift: comShift }
      ];
    }
    const t = TECLA_DO_CARACTERE[minuscula];
    if (!t) return [{ code: null, shift: false }];
    return [{ code: t[0], shift: comShift || t[1] }];
  }

  function shiftOposto(code) {
    const d = DEDO[code] || "";
    return d.slice(-2) === "-e" ? "ShiftRight" : "ShiftLeft";
  }

  /* ---------- Nomes das teclas ---------- */
  const LETRA_FALADA = { A: "á", B: "bê", C: "cê", D: "dê", E: "é", F: "éfe", G: "gê", H: "agá",
    I: "i", J: "jota", K: "cá", L: "éle", M: "ême", N: "êne", O: "ó", P: "pê", Q: "quê", R: "érre",
    S: "ésse", T: "tê", U: "u", V: "vê", W: "dáblio", X: "xis", Y: "ípsilon", Z: "zê" };
  const NUMERO_FALADO = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];

  // nome de cada tecla: [texto na tela, texto falado, artigo]
  const NOME = {
    Space: ["barra de espaço", "barra de espaço", "a"],
    Enter: ["Enter", "Énter", "o"],
    Semicolon: ["Ç", "cê cedilha", "o"],
    BracketLeft: ["acento agudo (´)", "acento agudo", "o"],
    BracketRight: ["colchete ([)", "colchete", "o"],
    Quote: ["til (~)", "til", "o"],
    Backslash: ["colchete (])", "colchete", "o"],
    Comma: ["vírgula (,)", "vírgula", "a"],
    Period: ["ponto (.)", "ponto", "o"],
    Slash: ["ponto e vírgula (;)", "ponto e vírgula", "o"],
    IntlRo: ["barra (/)", "barra", "a"],
    IntlBackslash: ["barra invertida (\\)", "barra invertida", "a"],
    Minus: ["tracinho (-)", "tracinho", "o"],
    Equal: ["igual (=)", "igual", "o"],
    Backquote: ["apóstrofo (')", "apóstrofo", "o"],
    Backspace: ["Apagar", "Apagar", "o"],
    Tab: ["Tab", "Tab", "o"],
    CapsLock: ["Caps Lock", "Caps Lock", "o"],
    ShiftLeft: ["Shift", "Shift", "o"],
    ShiftRight: ["Shift", "Shift", "o"],
    ControlLeft: ["Ctrl", "Control", "o"],
    ControlRight: ["Ctrl", "Control", "o"],
    AltLeft: ["Alt", "Alt", "o"],
    AltRight: ["Alt Gr", "Alt Gr", "o"]
  };
  Object.keys(LETRA_FALADA).forEach(function (l) { NOME["Key" + l] = [l, LETRA_FALADA[l], "o"]; });
  NUMERO_FALADO.forEach(function (n, i) { NOME["Digit" + i] = [String(i), n, "o"]; });

  function nome(code, falado) {
    const n = NOME[code];
    if (!n) return falado ? "outra tecla" : "outra tecla";
    return falado ? n[1] : n[0];
  }
  function artigo(code) { return (NOME[code] && NOME[code][2]) || "o"; }
  // "o L", "a vírgula"
  function comArtigo(code, falado) { return artigo(code) + " " + nome(code, falado); }
  // "do L", "da vírgula"
  function doNome(code, falado) { return (artigo(code) === "a" ? "da " : "do ") + nome(code, falado); }
  function maiusc(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  // Nome de um caractere: "F", "Á", "barra de espaço" (na tela) ou "éfe", "á com acento agudo" (na voz).
  function nomeCaractere(c, falado) {
    if (c === " ") return "barra de espaço";
    if (c === "\n") return falado ? "Énter" : "Enter";
    const min = c.toLowerCase();
    if (COMPOSTAS[min]) {
      if (!falado) return c.toUpperCase();
      const vogal = COMPOSTAS[min][1].toUpperCase();
      const ac = ACENTOS[COMPOSTAS[min][0]].nome;
      return LETRA_FALADA[vogal] + " com " + (ac === "til" ? "til" : ac);
    }
    const t = TECLA_DO_CARACTERE[min];
    if (min === "ç") return falado ? "cê cedilha" : "Ç";
    if (t && /^Key/.test(t[0])) return falado ? LETRA_FALADA[min.toUpperCase()] : c.toUpperCase();
    if (t) return nome(t[0], falado).replace(/ \(.*\)$/, "");
    return c;
  }
  function artigoCaractere(c) {
    if (c === " " || c === ",") return "a";
    return "o";
  }

  /* ---------- Dicas ---------- */
  const ACIMA_DE = { KeyQ: "KeyA", KeyW: "KeyS", KeyE: "KeyD", KeyR: "KeyF", KeyT: "KeyG", KeyY: "KeyH",
    KeyU: "KeyJ", KeyI: "KeyK", KeyO: "KeyL", KeyP: "Semicolon", BracketLeft: "Quote", BracketRight: "Backslash" };
  const ABAIXO_DE = { KeyZ: "KeyA", KeyX: "KeyS", KeyC: "KeyD", KeyV: "KeyF", KeyB: "KeyG", KeyN: "KeyH",
    KeyM: "KeyJ", Comma: "KeyK", Period: "KeyL", Slash: "Semicolon", IntlBackslash: "KeyA", IntlRo: "Quote" };
  const QUANTAS = ["", "uma", "duas", "três", "quatro", "cinco"];

  function dedoTexto(code) {
    const d = DEDOS[DEDO[code]];
    if (!d) return "";
    if (d.tipo === "polegar") return "o polegar";
    return (d.tipo === "medio" ? "o " : "o ") + d.nome + " da mão " + d.mao;
  }

  function relativo(alvo, ref, falado) {
    const a = POS[alvo], r = POS[ref];
    const dif = a.col - r.col;
    const lado = dif > 0 ? "direita" : "esquerda";
    if (Math.abs(dif) === 1) return "fica logo à " + lado + " " + doNome(ref, falado);
    return "fica " + QUANTAS[Math.abs(dif)] + " teclas à " + lado + " " + doNome(ref, falado);
  }

  // Onde fica a tecla "alvo". Se a criança apertou outra tecla ("apertada"), a dica parte dela.
  function ondeFica(alvo, apertada, falado) {
    if (alvo === "Space") return "A barra de espaço é a tecla comprida, embaixo de todas. Aperte com o polegar.";
    if (alvo === "Enter") return "O " + nome("Enter", falado) + " é a tecla grande do lado direito, na fileira do meio, depois do " + nome("Semicolon", falado) + ". Use o mindinho da mão direita.";
    const a = POS[alvo];
    if (!a) return "";
    const nomeAlvo = maiusc(comArtigo(alvo, falado));
    let frase = "";
    const p = apertada && apertada !== "Enter" ? POS[apertada] : null;
    if (p && p.linha === a.linha && alvo !== apertada && Math.abs(a.col - p.col) <= 4) {
      frase = nomeAlvo + " " + relativo(alvo, apertada, falado) + ".";
    } else if (alvo === "KeyF") {
      frase = "O " + nome("KeyF", falado) + " é a tecla com tracinho da mão esquerda.";
    } else if (alvo === "KeyJ") {
      frase = "O " + nome("KeyJ", falado) + " é a tecla com tracinho da mão direita.";
    } else if (a.linha === 2) {
      const ref = a.col <= POS.KeyF.col ? "KeyF" : "KeyJ";
      frase = nomeAlvo + " fica na fileira do meio e " + relativo(alvo, ref, falado) + ".";
    } else if (a.linha === 1 && ACIMA_DE[alvo]) {
      frase = nomeAlvo + " fica na fileira de cima, logo acima " + doNome(ACIMA_DE[alvo], falado) + ".";
    } else if (a.linha === 3 && ABAIXO_DE[alvo]) {
      frase = nomeAlvo + " fica na fileira de baixo, logo abaixo " + doNome(ABAIXO_DE[alvo], falado) + ".";
    } else if (a.linha === 0) {
      frase = nomeAlvo + " fica na fileira dos números, no alto do teclado.";
    } else {
      frase = nomeAlvo + " fica no lado direito do teclado.";
    }
    const dedo = dedoTexto(alvo);
    return frase + (dedo ? " Use " + dedo + "." : "");
  }

  // Dica completa para um passo (tecla + Shift ou acento, se precisar).
  function dica(passo, apertada, falado, caractere) {
    if (!passo || !passo.code) return "";
    if (passo.acento) {
      const ac = ACENTOS[passo.acento];
      const vogal = caractere ? nomeCaractere(COMPOSTAS[caractere.toLowerCase()][1], falado) : "a vogal";
      let t = "Primeiro aperte o " + ac.nome + " e depois " + (caractere ? "o " + vogal : vogal) + ". ";
      if (ac.shift) t += "Segure o Shift e aperte a tecla do til, que fica logo à direita " + doNome("Semicolon", falado) + ".";
      else t += ondeFica(ac.code, apertada, falado);
      return t;
    }
    let t = ondeFica(passo.code, apertada, falado);
    if (passo.shift) {
      const mao = shiftOposto(passo.code) === "ShiftRight" ? "direita" : "esquerda";
      t += " Segure o Shift com o mindinho da mão " + mao + " enquanto aperta.";
    }
    return t;
  }

  /* ---------- Desenho ---------- */
  function desenhar(container) {
    container.textContent = "";
    container.setAttribute("aria-hidden", "true");
    LINHAS.forEach(function (linha, l) {
      const div = document.createElement("div");
      div.className = "linha-teclas";
      linha.forEach(function (t) {
        const tecla = document.createElement("div");
        const dedo = DEDOS[DEDO[t[0]]];
        tecla.className = "tecla dedo-" + (dedo ? dedo.tipo : "nenhum");
        if (t[0] === "Enter") tecla.classList.add(l === 1 ? "enter-cima" : "enter-baixo");
        if (t[0] === "KeyF" || t[0] === "KeyJ") tecla.classList.add("tracinho");
        if ((t[1] || "").length > 1) tecla.classList.add("tecla-palavra");
        tecla.dataset.code = t[0];
        tecla.style.setProperty("--w", t[3] || 1);
        if (t[2]) {
          const cima = document.createElement("span");
          cima.className = "rotulo-cima";
          cima.textContent = t[2];
          tecla.append(cima);
        }
        const principal = document.createElement("span");
        principal.className = "rotulo";
        principal.textContent = t[1];
        tecla.append(principal);
        div.append(tecla);
      });
      container.append(div);
    });
  }

  function desenharMaos(container) {
    container.textContent = "";
    const ns = "http://www.w3.org/2000/svg";
    function mao(lado) {
      const caixa = document.createElement("div");
      caixa.className = "mao mao-" + lado;
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("viewBox", "0 0 130 110");
      svg.setAttribute("aria-hidden", "true");
      const g = document.createElementNS(ns, "g");
      if (lado === "direita") g.setAttribute("transform", "translate(130 0) scale(-1 1)");
      const palma = document.createElementNS(ns, "rect");
      palma.setAttribute("x", "14"); palma.setAttribute("y", "52"); palma.setAttribute("width", "80");
      palma.setAttribute("height", "52"); palma.setAttribute("rx", "22"); palma.setAttribute("class", "palma");
      g.append(palma);
      const s = lado === "esquerda" ? "-e" : "-d";
      const dedos = [["mindinho" + s, 16, 30], ["anelar" + s, 36, 42], ["medio" + s, 56, 48], ["indicador" + s, 76, 42]];
      dedos.forEach(function (d) {
        const r = document.createElementNS(ns, "rect");
        r.setAttribute("x", d[1]); r.setAttribute("y", 62 - d[2]); r.setAttribute("width", "17");
        r.setAttribute("height", d[2] + 10); r.setAttribute("rx", "8.5");
        r.setAttribute("class", "dedo dedo-" + DEDOS[d[0]].tipo);
        r.dataset.dedo = d[0];
        g.append(r);
      });
      const polegar = document.createElementNS(ns, "rect");
      polegar.setAttribute("x", "92"); polegar.setAttribute("y", "56"); polegar.setAttribute("width", "17");
      polegar.setAttribute("height", "40"); polegar.setAttribute("rx", "8.5");
      polegar.setAttribute("transform", "rotate(-35 100 76)");
      polegar.setAttribute("class", "dedo dedo-polegar");
      polegar.dataset.dedo = "polegar";
      g.append(polegar);
      svg.append(g);
      const rotulo = document.createElement("span");
      rotulo.className = "rotulo-mao";
      rotulo.textContent = "Mão " + lado;
      caixa.append(svg, rotulo);
      return caixa;
    }
    const texto = document.createElement("p");
    texto.className = "dedo-texto";
    texto.id = "dedoTexto";
    container.append(mao("esquerda"), texto, mao("direita"));
  }

  // Destaca no desenho a tecla (e o Shift, se precisar) e o dedo certo.
  function destacar(container, maos, passo) {
    container.querySelectorAll(".alvo").forEach(function (e) { e.classList.remove("alvo"); });
    maos.querySelectorAll(".dedo-ativo").forEach(function (e) { e.classList.remove("dedo-ativo"); });
    const texto = maos.querySelector("#dedoTexto");
    if (!passo || !passo.code) { if (texto) texto.textContent = ""; return; }
    container.querySelectorAll('[data-code="' + passo.code + '"]').forEach(function (e) { e.classList.add("alvo"); });
    const dedo = DEDO[passo.code];
    maos.querySelectorAll('[data-dedo="' + dedo + '"]').forEach(function (e) { e.classList.add("dedo-ativo"); });
    let t = "Use " + dedoTexto(passo.code);
    if (passo.shift) {
      const sh = shiftOposto(passo.code);
      container.querySelectorAll('[data-code="' + sh + '"]').forEach(function (e) { e.classList.add("alvo"); });
      const dedoShift = DEDO[sh];
      maos.querySelectorAll('[data-dedo="' + dedoShift + '"]').forEach(function (e) { e.classList.add("dedo-ativo"); });
      t += " + Shift com o mindinho da mão " + (sh === "ShiftRight" ? "direita" : "esquerda");
    }
    if (texto) texto.textContent = t;
  }

  function piscar(container, code, classe) {
    if (!code) return;
    container.querySelectorAll('[data-code="' + code + '"]').forEach(function (e) {
      e.classList.remove(classe);
      void e.offsetWidth;
      e.classList.add(classe);
      setTimeout(function () { e.classList.remove(classe); }, 450);
    });
  }

  return {
    ACENTOS: ACENTOS, COMPOSTAS: COMPOSTAS, DEDO: DEDO, DEDOS: DEDOS,
    passos: passos, compor: compor, acentoPorCode: acentoPorCode, acentoPorSimbolo: acentoPorSimbolo,
    nome: nome, comArtigo: comArtigo, nomeCaractere: nomeCaractere, artigoCaractere: artigoCaractere,
    dica: dica, ondeFica: ondeFica, dedoTexto: dedoTexto, maiusc: maiusc,
    desenhar: desenhar, desenharMaos: desenharMaos, destacar: destacar, piscar: piscar
  };
})();
