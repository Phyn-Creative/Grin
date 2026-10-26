const CACHE_NAME = 'grin-shell-v3';
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/grin.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('grin-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Push payloads should be small, non-sensitive, and safe to display on a lock screen.
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : 'You have new activity on GRIN.' };
  }

  const title = typeof payload.title === 'string' && payload.title.trim() ? payload.title.trim().slice(0, 80) : 'GRIN';
  const body = typeof payload.body === 'string' && payload.body.trim() ? payload.body.trim().slice(0, 180) : 'You have new activity.';
  const target = typeof payload.url === 'string' && payload.url.startsWith('/') && !payload.url.startsWith('//') ? payload.url : '/?source=push';

  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/icons/grin.svg',
    badge: '/icons/grin.svg',
    tag: typeof payload.tag === 'string' ? payload.tag.slice(0, 100) : 'grin-activity',
    data: { url: target }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const requested = event.notification.data && typeof event.notification.data.url === 'string'
    ? event.notification.data.url
    : '/?source=push';
  const target = new URL(requested.startsWith('/') && !requested.startsWith('//') ? requested : '/?source=push', self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin) {
        if ('navigate' in client) await client.navigate(target);
        if ('focus' in client) return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  const url = new URL(request.url);
  if (url.pathname.startsWith('/auth/') || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put('/', response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/')))
    );
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname === '/manifest.webmanifest') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(async () => await caches.match(request))
    );
  }
});
