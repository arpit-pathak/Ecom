import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './admin/context/AuthProvider';
import {store,persistor} from './store';
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import TagManager from 'react-gtm-module'
import { GTMID } from './constants/general';

const root = ReactDOM.createRoot(document.getElementById('root'));

const tagManagerArgs = {
  gtmId: GTMID
}
TagManager.initialize(tagManagerArgs)

root.render(
  <HelmetProvider>
    <AuthProvider>
      <BrowserRouter>
        <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
          </PersistGate>
        </Provider>
      </BrowserRouter>
    </AuthProvider>
  </HelmetProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
