import { motion, useInView, type Transition } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from '@public/icons'
import { useEffect, useRef, useState } from 'react'
import { Glass } from '@components/ui/liquid-glass.tsx'

const useThrottledInView = (throttleDelay: number = 300) => {
    const ref = useRef(null)
    const inView = useInView(ref, {
        margin: '-65% 0px -35% 0px',
        once: false,
    })
    const [throttledIsInView, setThrottledIsInView] = useState<boolean>(inView)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastUpdateTimeRef = useRef<number>(Date.now())

    useEffect(() => {
        const currentTime = Date.now()

        if (currentTime - lastUpdateTimeRef.current >= throttleDelay) {
            setThrottledIsInView(inView)
            lastUpdateTimeRef.current = currentTime
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(() => {
                setThrottledIsInView(inView)
                lastUpdateTimeRef.current = Date.now()
            }, throttleDelay)
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [inView, throttleDelay])

    return { ref, throttledIsInView }
}

interface ExploreStickyButtonProps {
    href: string
}

const ExploreStickyButton = ({ href }: ExploreStickyButtonProps) => {
    const { ref, throttledIsInView: inView } = useThrottledInView(1000)
    const containerTransition: Transition = {
        type: 'tween',
        times: [0, 0.45, 0.65, 1],
        duration: 0.6,
    }
    const containerVariants = {
        visible: {
            scale: [0, 1, 1, 1],
            transition: {
                when: 'beforeChildren',
                ...containerTransition,
                duration: 0.6,
            },
        },
        hidden: {
            scale: 0,
            transition: {
                when: 'afterChildren',
                delay: 0.1,
            },
        },
    }
    const textContainerVariants = {
        visible: {
            width: 'auto',
            transition: {
                when: 'beforeChildren',
            },
        },
        hidden: {
            width: 0,
            transition: {
                when: 'afterChildren',
            },
        },
    }
    const textVariants = {
        visible: {
            opacity: 1,
        },
        hidden: {
            opacity: 0,
        },
    }
    const iconVariants = {
        visible: {
            opacity: 1,
        },
        hidden: {
            opacity: 0,
        },
    }
    return (
        <div
            ref={ref}
            className="pointer-events-none absolute top-0 z-50 flex h-full w-full items-end justify-center"
        >
            <div className="sticky bottom-8 mt-8 mb-8 flex items-center">
                <motion.div
                    className="absolute top-0 left-0 h-full w-full rounded-full bg-[var(--ui-brand-500)] blur-[2px]"
                    animate={{
                        opacity: inView ? [0, 1, 1, 1] : 0,
                        scale: inView ? [0, 1.8, 2, 0] : 0,
                    }}
                    transition={containerTransition}
                />
                <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto"
                >
                    <motion.div
                        variants={containerVariants}
                        animate={inView ? 'visible' : 'hidden'}
                    >
                        <Glass
                            tint="soft"
                            interactive
                            aberration
                            band={16}
                            className="inline-flex rounded-full p-2 capitalize [--lg-blur:24px]"
                            contentClassName="flex items-center"
                        >
                            <motion.div
                                className="overflow-hidden"
                                variants={textContainerVariants}
                            >
                                <motion.span
                                    className="mx-2 block text-[14px] font-semibold text-nowrap md:mx-4 md:text-lg"
                                    variants={textVariants}
                                >
                                    Explore This Project
                                </motion.span>
                            </motion.div>
                            <motion.div variants={iconVariants}>
                                <span className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#5fc6ff_0%,#2b7fff_100%)] p-1 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_-8px_rgba(43,127,255,0.9)] md:size-10 md:p-2">
                                    <ArrowRight className="size-full" />
                                </span>
                            </motion.div>
                        </Glass>
                    </motion.div>
                </Link>
            </div>
        </div>
    )
}

export default ExploreStickyButton
