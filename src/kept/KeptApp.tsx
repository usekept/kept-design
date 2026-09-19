import * as React from 'react';
import { Button } from '@base-ui/react/button';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import { KeptBoard } from './KeptBoard.tsx';
import { KeptCollection } from './KeptCollection.tsx';
import { KeptLanding } from './KeptLanding.tsx';
import { KeptLibrary } from './KeptLibrary.tsx';
import { KeptLogin } from './KeptLogin.tsx';
import { KeptReference } from './KeptReference.tsx';
import { go, href, parseKeptRoute, type KeptRoute } from './href.ts';
import { ArrowIcon, ArrowLink, Separator } from './parts.tsx';
import { completeMfaForLab, getSession, signOut } from './session.ts';
import './tokens.css';
import './kept.css';

// Snapshot of w-ade/kept-ui@d250e558 operate UI, wired to product SPA paths.
// Shells follow the lab: marketing/auth/app chrome plus a chrome-less board.

type Shell = 'marketing' | 'auth' | 'app' | 'board';

const MARKETING_NAV = [
  { href: href.home, label: 'Landing', route: 'home' },
  { href: href.library, label: 'Library', route: 'library' },
  { href: href.map, label: 'Map', route: 'map' },
];
const AUTH_NAV = MARKETING_NAV.slice(0, 1);
const APP_NAV = MARKETING_NAV.slice(1);

function shellFor(route: KeptRoute): Shell {
  switch (route.kind) {
    case 'home':
    case 'unknown':
      return 'marketing';
    case 'board':
      return 'board';
    case 'login':
    case 'mfa':
    case 'request':
      return 'auth';
    case 'library':
    case 'collection':
      return 'app';
    default: {
      const _exhaustive: never = route;
      return _exhaustive;
    }
  }
}

function titleFor(route: KeptRoute) {
  switch (route.kind) {
    case 'home':
      return 'KEPT — A library you can actually operate.';
    case 'login':
      return 'Sign in · KEPT';
    case 'mfa':
      return 'Two-factor · KEPT';
    case 'request':
      return 'Request an invite · KEPT';
    case 'library':
      return 'Library · KEPT';
    case 'collection':
    case 'board':
      return null;
    case 'unknown':
      return 'KEPT';
    default: {
      const _exhaustive: never = route;
      return _exhaustive;
    }
  }
}

// Signed-in routes: send the visitor to whichever auth step they still owe.
function useAuthGate(route: KeptRoute) {
  const session = getSession();
  const needsGate = route.kind === 'library' || route.kind === 'collection';
  const redirect =
    !needsGate || session?.aal === 'aal2' ? null : session ? href.mfa : href.login;

  React.useEffect(() => {
    if (redirect) go(redirect, 'replace');
  }, [redirect]);

  return redirect !== null;
}

function canonicalizeCollectionUrl(route: KeptRoute) {
  if (route.kind !== 'collection' || !route.referenceId) return;
  const canonical = href.reference(route.collectionId, route.referenceId);
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== canonical) window.history.replaceState(null, '', canonical);
}

export function KeptApp() {
  const route = parseKeptRoute();
  const redirecting = useAuthGate(route);

  React.useEffect(() => {
    canonicalizeCollectionUrl(route);
  }, [route]);

  React.useEffect(() => {
    const previous = document.title;
    const title = titleFor(route);
    if (title) document.title = title;
    return () => {
      document.title = previous;
    };
  }, [route]);

  if (redirecting) return null;

  const shell = shellFor(route);
  if (shell === 'board') {
    const token = route.kind === 'board' ? route.token : '';
    return <KeptBoard key={token} token={token} />;
  }

  const nav = shell === 'app' ? APP_NAV : shell === 'auth' ? AUTH_NAV : MARKETING_NAV;
  const session = getSession();
  const currentNav =
    route.kind === 'home'
      ? 'home'
      : route.kind === 'library' || route.kind === 'collection'
        ? 'library'
        : null;

  let content: React.ReactNode;
  switch (route.kind) {
    case 'home':
      content = <KeptLanding />;
      break;
    case 'login':
      content = <KeptLogin />;
      break;
    case 'mfa':
      content = <KeptMfaPlaceholder />;
      break;
    case 'library':
      content = <KeptLibrary />;
      break;
    case 'collection':
      content = route.referenceId ? (
        <KeptReference
          key={route.referenceId}
          collectionId={route.collectionId}
          referenceId={route.referenceId}
        />
      ) : (
        <KeptCollection key={route.collectionId} collectionId={route.collectionId} />
      );
      break;
    case 'request':
      content = <KeptComingNext label="Request an invite" />;
      break;
    case 'board':
      content = null;
      break;
    case 'unknown':
      content = <KeptComingNext label="Not found" />;
      break;
    default: {
      const _exhaustive: never = route;
      content = _exhaustive;
    }
  }

  return (
    <div className="KeptBody">
      <div className="KeptGrid">
        <header className="KeptContents">
          <a className="KeptWordmark KeptCol-logo" href={href.home} aria-label="Kept home">
            KEPT
          </a>
          <nav className="KeptStack KeptCol-nav" aria-label="Site">
            {nav.map((item) => (
              <a
                key={item.href}
                className="KeptLink KeptText1"
                href={item.href}
                aria-current={item.route === currentNav ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
            {shell === 'app' && (
              <Button
                className="KeptLink KeptText1 KeptButtonReset KeptButtonText1"
                onClick={() => {
                  signOut();
                  go(href.home);
                }}
              >
                Sign out
              </Button>
            )}
          </nav>
          <span className="KeptText1 KeptMuted KeptCol-status">
            {shell === 'app' && session ? session.username : 'Early development'}
          </span>
        </header>

        <main className="KeptContents">{content}</main>

        <Separator />
        <footer className="KeptContents">
          <span className="KeptText1 KeptCol-label">© Kept</span>
        </footer>
      </div>
    </div>
  );
}

// Two-factor isn't built yet; this stand-in lets the snapshot reach the library.
function KeptMfaPlaceholder() {
  return (
    <section className="KeptContents">
      <h1 className="KeptDisplay KeptCol-hero">Two-factor</h1>
      <p className="KeptText2 KeptMuted KeptCol-full">
        Not built in the lab yet. Continue without a code for now.
      </p>
      <div className="KeptCol-full">
        <Button
          className="KeptLink KeptLinkArrow KeptText2 KeptButtonReset"
          onClick={() => {
            completeMfaForLab();
            go(href.library);
          }}
        >
          Continue to library
          <ArrowIcon />
        </Button>
      </div>
    </section>
  );
}

function KeptComingNext({
  label,
  back = href.home,
  backLabel = 'Back to landing',
}: {
  label?: string;
  back?: string;
  backLabel?: string;
}) {
  return (
    <section className="KeptContents">
      <h1 className="KeptDisplay KeptCol-hero">{label ?? 'Not found'}</h1>
      <p className="KeptText2 KeptMuted KeptCol-full">Not built yet.</p>
      <div className="KeptCol-full">
        <ArrowLink href={back}>{backLabel}</ArrowLink>
      </div>
    </section>
  );
}
