import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeProvider'
import { AppQueryProvider } from './providers/AppQueryProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AppQueryProvider>
          <App />
        </AppQueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
) 