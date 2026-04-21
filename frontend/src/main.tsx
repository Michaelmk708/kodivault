import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { getRouter } from './router'
import './styles.css'

// 1. Initialize the router
const router = getRouter()

// 2. Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      {/* TanStack Router needs the QueryClientProvider if you use context */}
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
}