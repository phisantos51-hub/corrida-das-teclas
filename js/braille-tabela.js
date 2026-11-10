/*
  TABELA BRAILLE DO MODO BRAILLE
  (Grafia Braille para a Língua Portuguesa, usada no Brasil)

  Cada letra ou sinal está ligado aos pontos da cela, escritos em ordem crescente.
  Exemplo:  B: "12"  quer dizer pontos 1 e 2.

        Cela braille        Teclas do computador
        1 ● ● 4             F = ponto 1    J = ponto 4
        2 ● ● 5             D = ponto 2    K = ponto 5
        3 ● ● 6             S = ponto 3    L = ponto 6

  Para corrigir uma letra ou um sinal, troque só os números entre aspas.
  A lista completa, para conferir, está no arquivo REVISAR-BRAILLE.md.
*/
const BRAILLE_TABELA = {
  // Letras de A a Z
  letras: {
    A: "1", B: "12", C: "14", D: "145", E: "15", F: "124", G: "1245", H: "125", I: "24", J: "245",
    K: "13", L: "123", M: "134", N: "1345", O: "135", P: "1234", Q: "12345", R: "1235", S: "234", T: "2345",
    U: "136", V: "1236", W: "2456", X: "1346", Y: "13456", Z: "1356"
  },

  // Ç e letras com acento (só entram depois das letras de A a Z)
  especiais: {
    "Ç": "12346",
    "Á": "12356", "É": "123456", "Í": "34", "Ó": "346", "Ú": "23456",
    "À": "1246",
    "Â": "16", "Ê": "126", "Ô": "1456",
    "Ã": "345", "Õ": "246"
  },

  // Sinais (só no Treino livre). "simbolo" é o que aparece na tela.
  sinais: [
    { pontos: "2", nome: "vírgula", simbolo: "," },
    { pontos: "23", nome: "ponto e vírgula", simbolo: ";" },
    { pontos: "25", nome: "dois-pontos", simbolo: ":" },
    { pontos: "3", nome: "ponto final", simbolo: "." },
    { pontos: "26", nome: "ponto de interrogação", simbolo: "?" },
    { pontos: "235", nome: "ponto de exclamação", simbolo: "!" },
    { pontos: "36", nome: "hífen", simbolo: "-" },
    { pontos: "46", nome: "sinal de letra maiúscula", simbolo: "" },
    { pontos: "3456", nome: "sinal de número", simbolo: "" }
  ]
};
