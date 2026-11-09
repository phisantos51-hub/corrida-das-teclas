/*
  Guarda uma cópia do jogo no navegador para que ele abra mesmo sem internet.
  Com internet, sempre busca a versão mais nova; sem internet, usa a cópia guardada.
  Se acrescentar arquivos novos ao jogo, inclua-os na lista ARQUIVOS e aumente a VERSAO.
*/
const VERSAO = "corrida-das-teclas-1";
const ARQUIVOS = [
  "./",
  "index.html",
  "css/estilo.css?v=1",
  "js/palavras.js?v=1",
  "js/teclado.js?v=1",
  "js/som.js?v=1",
  "js/jogo.js?v=1"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ARQUIVOS); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== VERSAO; }).map(function (n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (resposta) {
      const copia = resposta.clone();
      caches.open(VERSAO).then(function (c) { c.put(e.request, copia); });
      return resposta;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match("index.html"); });
    })
  );
});
