'use client'

import {
    forwardRef,
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type ReactNode,
} from 'react'

const cn = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ')

type Color = 'white' | 'black' | 'blue' | 'gray' | 'red'
type Size = 'sm' | 'md' | 'lg'

const buttonColorClasses: Record<Color, string> = {
    white: 'bg-white text-black hover:bg-gray-200',
    black: 'bg-black text-white hover:bg-zinc-800 border border-zinc-700',
    blue: 'bg-blue-500 text-white hover:bg-blue-600',
    gray: 'bg-zinc-800 text-white hover:bg-zinc-700',
    red: 'bg-red-500 text-white hover:bg-red-600',
}

const buttonSizeClasses: Record<Size, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-11 px-5 text-base',
}

const textButtonSizeClasses: Record<Size, string> = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-3.5 py-2 text-base',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    color?: Color
    variant?: 'filled' | 'text'
    size?: Size
    loading?: boolean
}

export const HEADER_CLASS = 'h-16 md:h-20'

interface MainLayoutProps extends HTMLAttributes<HTMLElement> {
    withHeaderOffset?: boolean
}

export function MainLayout({
    withHeaderOffset = true,
    className,
    children,
    ...props
}: MainLayoutProps) {
    return (
        <main
            className={cn(
                'w-full',
                withHeaderOffset && 'app-main-offset',
                className
            )}
            {...props}
        >
            {children}
        </main>
    )
}

export function Container({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('app-container', className)} {...props}>
            {children}
        </div>
    )
}

export const Section = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
    function Section({ className, children, ...props }, ref) {
        return (
            <section
                ref={ref}
                className={cn('py-14 md:py-20', className)}
                {...props}
            >
                {children}
            </section>
        )
    }
)

interface StackProps extends HTMLAttributes<HTMLDivElement> {
    space?: 'sm' | 'md' | 'lg'
}

const stackSpaceClasses: Record<NonNullable<StackProps['space']>, string> = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-10',
}

export function Stack({
    space = 'md',
    className,
    children,
    ...props
}: StackProps) {
    return (
        <div className={cn(stackSpaceClasses[space], className)} {...props}>
            {children}
        </div>
    )
}

export function Button({
    color = 'white',
    variant = 'filled',
    size = 'md',
    loading = false,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading
    return (
        <button
            disabled={isDisabled}
            className={cn(
                'inline-flex items-center justify-center gap-2 font-semibold leading-none transition-colors',
                variant === 'text'
                    ? cn(
                          'rounded-md bg-transparent text-white hover:bg-white/10',
                          textButtonSizeClasses[size]
                      )
                    : cn('rounded-full', buttonSizeClasses[size], buttonColorClasses[color]),
                isDisabled && 'cursor-not-allowed opacity-50',
                className
            )}
            {...props}
        >
            {loading && <Spinner className="size-4 border-2 border-current" />}
            {children}
        </button>
    )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'filled' | 'text'
    size?: Size
}

const iconButtonSizeClasses: Record<Size, string> = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
}

export function IconButton({
    variant = 'text',
    size = 'md',
    className,
    children,
    ...props
}: IconButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-full leading-none transition-colors',
                iconButtonSizeClasses[size],
                variant === 'text'
                    ? 'bg-transparent text-white hover:bg-white/10'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

export function Tooltip({
    content,
    children,
}: {
    content: ReactNode
    children: ReactNode
}) {
    return (
        <span className="group relative inline-flex">
            {children}
            <span className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded bg-zinc-900 px-2 py-1 text-xs text-white shadow md:group-hover:block">
                {content}
            </span>
        </span>
    )
}

export function Card({
    className,
    children,
    color,
}: {
    className?: string
    children: ReactNode
    color?: Color
}) {
    const base = color === 'gray' ? 'bg-zinc-900' : 'bg-zinc-950'
    return (
        <div
            className={cn(
                'rounded-2xl border border-zinc-800/80 shadow-[0_10px_24px_rgba(0,0,0,0.24)]',
                base,
                className
            )}
        >
            {children}
        </div>
    )
}

export function CardBody({
    className,
    children,
}: {
    className?: string
    children: ReactNode
}) {
    return <div className={cn('p-5 md:p-6', className)}>{children}</div>
}

export function Chip({
    value,
    className,
}: {
    value: ReactNode
    className?: string
    size?: Size
    color?: Color
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide text-white',
                className
            )}
        >
            {value}
        </span>
    )
}

export function Spinner({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'inline-block size-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white',
                className
            )}
        />
    )
}

interface AlertProps {
    open?: boolean
    color?: Color
    onClose?: () => void
    className?: string
    children?: ReactNode
    animate?: unknown
    transition?: unknown
}

const alertColorClasses: Record<Color, string> = {
    white: 'bg-white text-black',
    black: 'bg-black text-white border border-zinc-700',
    blue: 'bg-blue-500 text-white',
    gray: 'bg-zinc-800 text-white',
    red: 'bg-red-500 text-white',
}

export function Alert({
    open = false,
    color = 'gray',
    onClose,
    className,
    children,
}: AlertProps) {
    if (!open) return null
    return (
        <div
            className={cn(
                'flex items-center justify-between gap-3 rounded-xl p-4 shadow-lg',
                alertColorClasses[color],
                className
            )}
        >
            <div>{children}</div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="rounded px-2 py-1 text-sm opacity-80 hover:opacity-100"
                >
                    Close
                </button>
            )}
        </div>
    )
}
