/* FxTube - YouTube client for Firefox OS (ES5, no modern APIs) */
(function () {
  var DEFAULT_INSTANCES = [
    'https://yewtu.be',
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://invidious.privacyredirect.com',
    'https://iv.melmac.space',
    'https://invidious.jing.rocks',
    'https://invidious.fdn.fr',
    'https://inv.tux.pizza',
    'https://invidious.protokolla.fi'
  ];

  function $(id) { return document.getElementById(id); }

  /* ---------- storage ---------- */
  function load(key, def) {
    try { var v = localStorage.getItem(key); return v === null ? def : JSON.parse(v); }
    catch (e) { return def; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  // saved lists are versioned so an updated default list replaces stale/dead servers
  var LIST_VER = 2;
  if (load('listVer', 0) !== LIST_VER) { save('instances', DEFAULT_INSTANCES); save('listVer', LIST_VER); }
  var instances = load('instances', DEFAULT_INSTANCES);
  if (!instances || !instances.length) instances = DEFAULT_INSTANCES;
  var region = load('region', 'US');
  var cur = 0;

  /* ---------- languages ---------- */
  var LANGS = { en: 'English', it: 'Italiano', es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português' };
  var STR = {
    en: { searchPh: 'Search or paste a link', go: 'Go', more: 'Load more', server: 'Server (Invidious)',
      serverHelp: 'Videos are loaded through a public Invidious server. If nothing loads, pick another server.',
      region: 'Trending region', language: 'Language', save: 'Save', find: 'Find working servers',
      tab_home: 'Home', tab_search: 'Search', tab_shorts: 'Shorts', tab_set: 'Settings',
      loading: 'Loading...', nothing: 'Nothing here. Try searching.', searching: 'Searching...', noResults: 'No results.',
      noServer: 'No server answered. Try another one in Settings.', views: 'views', loadingVideo: 'Loading video...',
      cantPlay: 'This video cannot be played (server blocked it or format not supported). Try another server in Settings.',
      loadingShorts: 'Loading shorts...', shortsFail: 'Could not load shorts. Try another server in Settings.',
      noShorts: 'No shorts found on this server.', loadingMore: 'Loading more...', saved: 'Saved.',
      lookingServers: 'Looking for servers...', foundServers: 'Found {n} servers.', noServersFound: 'No servers found.', failed: 'Failed: ' },
    it: { searchPh: 'Cerca o incolla un link', go: 'Vai', more: 'Carica altri', server: 'Server (Invidious)',
      serverHelp: 'I video vengono caricati tramite un server Invidious pubblico. Se non si carica nulla, scegli un altro server.',
      region: 'Regione di tendenza', language: 'Lingua', save: 'Salva', find: 'Trova server funzionanti',
      tab_home: 'Home', tab_search: 'Cerca', tab_shorts: 'Shorts', tab_set: 'Impostazioni',
      loading: 'Caricamento...', nothing: 'Niente da mostrare. Prova a cercare.', searching: 'Ricerca...', noResults: 'Nessun risultato.',
      noServer: 'Nessun server ha risposto. Provane un altro in Impostazioni.', views: 'visualizzazioni', loadingVideo: 'Caricamento video...',
      cantPlay: 'Impossibile riprodurre questo video (server bloccato o formato non supportato). Prova un altro server in Impostazioni.',
      loadingShorts: 'Caricamento shorts...', shortsFail: 'Impossibile caricare gli shorts. Prova un altro server in Impostazioni.',
      noShorts: 'Nessuno short trovato su questo server.', loadingMore: 'Caricamento altri...', saved: 'Salvato.',
      lookingServers: 'Ricerca server...', foundServers: 'Trovati {n} server.', noServersFound: 'Nessun server trovato.', failed: 'Errore: ' },
    es: { searchPh: 'Busca o pega un enlace', go: 'Ir', more: 'Cargar más', server: 'Servidor (Invidious)',
      serverHelp: 'Los vídeos se cargan mediante un servidor Invidious público. Si no carga nada, elige otro servidor.',
      region: 'Región de tendencias', language: 'Idioma', save: 'Guardar', find: 'Buscar servidores que funcionen',
      tab_home: 'Inicio', tab_search: 'Buscar', tab_shorts: 'Shorts', tab_set: 'Ajustes',
      loading: 'Cargando...', nothing: 'Nada que mostrar. Prueba a buscar.', searching: 'Buscando...', noResults: 'Sin resultados.',
      noServer: 'Ningún servidor respondió. Prueba otro en Ajustes.', views: 'visualizaciones', loadingVideo: 'Cargando vídeo...',
      cantPlay: 'No se puede reproducir este vídeo (servidor bloqueado o formato no compatible). Prueba otro servidor en Ajustes.',
      loadingShorts: 'Cargando shorts...', shortsFail: 'No se pudieron cargar los shorts. Prueba otro servidor en Ajustes.',
      noShorts: 'No se encontraron shorts en este servidor.', loadingMore: 'Cargando más...', saved: 'Guardado.',
      lookingServers: 'Buscando servidores...', foundServers: 'Se encontraron {n} servidores.', noServersFound: 'No se encontraron servidores.', failed: 'Error: ' },
    fr: { searchPh: 'Rechercher ou coller un lien', go: 'OK', more: 'Charger plus', server: 'Serveur (Invidious)',
      serverHelp: 'Les vidéos sont chargées via un serveur Invidious public. Si rien ne se charge, choisissez un autre serveur.',
      region: 'Région des tendances', language: 'Langue', save: 'Enregistrer', find: 'Trouver des serveurs',
      tab_home: 'Accueil', tab_search: 'Recherche', tab_shorts: 'Shorts', tab_set: 'Réglages',
      loading: 'Chargement...', nothing: 'Rien à afficher. Essayez de rechercher.', searching: 'Recherche...', noResults: 'Aucun résultat.',
      noServer: 'Aucun serveur n’a répondu. Essayez-en un autre dans les réglages.', views: 'vues', loadingVideo: 'Chargement de la vidéo...',
      cantPlay: 'Impossible de lire cette vidéo (serveur bloqué ou format non pris en charge). Essayez un autre serveur dans les réglages.',
      loadingShorts: 'Chargement des shorts...', shortsFail: 'Impossible de charger les shorts. Essayez un autre serveur dans les réglages.',
      noShorts: 'Aucun short trouvé sur ce serveur.', loadingMore: 'Chargement...', saved: 'Enregistré.',
      lookingServers: 'Recherche de serveurs...', foundServers: '{n} serveurs trouvés.', noServersFound: 'Aucun serveur trouvé.', failed: 'Échec : ' },
    de: { searchPh: 'Suchen oder Link einfügen', go: 'Los', more: 'Mehr laden', server: 'Server (Invidious)',
      serverHelp: 'Videos werden über einen öffentlichen Invidious-Server geladen. Wenn nichts lädt, wähle einen anderen Server.',
      region: 'Trends-Region', language: 'Sprache', save: 'Speichern', find: 'Funktionierende Server finden',
      tab_home: 'Start', tab_search: 'Suche', tab_shorts: 'Shorts', tab_set: 'Einstellungen',
      loading: 'Lädt...', nothing: 'Nichts vorhanden. Versuche zu suchen.', searching: 'Suche...', noResults: 'Keine Ergebnisse.',
      noServer: 'Kein Server hat geantwortet. Probiere einen anderen in den Einstellungen.', views: 'Aufrufe', loadingVideo: 'Video wird geladen...',
      cantPlay: 'Dieses Video kann nicht abgespielt werden (Server blockiert oder Format nicht unterstützt). Probiere einen anderen Server.',
      loadingShorts: 'Shorts werden geladen...', shortsFail: 'Shorts konnten nicht geladen werden. Probiere einen anderen Server.',
      noShorts: 'Keine Shorts auf diesem Server gefunden.', loadingMore: 'Lädt mehr...', saved: 'Gespeichert.',
      lookingServers: 'Suche Server...', foundServers: '{n} Server gefunden.', noServersFound: 'Keine Server gefunden.', failed: 'Fehler: ' },
    pt: { searchPh: 'Pesquise ou cole um link', go: 'Ir', more: 'Carregar mais', server: 'Servidor (Invidious)',
      serverHelp: 'Os vídeos são carregados por um servidor Invidious público. Se nada carregar, escolha outro servidor.',
      region: 'Região de tendências', language: 'Idioma', save: 'Salvar', find: 'Encontrar servidores',
      tab_home: 'Início', tab_search: 'Buscar', tab_shorts: 'Shorts', tab_set: 'Ajustes',
      loading: 'Carregando...', nothing: 'Nada por aqui. Tente pesquisar.', searching: 'Pesquisando...', noResults: 'Sem resultados.',
      noServer: 'Nenhum servidor respondeu. Tente outro nos Ajustes.', views: 'visualizações', loadingVideo: 'Carregando vídeo...',
      cantPlay: 'Não foi possível reproduzir este vídeo (servidor bloqueado ou formato não suportado). Tente outro servidor nos Ajustes.',
      loadingShorts: 'Carregando shorts...', shortsFail: 'Não foi possível carregar os shorts. Tente outro servidor nos Ajustes.',
      noShorts: 'Nenhum short encontrado neste servidor.', loadingMore: 'Carregando mais...', saved: 'Salvo.',
      lookingServers: 'Procurando servidores...', foundServers: '{n} servidores encontrados.', noServersFound: 'Nenhum servidor encontrado.', failed: 'Falha: ' }
  };
  var lang = load('lang', null);
  if (!lang || !STR[lang]) {
    var nl = ((navigator.language || 'en') + '').toLowerCase().substr(0, 2);
    lang = STR[nl] ? nl : 'en';
  }
  function t(k, n) {
    var s = (STR[lang] && STR[lang][k]) || STR.en[k] || k;
    return n === undefined ? s : s.replace('{n}', n);
  }
  function applyLang() {
    var els = document.querySelectorAll('[data-i]'), i;
    for (i = 0; i < els.length; i++) els[i].textContent = t(els[i].getAttribute('data-i'));
    els = document.querySelectorAll('[data-ip]');
    for (i = 0; i < els.length; i++) els[i].setAttribute('placeholder', t(els[i].getAttribute('data-ip')));
    document.documentElement.setAttribute('lang', lang);
  }
  var langSel = $('langSel');
  for (var lk in LANGS) {
    if (!LANGS.hasOwnProperty(lk)) continue;
    var lo = document.createElement('option');
    lo.value = lk; lo.textContent = LANGS[lk];
    langSel.appendChild(lo);
  }
  langSel.value = lang;
  applyLang();

  /* ---------- network ---------- */
  function getJSON(url, ok, fail, timeout) {
    var x;
    try { x = new XMLHttpRequest({ mozSystem: true, mozAnon: true }); }
    catch (e) { x = new XMLHttpRequest(); }
    x.open('GET', url, true);
    x.timeout = timeout || 15000;
    x.onload = function () {
      if (x.status >= 200 && x.status < 300) {
        var d;
        try { d = JSON.parse(x.responseText); } catch (e) { fail('bad response'); return; }
        if (d && d.error) { fail(String(d.error)); return; }
        ok(d);
      } else { fail('HTTP ' + x.status); }
    };
    x.onerror = function () { fail('network error'); };
    x.ontimeout = function () { fail('timeout'); };
    x.send();
  }

  // tries every server in turn until one answers
  function api(path, ok, fail) {
    var tries = 0, n = instances.length, errs = [];
    function next() {
      if (tries >= n) { fail(t('noServer') + ' [' + errs.slice(0, 3).join('; ') + ']'); return; }
      var idx = (cur + tries) % n;
      var base = instances[idx];
      getJSON(base + path, function (d) { cur = idx; ok(d, base); },
        function (why) { errs.push(base.replace(/^https?:\/\//, '') + ': ' + why); tries++; next(); });
    }
    next();
  }

  /* ---------- helpers ---------- */
  function fmtTime(s) {
    s = parseInt(s, 10) || 0;
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    var t = (sec < 10 ? '0' : '') + sec;
    if (h > 0) return h + ':' + (m < 10 ? '0' : '') + m + ':' + t;
    return m + ':' + t;
  }
  function fmtViews(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) return '';
    if (n >= 1000000) return (Math.round(n / 100000) / 10) + 'M ' + t('views');
    if (n >= 1000) return (Math.round(n / 100) / 10) + 'K ' + t('views');
    return n + ' ' + t('views');
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  function absUrl(u, base) {
    if (!u) return u;
    if (u.indexOf('//') === 0) return 'https:' + u;
    if (u.charAt(0) === '/') return base + u;
    return u;
  }

  function extractId(text) {
    var m = /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/.exec(text);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(text)) return text;
    return null;
  }

  /* ---------- video cards ---------- */
  function makeCard(v) {
    var a = document.createElement('div');
    a.className = 'card';
    var th = document.createElement('div');
    th.className = 'thumb';
    var img = document.createElement('img');
    img.src = instances[cur] + '/vi/' + v.videoId + '/mqdefault.jpg';
    th.appendChild(img);
    if (v.lengthSeconds) {
      var d = document.createElement('div');
      d.className = 'dur';
      d.textContent = fmtTime(v.lengthSeconds);
      th.appendChild(d);
    }
    var t = document.createElement('div');
    t.className = 'ttl';
    t.textContent = v.title;
    var m = document.createElement('div');
    m.className = 'meta';
    var bits = [v.author, fmtViews(v.viewCount), v.publishedText];
    var out = [];
    for (var i = 0; i < bits.length; i++) if (bits[i]) out.push(bits[i]);
    m.textContent = out.join(' \u00B7 ');
    a.appendChild(th); a.appendChild(t); a.appendChild(m);
    a.onclick = function () { openPlayer(v.videoId, v.title); };
    return a;
  }

  function renderList(list, box) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].type && list[i].type !== 'video') continue;
      if (!list[i].videoId) continue;
      box.appendChild(makeCard(list[i]));
    }
  }

  /* ---------- tabs ---------- */
  var tabs = ['home', 'search', 'shorts', 'set'];
  var shortsStarted = false, shortsResume = false;

  function showTab(name) {
    for (var i = 0; i < tabs.length; i++) {
      $(tabs[i] + 'View').style.display = tabs[i] === name ? 'block' : 'none';
    }
    var btns = $('nav').getElementsByTagName('button');
    for (var j = 0; j < btns.length; j++) {
      btns[j].className = btns[j].getAttribute('data-tab') === name ? 'on' : '';
    }
    if (name !== 'shorts') { $('shortVideo').pause(); $('shortEmbed').removeAttribute('src'); if (shortsStarted && shorts.length) shortsResume = true; }
    if (name === 'shorts') {
      if (!shortsStarted) { shortsStarted = true; loadShorts(true); }
      else if (shorts.length) { playShort(shortIdx); }
    }
    if (name === 'set') {
      $('instInput').value = instances[0] || '';
      $('regionInput').value = region;
      $('langSel').value = lang;
    }
  }

  var navBtns = $('nav').getElementsByTagName('button');
  for (var nb = 0; nb < navBtns.length; nb++) {
    (function (b) { b.onclick = function () { showTab(b.getAttribute('data-tab')); }; })(navBtns[nb]);
  }

  /* ---------- home / trending ---------- */
  function loadHome() {
    $('homeMsg').textContent = t('loading');
    var p = '/api/v1/trending?region=' + encodeURIComponent(region) + '&hl=' + lang;
    api(p, function (d) {
      clear($('homeList'));
      $('homeMsg').textContent = '';
      renderList(d, $('homeList'));
      if (!$('homeList').firstChild) $('homeMsg').textContent = t('nothing');
    }, function () {
      // trending is disabled on some servers: fall back to popular
      api('/api/v1/popular', function (d) {
        clear($('homeList'));
        $('homeMsg').textContent = '';
        renderList(d, $('homeList'));
      }, function (err) {
        $('homeMsg').textContent = err;
      });
    });
  }

  /* ---------- search ---------- */
  var lastQuery = '', searchPage = 1;

  function doSearch(q, page) {
    lastQuery = q; searchPage = page;
    if (page === 1) clear($('searchList'));
    $('moreBtn').style.display = 'none';
    $('searchMsg').textContent = t('searching');
    api('/api/v1/search?type=video&hl=' + lang + '&region=' + region + '&page=' + page + '&q=' + encodeURIComponent(q), function (d) {
      $('searchMsg').textContent = '';
      renderList(d, $('searchList'));
      if (!$('searchList').firstChild) $('searchMsg').textContent = t('noResults');
      else $('moreBtn').style.display = 'block';
    }, function (err) { $('searchMsg').textContent = err; });
  }

  $('searchForm').onsubmit = function () {
    var q = $('q').value.replace(/^\s+|\s+$/g, '');
    if (!q) return false;
    var id = extractId(q);
    if (id) { openPlayer(id, ''); return false; }
    showTab('search');
    doSearch(q, 1);
    $('q').blur();
    return false;
  };
  $('moreBtn').onclick = function () { doSearch(lastQuery, searchPage + 1); };

  /* ---------- fetching a playable stream ---------- */
  var PIPED = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.adminforge.de',
    'https://api.piped.private.coffee',
    'https://pipedapi.leptons.xyz',
    'https://pipedapi.nosebs.ru'
  ];

  // Order: Invidious API (formatStreams) -> Piped API -> direct /latest_version links -> embedded player
  function getStreams(id, ok, fail) {
    var n = Math.min(instances.length, 8), i = 0, firstInfo = null, firstBase = null;

    function finish() {
      var out = [], k, its = [['18', '360p mp4'], ['22', '720p mp4']];
      // direct links work even if the JSON API is disabled (no CORS needed for <video>)
      var bases = [];
      if (firstBase) bases.push(firstBase);
      for (k = 0; k < instances.length && bases.length < 3; k++) {
        if (bases.indexOf(instances[(cur + k) % instances.length]) < 0) bases.push(instances[(cur + k) % instances.length]);
      }
      for (k = 0; k < bases.length; k++) {
        for (var q = 0; q < its.length; q++) {
          out.push({ label: its[q][1], url: bases[k] + '/latest_version?id=' + id + '&itag=' + its[q][0] + '&local=true' });
        }
      }
      // last resort: the official YouTube embedded player
      out.push({ label: 'YouTube', embed: 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1&hl=' + lang });
      ok(out, firstInfo || {});
    }

    function tryPiped(j) {
      if (j >= PIPED.length) { finish(); return; }
      getJSON(PIPED[j] + '/streams/' + id, function (d) {
        var vs = d.videoStreams || [], out = [];
        for (var k = 0; k < vs.length; k++) {
          var s = vs[k];
          if (!s.videoOnly && s.url && (s.format === 'MPEG_4' || /mp4/.test(s.mimeType || ''))) {
            out.push({ label: (s.quality || '?') + ' mp4', url: s.url });
          }
        }
        if (out.length) ok(out, { title: d.title }); else tryPiped(j + 1);
      }, function () { tryPiped(j + 1); }, 8000);
    }

    function tryInv() {
      if (i >= n) { tryPiped(0); return; }
      var idx = (cur + i) % instances.length, base = instances[idx];
      getJSON(base + '/api/v1/videos/' + id + '?local=true', function (d) {
        if (!firstBase) { firstBase = base; firstInfo = d; }
        var list = d.formatStreams || [], out = [];
        for (var k = 0; k < list.length; k++) {
          var f = list[k];
          if (!f.url) continue;
          out.push({
            label: (f.qualityLabel || f.quality || '?') + ' ' + (f.container || ''),
            url: absUrl(f.url, base)
          });
        }
        if (out.length) { cur = idx; ok(out, d); } else { i++; tryInv(); }
      }, function () { i++; tryInv(); }, 8000);
    }

    tryInv();
  }

  // plays streams[idx]; if the video errors, moves on to the next candidate (embed is the last)
  function startPlayback(v, streams, idx, msgEl, sel, emb) {
    var i = idx;
    function go() {
      var s = streams[i];
      if (s.embed) {
        v.onerror = null; v.pause(); v.removeAttribute('src');
        v.style.display = 'none';
        emb.style.display = 'block';
        emb.src = s.embed;
        return;
      }
      emb.style.display = 'none'; emb.removeAttribute('src');
      v.style.display = 'block';
      v.src = s.url;
      v.play();
    }
    v.onerror = function () {
      i++;
      if (i < streams.length) {
        if (sel) sel.value = i;
        go();
      } else {
        msgEl.textContent = t('cantPlay');
      }
    };
    // a stalled stream never fires "error": give it a few seconds, then move on
    go();
  }

  function pickDefault(streams) {
    // prefer 360p mp4: light enough for old hardware
    var best = 0, i;
    if (streams[0].embed) return 0;
    for (i = 0; i < streams.length; i++) {
      if (/360/.test(streams[i].label)) { best = i; break; }
    }
    return best;
  }

  /* ---------- full player ---------- */
  var curStreams = [];

  function openPlayer(id, title) {
    $('player').style.display = 'block';
    $('playerTitle').textContent = title || '';
    $('playerMsg').textContent = t('loadingVideo');
    clear($('qualSel'));
    var v = $('mainVideo');
    v.removeAttribute('src');
    getStreams(id, function (streams, info) {
      curStreams = streams;
      if (!title) $('playerTitle').textContent = info.title || '';
      for (var i = 0; i < streams.length; i++) {
        var o = document.createElement('option');
        o.value = i; o.textContent = streams[i].label;
        $('qualSel').appendChild(o);
      }
      var def = pickDefault(streams);
      $('qualSel').value = def;
      $('playerMsg').textContent = '';
      startPlayback(v, streams, def, $('playerMsg'), $('qualSel'), $('mainEmbed'));
    }, function (err) { $('playerMsg').textContent = err; });
  }

  $('qualSel').onchange = function () {
    var v = $('mainVideo'), t = v.currentTime;
    v.src = curStreams[$('qualSel').value].url;
    v.addEventListener('loadedmetadata', function seek() {
      v.removeEventListener('loadedmetadata', seek, false);
      try { v.currentTime = t; } catch (e) {}
      v.play();
    }, false);
  };

  $('closeBtn').onclick = function () {
    var v = $('mainVideo');
    v.onerror = null;
    v.pause();
    v.removeAttribute('src');
    v.load();
    $('mainEmbed').removeAttribute('src'); $('mainEmbed').style.display = 'none'; v.style.display = 'block';
    $('player').style.display = 'none';
  };

  /* ---------- shorts ---------- */
  var shorts = [], shortIdx = 0, shortsPage = 1, shortsLoading = false, shortToken = 0;

  function loadShorts(first) {
    if (shortsLoading) return;
    shortsLoading = true;
    if (first) $('shortMsg').textContent = t('loadingShorts');
    var base = '/api/v1/search?type=video&page=' + shortsPage + '&q=' + encodeURIComponent('#shorts');
    function fetchShorts(path, onOk, onFail) {
      api(path, onOk, function () { onFail(); });
    }
    function failed() {
      shortsLoading = false;
      $('shortMsg').textContent = t('shortsFail');
      if (first) shortsStarted = false;
    }
    // try with the "short" duration filter first, then without it
    fetchShorts(base + '&duration=short', handle, function () {
      fetchShorts(base, handle, failed);
    });
    function handle(d) {
      shortsLoading = false;
      shortsPage++;
      var added = 0;
      for (var i = 0; i < d.length; i++) {
        // real shorts are 60 seconds or less
        if (d[i].videoId && d[i].lengthSeconds && d[i].lengthSeconds <= 60) {
          shorts.push(d[i]); added++;
        }
      }
      if (first) {
        if (shorts.length) { $('shortMsg').textContent = ''; playShort(0); }
        else if (shortsPage <= 6) { loadShorts(true); }
        else { $('shortMsg').textContent = t('noShorts'); shortsStarted = false; }
      }
    }
  }

  function playShort(i) {
    if (i < 0) i = 0;
    if (i >= shorts.length) {
      loadShorts(false);
      $('shortMsg').textContent = t('loadingMore');
      return;
    }
    shortIdx = i;
    var token = ++shortToken;
    var s = shorts[i], v = $('shortVideo');
    $('shortInfo').textContent = s.title + ' - ' + (s.author || '');
    $('shortMsg').textContent = t('loading');
    v.pause();
    v.removeAttribute('src');
    $('shortEmbed').removeAttribute('src'); $('shortEmbed').style.display = 'none'; v.style.display = 'block';
    getStreams(s.videoId, function (streams) {
      if (token !== shortToken) return;
      $('shortMsg').textContent = '';
      startPlayback(v, streams, pickDefault(streams), $('shortMsg'), null, $('shortEmbed'));
    }, function (err) {
      if (token !== shortToken) return;
      $('shortMsg').textContent = err;
    });
    if (i >= shorts.length - 3) loadShorts(false);
  }

  $('shortUp').onclick = function () { playShort(shortIdx - 1); };
  $('shortDown').onclick = function () { playShort(shortIdx + 1); };

  // swipe up = next, swipe down = previous, tap = pause/play
  var touchY = null, touchMoved = false;
  var sv = $('shortsView');
  sv.addEventListener('touchstart', function (e) {
    if (e.target.className === 'shortBtn') return;
    touchY = e.touches[0].clientY; touchMoved = false;
  }, false);
  sv.addEventListener('touchmove', function () { touchMoved = true; }, false);
  sv.addEventListener('touchend', function (e) {
    if (touchY === null) return;
    var dy = e.changedTouches[0].clientY - touchY;
    touchY = null;
    if (dy < -60) { playShort(shortIdx + 1); }
    else if (dy > 60) { playShort(shortIdx - 1); }
    else if (!touchMoved) {
      var v = $('shortVideo');
      if (v.paused) v.play(); else v.pause();
    }
  }, false);
  $('shortVideo').addEventListener('ended', function () { /* loop attribute handles replay */ }, false);

  /* ---------- settings ---------- */
  $('saveBtn').onclick = function () {
    var u = $('instInput').value.replace(/\s+|\/+$/g, '');
    if (u) {
      var rest = [];
      for (var i = 0; i < instances.length; i++) if (instances[i] !== u) rest.push(instances[i]);
      instances = [u].concat(rest);
      cur = 0;
      save('instances', instances);
    }
    var r = $('regionInput').value.toUpperCase();
    if (r.length === 2) { region = r; save('region', r); }
    lang = $('langSel').value; save('lang', lang); applyLang();
    $('setMsg').textContent = t('saved');
    loadHome();
  };

  $('findBtn').onclick = function () {
    $('setMsg').textContent = t('lookingServers');
    getJSON('https://api.invidious.io/instances.json?sort_by=health', function (d) {
      var found = [];
      for (var i = 0; i < d.length && found.length < 8; i++) {
        var info = d[i][1];
        if (info && info.type === 'https' && info.api === true && info.uri) found.push(info.uri);
      }
      if (!found.length) { $('setMsg').textContent = t('noServersFound'); return; }
      for (var di = 0; di < DEFAULT_INSTANCES.length; di++) if (found.indexOf(DEFAULT_INSTANCES[di]) < 0) found.push(DEFAULT_INSTANCES[di]);
      instances = found; cur = 0;
      save('instances', instances);
      $('instInput').value = found[0];
      $('setMsg').textContent = t('foundServers', found.length);
      loadHome();
    }, function (err) { $('setMsg').textContent = t('failed') + err; });
  };

  /* ---------- go ---------- */
  loadHome();
})();

