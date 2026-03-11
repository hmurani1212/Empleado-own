import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from "@material-tailwind/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './Theme/Theme'

// Employees list cache: data considered fresh for 5 min, then removed from cache
const EMPLOYEES_CACHE_MS = 5 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: EMPLOYEES_CACHE_MS,
      gcTime: EMPLOYEES_CACHE_MS,
    },
  },
});

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
