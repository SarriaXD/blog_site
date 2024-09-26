'use client'

import 'react-toastify/dist/ReactToastify.css'
import './global.css'
import { ToastContainer } from 'react-toastify'

interface ToastProviderProps {
    children: React.ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
    return (
        <>
            {children}
            <ToastContainer className="pt-12" theme={'dark'} />
        </>
    )
}
