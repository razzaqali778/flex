import React from 'react';
import ReactDOM from 'react-dom/client';
import { PartnerRuntimeApp } from 'partner-ui';
import 'partner-ui/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PartnerRuntimeApp
      appId="rpt"
      appName="dhub-rpt"
      theme="violet"
      tagline="Planning & capacity"
      marketplaceUrl="http://localhost:5176/"
    />
  </React.StrictMode>
);
