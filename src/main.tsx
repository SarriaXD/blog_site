import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/Router.tsx'
import { Nav } from './components/Nav.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Nav />
        <RouterProvider router={router} />
    </React.StrictMode>
)
