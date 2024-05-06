import { createBrowserRouter } from 'react-router-dom'
import { Homepage } from '../pages/Homepage.tsx'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Homepage />,
    },
])
