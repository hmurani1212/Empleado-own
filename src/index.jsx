import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from "@material-tailwind/react";
import { QueryClientProvider } from '@tanstack/react-query';
import { theme } from './Theme/Theme'
import { queryClient } from './queryClient';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value = {theme}>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
