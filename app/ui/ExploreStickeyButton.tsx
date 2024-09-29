import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from '@public/icons'
import { useEffect, useRef, useState } from 'react'

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
    const containerTransition = {
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
            <div className="sticky bottom-8 mb-8 mt-8 flex items-center">
                <motion.div
                    className="absolute left-0 top-0 h-full w-full rounded-full bg-[#0071e3]"
                    animate={{
                        opacity: inView ? [0, 1, 1, 1] : 0,
                        scale: inView ? [0, 1.8, 2, 0] : 0,
                    }}
                    transition={containerTransition}
                />
                <Link href={href} target="_blank" rel="noopener noreferrer">
                    <motion.div
                        className="box-content flex items-center rounded-full bg-gray-800 bg-opacity-70 p-2 capitalize backdrop-blur"
                        variants={containerVariants}
                        animate={inView ? 'visible' : 'hidden'}
                    >
                        <motion.div
                            className="overflow-hidden"
                            variants={textContainerVariants}
                        >
                            <motion.span
                                className="mx-2 text-nowrap text-[14px] text-base md:mx-4 md:text-lg"
                                variants={textVariants}
                            >
                                Explore This Project
                            </motion.span>
                        </motion.div>
                        <motion.div variants={iconVariants}>
                            <ArrowRight className="size-8 rounded-full bg-[#0071e3] p-1 text-white md:size-10 md:p-2" />
                        </motion.div>
                    </motion.div>
                </Link>
            </div>
        </div>
    )
}

export default ExploreStickyButton
