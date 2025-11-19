
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeCapacitor } from './src/capacitor';

// Capacitorの初期化
initializeCapacitor().catch((error) => {
  console.error('Capacitorの初期化中にエラーが発生しました:', error);
  // エラーが発生してもアプリは起動するので、エラーはログのみ
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
