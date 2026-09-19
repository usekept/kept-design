import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './kept/tokens.css';
import App from './App.tsx';
import { applyTheme, getTheme } from './kept/theme.ts';

// Apply a chosen light or dark mode before the first paint.
applyTheme(getTheme());

// Layout overlay for inspecting the grid (Cmd/Ctrl + G). Dev only, so it never ships.
const KeptGuideframe = import.meta.env.DEV ? lazy(() => import('./dev/KeptGuideframe.tsx')) : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {KeptGuideframe && (
      <Suspense fallback={null}>
        <KeptGuideframe />
      </Suspense>
    )}
  </StrictMode>,
);
