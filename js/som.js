/*
  VOZ E SONS
  - Voz: síntese de voz do próprio navegador, em português do Brasil (só no Modo Áudio).
    Se a "voz do jogo" estiver desligada, o texto vai para uma região invisível que o
    NVDA ou o Narrador leem sozinhos (assim não há duas vozes ao mesmo tempo).
  - Sons: bipes simples, feitos pelo navegador, sem arquivos e sem internet.
*/
const VOZ = (function () {
  let voz = null;
  let ultimaInstrucao = "";
  let vozPropria = true;
  let temporizador = null;
  const temSintese = "speechSynthesis" in window;

  function escolherVoz() {
    if (!temSintese) return;
    const vozes = window.speechSynthesis.getVoices();
    const br = vozes.filter(function (v) { return /^pt[-_]br/i.test(v.lang); });
    const pt = vozes.filter(function (v) { return /^pt/i.test(v.lang); });
    // Prefere vozes instaladas no computador: funcionam sem internet.
    voz = br.find(function (v) { return v.localService; }) || br[0] ||
          pt.find(function (v) { return v.localService; }) || pt[0] || null;
  }
  if (temSintese) {
    escolherVoz();
    window.speechSynthesis.addEventListener("voiceschanged", escolherVoz);
  }

  function anunciarLeitor(texto) {
    const regiao = document.getElementById("anuncio");
    if (!regiao) return;
    regiao.textContent = "";
    setTimeout(function () { regiao.textContent = texto; }, 60);
  }

  // Fala um texto. "instrucao" é o que a barra de espaço repete depois.
  function falar(texto, instrucao) {
    if (instrucao !== undefined) ultimaInstrucao = instrucao;
    if (!texto) return;
    if (!vozPropria || !temSintese) { anunciarLeitor(texto); return; }
    clearTimeout(temporizador);
    window.speechSynthesis.cancel();
    // Pequena espera depois de "cancel": alguns navegadores perdem a fala sem ela.
    temporizador = setTimeout(function () {
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR";
      if (voz) u.voice = voz;
      u.rate = 0.95;
      u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    }, 40);
  }

  function repetir() { if (ultimaInstrucao) falar(ultimaInstrucao); }

  function calar() {
    clearTimeout(temporizador);
    if (temSintese) window.speechSynthesis.cancel();
  }

  return {
    falar: falar,
    repetir: repetir,
    calar: calar,
    definirInstrucao: function (t) { ultimaInstrucao = t; },
    usarVozPropria: function (sim) { vozPropria = !!sim; if (!sim) calar(); },
    temVozPortugues: function () { escolherVoz(); return !!voz; },
    disponivel: function () { return temSintese; }
  };
})();

const SONS = (function () {
  let ctx = null;
  function contexto() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function nota(freq, inicio, duracao, tipo, volume) {
    const c = contexto();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = tipo || "sine";
    o.frequency.value = freq;
    const t0 = c.currentTime + inicio;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(volume || 0.2, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duracao);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + duracao + 0.05);
  }
  const TOQUES = {
    certo: function () { nota(880, 0, 0.09, "sine", 0.18); nota(1320, 0.07, 0.12, "sine", 0.15); },
    errado: function () { nota(240, 0, 0.22, "triangle", 0.22); nota(200, 0.12, 0.22, "triangle", 0.18); },
    acento: function () { nota(660, 0, 0.08, "sine", 0.15); },
    estouro: function () { nota(1200, 0, 0.05, "square", 0.08); nota(500, 0.03, 0.12, "triangle", 0.15); },
    fim: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { nota(f, i * 0.14, 0.25, "sine", 0.2); });
      nota(1047, 0.6, 0.5, "sine", 0.16); nota(1319, 0.6, 0.5, "sine", 0.12);
    }
  };
  return {
    tocar: function (tipo) { try { if (TOQUES[tipo]) TOQUES[tipo](); } catch (e) { /* sem som */ } }
  };
})();
