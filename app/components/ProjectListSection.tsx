'use client'
import {
    animate,
    motion,
    MotionValue,
    useMotionValue,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
    flutterProjectData,
    FlutterDataItem,
} from '../data/FlutterProjectData.ts'
import Image, { StaticImageData } from 'next/image'
import { useMediaQuery } from '../Hooks.ts'
import { Typography } from './Material.tsx'

interface FramesProps {
    frames: FlutterDataItem[]
    enterProgress: MotionValue<number>
    stayProgress: MotionValue<number>
    leavingProgress: MotionValue<number>
}

const ImageItem = ({
    img,
    index,
    currentIndex,
}: {
    img: StaticImageData
    index: number
    currentIndex: number
}) => {
    let opacity
    if (index === currentIndex) {
        opacity = 1
    } else {
        opacity = 0.65
    }
    return (
        <motion.div
            className={`relative h-full w-full flex-none p-2 md:p-4`}
            animate={{
                opacity: opacity,
                scale: opacity,
                transition: {
                    type: 'tween',
                    duration: 0.4,
                    ease: 'easeOut',
                },
            }}
        >
            <Image
                src={img}
                alt={`play index ${index}`}
                fill={true}
                className="object-contain"
            />
        </motion.div>
    )
}

const Frames = ({
    frames,
    leavingProgress,
    stayProgress,
    enterProgress,
}: FramesProps) => {
    const scale = useTransform(enterProgress, [0, 1], [0.6, 1])
    const opacity = useTransform(leavingProgress, [0, 0.45], [1, 0])
    const [currentIndex, setCurrentIndex] = useState(0)
    useMotionValueEvent(stayProgress, 'change', (value) => {
        const index = Math.floor(value * frames.length)
        setCurrentIndex(index)
    })
    const scrollX = useMotionValue(0)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (scrollContainerRef.current === null) return
        const targetOffset =
            scrollContainerRef.current.clientWidth * currentIndex
        const controls = animate(scrollX, targetOffset, {
            type: 'spring',
            stiffness: 100,
            damping: 20,
        })
        return () => controls.stop()
    }, [currentIndex, scrollX])
    useMotionValueEvent(scrollX, 'change', (value) => {
        if (scrollContainerRef.current === null) return
        scrollContainerRef.current.scrollLeft = value
    })
    return (
        <motion.div
            className="w-full flex-1 p-4 md:h-full md:p-0"
            style={{
                scale,
                opacity,
            }}
        >
            <motion.div
                ref={scrollContainerRef}
                className="flex h-full w-full overflow-hidden scroll-auto"
            >
                {frames.map((frame, index) => {
                    return (
                        <ImageItem
                            key={index}
                            img={frame.image}
                            index={index}
                            currentIndex={currentIndex}
                        />
                    )
                })}
            </motion.div>
        </motion.div>
    )
}

interface IntroductionProps {
    stayProgress: MotionValue<number>
    leavingProgress: MotionValue<number>
}

const list = [
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Framer Motion',
    'Material Tailwind',
]

const IntroductionVariants = {
    hidden: (isMobile: boolean) => ({
        opacity: 0,
        width: isMobile ? '100%' : '0%',
        height: isMobile ? '0%' : '100%',
        transition: {
            height: { duration: 0.3, delay: 0.3 },
            width: { duration: 0.3, delay: 0.3 },
            opacity: { duration: 0.1 },
        },
    }),
    visible: (isMobile: boolean) => ({
        opacity: 1,
        width: isMobile ? '100%' : '33%',
        height: isMobile ? '50%' : '100%',
        transition: {
            height: { duration: 0.6, ease: 'easeInOut' },
            width: { duration: 0.6, ease: 'easeInOut' },
            opacity: { duration: 0.6, delay: 0.6 },
        },
    }),
}

const useIntroductionAnimation = (leavingProgress: MotionValue<number>) => {
    const opacity = useTransform(leavingProgress, [0, 0.3], [1, 0])
    return { opacity }
}

interface IntroductionTextProps {
    text: string
    progress: MotionValue<number>
    index: number
    totalSize: number
}
const IntroductionText = ({
    text,
    progress,
    index,
    totalSize,
}: IntroductionTextProps) => {
    const low = index / totalSize
    const high = (index + 1) / totalSize
    const opacity = useTransform(progress, [low, high], [0, 1])
    return (
        <motion.div
            style={{
                opacity,
            }}
        >
            <Typography variant="h4" color="orange" textGradient={true}>
                {text}
            </Typography>
        </motion.div>
    )
}

const Introduction = ({ stayProgress, leavingProgress }: IntroductionProps) => {
    const isMobile = useMediaQuery('(max-width: 720px)', true)
    const { opacity } = useIntroductionAnimation(leavingProgress)
    const [isVisible, setVisible] = useState(false)
    useMotionValueEvent(stayProgress, 'change', (value) => {
        if (value > 0.1 && !isVisible) {
            setVisible(true)
        }
        if (value <= 0.1 && isVisible) {
            setVisible(false)
        }
    })

    return (
        <motion.div
            className={`flex flex-col items-center justify-center`}
            custom={isMobile}
            variants={IntroductionVariants}
            animate={isVisible ? 'visible' : 'hidden'}
            transition={{
                width: { duration: 1, ease: 'easeInOut', delay: 1 },
                opacity: { duration: 1 },
            }}
        >
            <motion.div
                style={{
                    opacity,
                }}
            >
                {list.map((item, index) => {
                    return (
                        <IntroductionText
                            key={index}
                            text={item}
                            progress={stayProgress}
                            index={index}
                            totalSize={list.length}
                        />
                    )
                })}
            </motion.div>
        </motion.div>
    )
}

interface ProjectProps {
    leavingProgress: MotionValue<number>
    progress: MotionValue<number>
    frames: FlutterDataItem[]
    reverse: boolean
}

const Project = ({
    progress,
    frames,
    leavingProgress,
    reverse,
}: ProjectProps) => {
    const enterProgress = useTransform(progress, [0, 1 / 3], [0, 1])
    const stayProgress = useTransform(progress, [1 / 3, 1], [0, 1])
    return (
        <>
            <div className="flex h-full w-full flex-col items-center justify-center  p-4 md:flex-row md:p-8 xl:p-16">
                {reverse ? (
                    <Frames
                        frames={frames}
                        enterProgress={enterProgress}
                        stayProgress={stayProgress}
                        leavingProgress={leavingProgress}
                    />
                ) : (
                    <Introduction
                        stayProgress={stayProgress}
                        leavingProgress={leavingProgress}
                    />
                )}
                {reverse ? (
                    <Introduction
                        stayProgress={stayProgress}
                        leavingProgress={leavingProgress}
                    />
                ) : (
                    <Frames
                        frames={frames}
                        enterProgress={enterProgress}
                        stayProgress={stayProgress}
                        leavingProgress={leavingProgress}
                    />
                )}
            </div>
        </>
    )
}

interface ProjectItemProps {
    index: number
    totalSize: number
    totalProgress: MotionValue<number>
    className: string
    frames: FlutterDataItem[]
    reverse: boolean
}

const ProjectItem = ({
    index,
    totalSize,
    totalProgress,
    className,
    frames,
    reverse,
}: ProjectItemProps) => {
    const rate = 5
    const rateSize = rate * totalSize + 1
    const low = (index * rate) / rateSize
    const high = ((index + 1) * rate) / rateSize
    const ratio = 1 / rateSize
    const progress = useTransform(totalProgress, [low, high], [0, 1])
    const leavingProgress = useTransform(
        totalProgress,
        [high, high + ratio],
        [0, 1]
    )
    return (
        <>
            <div className={`${className} sticky top-0 h-[100vh] w-full pt-20`}>
                <Project
                    frames={frames}
                    progress={progress}
                    leavingProgress={leavingProgress}
                    reverse={reverse}
                />
            </div>
            <div className={`h-[400vh]`} />
        </>
    )
}

const ProjectItemList = [
    {
        frames: flutterProjectData[0],
        className: 'bg-night-shift',
        reverse: true,
    },
    {
        frames: flutterProjectData[1],
        className: 'bg-night-club',
        reverse: false,
    },
    {
        frames: flutterProjectData[2],
        className: 'bg-worker-day',
        reverse: true,
    },
]

export const ProjectListSection = () => {
    const target = useRef(null)
    const { scrollYProgress } = useScroll({
        target,
        offset: ['start end', 'end start'],
    })
    return (
        <>
            <motion.div ref={target}>
                {ProjectItemList.map((item, index) => {
                    return (
                        <ProjectItem
                            key={index}
                            index={index}
                            totalSize={ProjectItemList.length}
                            totalProgress={scrollYProgress}
                            className={item.className}
                            frames={item.frames}
                            reverse={item.reverse}
                        />
                    )
                })}
            </motion.div>
        </>
    )
}
