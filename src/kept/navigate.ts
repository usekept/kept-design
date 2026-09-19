// Client-side navigation on real paths. kept-ui routes with `#/kept/...` hashes; here the same
// screens run on `/...` paths, so link clicks and redirects go through history instead.

const EVENT = 'kept:navigate';

export function navigate(path: string, mode: 'push' | 'replace' = 'push') {
  if (mode === 'replace') window.history.replaceState(null, '', path);
  else window.history.pushState(null, '', path);
  window.dispatchEvent(new Event(EVENT));
}

// The route string kept-ui's screens expect: the path without its leading slash ('' is the landing).
export function currentRoute() {
  return window.location.pathname.replace(/^\/+|\/+$/g, '');
}

export function onNavigate(listener: () => void) {
  window.addEventListener('popstate', listener);
  window.addEventListener(EVENT, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener(EVENT, listener);
  };
}

// Plain same-origin links navigate without a page load, like hash links do in kept-ui.
export function interceptLinks() {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.('a[href]');
    if (!(link instanceof HTMLAnchorElement)) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download') || link.origin !== window.location.origin) return;
    event.preventDefault();
    const path = `${link.pathname}${link.search}${link.hash}`;
    if (path !== `${window.location.pathname}${window.location.search}${window.location.hash}`) navigate(path);
  };
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
