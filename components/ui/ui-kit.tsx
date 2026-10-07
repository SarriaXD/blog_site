'use client'

import {
    forwardRef,
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type ReactNode,
} from 'react'
import { Glass, cn, type GlassTint } from './liquid-glass.tsx'

export { Glass, cn }
export type { GlassTint }

type Tone = 'neutral' | 'brand' | 'danger' | 'inverse'
type Size = 'sm' | 'md' | 'lg'
type Variant = 'solid' | 'soft' | 'ghost' | 'outline'

/** Maps the semantic tone/variant API onto a glass tint. */
const resolveTint = (tone: Tone, variant: Variant): GlassTint => {
    switch (tone) {
        case 'brand':
            return variant === 'solid' ? 'brand-solid' : 'brand'
        case 'danger':
            return variant === 'solid' ? 'danger-solid' : 'danger'
        case 'inverse':
            return 'inverse'
        default:
            switch (variant) {
                case 'solid':
                    return 'soft'
                case 'soft':
                    return 'neutral'
                case 'ghost':
                    return 'clear'
                case 'outline':
                    return 'clear'
            }
    }
}

const variantText: Record<Tone, string> = {
    neutral: 'text-[var(--ui-text-primary)]',
    brand: 'text-[#dff2ff]',
    danger: 'text-[#ffe1e6]',
    inverse: 'text-[#0a1020]',
}

const buttonSizeClasses: Record<Size, string> = {
    sm: 'min-h-10 px-5 text-sm',
    md: 'min-h-11 px-6 text-[15px]',
    lg: 'min-h-12 px-7 text-base',
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

export const HEADER_CLASS = 'h-14 md:h-16'

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

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
                'relative w-full text-[var(--ui-text-primary)] antialiased',
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
                className={cn('relative py-16 md:py-24', className)}
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

/* ------------------------------------------------------------------ */
/*  Actions                                                            */
/* ------------------------------------------------------------------ */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    tone?: Tone
    size?: Size
    loading?: boolean
    /** Disable the (Chromium-only) refraction layer for very small buttons. */
    refraction?: boolean
}

export function Button({
    variant = 'solid',
    tone = 'neutral',
    size = 'md',
    loading = false,
    refraction = true,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading
    return (
        <Glass
            as="button"
            type={props.type ?? 'button'}
            tint={resolveTint(tone, variant)}
            interactive
            refraction={refraction}
            disabled={isDisabled}
            className={cn(
                'inline-flex shrink-0 rounded-full leading-[1.15] font-semibold tracking-[-0.01em]',
                buttonSizeClasses[size],
                variantText[tone],
                variant === 'outline' && 'lg-outline',
                className
            )}
            contentClassName="flex items-center justify-center gap-2 whitespace-nowrap"
            {...(props as HTMLAttributes<HTMLElement>)}
        >
            {loading && (
                <Spinner className="size-4 border-current border-r-transparent" />
            )}
            {children}
        </Glass>
    )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    tone?: Tone
    size?: Size
    refraction?: boolean
}

export function IconButton({
    variant = 'ghost',
    tone = 'neutral',
    size = 'md',
    refraction = true,
    className,
    children,
    ...props
}: IconButtonProps) {
    return (
        <Glass
            as="button"
            type={props.type ?? 'button'}
            tint={resolveTint(tone, variant)}
            interactive
            refraction={refraction}
            className={cn(
                'inline-flex shrink-0 rounded-full leading-none',
                iconButtonSizeClasses[size],
                variantText[tone],
                className
            )}
            contentClassName="flex items-center justify-center"
            {...(props as HTMLAttributes<HTMLElement>)}
        >
            {children}
        </Glass>
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
            <span className="pointer-events-none absolute -top-11 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-white/15 bg-[#0d1020]/80 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[#e6ecfa] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl md:group-hover:block">
                {content}
            </span>
        </span>
    )
}

/* ------------------------------------------------------------------ */
/*  Surfaces                                                           */
/* ------------------------------------------------------------------ */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    tone?: Tone
    /** Lift and shine on hover (for clickable cards). */
    interactive?: boolean
    refraction?: boolean
    aberration?: boolean
    band?: number
    strength?: number
    contentClassName?: string
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
    {
        tone = 'neutral',
        interactive = false,
        refraction = true,
        aberration = false,
        band,
        strength,
        className,
        contentClassName,
        children,
        ...props
    },
    ref
) {
    return (
        <Glass
            ref={ref}
            as="div"
            tint={resolveTint(tone, 'soft')}
            interactive={interactive}
            refraction={refraction}
            aberration={aberration}
            band={band}
            strength={strength}
            className={cn('rounded-[28px]', variantText[tone], className)}
            contentClassName={cn('flex flex-col', contentClassName)}
            {...(props as HTMLAttributes<HTMLElement>)}
        >
            {children}
        </Glass>
    )
})

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
        <Glass
            as="span"
            tint={resolveTint(tone, 'soft')}
            refraction={false}
            className={cn(
                'inline-flex rounded-full font-semibold tracking-wide shadow-none [--lg-blur:10px]',
                chipSizeClasses[size],
                variantText[tone],
                className
            )}
            contentClassName="flex items-center whitespace-nowrap"
        >
            {value}
        </Glass>
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
        <Glass
            as="div"
            role="alert"
            tint={resolveTint(tone, 'soft')}
            className={cn('rounded-[22px] p-4', variantText[tone], className)}
            contentClassName="flex items-center justify-between gap-3"
        >
            <div>{children}</div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full px-3 py-1 text-sm opacity-80 transition hover:bg-white/10 hover:opacity-100"
                >
                    Close
                </button>
            )}
        </Glass>
    )
}
