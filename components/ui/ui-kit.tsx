'use client'

import {
    forwardRef,
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type ReactNode,
} from 'react'

const cn = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ')

type Tone = 'neutral' | 'brand' | 'danger' | 'inverse'
type Size = 'sm' | 'md' | 'lg'
type Variant = 'solid' | 'soft' | 'ghost' | 'outline'

const tonePalette: Record<
    Tone,
    {
        solid: string
        soft: string
        ghost: string
        outline: string
        chip: string
        alert: string
        card: string
    }
> = {
    neutral: {
        solid: 'border border-white/20 bg-white/14 text-white shadow-[0_18px_42px_rgba(0,0,0,0.38)] hover:bg-white/20',
        soft: 'border border-white/20 bg-white/10 text-[#dce5f7] hover:bg-white/15',
        ghost: 'border border-white/14 bg-white/6 text-[#dce5f7] hover:bg-white/12',
        outline: 'border border-white/24 bg-transparent text-[#dce5f7] hover:border-white/40 hover:bg-white/10',
        chip: 'border-white/20 bg-white/10 text-[#dbe4f8]',
        alert: 'border-white/20 bg-white/12 text-[#e4ebfa]',
        card: 'border-white/16 bg-white/8 text-[#eef3ff]',
    },
    brand: {
        solid: 'border border-cyan-300/40 bg-[linear-gradient(180deg,#42b9ff_0%,#1d74ff_100%)] text-white shadow-[0_18px_44px_rgba(24,117,255,0.5)] hover:brightness-110',
        soft: 'border border-cyan-300/35 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/28',
        ghost: 'border border-cyan-300/30 bg-cyan-500/14 text-cyan-200 hover:bg-cyan-500/22',
        outline: 'border border-cyan-300/45 bg-transparent text-cyan-200 hover:bg-cyan-500/14',
        chip: 'border-cyan-300/40 bg-cyan-500/20 text-cyan-100',
        alert: 'border-cyan-300/45 bg-cyan-500/20 text-cyan-100',
        card: 'border-cyan-300/24 bg-[linear-gradient(160deg,rgba(40,86,157,0.55)_0%,rgba(15,27,52,0.82)_100%)] text-white',
    },
    danger: {
        solid: 'border border-red-300/35 bg-[linear-gradient(180deg,#ff6f84_0%,#d72e45_100%)] text-white shadow-[0_16px_40px_rgba(215,46,69,0.45)] hover:brightness-110',
        soft: 'border border-red-300/35 bg-red-500/20 text-red-100 hover:bg-red-500/28',
        ghost: 'border border-red-300/32 bg-red-500/12 text-red-200 hover:bg-red-500/20',
        outline: 'border border-red-300/40 bg-transparent text-red-200 hover:bg-red-500/15',
        chip: 'border-red-300/45 bg-red-500/20 text-red-100',
        alert: 'border-red-300/45 bg-red-500/24 text-red-100',
        card: 'border-red-300/28 bg-[linear-gradient(160deg,rgba(114,20,33,0.62)_0%,rgba(39,12,17,0.9)_100%)] text-white',
    },
    inverse: {
        solid: 'border border-[#d4deef] bg-[#f2f7ff] text-[#060e1c] shadow-[0_16px_32px_rgba(191,206,232,0.35)] hover:bg-[#e7eef9]',
        soft: 'border border-[#d4deef] bg-[#ecf2fe] text-[#0b1425] hover:bg-[#e2ebfb]',
        ghost: 'border border-[#d4deef]/60 bg-white/10 text-[#f1f6ff] hover:bg-white/16',
        outline: 'border border-[#d4deef] bg-transparent text-[#f1f6ff] hover:bg-white/12',
        chip: 'border-[#cad6eb] bg-[#edf3fe] text-[#0d1729]',
        alert: 'border-[#d4deef] bg-[#f1f7ff] text-[#071122]',
        card: 'border-[#d4deef] bg-[#f3f7ff] text-[#071122]',
    },
}

const buttonSizeClasses: Record<Size, string> = {
    sm: 'min-h-10 px-5 py-2 text-sm',
    md: 'min-h-11 px-6 py-2.5 text-[15px]',
    lg: 'min-h-12 px-7 py-3 text-base',
}

const iconButtonSizeClasses: Record<Size, string> = {
    sm: 'size-9',
    md: 'size-11',
    lg: 'size-12',
}

const chipSizeClasses: Record<Size, string> = {
    sm: 'h-6 px-2.5 text-[11px]',
    md: 'h-7 px-3 text-xs',
    lg: 'h-8 px-3.5 text-sm',
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
                'w-full text-[var(--ui-text-primary)] antialiased',
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
                className={cn('py-16 md:py-24', className)}
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
    md: 'space-y-7',
    lg: 'space-y-12',
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

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    tone?: Tone
    size?: Size
    loading?: boolean
}

export function Button({
    variant = 'solid',
    tone = 'neutral',
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
            type={props.type ?? 'button'}
            disabled={isDisabled}
            className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold leading-[1.15] tracking-[-0.01em] transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070b]',
                buttonSizeClasses[size],
                tonePalette[tone][variant],
                variant === 'ghost' && 'backdrop-blur-sm',
                variant === 'soft' && 'backdrop-blur-xl',
                isDisabled && 'cursor-not-allowed opacity-50',
                className
            )}
            {...props}
        >
            {loading && <Spinner className="size-4 border-current border-r-transparent" />}
            {children}
        </button>
    )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    tone?: Tone
    size?: Size
}

export function IconButton({
    variant = 'ghost',
    tone = 'neutral',
    size = 'md',
    className,
    children,
    ...props
}: IconButtonProps) {
    return (
        <button
            type={props.type ?? 'button'}
            className={cn(
                'inline-flex items-center justify-center rounded-full leading-[1] transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070b]',
                iconButtonSizeClasses[size],
                tonePalette[tone][variant],
                variant === 'ghost' && 'backdrop-blur-sm',
                variant === 'soft' && 'backdrop-blur-xl',
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
            <span className="pointer-events-none absolute -top-11 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-[#0d1118]/95 px-3 py-1.5 text-xs font-medium text-[#e2e9f8] shadow-[0_10px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl md:group-hover:block">
                {content}
            </span>
        </span>
    )
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    tone?: Tone
}

export function Card({ tone = 'neutral', className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-[28px] border shadow-[0_24px_54px_rgba(3,6,14,0.35)] backdrop-blur-xl',
                tonePalette[tone].card,
                className
            )}
            {...props}
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
    return <div className={cn('p-5 md:p-7', className)}>{children}</div>
}

interface ChipProps {
    value: ReactNode
    className?: string
    size?: Size
    tone?: Tone
}

export function Chip({
    value,
    className,
    size = 'md',
    tone = 'neutral',
}: ChipProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border font-semibold tracking-wide backdrop-blur-sm',
                chipSizeClasses[size],
                tonePalette[tone].chip,
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
                'inline-block size-6 animate-spin rounded-full border-2 border-current border-r-transparent',
                className
            )}
        />
    )
}

interface AlertProps {
    open?: boolean
    tone?: Tone
    onClose?: () => void
    className?: string
    children?: ReactNode
}

export function Alert({
    open = false,
    tone = 'neutral',
    onClose,
    className,
    children,
}: AlertProps) {
    if (!open) return null
    return (
        <div
            role="alert"
            className={cn(
                'flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-[0_20px_48px_rgba(2,4,11,0.35)] backdrop-blur-xl',
                tonePalette[tone].alert,
                className
            )}
        >
            <div>{children}</div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-2 py-1 text-sm opacity-80 transition-opacity hover:opacity-100"
                >
                    Close
                </button>
            )}
        </div>
    )
}
