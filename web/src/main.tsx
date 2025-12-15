import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Admin from './Admin'
import '@arco-design/web-react/dist/css/arco.css'
import './styles.css'

const isAdmin = window.location.pathname.startsWith('/admin')
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdmin ? <Admin /> : <App />}
  </React.StrictMode>
)
