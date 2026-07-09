import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="bg-grid"></div>
    <div className="bg-waveform"></div>
    <App />
  </StrictMode>,
);