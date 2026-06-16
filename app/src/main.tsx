import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { warmApi } from '@/lib/api'
import { startKeepAlive } from '@/lib/keepAlive'

// Initial warm-up ping
warmApi()

// Start keep-alive pinger to prevent server from sleeping
startKeepAlive()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
