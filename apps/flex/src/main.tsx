import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import { FlexProvider } from './store/FlexContext';
import './index.css';

// BrowserRouter breaks in chrome-extension:// (path is /app/index.html, not /)
const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime?.id;
const Router = isExtension ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <FlexProvider>
        <App />
      </FlexProvider>
    </Router>
  </React.StrictMode>
);
