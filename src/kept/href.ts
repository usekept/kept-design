// Product paths for the Kept operate UI. Lab used `#/kept/...`; these are real SPA routes.

export const href = {
  home: '/',
  login: '/login',
  mfa: '/login/mfa',
  request: '/request',
  library: '/library',
  map: '/map',
  collection: (collectionId: string) => `/library/${encodeURIComponent(collectionId)}`,
  reference: (collectionId: string, referenceId: string) =>
    `/library/${encodeURIComponent(collectionId)}?r=${encodeURIComponent(referenceId)}`,
  board: (token: string) => `/m/${encodeURIComponent(token)}`,
} as const;

export function boardAbsoluteUrl(token: string) {
  return `${window.location.origin}${href.board(token)}`;
}

export function go(path: string, mode: 'assign' | 'replace' = 'assign') {
  if (mode === 'replace') window.location.replace(path);
  else window.location.assign(path);
}

export type KeptRoute =
  | { kind: 'home' }
  | { kind: 'login' }
  | { kind: 'mfa' }
  | { kind: 'request' }
  | { kind: 'library' }
  | { kind: 'collection'; collectionId: string; referenceId: string | null }
  | { kind: 'board'; token: string }
  | { kind: 'unknown' };

export function parseKeptRoute(pathname = window.location.pathname, search = window.location.search): KeptRoute {
  const path = pathname.replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  const referenceParam = new URLSearchParams(search).get('r');

  if (path === '/') return { kind: 'home' };
  if (path === '/login') return { kind: 'login' };
  if (path === '/login/mfa') return { kind: 'mfa' };
  if (path === '/request') return { kind: 'request' };
  if (path === '/library') return { kind: 'library' };
  if (parts[0] === 'library' && parts[1]) {
    const collectionId = decodeURIComponent(parts[1]);
    const nestedId = parts[2] ? decodeURIComponent(parts.slice(2).join('/')) : null;
    return {
      kind: 'collection',
      collectionId,
      referenceId: nestedId ?? referenceParam,
    };
  }
  if (parts[0] === 'm' && parts[1]) {
    return { kind: 'board', token: decodeURIComponent(parts.slice(1).join('/')) };
  }
  return { kind: 'unknown' };
}
