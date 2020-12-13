import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { App } from './App';


// Changed from .render to .hydrate for server-side rendering support.
ReactDOM.hydrate(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
