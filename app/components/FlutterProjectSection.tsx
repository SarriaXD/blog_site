'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from '../../public/icons'
import {
    motion,
    MotionValue,
    useInView,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { flutterProjectData } from '../data/flutterProjectData.ts'
import { StaticImageColor } from '../utils.ts'

const useTitleAnimation = () => {
    const ref = useRef(null)
    const enterViewport = useInView(ref, {
        once: false,
        margin: '100% 0% -10% 0%',
    })
    return {
        ref,
        enterViewport,
    }
}

const Title = () => {
    const { ref, enterViewport } = useTitleAnimation()
    return (
        <motion.div
            ref={ref}
            className="mx-auto max-w-[290px] md:w-[578px] md:max-w-full lg:w-[735px]"
            animate={{
                opacity: enterViewport ? 1 : 0,
                y: enterViewport ? 0 : 50,
            }}
            transition={{
                type: 'spring',
                duration: 1,
            }}
        >
            <h3 className="text-3xl text-[#86868b] md:text-6xl lg:text-8xl">
                Driving Test App.
            </h3>
            <h4 className="text-3xl text-[#F5F5F7] md:text-6xl lg:text-8xl">
                Powered by Flutter.
            </h4>
        </motion.div>
    )
}

const useThrottledInView = (throttleDelay: number = 300) => {
    const ref = useRef(null)
    const inView = useInView(ref, {
        margin: '-85% 0px -15% 0px',
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

const ExploreStickyButton = () => {
    const { ref, throttledIsInView: inView } = useThrottledInView(1000)
    const containerTransition = {
        type: 'tween',
        times: [0, 0.45, 0.65, 1],
        duration: 0.8,
    }
    const containerVariants = {
        visible: {
            scale: [0, 1, 1, 1],
            transition: {
                when: 'beforeChildren',
                ...containerTransition,
                duration: 0.7,
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
            className="absolute top-0 z-50 flex h-full w-full items-end justify-center"
        >
            <div className="sticky bottom-8 mb-24 mt-8 flex items-center">
                <motion.div
                    className="absolute left-0 top-0 h-full w-full rounded-full bg-[#0071e3]"
                    animate={{
                        opacity: inView ? [0, 1, 1, 1] : 0,
                        scale: inView ? [0, 1.8, 2, 0] : 0,
                    }}
                    transition={containerTransition}
                />
                <Link
                    href={'https://github.com/SarriaXD/manitoba_driving_test'}
                    target="_blank"
                    rel="noopener noreferrer"
                >
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

interface ImageGalleryProps {
    nearTopViewport: boolean
    currentDataIndex: number
    colors: StaticImageColor[]
}

const useImageGalleryAnimation = () => {
    const ref = useRef(null)
    const enterViewport = useInView(ref, {
        once: false,
        margin: '100% 0% -10% 0%',
    })
    return {
        ref,
        enterViewport,
    }
}

const ImageGallery = ({
    nearTopViewport,
    currentDataIndex,
    colors,
}: ImageGalleryProps) => {
    const { ref, enterViewport } = useImageGalleryAnimation()
    const gradientBackground = `linear-gradient(to bottom, ${colors[currentDataIndex].secondaryColor} 0%, ${colors[currentDataIndex].mainColor} 40%, transparent)`
    return (
        <motion.div
            ref={ref}
            animate={{
                opacity: enterViewport ? 1 : 0,
                y: enterViewport ? 0 : 100,
            }}
            style={{
                perspective: '2000px',
            }}
            transition={{
                type: 'spring',
                duration: 1,
            }}
            className="relative"
        >
            {flutterProjectData.map(({ images }, index) => {
                return (
                    <div
                        key={index}
                        className="relative z-10 mx-auto mt-8 flex w-[92%] items-center justify-between gap-4 md:mt-0 md:w-full md:gap-6 lg:gap-8"
                        style={{
                            display:
                                index === currentDataIndex ? 'flex' : 'none',
                        }}
                    >
                        <motion.div
                            className="z-0"
                            animate={{
                                opacity: nearTopViewport ? 1 : 0,
                                x: nearTopViewport ? 0 : 100,
                            }}
                            transition={{
                                type: 'spring',
                                duration: nearTopViewport ? 1 : 0.5,
                            }}
                        >
                            <Image
                                src={images[0]}
                                alt="flutter project image 1"
                                priority={true}
                                sizes={'(max-width: 735px) 33vw, 30vw'}
                            />
                        </motion.div>
                        <motion.div
                            className="z-10"
                            animate={{
                                scale: nearTopViewport ? 1 : 2,
                            }}
                            style={{
                                transformOrigin: 'top',
                            }}
                            transition={{
                                type: 'spring',
                                duration: 1,
                            }}
                        >
                            <Image
                                src={images[1]}
                                alt="flutter project image 1"
                                priority={true}
                                sizes={'(max-width: 735px) 33vw, 30vw'}
                            />
                        </motion.div>
                        <motion.div
                            className="z-0"
                            animate={{
                                opacity: nearTopViewport ? 1 : 0,
                                x: nearTopViewport ? 0 : -100,
                            }}
                            transition={{
                                type: 'spring',
                                duration: nearTopViewport ? 1 : 0.5,
                            }}
                        >
                            <Image
                                src={images[2]}
                                alt="flutter project image 1"
                                priority={true}
                                sizes={'(max-width: 735px) 33vw, 30vw'}
                            />
                        </motion.div>
                    </div>
                )
            })}
            <div
                className="absolute inset-x-0 -bottom-[50%] h-3/4 rounded-b-full blur-3xl"
                style={{
                    background: gradientBackground,
                }}
            />
        </motion.div>
    )
}

interface IntroductionProps {
    progress: MotionValue<number>
    enterViewport: boolean
    title: string
    description: string
}

const Introduction = ({
    progress,
    enterViewport,
    title,
    description,
}: IntroductionProps) => {
    return (
        <motion.div
            animate={{
                opacity: enterViewport ? 1 : 0,
                y: enterViewport ? 0 : 50,
            }}
            transition={{
                type: 'spring',
                delay: enterViewport ? 0.5 : 0,
                duration: enterViewport ? 1 : 0.5,
            }}
            className="relative z-0 p-8"
        >
            <div className="mx-auto mt-8 flex w-[90%] justify-around gap-4 md:w-full">
                <div className="flex max-w-[90%] flex-col gap-2 md:max-w-[95%] md:flex-row md:gap-12">
                    <h4 className="text-3xl md:w-[45%] md:text-4xl">{title}</h4>
                    <p className="text-lg font-semibold text-gray-400 md:w-[45%] md:text-xl">
                        {description}
                    </p>
                </div>
                <div className="mt-2 h-24 w-1 self-start rounded bg-gray-600 md:mt-0">
                    <ProgressBar progress={progress} />
                </div>
            </div>
        </motion.div>
    )
}

interface ProgressBarProps {
    progress: MotionValue<number>
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
    const percentage = useTransform(progress, [0, 1], ['0%', '100%'])
    return (
        <div className="h-full w-full rounded-full bg-gray-800">
            <motion.div
                key={'vertical'}
                className="block w-full rounded-full bg-gray-500"
                style={{
                    height: percentage,
                }}
            />
        </div>
    )
}

const useMainContentAnimation = () => {
    const ref = useRef(null)
    const nearTopViewport = useInView(ref, {
        once: false,
        margin: '100% 0% -90% 0%',
    })
    return {
        ref,
        nearTopViewport,
    }
}

interface MainContentProps {
    progress: MotionValue<number>
    currentDataIndex: number
    colors: StaticImageColor[]
}

const MainContent = ({
    progress,
    currentDataIndex,
    colors,
}: MainContentProps) => {
    const { ref, nearTopViewport } = useMainContentAnimation()
    return (
        <div
            ref={ref}
            className="min-h-[900px]: sticky top-0 mx-auto h-[120vh] md:w-[692px] lg:w-[800px]"
        >
            <ExploreStickyButton />
            <div className="mx-auto h-full max-w-[530px] py-24 md:max-w-full">
                <ImageGallery
                    nearTopViewport={nearTopViewport}
                    currentDataIndex={currentDataIndex}
                    colors={colors}
                />
                <Introduction
                    progress={progress}
                    enterViewport={nearTopViewport}
                    title={flutterProjectData[currentDataIndex].title}
                    description={
                        flutterProjectData[currentDataIndex].description
                    }
                />
            </div>
        </div>
    )
}

const useDataIndex = (progress: MotionValue<number>) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const index = useTransform(
        progress,
        [0, 1],
        [0, flutterProjectData.length - 1]
    )
    useMotionValueEvent(index, 'change', (value) => {
        const roundedIndex = Math.round(value)
        setCurrentIndex(roundedIndex)
    })
    return currentIndex
}

interface FlutterProjectSectionProps {
    colors: StaticImageColor[]
}

export const FlutterProjectSection = ({
    colors,
}: FlutterProjectSectionProps) => {
    const ref = useRef(null)
    const { scrollYProgress: progress } = useScroll({
        target: ref,
        offset: ['start -150vh', '530vh end'],
    })
    const currentDataIndex = useDataIndex(progress)
    return (
        <section id="my-flutter-project" ref={ref} className="mb-24">
            <div className="mx-auto h-[550vh] bg-[#101010] pt-24 md:max-w-[908px] lg:max-w-[1120px]">
                <Title />
                <MainContent
                    progress={progress}
                    currentDataIndex={currentDataIndex}
                    colors={colors}
                />
            </div>
        </section>
    )
}
