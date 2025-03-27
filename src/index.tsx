// src/index.tsx (or App.tsx if you prefer)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css'; // Ensure you have this file
import App from './App';
import { DocumentProvider } from './contexts/DocumentContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <DocumentProvider> {/* Wrap App with the provider */}
      <App />
    </DocumentProvider>
  </React.StrictMode>
);