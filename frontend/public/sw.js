const CACHE_NAME = 'feminaflow-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/tracker',
  '/calendar',
  '/analytics',
  '/chat',
  '/profile',
  '/login',
  '/register',
  '/about',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});