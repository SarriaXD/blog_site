'use client'

import 'react-toastify/dist/ReactToastify.css'
import '@styles/global.css'
import { ToastContainer } from 'react-toastify'

interface ToastProviderProps {
    children: React.ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
    return (
        <>
            {children}
            <ToastContainer theme={'dark'} />
        </>
    )
}
