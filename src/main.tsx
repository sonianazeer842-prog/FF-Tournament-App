import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-register PWA service worker for offline caching and fast native loading
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);

