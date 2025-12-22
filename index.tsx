import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Remove the initial loader once React has mounted and execution reaches here
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
  }
} catch (error: any) {
  console.error("Critical application error:", error);
  const errorDisplay = document.getElementById('error-display');
  const loader = document.getElementById('initial-loader');
  if (loader) loader.style.display = 'none';
  if (errorDisplay) {
    errorDisplay.style.display = 'block';
    errorDisplay.innerText = "Application Failed to Start: " + (error.message || error);
  }
}
