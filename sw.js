/* 조아박스 제작관리 — 설치용 서비스 워커
 * 앱 껍데기(이 폴더의 파일)만 기기에 저장해서 홈 화면 아이콘으로 빨리 열리게 합니다.
 * 제작일지 내용은 저장하지 않습니다 (항상 구글 시트에서 최신 내용을 불러옴). */
var CACHE = 'joabox-shell-v2';
var SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon-32.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// 이 폴더 파일만: 먼저 인터넷에서 새로 받고, 안 되면 저장해 둔 것
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(function (res) {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return res;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); }); }));
});
