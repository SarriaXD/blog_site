'use client'

import {
    createElement,
    forwardRef,
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    type Ref,
} from 'react'
import {
    buildGlassMap,
    supportsSvgBackdropFilter,
    type GlassMap,
} from '@lib/utils/glass-map.ts'

export const cn = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ')

export type GlassTint =
    | 'clear'
    | 'dark'
    | 'neutral'
    | 'soft'
    | 'brand'
    | 'brand-solid'
    | 'danger'
    | 'danger-solid'
    | 'inverse'

type GlassTag =
    | 'div'
    | 'span'
    | 'button'
    | 'nav'
    | 'section'
    | 'footer'
    | 'header'
    | 'aside'
    | 'article'
    | 'li'

export interface GlassProps
    extends
        Omit<HTMLAttributes<HTMLElement>, 'children'>,
        Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled'> {
    as?: GlassTag
    /** Colour of the glass. */
    tint?: GlassTint
    /** Render the SVG refraction layer (Chromium only, falls back gracefully). */
    refraction?: boolean
    /** Split the refraction per colour channel for a prism-like rim. */
    aberration?: boolean
    /** Pointer-following specular highlight and hover / press scaling. */
    interactive?: boolean
    /** Rim thickness in CSS px (defaults to a fraction of the element size). */
    band?: number
    /** 0..1 — how strongly the rim bends the backdrop. */
    strength?: number
    /** Classes for the inner content wrapper. */
    contentClassName?: string
    children?: ReactNode
}

interface RefractionState {
    map: GlassMap
}

const useGlassRefraction = (
    enabled: boolean,
    band: number | undefined,
    strength: number | undefined
) => {
    const ref = useRef<HTMLElement | null>(null)
    const [state, setState] = useState<RefractionState | null>(null)

    useEffect(() => {
        if (!enabled) {
            setState(null)
            return
        }
        const el = ref.current
        if (!el || !supportsSvgBackdropFilter()) return

        let frame = 0
        let timer: ReturnType<typeof setTimeout> | null = null
        let lastKey = ''

        const measure = () => {
            frame = 0
            const width = el.offsetWidth
            const height = el.offsetHeight
            const radius =
                parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
            const key = `${width}x${height}:${radius}`
            if (key === lastKey) return
            lastKey = key
            const map = buildGlassMap({ width, height, radius, band, strength })
            setState(map ? { map } : null)
        }
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(measure)
        }
        const debounced = () => {
            if (timer) clearTimeout(timer)
            timer = setTimeout(schedule, 120)
        }

        schedule()
        const observer = new ResizeObserver(debounced)
        observer.observe(el)
        return () => {
            observer.disconnect()
            if (frame) cancelAnimationFrame(frame)
            if (timer) clearTimeout(timer)
        }
    }, [enabled, band, strength])

    return { ref, state }
}

const RefractionFilter = ({
    id,
    map,
    aberration,
}: {
    id: string
    map: GlassMap
    aberration: boolean
}) => {
    const image = (
        <feImage
            href={map.href}
            x="0"
            y="0"
            width={map.width}
            height={map.height}
            preserveAspectRatio="none"
            result="map"
        />
    )
    return (
        <svg className="lg-defs" aria-hidden="true" focusable="false">
            <filter
                id={id}
                x="0"
                y="0"
                width="100%"
                height="100%"
                colorInterpolationFilters="sRGB"
            >
                {image}
                {aberration ? (
                    <>
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="map"
                            scale={map.scale * 0.86}
                            xChannelSelector="R"
                            yChannelSelector="G"
                            result="dr"
                        />
                        <feColorMatrix
                            in="dr"
                            type="matrix"
                            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                            result="r"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="map"
                            scale={map.scale}
                            xChannelSelector="R"
                            yChannelSelector="G"
                            result="dg"
                        />
                        <feColorMatrix
                            in="dg"
                            type="matrix"
                            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                            result="g"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="map"
                            scale={map.scale * 1.14}
                            xChannelSelector="R"
                            yChannelSelector="G"
                            result="db"
                        />
                        <feColorMatrix
                            in="db"
                            type="matrix"
                            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                            result="b"
                        />
                        <feBlend in="r" in2="g" mode="screen" result="rg" />
                        <feBlend in="rg" in2="b" mode="screen" />
                    </>
                ) : (
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="map"
                        scale={map.scale}
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                )}
            </filter>
        </svg>
    )
}

/**
 * A slab of liquid glass. Layers, back to front:
 *  1. `.lg-backdrop` — blurred, saturated, tinted backdrop (pure CSS).
 *  2. `.lg-refract`  — SVG displacement of the blurred backdrop at the rim
 *                      (Chromium; skipped elsewhere).
 *  3. `.lg-rim`      — specular highlights, gradient edge, grain.
 *  4. `.lg-content`  — your content.
 */
export const Glass = forwardRef<HTMLElement, GlassProps>(function Glass(
    {
        as = 'div',
        tint = 'neutral',
        refraction = true,
        aberration = false,
        interactive = false,
        band,
        strength,
        className,
        contentClassName,
        children,
        onPointerMove,
        onPointerLeave,
        ...rest
    },
    forwardedRef
) {
    const rawId = useId()
    const filterId = `lg-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`
    const { ref, state } = useGlassRefraction(refraction, band, strength)

    const setRefs = useCallback(
        (node: HTMLElement | null) => {
            ref.current = node
            if (typeof forwardedRef === 'function') forwardedRef(node)
            else if (forwardedRef)
                (forwardedRef as { current: HTMLElement | null }).current = node
        },
        [forwardedRef, ref]
    )

    const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
        onPointerMove?.(event)
        if (!interactive) return
        const el = event.currentTarget
        const rect = el.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100
        el.style.setProperty('--lg-mx', `${x.toFixed(1)}%`)
        el.style.setProperty('--lg-my', `${y.toFixed(1)}%`)
    }
    const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
        onPointerLeave?.(event)
        if (!interactive) return
        event.currentTarget.style.removeProperty('--lg-mx')
        event.currentTarget.style.removeProperty('--lg-my')
    }

    const refractionStyle = state
        ? {
              backdropFilter: `url(#${filterId})`,
              WebkitBackdropFilter: `url(#${filterId})`,
          }
        : undefined

    return createElement(
        as,
        {
            ref: setRefs as Ref<HTMLElement>,
            className: cn(
                'lg',
                `lg-${tint}`,
                interactive && 'lg-interactive',
                className
            ),
            onPointerMove: handlePointerMove,
            onPointerLeave: handlePointerLeave,
            ...rest,
        },
        <span aria-hidden="true" className="lg-backdrop" />,
        state && (
            <span
                aria-hidden="true"
                className="lg-refract"
                style={refractionStyle}
            />
        ),
        <span aria-hidden="true" className="lg-rim" />,
        <span className={cn('lg-content', contentClassName)}>{children}</span>,
        state && (
            <RefractionFilter
                id={filterId}
                map={state.map}
                aberration={aberration}
            />
        )
    )
})
