import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Termo: Direct Rendering Flow - Fluxo de renderização direta sem verificações duplas
createRoot(document.getElementById('root')).render(
  <App />
)