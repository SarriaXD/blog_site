'use client'

import 'react-toastify/dist/ReactToastify.css'
import '@styles/global.css'
import { Slide, ToastContainer, ToastOptions } from 'react-toastify'
import { Warn } from '@public/icons'

export const toastErrorOptions: ToastOptions = {
    type: 'error',
    position: 'top-center',
    transition: Slide,
    className: 'bg-[#E96F40]',
    icon: () => (
        <div className="rounded-full bg-white p-1 text-[#E96F40]">
            <Warn className="size-3" />
        </div>
    ),
    autoClose: 3000,
    hideProgressBar: true,
}

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
