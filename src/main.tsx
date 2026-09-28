import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/manrope';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/bricolage-grotesque/opsz.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles.css';
import App from './App';
import { intro } from './transition';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
intro();
