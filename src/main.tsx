import React from 'react';
import ReactDOM from 'react-dom/client';
// Archivo con eje de ancho: los titulares se abren con font-stretch.
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/jetbrains-mono';
import './styles.css';
import App from './App';
import { intro } from './transition';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
intro();
