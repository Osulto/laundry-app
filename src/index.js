import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // We'll create this file next
import App from './App';

// This line finds the <div id="root"></div> element in your public/index.html file.
const root = ReactDOM.createRoot(document.getElementById('root'));

// This tells React to render your main App component inside that root div.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
