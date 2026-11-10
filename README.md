# Corrida das Teclas

Jogo de digitação para o Ciclo de Alfabetização (1º, 2º e 3º ano do Ensino Fundamental).
A criança aprende a usar o teclado brasileiro (ABNT2) enquanto pratica letras, sílabas, palavras e frases.

Endereço: https://phisantos51-hub.github.io/corrida-das-teclas/

## Como se joga

- **Corrida:** a cada tecla certa, o carrinho anda. Se errar, ele só para um instante, sem voltar.
- **Balões:** letras, sílabas ou palavras sobem em balões; a criança estoura o balão marcado digitando o que está escrito.
- **Aula das mãos:** ensina a achar os tracinhos do F e do J e as teclas vizinhas.
- O teclado desenhado na tela mostra a tecla certa (grande e brilhando) e a cor do dedo que deve ser usado.
- No fim, aparecem até 3 estrelas, as "teclas campeãs" e as teclas para treinar mais.
- Com 2 ou 3 estrelas, a próxima fase é liberada.
- Velocidade lenta, média ou rápida (começa sempre na lenta).
- O som vem desligado; há um botão para ligar.

## Modo Áudio (para estudante cego)

- Botão **Modo Áudio** na tela inicial, ou tecla **F1** (em alguns notebooks é preciso segurar a tecla Fn).
- O jogo fala em português do Brasil a tecla ou a palavra pedida e repete cada tecla apertada.
- Na primeira vez, começa com a **aula das mãos**.
- **Barra de espaço** repete a última instrução; **Esc** volta ao menu; **F1** desliga o Modo Áudio.
- No menu: setas para cima e para baixo escolhem, setas para os lados trocam a fase da Corrida, Enter começa.
- Sem limite de tempo. No lugar dos Balões há o **Ditado**.
- Com o **NVDA** ou o **Narrador**: desligue a "Voz do jogo" (botão na tela inicial ou no menu do Modo Áudio). Assim só o leitor de tela fala.
- O endereço terminado em `?audio` (https://phisantos51-hub.github.io/corrida-das-teclas/?audio) abre o jogo pronto para o Modo Áudio: basta apertar qualquer tecla.
- A voz usa as vozes instaladas no computador. No Windows, confira se a voz "Português (Brasil)" está instalada (Configurações > Hora e idioma > Fala).

## Modo Braille (dentro do Modo Áudio)

Para estudante cego que já tem noções de braille. No menu do Modo Áudio, escolha **Modo Braille**.

- As teclas viram os pontos da cela, como na máquina Perkins:
  F = ponto 1, D = ponto 2, S = ponto 3, J = ponto 4, K = ponto 5, L = ponto 6.
- A criança aperta as teclas juntas; a letra é registrada quando ela solta todas.
- Barra de espaço: espaço entre palavras (quando não é hora de espaço, repete a instrução). Backspace: apaga. Esc: volta ao menu.
- Na primeira vez, o jogo testa o teclado ("aperte as seis teclas juntas"). Se o teclado não registrar todas,
  avisa por voz e mostra o aviso no menu do Modo Braille.
- Atividades: Apresentação dos pontos, Corrida Braille (A a J, K a T, U a Z, palavras curtas, nome da criança,
  Ç e letras com acento), Ponte (o jogo fala os pontos e a criança digita a letra no teclado comum) e Treino livre.
- Na Área do professor: cadastrar o nome da criança e mostrar na tela a cela braille de cada letra.
- A tabela de pontos fica em `js/braille-tabela.js`; a lista para conferir está em `REVISAR-BRAILLE.md`.
- As palavras curtas ficam no fim de `js/palavras.js` (lista `PALAVRAS_BRAILLE`).

## Área do professor

Botão discreto "Área do professor", no canto de baixo da tela inicial, protegido por uma conta de somar.
Lá é possível **liberar todas as fases** e **apagar o progresso** (com confirmação).
O progresso fica salvo só no navegador daquele computador.

## Arquivos

- `index.html`: a página do jogo.
- `js/palavras.js`: **as letras, sílabas, palavras e frases de cada ano** (é aqui que se acrescentam palavras).
- `js/teclado.js`: o desenho do teclado ABNT2, os dedos e as dicas.
- `js/som.js`: a voz e os bipes.
- `js/jogo.js`: o funcionamento do jogo.
- `js/braille.js` e `js/braille-tabela.js`: o Modo Braille e a sua tabela de pontos.
- `css/estilo.css`: cores e tamanhos.
- `sw.js`: guarda uma cópia para o jogo abrir sem internet.

## Como acrescentar palavras

Abra `js/palavras.js`, encontre a fase e acrescente a palavra entre aspas no fim da lista `itens`, com uma vírgula antes.
As instruções completas estão no começo do próprio arquivo.

Depois de mudar qualquer arquivo, aumente o número `?v=` no `index.html` (e em `sw.js`, junto com a `VERSAO`),
para os computadores baixarem a versão nova.

Sem anúncios, sem links externos e sem coleta de dados. Funciona sem internet depois de carregado.
