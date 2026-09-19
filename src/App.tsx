import * as React from 'react';
import { KeptApp } from './kept/KeptApp.tsx';
import { currentRoute, interceptLinks, onNavigate } from './kept/navigate.ts';

// Every address is a Kept address. kept-ui reads its route from `#/kept/...`; here it's the path.
// useSyncExternalStore re-reads the path after subscribing, so a redirect fired by a child's
// effect (the auth gate) before this subscribes is still picked up.
function usePathRoute() {
  const route = React.useSyncExternalStore(onNavigate, currentRoute);
  React.useEffect(() => interceptLinks(), []);
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) first.current = false;
    else window.scrollTo(0, 0);
  }, [route]);
  return route;
}

export default function App() {
  const route = usePathRoute();
  return <KeptApp route={route} />;
}
