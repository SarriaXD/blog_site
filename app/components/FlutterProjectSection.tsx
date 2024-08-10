'use client'

import Image, { StaticImageData } from 'next/image'
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
import { useMediaQuery } from '../hooks.ts'
import { flutterProjectData } from '../data/flutterProjectData.ts'

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
    images: StaticImageData[]
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

const ImageGallery = ({ nearTopViewport, images }: ImageGalleryProps) => {
    const { ref, enterViewport } = useImageGalleryAnimation()
    return (
        <motion.div
            ref={ref}
            className="relative z-10 mx-auto mt-8 flex w-[92%] items-center justify-between gap-4 md:mt-0 md:w-full md:gap-6 lg:gap-8"
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
                <Image src={images[0]} alt="flutter project image 1" />
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
                <Image src={images[1]} alt="flutter project image 1" />
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
                <Image src={images[2]} alt="flutter project image 1" />
            </motion.div>
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
            <div className="mx-auto mt-8 flex w-[90%] flex-col items-stretch gap-2 md:w-full md:flex-row md:justify-around">
                <h4 className="w-full text-3xl md:w-[45%] md:text-4xl">
                    {title}
                </h4>
                <p className="w-full text-lg font-semibold text-[#86868b] md:w-[45%] md:text-xl">
                    {description}
                </p>
                <div className="my-8 h-1 rounded bg-gray-600 md:my-0 md:h-auto md:w-1">
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
    const isMobile = useMediaQuery('(max-width: 735px)', true)
    const percentage = useTransform(progress, [0, 1], ['0%', '100%'])
    return (
        <div className="h-full w-full rounded-full bg-gray-800">
            {isMobile ? (
                <motion.div
                    key={'horizontal'}
                    className="block h-full rounded-full bg-gray-500"
                    style={{
                        width: percentage,
                    }}
                />
            ) : (
                <motion.div
                    key={'vertical'}
                    className="block w-full rounded-full bg-gray-500"
                    style={{
                        height: percentage,
                    }}
                />
            )}
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
        console.log(progress)
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
    images: StaticImageData[]
    title: string
    description: string
}

const MainContent = ({
    progress,
    images,
    title,
    description,
}: MainContentProps) => {
    const { ref, nearTopViewport } = useMainContentAnimation()
    return (
        <div
            ref={ref}
            className="sticky top-0 mx-auto h-[100vh] min-h-[900px] md:w-[692px] lg:w-[800px]"
        >
            <ExploreStickyButton />
            <div className="mx-auto h-full max-w-[530px] py-20 md:max-w-full">
                <ImageGallery
                    nearTopViewport={nearTopViewport}
                    images={images}
                />
                <Introduction
                    progress={progress}
                    enterViewport={nearTopViewport}
                    title={title}
                    description={description}
                />
            </div>
        </div>
    )
}

const useData = (progress: MotionValue<number>) => {
    const [currentValue, setCurrentValue] = useState(flutterProjectData[0])
    const index = useTransform(
        progress,
        [0, 1],
        [0, flutterProjectData.length - 1]
    )
    useMotionValueEvent(index, 'change', (value) => {
        const roundedIndex = Math.round(value)
        setCurrentValue(flutterProjectData[roundedIndex])
    })
    return currentValue
}

export const FlutterProjectSection = () => {
    const ref = useRef(null)
    const { scrollYProgress: progress } = useScroll({
        target: ref,
        offset: ['start start', 'end end'],
    })
    const data = useData(progress)
    return (
        <section ref={ref}>
            <div className="mx-auto h-[400vh] bg-[#101010] py-24 md:max-w-[908px] lg:max-w-[1120px]">
                <Title />
                <MainContent progress={progress} {...data} />
            </div>
        </section>
    )
}
