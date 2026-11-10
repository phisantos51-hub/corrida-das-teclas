/*
  CORRIDA DAS TECLAS: LETRAS, SÍLABAS, PALAVRAS E FRASES
  ======================================================

  Este é o único arquivo que você precisa abrir para mudar o que as crianças digitam.

  COMO ESTÁ ORGANIZADO
  - Há um bloco para cada ano (1º, 2º e 3º).
  - Cada ano tem uma lista de FASES, na ordem em que as crianças jogam.
    A fase seguinte é liberada quando a criança ganha 2 ou 3 estrelas na anterior.
  - Cada fase tem:
      nome:       o nome que aparece no cartão da fase;
      icone:      um emoji para enfeitar o cartão;
      itens:      a lista do que a criança vai digitar, cada item entre aspas e separado por vírgula;
      quantidade: quantos itens aparecem em cada corrida (o jogo sorteia da lista);
      baloes:     (opcional) escreva  baloes: false  para a fase NÃO aparecer no modo Balões
                  (use em frases compridas, que não cabem nos balões).

  COMO ACRESCENTAR UMA PALAVRA
  - Encontre a fase, vá até o fim da lista "itens" e acrescente a palavra entre aspas,
    com uma vírgula antes. Exemplo:
        itens: ["SOL", "PATO", "BOLA", "MACACO"]
                                       ^^^^^^^^ palavra nova

  COMO CRIAR UMA FASE NOVA
  - Copie um bloco inteiro de uma fase, de { até },  e cole logo abaixo.
  - Troque o nome, o ícone e os itens.

  CUIDADOS
  - No 1º e no 2º ano, maiúsculas e minúsculas valem igual: escreva como quer que apareça na tela.
  - No 3º ano o jogo confere maiúsculas: a frase deve começar com letra maiúscula (a criança usa o Shift)
    e as palavras soltas devem estar em minúsculas.
  - Pode usar Ç, acento agudo (á é í ó ú), til (ã õ), circunflexo (â ê ô), ponto final e vírgula.
  - Evite ponto de interrogação (?): em alguns notebooks ABNT2 essa tecla não existe.
  - Para pedir a tecla Enter, escreva [ENTER] dentro do item. Exemplo: "F[ENTER]".
  - Para pedir a barra de espaço, basta deixar um espaço entre as letras ou palavras.
  - Não apague as aspas nem as vírgulas entre os itens.
*/

const ANOS = [
  {
    ano: 1,
    titulo: "1º ano",
    conferirMaiusculas: false,
    fases: [
      {
        nome: "Teclas com tracinho e vizinhas",
        icone: "✋",
        itens: ["F", "J", "D", "K"],
        quantidade: 12
      },
      {
        nome: "Fileira do meio",
        icone: "🏠",
        itens: ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç"],
        quantidade: 15
      },
      {
        nome: "Fileira de cima",
        icone: "⬆️",
        itens: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        quantidade: 15
      },
      {
        nome: "Fileira de baixo",
        icone: "⬇️",
        itens: ["Z", "X", "C", "V", "B", "N", "M"],
        quantidade: 12
      },
      {
        nome: "Espaço e Enter",
        icone: "⏎",
        itens: ["F J", "J F", "D K", "A Ç", "S L", "F[ENTER]", "J[ENTER]", "[ENTER]"],
        quantidade: 8,
        baloes: false
      },
      {
        nome: "Todas as letras",
        icone: "🔤",
        itens: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
                "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Ç"],
        quantidade: 15
      },
      {
        nome: "Palavras curtinhas",
        icone: "☀️",
        itens: ["SOL", "PATO", "BOLA", "CASA", "LUA", "MAR", "GATO", "DADO", "UVA",
                "OVO", "RUA", "MALA", "SAPO", "FOCA", "BOLO", "CAMA", "MESA", "PIPA", "VACA"],
        quantidade: 8
      }
    ]
  },

  {
    ano: 2,
    titulo: "2º ano",
    conferirMaiusculas: false,
    fases: [
      {
        nome: "Sílabas",
        icone: "🧩",
        itens: ["BA", "BE", "BI", "BO", "BU", "CA", "CO", "CU", "DA", "DE", "DI", "DO", "DU",
                "FA", "FE", "FI", "FO", "FU", "GA", "GO", "GU", "JA", "JE", "JI", "JO", "JU",
                "LA", "LE", "LI", "LO", "LU", "MA", "ME", "MI", "MO", "MU", "NA", "NE", "NI",
                "NO", "NU", "PA", "PE", "PI", "PO", "PU", "RA", "RE", "RI", "RO", "RU",
                "SA", "SE", "SI", "SO", "SU", "TA", "TE", "TI", "TO", "TU", "VA", "VE", "VI",
                "VO", "VU", "ZA", "ZE", "ZI", "ZO", "ZU"],
        quantidade: 12
      },
      {
        nome: "Sílabas minúsculas",
        icone: "🔡",
        itens: ["ba", "be", "bi", "bo", "bu", "ca", "co", "cu", "da", "de", "di", "do", "du",
                "fa", "fe", "fi", "fo", "fu", "ga", "go", "gu", "ja", "je", "ji", "jo", "ju",
                "la", "le", "li", "lo", "lu", "ma", "me", "mi", "mo", "mu", "na", "ne", "ni",
                "no", "nu", "pa", "pe", "pi", "po", "pu", "ra", "re", "ri", "ro", "ru",
                "sa", "se", "si", "so", "su", "ta", "te", "ti", "to", "tu", "va", "ve", "vi",
                "vo", "vu", "za", "ze", "zi", "zo", "zu"],
        quantidade: 12
      },
      {
        nome: "Palavras de 2 sílabas",
        icone: "🐱",
        itens: ["bola", "casa", "dado", "faca", "gato", "lata", "mala", "pato", "rato", "sapo",
                "suco", "vela", "foca", "bolo", "copo", "dedo", "fita", "lobo", "mapa", "mesa",
                "pipa", "rede", "sino", "tatu", "vaca"],
        quantidade: 8
      },
      {
        nome: "Palavras de 3 sílabas",
        icone: "🐵",
        itens: ["boneca", "macaco", "sapato", "janela", "menino", "cavalo", "banana", "panela",
                "caneca", "tomate", "peteca", "pipoca", "girafa", "tapete", "cabelo", "camelo",
                "salada", "cenoura", "bonito", "tijolo"],
        quantidade: 8
      },
      {
        nome: "Palavras com espaço",
        icone: "␣",
        itens: ["o gato", "a bola", "meu sapo", "a casa", "o pato nada", "a vaca come",
                "meu dado", "a lua", "o sapo pula", "eu leio", "o bolo", "a pipa sobe"],
        quantidade: 6
      }
    ]
  },

  {
    ano: 3,
    titulo: "3º ano",
    conferirMaiusculas: true,
    fases: [
      {
        nome: "Dígrafos (ch, lh, nh, rr, ss, qu, gu)",
        icone: "🌧️",
        itens: ["chuva", "chave", "chinelo", "ninho", "galinha", "banho", "folha", "carro",
                "terra", "cachorro", "osso", "massa", "queijo", "quente", "guitarra",
                "foguete", "chocolate", "minhoca", "abelha", "telhado"],
        quantidade: 8
      },
      {
        nome: "Sílabas complexas (br, pr, fl, tr...)",
        icone: "🌸",
        itens: ["prato", "bruxa", "flor", "planta", "livro", "trem", "blusa", "cravo",
                "globo", "fruta", "cobra", "zebra", "tigre", "placa", "prego", "grama",
                "porta", "mosca", "festa", "barco", "circo", "escola", "bicicleta"],
        quantidade: 8
      },
      {
        nome: "Palavras com Ç",
        icone: "🦁",
        itens: ["palhaço", "cabeça", "poço", "laço", "moço", "onça", "praça", "lenço",
                "criança", "calça", "almoço", "abraço", "dança", "caçador"],
        quantidade: 8
      },
      {
        nome: "Acento agudo (´)",
        icone: "☕",
        itens: ["café", "sofá", "pé", "jacaré", "baú", "pá", "vovó", "régua", "música",
                "lápis", "árvore", "óculos", "xícara", "pássaro", "máquina"],
        quantidade: 8
      },
      {
        nome: "Til (~) e circunflexo (^)",
        icone: "🍎",
        itens: ["mão", "pão", "cão", "maçã", "limão", "avião", "balão", "coração", "irmã",
                "mamãe", "ônibus", "você", "avô", "bebê", "robô", "pêssego", "lâmpada"],
        quantidade: 8
      },
      {
        nome: "Frases curtas",
        icone: "📝",
        itens: ["O gato bebe leite.", "A menina pula corda.", "O sapo pula no lago.",
                "Eu gosto de ler.", "A vaca come capim.", "O sol nasceu.",
                "Meu cachorro late.", "Ana tem uma boneca.", "Pedro joga bola."],
        quantidade: 4,
        baloes: false
      },
      {
        nome: "Frases com acentos",
        icone: "🏆",
        itens: ["A bola é azul.", "Eu como pão.", "O avião voa alto.", "Vovó faz bolo.",
                "O bebê dorme.", "Meu irmão é alto.", "O café está quente.",
                "A maçã é vermelha.", "Você é meu amigo."],
        quantidade: 4,
        baloes: false
      }
    ]
  }
];

/*
  DITADO (só no Modo Áudio)
  O jogo fala uma palavra e a criança digita. Use palavras curtas e conhecidas,
  sem acento, em letras maiúsculas.
*/
const DITADO = ["SOL", "PATO", "BOLA", "CASA", "LUA", "MAR", "GATO", "DADO", "UVA",
                "OVO", "RUA", "MALA", "SAPO", "BOLO", "CAMA", "MESA", "PIPA", "VACA"];

/*
  PALAVRAS DO MODO BRAILLE (fase "Palavras curtas" da Corrida Braille)
  A criança forma cada letra com as teclas F, D, S, J, K e L.
  Use palavras curtas, em letras maiúsculas, sem acento.
  O nome da criança é cadastrado na Área do professor, não aqui.
*/
const PALAVRAS_BRAILLE = ["SOL", "PATO", "BOLA", "CASA", "LUA", "MAR", "GATO", "DADO", "UVA",
                          "OVO", "RUA", "MALA", "SAPO", "BOLO", "CAMA", "MESA", "PIPA", "VACA"];
