import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/Router.tsx'
import { Nav } from './components/Nav.tsx'
import { ThemeProvider } from '@material-tailwind/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <Nav />
            <RouterProvider router={router} />
        </ThemeProvider>
    </React.StrictMode>
)
