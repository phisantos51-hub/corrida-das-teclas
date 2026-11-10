# Revisar: tabela do Modo Braille

Esta é a lista de todas as letras e sinais que o Modo Braille da **Corrida das Teclas** usa,
com os pontos de cada um. Ela foi gerada a partir do próprio jogo (arquivo `js/braille-tabela.js`),
então o que está aqui é exatamente o que o jogo ensina e confere.

Padrão seguido: **Grafia Braille para a Língua Portuguesa** (usada no Brasil).
Peço que a professora do AEE confira cada linha e marque a coluna "Conferido".

## Como as teclas viram pontos (como na máquina Perkins)

```
   Cela braille         Teclas do computador
   1 ● ● 4              F = ponto 1    J = ponto 4
   2 ● ● 5              D = ponto 2    K = ponto 5
   3 ● ● 6              S = ponto 3    L = ponto 6
```

- Mão esquerda: indicador no F, dedo médio no D, anelar no S.
- Mão direita: indicador no J, dedo médio no K, anelar no L.
- A criança aperta as teclas juntas; a letra é registrada quando ela solta todas.
- Barra de espaço: espaço entre palavras. Backspace: apaga.
- A coluna "Cela" mostra o desenho da cela (caractere braille do computador), para conferir visualmente.

## 1. Letras de A a Z (Corrida Braille, fases 1 a 3, Palavras curtas e Ponte)

Fase 1: A a J (pontos 1, 2, 4 e 5) · Fase 2: K a T (acrescenta o ponto 3) · Fase 3: U a Z (acrescenta o ponto 6).

| Letra | Pontos | Cela | Teclas | Conferido |
|---|---|---|---|---|
| **A** | 1 | ⠁ | F | ☐ |
| **B** | 1 e 2 | ⠃ | F + D | ☐ |
| **C** | 1 e 4 | ⠉ | F + J | ☐ |
| **D** | 1, 4 e 5 | ⠙ | F + J + K | ☐ |
| **E** | 1 e 5 | ⠑ | F + K | ☐ |
| **F** | 1, 2 e 4 | ⠋ | F + D + J | ☐ |
| **G** | 1, 2, 4 e 5 | ⠛ | F + D + J + K | ☐ |
| **H** | 1, 2 e 5 | ⠓ | F + D + K | ☐ |
| **I** | 2 e 4 | ⠊ | D + J | ☐ |
| **J** | 2, 4 e 5 | ⠚ | D + J + K | ☐ |
| **K** | 1 e 3 | ⠅ | F + S | ☐ |
| **L** | 1, 2 e 3 | ⠇ | F + D + S | ☐ |
| **M** | 1, 3 e 4 | ⠍ | F + S + J | ☐ |
| **N** | 1, 3, 4 e 5 | ⠝ | F + S + J + K | ☐ |
| **O** | 1, 3 e 5 | ⠕ | F + S + K | ☐ |
| **P** | 1, 2, 3 e 4 | ⠏ | F + D + S + J | ☐ |
| **Q** | 1, 2, 3, 4 e 5 | ⠟ | F + D + S + J + K | ☐ |
| **R** | 1, 2, 3 e 5 | ⠗ | F + D + S + K | ☐ |
| **S** | 2, 3 e 4 | ⠎ | D + S + J | ☐ |
| **T** | 2, 3, 4 e 5 | ⠞ | D + S + J + K | ☐ |
| **U** | 1, 3 e 6 | ⠥ | F + S + L | ☐ |
| **V** | 1, 2, 3 e 6 | ⠧ | F + D + S + L | ☐ |
| **W** | 2, 4, 5 e 6 | ⠺ | D + J + K + L | ☐ |
| **X** | 1, 3, 4 e 6 | ⠭ | F + S + J + L | ☐ |
| **Y** | 1, 3, 4, 5 e 6 | ⠽ | F + S + J + K + L | ☐ |
| **Z** | 1, 3, 5 e 6 | ⠵ | F + S + K + L | ☐ |

## 2. Ç e letras com acento (última fase da Corrida Braille e nome da criança)

| Letra | Pontos | Cela | Teclas | Conferido |
|---|---|---|---|---|
| **Ç** | 1, 2, 3, 4 e 6 | ⠯ | F + D + S + J + L | ☐ |
| **Á** | 1, 2, 3, 5 e 6 | ⠷ | F + D + S + K + L | ☐ |
| **É** | 1, 2, 3, 4, 5 e 6 | ⠿ | F + D + S + J + K + L | ☐ |
| **Í** | 3 e 4 | ⠌ | S + J | ☐ |
| **Ó** | 3, 4 e 6 | ⠬ | S + J + L | ☐ |
| **Ú** | 2, 3, 4, 5 e 6 | ⠾ | D + S + J + K + L | ☐ |
| **À** | 1, 2, 4 e 6 | ⠫ | F + D + J + L | ☐ |
| **Â** | 1 e 6 | ⠡ | F + L | ☐ |
| **Ê** | 1, 2 e 6 | ⠣ | F + D + L | ☐ |
| **Ô** | 1, 4, 5 e 6 | ⠹ | F + J + K + L | ☐ |
| **Ã** | 3, 4 e 5 | ⠜ | S + J + K | ☐ |
| **Õ** | 2, 4 e 6 | ⠪ | D + J + L | ☐ |

## 3. Sinais (só no Treino livre)

No Treino livre, o jogo diz o nome destes sinais quando a criança forma os pontos.
Qualquer outra combinação recebe a resposta "essa combinação não forma letra".

| Sinal | Pontos | Cela | Teclas | Conferido |
|---|---|---|---|---|
| vírgula ( , ) | 2 | ⠂ | D | ☐ |
| ponto e vírgula ( ; ) | 2 e 3 | ⠆ | D + S | ☐ |
| dois-pontos ( : ) | 2 e 5 | ⠒ | D + K | ☐ |
| ponto final ( . ) | 3 | ⠄ | S | ☐ |
| ponto de interrogação ( ? ) | 2 e 6 | ⠢ | D + L | ☐ |
| ponto de exclamação ( ! ) | 2, 3 e 5 | ⠖ | D + S + K | ☐ |
| hífen ( - ) | 3 e 6 | ⠤ | S + L | ☐ |
| sinal de letra maiúscula | 4 e 6 | ⠨ | J + L | ☐ |
| sinal de número | 3, 4, 5 e 6 | ⠼ | S + J + K + L | ☐ |

## Pontos de atenção para a conferência

- **Ponto final**: o jogo usa o ponto 3. Confirmar com a Grafia Braille em vigor.
- **Sinal de maiúscula (4 e 6)** e **sinal de número (3, 4, 5 e 6)**: o jogo só diz o nome do sinal no Treino livre.
  Nas corridas, as letras são pedidas sem o sinal de maiúscula.
- **À (crase)**: incluída na fase de letras com acento. Se a professora preferir, ela pode ser retirada.
- Combinações que no jogo aparecem como "não forma letra" podem ser sinais que não foram incluídos
  (por exemplo, aspas e parênteses). Se for importante incluí-los, avise.

## Como corrigir

Abra `js/braille-tabela.js` e troque só os números entre aspas da letra ou do sinal.
Exemplo: `B: "12"` quer dizer pontos 1 e 2.
