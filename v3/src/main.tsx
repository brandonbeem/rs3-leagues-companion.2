import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { PlayerProvider } from './core/player/PlayerProvider';
import './styles.css';
import './engine.css';
import './world-foundation.css';
import './taskTracker.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Unable to find the application root element.');
}

createRoot(rootElement).render(
  <StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </StrictMode>,
);
