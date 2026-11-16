import React from 'react';
import ReactDOM from 'react-dom/client';
// Bricolage para títulos, DM Sans (con eje óptico) para leer y JetBrains Mono sólo para cifras y pies.
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/dm-sans/opsz.css';
import '@fontsource-variable/jetbrains-mono';
import './styles.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
