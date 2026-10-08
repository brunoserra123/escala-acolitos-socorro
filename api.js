/* Ponte: o site no GitHub Pages fala com a planilha pelo Apps Script (doPost do Code.js).
   Imita o google.script.run, para as páginas funcionarem sem mudar nada. Gerado por gerar-github.py. */
(function () {
  var API = "https://script.google.com/macros/s/AKfycbziAJHtJrRarB7rlbxO7JTAPNjm73cuZDcT6mRQYzsxAoALmcQremEnJej1qT-SH3MqtQ/exec";
  function chamar(fn, args) {
    return fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ fn: fn, args: args }) })
      .then(function (r) { if (!r.ok) throw new Error("Sem conexão com o servidor (" + r.status + ")."); return r.json(); })
      .then(function (d) { if (!d.ok) throw new Error(d.erro || "Erro no servidor."); return d.r; });
  }
  function novoRunner() {
    var ok = function () {}, falha = function (e) { console.error(e); }, proxy;
    var base = {
      withSuccessHandler: function (f) { ok = f || ok; return proxy; },
      withFailureHandler: function (f) { falha = f || falha; return proxy; },
      withUserObject: function () { return proxy; }
    };
    proxy = new Proxy(base, { get: function (t, k) {
      if (k in t) return t[k];
      return function () {
        var args = Array.prototype.slice.call(arguments);
        chamar(String(k), args).then(function (r) { ok(r); }, function (e) { falha(e); });
      };
    } });
    return proxy;
  }
  window.google = { script: { get run() { return novoRunner(); } } };
  window.chamarApi = chamar;
  /* espera os dados iniciais (escala, nomes, chaves) antes de montar a tela, numa chamada só */
  window.prontoSite = function (iniciar) {
    var inscricao = /[?&]p=inscricao/.test(location.search);
    var guardado = null;
    try { guardado = JSON.parse(localStorage.getItem("dados_site") || "null"); } catch (e) {}
    var comecar = function () {
      var iniciado = false;
      // abre na hora com a última escala guardada neste celular; quando a nova chegar, atualiza a tela
      if (guardado && !inscricao) { DADOS_INICIAIS = guardado; iniciar(); iniciado = true; }
      chamar("dadosIniciaisSite", [inscricao]).then(function (d) {
        try { localStorage.setItem("dados_site", JSON.stringify(d)); } catch (e) {}
        DADOS_INICIAIS = d;
        if (!iniciado) { iniciar(); return; }
        trocasLiberadas = !!d.trocas; chamadaAtiva = !!d.chamada;
        if (Array.isArray(d.nomes)) nomesAcolitos = d.nomes;
        if (d.grade) gradeMissas = d.grade;
        carregarEscala(d.escala);
      }, function () { if (!iniciado) iniciar(); });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", comecar); else comecar();
  };
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
})();
