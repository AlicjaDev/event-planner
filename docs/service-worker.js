const sw = new URL('service-worker.js', import.meta.url)
if ('serviceWorker' in navigator) {
 const s = navigator.serviceWorker;
 s.register(sw.href, {
 scope: 'https://alicjadev.github.io/event-planner/'
 })
 .then(_ => console.log('Service Worker Registered for scope:', sw.href,
'with', import.meta.url))
 .catch(err => console.error('Service Worker Error:', err));
}
