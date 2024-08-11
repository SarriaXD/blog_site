'use client'

import Image from 'next/image'
import { Button } from './Material.tsx'
import Link from 'next/link'
import { ArrowRight } from '../../public/icons'
import {
    motion,
    MotionValue,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'framer-motion'
import { useRef, useState } from 'react'
import { flutterProjectData } from '../data/flutterProjectData.ts'
import { StaticImageColor } from '../utils.ts'

const useTitleAnimation = () => {
    const ref = useRef(null)
    const [enterViewport, setEnterViewport] = useState(false)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['end end', 'end start'],
    })
    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
        if (progress > 0.0 && !enterViewport) {
            setEnterViewport(true)
        }
        if (progress === 0.0 && enterViewport) {
            setEnterViewport(false)
        }
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

const ExploreStickyButton = () => {
    return (
        <div className="absolute top-0 h-full w-full">
            <div
                className="sticky z-50 mx-8 flex items-center justify-center py-4"
                style={{
                    top: 'calc(100vh - 100px)',
                }}
            >
                <Link href={'/'}>
                    <Button
                        size="sm"
                        className="flex items-center gap-3 rounded-full bg-gray-900 bg-opacity-80 backdrop-blur"
                    >
                        Explore This Project
                        <ArrowRight className="size-10 rounded-full bg-gray-800 p-2 text-white" />
                    </Button>
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
    const [enterViewport, setEnterViewport] = useState(false)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['center end', 'end start'],
    })
    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
        if (progress > 0.0 && !enterViewport) {
            setEnterViewport(true)
        }
        if (progress === 0.0 && enterViewport) {
            setEnterViewport(false)
        }
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
                                priority={true}
                                alt="flutter project image 1"
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
                                priority={true}
                                alt="flutter project image 1"
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
                                priority={true}
                                alt="flutter project image 1"
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
                <div className="flex max-w-[90%] flex-col gap-2 md:max-w-[95%] md:flex-row md:gap-4">
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
    const [nearTopViewport, setNearTopViewport] = useState(false)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'start 10%'],
    })
    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
        if (progress === 1 && !nearTopViewport) {
            setNearTopViewport(true)
        }
        if (progress < 1 && nearTopViewport) {
            setNearTopViewport(false)
        }
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
            className="sticky top-0 mx-auto h-[100vh] min-h-[900px] md:w-[692px] lg:w-[800px]"
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
        offset: ['start -150vh', 'end end'],
    })
    const currentDataIndex = useDataIndex(progress)
    return (
        <section ref={ref} className="mb-24">
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
