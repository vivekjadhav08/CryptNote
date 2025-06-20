import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './App'; // Assuming Root is exported from App.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
